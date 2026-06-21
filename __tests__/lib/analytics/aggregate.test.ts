import { describe, it, expect } from '@jest/globals';
import {
  aggregateTrendCharts,
  aggregateWellnessRadar,
  aggregatePainZones,
  buildMetricSeries,
  sortByWeek,
  hasEnoughData,
  PAIN_ZONE_LABELS,
} from '@/lib/analytics/aggregate';
import type { ProgramFeedback } from '@/types';

/** Construit un ProgramFeedback partiel typé pour les tests. */
function fb(partial: Partial<ProgramFeedback> & { week_number: number }): ProgramFeedback {
  return {
    id: `fb-${partial.week_number}`,
    user_id: 'u1',
    program_id: 'p1',
    feedback_date: `2026-01-0${partial.week_number}`,
    exercises_completed: [],
    exercises_skipped: [],
    exercises_modified: [],
    pain_locations: [],
    suggestions_applied: false,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...partial,
  };
}

describe('sortByWeek', () => {
  it('trie par semaine croissante sans muter la source', () => {
    const src = [fb({ week_number: 3 }), fb({ week_number: 1 }), fb({ week_number: 2 })];
    const sorted = sortByWeek(src);
    expect(sorted.map((f) => f.week_number)).toEqual([1, 2, 3]);
    expect(src.map((f) => f.week_number)).toEqual([3, 1, 2]);
  });
});

describe('buildMetricSeries', () => {
  const feedbacks = [
    fb({ week_number: 1, energy_level: 2 }),
    fb({ week_number: 2, energy_level: 3 }),
    fb({ week_number: 3, energy_level: 4 }),
    fb({ week_number: 4, energy_level: 5 }),
  ];

  it('calcule moyenne, déviation, min, max', () => {
    const s = buildMetricSeries(feedbacks, (f) => f.energy_level);
    expect(s.average).toBe(3.5);
    expect(s.min).toBe(2);
    expect(s.max).toBe(5);
    expect(s.deviation).toBeGreaterThan(0);
  });

  it('détecte une tendance haussière', () => {
    const s = buildMetricSeries(feedbacks, (f) => f.energy_level);
    expect(s.trend).toBe('up');
  });

  it('détecte une tendance baissière', () => {
    const desc = [
      fb({ week_number: 1, energy_level: 5 }),
      fb({ week_number: 2, energy_level: 4 }),
      fb({ week_number: 3, energy_level: 2 }),
      fb({ week_number: 4, energy_level: 1 }),
    ];
    const s = buildMetricSeries(desc, (f) => f.energy_level);
    expect(s.trend).toBe('down');
  });

  it('reste stable si variation sous le seuil', () => {
    const flat = [
      fb({ week_number: 1, energy_level: 3 }),
      fb({ week_number: 2, energy_level: 3 }),
      fb({ week_number: 3, energy_level: 3 }),
    ];
    const s = buildMetricSeries(flat, (f) => f.energy_level);
    expect(s.trend).toBe('stable');
  });

  it('gère les valeurs manquantes (null) sans fausser les stats', () => {
    const sparse = [
      fb({ week_number: 1, energy_level: 4 }),
      fb({ week_number: 2 }), // pas d'énergie
      fb({ week_number: 3, energy_level: 2 }),
    ];
    const s = buildMetricSeries(sparse, (f) => f.energy_level);
    expect(s.average).toBe(3); // (4+2)/2
    expect(s.points[1].value).toBeNull();
    // La MA du point 2 (fenêtre incluant seulement la valeur de la semaine 1) reste définie.
    expect(s.points[1].movingAverage).toBe(4);
  });

  it('calcule une moyenne mobile trailing sur la fenêtre demandée', () => {
    const s = buildMetricSeries(feedbacks, (f) => f.energy_level, {
      movingAverageWindow: 2,
    });
    // semaine 2 : moyenne de [2,3] = 2.5
    expect(s.points[1].movingAverage).toBe(2.5);
    // semaine 4 : moyenne de [4,5] = 4.5
    expect(s.points[3].movingAverage).toBe(4.5);
  });

  it('renvoie des stats nulles sur liste vide', () => {
    const s = buildMetricSeries([], (f) => f.energy_level);
    expect(s.average).toBeNull();
    expect(s.min).toBeNull();
    expect(s.trend).toBe('stable');
    expect(s.points).toHaveLength(0);
  });
});

