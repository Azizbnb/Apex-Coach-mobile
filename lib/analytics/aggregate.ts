/**
 * APEX COACH MOBILE — Agrégation analytics des bilans hebdomadaires
 *
 * Helpers purs (zéro dépendance UI) pour transformer une liste de
 * `program_feedback` en données prêtes à afficher : séries temporelles,
 * moyennes mobiles, tendances, radar bien-être, fréquence des zones de douleur.
 *
 * Source de vérité de la shape : `Apex-Coach/app/api/feedback/route.ts`
 * (table `program_feedback`). Champs vérifiés contre le web :
 *   week_number, feedback_date, completion_rate, difficulty_rating,
 *   energy_level, muscle_soreness, motivation_level, sleep_quality,
 *   stress_level, weight_kg, pain_locations, pain_or_discomfort.
 *
 * Convention d'échelle :
 *   - completion_rate : 0-100 (%)
 *   - ratings ressenti : 1-5
 *   - pain_locations : tableau d'enum PainLocation
 */

import type { PainLocation, ProgramFeedback } from '@/types';

// ============================================
// TYPES
// ============================================

/** Métriques 1-5 disponibles pour les tendances et le radar. */
export type WellnessMetricKey =
  | 'difficulty_rating'
  | 'energy_level'
  | 'muscle_soreness'
  | 'motivation_level'
  | 'sleep_quality'
  | 'stress_level';

/** Direction d'une tendance sur la fenêtre récente. */
export type TrendDirection = 'up' | 'down' | 'stable';

/** Un point d'une série temporelle indexé par semaine. */
export interface TrendPoint {
  weekNumber: number;
  /** Valeur brute du bilan (null si non renseignée cette semaine). */
  value: number | null;
  /** Moyenne mobile (fenêtre `movingAverageWindow`) à ce point. */
  movingAverage: number | null;
}

/** Série temporelle complète d'une métrique. */
export interface MetricSeries {
  points: TrendPoint[];
  /** Moyenne de toutes les valeurs renseignées. */
  average: number | null;
  /** Écart-type (population) des valeurs renseignées. */
  deviation: number | null;
  /** Tendance déduite du début vs fin de la fenêtre récente. */
  trend: TrendDirection;
  /** Min / max observés (utiles au scaling des charts). */
  min: number | null;
  max: number | null;
}

/** Données agrégées des 4 courbes de `TrendCharts`. */
export interface TrendChartsData {
  completion: MetricSeries; // 0-100
  difficulty: MetricSeries; // 1-5
  energy: MetricSeries; // 1-5
  stress: MetricSeries; // 1-5
  /** Nombre de bilans pris en compte. */
  count: number;
}

/** Un axe du radar bien-être (valeur moyenne 0-5). */
export interface WellnessRadarAxis {
  key: WellnessMetricKey | 'pain';
  label: string;
  /** Valeur moyenne sur 0-5 (déjà orientée « plus haut = mieux »). */
  value: number;
}

/** Fréquence d'une zone de douleur. */
export interface PainZoneFrequency {
  zone: PainLocation;
  label: string;
  /** Nombre de bilans mentionnant cette zone. */
  count: number;
  /** Part 0-1 du nombre total de bilans. */
  ratio: number;
}

// ============================================
// CONSTANTES
// ============================================

const DEFAULT_MA_WINDOW = 4;

const METRIC_LABELS: Record<WellnessMetricKey, string> = {
  difficulty_rating: 'Difficulté',
  energy_level: 'Énergie',
  muscle_soreness: 'Courbatures',
  motivation_level: 'Motivation',
  sleep_quality: 'Sommeil',
  stress_level: 'Stress',
};

export const PAIN_ZONE_LABELS: Record<PainLocation, string> = {
  lower_back: 'Lombaires',
  upper_back: 'Haut du dos',
  neck: 'Nuque',
  shoulders: 'Épaules',
  knees: 'Genoux',
  ankles: 'Chevilles',
  wrists: 'Poignets',
  hips: 'Hanches',
  elbows: 'Coudes',
  other: 'Autre',
};

