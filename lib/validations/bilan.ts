import { z } from 'zod';

/**
 * Schema de validation du bilan hebdomadaire — MIRROR du `FeedbackSchema` web
 * (`Apex-Coach/app/api/feedback/route.ts`). Toute divergence de contrainte
 * ferait rejeter la requête côté serveur (400). Vérifié contre le code web réel
 * le 21/06/2026 (le `WEB_FLOW_AUDIT` n'est pas fiable sur les endpoints).
 *
 * Champs strictement validés/persistés par la route /api/feedback :
 *   week_number, completion_rate, difficulty_rating, energy_level,
 *   muscle_soreness, motivation_level, sleep_quality, stress_level, weight_kg,
 *   pain_or_discomfort, pain_locations, notes, achievements, challenges,
 *   skip_reasons, hunger_level, digestive_comfort, meal_satisfaction.
 *
 * NB : les champs jeûne (`fasting_days_count`, `fasting_difficulty`,
 * `continue_fasting`) ne sont PAS dans le `FeedbackSchema` web (Zod strip) —
 * le web les envoie quand même dans le body et la désactivation du jeûne passe
 * par `PATCH /api/profile/fasting`. On reproduit ce comportement : le form les
 * collecte et les inclut au body (le serveur ignore les inconnus), et on
 * désactive le mode jeûne via l'API profil si l'utilisateur choisit "Stop".
 */

// ---- Skip reason (mirror SkipReasonSchema web) ----

export const SKIP_REASON_CODES = [
  'equipment',
  'difficulty',
  'pain',
  'time',
  'other',
] as const;

export type SkipReasonCode = (typeof SKIP_REASON_CODES)[number];

export const SkipReasonSchema = z.object({
  exerciseName: z.string(),
  reason: z.enum(SKIP_REASON_CODES),
  note: z.string().max(200).optional(),
});

export type SkipReason = z.infer<typeof SkipReasonSchema>;

// ---- Pain locations (mirror enum web) ----

export const PAIN_LOCATIONS = [
  'lower_back',
  'upper_back',
  'neck',
  'shoulders',
  'knees',
  'ankles',
  'wrists',
  'hips',
  'elbows',
  'other',
] as const;

export type PainLocation = (typeof PAIN_LOCATIONS)[number];

// ---- Bilan (mirror FeedbackSchema web) ----

export const BilanSchema = z.object({
  week_number: z.number().int().min(1).max(52),
  completion_rate: z.number().min(0).max(100),
  difficulty_rating: z.number().int().min(1).max(5),
  energy_level: z.number().int().min(1).max(5),
  muscle_soreness: z.number().int().min(1).max(5).optional(),
  motivation_level: z.number().int().min(1).max(5).optional(),
  sleep_quality: z.number().int().min(1).max(5).optional(),
  stress_level: z.number().int().min(1).max(5).optional(),
  weight_kg: z.number().min(30).max(300).nullish(),
  pain_or_discomfort: z.string().max(500).optional(),
  pain_locations: z.array(z.enum(PAIN_LOCATIONS)).optional(),
  notes: z.string().max(500).optional(),
  achievements: z.string().max(300).optional(),
  challenges: z.string().max(300).optional(),
  skip_reasons: z.array(SkipReasonSchema).optional(),
  // Signaux nutrition — Coaching Pro (optionnels, rétrocompatibles)
  hunger_level: z.number().int().min(1).max(5).nullable().optional(),
  digestive_comfort: z.number().int().min(1).max(5).nullable().optional(),
  meal_satisfaction: z.number().int().min(1).max(5).nullable().optional(),
});

export type BilanData = z.infer<typeof BilanSchema>;

/**
 * Champs jeûne envoyés en plus du `FeedbackSchema` (mirror du body web).
 * Le serveur ne les valide pas via le schema feedback ; conservés ici pour le
 * typage du form et du body POST. `continue_fasting === false` déclenche en
 * parallèle un `PATCH /api/profile/fasting` (désactivation du mode).
 */
export const BilanFastingSchema = z.object({
  fasting_days_count: z.number().int().min(0).max(7).optional(),
  fasting_difficulty: z.number().int().min(1).max(5).optional(),
  continue_fasting: z.boolean().optional(),
});

export type BilanFastingData = z.infer<typeof BilanFastingSchema>;

/** Body complet envoyé à POST /api/feedback (feedback + extras jeûne). */
export type BilanSubmitBody = BilanData & BilanFastingData;