describe('aggregateTrendCharts', () => {
  const feedbacks = [
    fb({ week_number: 2, completion_rate: 80, difficulty_rating: 3, energy_level: 3, stress_level: 2 }),
    fb({ week_number: 1, completion_rate: 60, difficulty_rating: 4, energy_level: 2, stress_level: 4 }),
  ];

  it('trie et expose les 4 séries + count', () => {
    const data = aggregateTrendCharts(feedbacks);
    expect(data.count).toBe(2);
    expect(data.completion.points.map((p) => p.weekNumber)).toEqual([1, 2]);
    expect(data.completion.average).toBe(70);
    expect(data.difficulty.average).toBe(3.5);
    expect(data.energy.average).toBe(2.5);
    expect(data.stress.average).toBe(3);
  });

  it('count = 0 sur liste vide', () => {
    expect(aggregateTrendCharts([]).count).toBe(0);
  });
});

describe('aggregateWellnessRadar', () => {
  const feedbacks = [
    fb({
      week_number: 1,
      sleep_quality: 4,
      energy_level: 4,
      motivation_level: 5,
      muscle_soreness: 2,
      stress_level: 2,
      pain_locations: [],
    }),
    fb({
      week_number: 2,
      sleep_quality: 4,
      energy_level: 4,
      motivation_level: 5,
      muscle_soreness: 2,
      stress_level: 2,
      pain_locations: ['knees'],
    }),
  ];

  it('produit 6 axes (5 ressentis + douleur)', () => {
    const axes = aggregateWellnessRadar(feedbacks);
    expect(axes).toHaveLength(6);
    expect(axes.map((a) => a.key)).toContain('pain');
  });

  it('inverse les métriques « basses = mieux » (courbatures, stress)', () => {
    const axes = aggregateWellnessRadar(feedbacks);
    const soreness = axes.find((a) => a.key === 'muscle_soreness');
    const stress = axes.find((a) => a.key === 'stress_level');
    // moyenne 2 -> inversé 6-2 = 4
    expect(soreness?.value).toBe(4);
    expect(stress?.value).toBe(4);
  });

  it('ne touche pas aux métriques « hautes = mieux »', () => {
    const axes = aggregateWellnessRadar(feedbacks);
    const sleep = axes.find((a) => a.key === 'sleep_quality');
    expect(sleep?.value).toBe(4);
  });

  it('axe douleur dégradé selon la part de bilans avec douleur', () => {
    const axes = aggregateWellnessRadar(feedbacks);
    const pain = axes.find((a) => a.key === 'pain');
    // 1 bilan sur 2 avec douleur -> ratio 0.5 -> 5 - 0.5*4 = 3
    expect(pain?.value).toBe(3);
  });

  it('limite aux N derniers bilans si recentWeeks fourni', () => {
    const many = [
      fb({ week_number: 1, sleep_quality: 1 }),
      fb({ week_number: 2, sleep_quality: 5 }),
      fb({ week_number: 3, sleep_quality: 5 }),
    ];
    const axes = aggregateWellnessRadar(many, 2);
    const sleep = axes.find((a) => a.key === 'sleep_quality');
    expect(sleep?.value).toBe(5); // moyenne des 2 derniers (5,5)
  });
});

describe('aggregatePainZones', () => {
  const feedbacks = [
    fb({ week_number: 1, pain_locations: ['knees', 'lower_back'] }),
    fb({ week_number: 2, pain_locations: ['knees'] }),
    fb({ week_number: 3, pain_locations: ['shoulders', 'knees'] }),
    fb({ week_number: 4, pain_locations: [] }),
  ];

  it('compte et trie par fréquence décroissante', () => {
    const zones = aggregatePainZones(feedbacks);
    expect(zones[0].zone).toBe('knees');
    expect(zones[0].count).toBe(3);
    expect(zones[0].ratio).toBe(0.75); // 3/4
  });

  it('dédoublonne une zone répétée dans le même bilan', () => {
    const dup = [fb({ week_number: 1, pain_locations: ['knees', 'knees'] })];
    const zones = aggregatePainZones(dup);
    expect(zones[0].count).toBe(1);
  });

  it('utilise les labels français', () => {
    const zones = aggregatePainZones(feedbacks);
    expect(zones[0].label).toBe(PAIN_ZONE_LABELS.knees);
  });

  it('renvoie un tableau vide si aucune douleur', () => {
    const none = [fb({ week_number: 1, pain_locations: [] })];
    expect(aggregatePainZones(none)).toHaveLength(0);
  });
});

describe('hasEnoughData', () => {
  it('exige 4 bilans par défaut (gate web)', () => {
    expect(hasEnoughData([fb({ week_number: 1 }), fb({ week_number: 2 })])).toBe(false);
    expect(
      hasEnoughData([
        fb({ week_number: 1 }),
        fb({ week_number: 2 }),
        fb({ week_number: 3 }),
        fb({ week_number: 4 }),
      ]),
    ).toBe(true);
  });
});