/**
 * Métriques où une valeur basse est « meilleure ». Pour le radar (où l'on veut
 * « plus loin du centre = mieux »), on les inverse : 5 - value + 1.
 */
const INVERTED_METRICS: ReadonlySet<WellnessMetricKey> = new Set([
  'difficulty_rating',
  'muscle_soreness',
  'stress_level',
]);

// ============================================
// HELPERS BAS NIVEAU
// ============================================

/** Tri stable par numéro de semaine croissant (copie, ne mute pas). */
export function sortByWeek(feedbacks: ProgramFeedback[]): ProgramFeedback[] {
  return [...feedbacks].sort((a, b) => a.week_number - b.week_number);
}

function toFiniteOrNull(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / values.length;
}

function stdDev(values: number[]): number | null {
  if (values.length === 0) return null;
  const m = mean(values);
  if (m === null) return null;
  const variance =
    values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Moyenne mobile « trailing » : pour chaque point, moyenne des `window`
 * dernières valeurs NON nulles (incluant le point courant). Renvoie null si
 * aucune valeur dans la fenêtre.
 */
function trailingMovingAverage(
  values: (number | null)[],
  window: number,
): (number | null)[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = values
      .slice(start, i + 1)
      .filter((v): v is number => v !== null);
    return slice.length > 0 ? round(mean(slice) as number) : null;
  });
}

/**
 * Tendance : compare la moyenne de la première moitié à la seconde moitié des
 * valeurs renseignées. `threshold` = variation minimale (en unités de la
 * métrique) pour ne pas être considéré « stable ».
 */
function computeTrend(
  values: number[],
  threshold: number,
): TrendDirection {
  if (values.length < 2) return 'stable';
  const mid = Math.ceil(values.length / 2);
  const firstHalf = mean(values.slice(0, mid));
  const secondHalf = mean(values.slice(mid));
  if (firstHalf === null || secondHalf === null) return 'stable';
  const delta = secondHalf - firstHalf;
  if (delta > threshold) return 'up';
  if (delta < -threshold) return 'down';
  return 'stable';
}

// ============================================
// SÉRIE D'UNE MÉTRIQUE
// ============================================

interface SeriesOptions {
  /** Fenêtre de moyenne mobile (défaut 4). */
  movingAverageWindow?: number;
  /** Seuil de variation pour la tendance (échelle de la métrique). */
  trendThreshold?: number;
}

/**
 * Construit la série temporelle d'une métrique à partir des bilans triés.
 * `extract` renvoie la valeur brute (ou null/undefined) d'un bilan.
 */
export function buildMetricSeries(
  sortedFeedbacks: ProgramFeedback[],
  extract: (f: ProgramFeedback) => number | null | undefined,
  options: SeriesOptions = {},
): MetricSeries {
  const window = options.movingAverageWindow ?? DEFAULT_MA_WINDOW;
  const threshold = options.trendThreshold ?? 0.3;

  const rawValues = sortedFeedbacks.map((f) => toFiniteOrNull(extract(f)));
  const movingAverages = trailingMovingAverage(rawValues, window);

  const points: TrendPoint[] = sortedFeedbacks.map((f, i) => ({
    weekNumber: f.week_number,
    value: rawValues[i],
    movingAverage: movingAverages[i],
  }));

  const present = rawValues.filter((v): v is number => v !== null);
  const avg = mean(present);
  const dev = stdDev(present);

  return {
    points,
    average: avg === null ? null : round(avg),
    deviation: dev === null ? null : round(dev, 2),
    trend: computeTrend(present, threshold),
    min: present.length > 0 ? Math.min(...present) : null,
    max: present.length > 0 ? Math.max(...present) : null,
  };
}

// ============================================
// AGRÉGATEURS PUBLICS
// ============================================

/**
 * Données des 4 courbes de tendance (completion, difficulté, énergie, stress).
 * Le seuil de tendance est plus large pour la complétion (échelle 0-100).
 */
export function aggregateTrendCharts(
  feedbacks: ProgramFeedback[],
  options: SeriesOptions = {},
): TrendChartsData {
  const sorted = sortByWeek(feedbacks);
  return {
    completion: buildMetricSeries(sorted, (f) => f.completion_rate, {
      ...options,
      trendThreshold: options.trendThreshold ?? 5,
    }),
    difficulty: buildMetricSeries(sorted, (f) => f.difficulty_rating, options),
    energy: buildMetricSeries(sorted, (f) => f.energy_level, options),
    stress: buildMetricSeries(sorted, (f) => f.stress_level, options),
    count: sorted.length,
  };
}

/**
 * Radar bien-être : moyenne 0-5 par axe, sur les `recentWeeks` derniers bilans
 * (défaut = tous). Les métriques « basses = mieux » (difficulté, courbatures,
 * stress, douleur) sont inversées pour que « plus loin du centre = mieux ».
 *
 * Axe douleur : 5 si aucun bilan ne signale de zone, dégradé selon la part de
 * bilans mentionnant au moins une zone.
 */
export function aggregateWellnessRadar(
  feedbacks: ProgramFeedback[],
  recentWeeks?: number,
): WellnessRadarAxis[] {
  const sorted = sortByWeek(feedbacks);
  const scoped =
    recentWeeks && recentWeeks > 0 ? sorted.slice(-recentWeeks) : sorted;

  const metricKeys: WellnessMetricKey[] = [
    'sleep_quality',
    'energy_level',
    'motivation_level',
    'muscle_soreness',
    'stress_level',
  ];

  const axes: WellnessRadarAxis[] = metricKeys.map((key) => {
    const values = scoped
      .map((f) => toFiniteOrNull(f[key] as number | null | undefined))
      .filter((v): v is number => v !== null);
    const avg = mean(values);
    let value = avg === null ? 0 : avg;
    if (INVERTED_METRICS.has(key) && avg !== null) {
      // 1-5 inversé : 5 -> 1, 1 -> 5 (6 - value)
      value = 6 - value;
    }
    return { key, label: METRIC_LABELS[key], value: round(value) };
  });

  // Axe douleur dérivé de la fréquence des pain_locations.
  const withFeedback = scoped.length;
  const painCount = scoped.filter(
    (f) => Array.isArray(f.pain_locations) && f.pain_locations.length > 0,
  ).length;
  const painRatio = withFeedback > 0 ? painCount / withFeedback : 0;
  // Aucune douleur -> 5, douleur systématique -> 1.
  const painScore = withFeedback > 0 ? round(5 - painRatio * 4) : 0;

  axes.push({ key: 'pain', label: 'Sans douleur', value: painScore });
  return axes;
}

/**
 * Fréquence des zones de douleur, triée par occurrence décroissante.
 * `ratio` rapporté au nombre total de bilans.
 */
export function aggregatePainZones(
  feedbacks: ProgramFeedback[],
): PainZoneFrequency[] {
  const total = feedbacks.length;
  const counts = new Map<PainLocation, number>();

  for (const f of feedbacks) {
    const zones = f.pain_locations;
    if (!Array.isArray(zones)) continue;
    // Dédoublonne par bilan (une zone compte une fois par semaine).
    for (const zone of new Set(zones)) {
      counts.set(zone, (counts.get(zone) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([zone, count]) => ({
      zone,
      label: PAIN_ZONE_LABELS[zone],
      count,
      ratio: total > 0 ? count / total : 0,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** True si assez de données pour afficher les analytics (gate web : ≥4 bilans). */
export function hasEnoughData(feedbacks: ProgramFeedback[], min = 4): boolean {
  return feedbacks.length >= min;
}
