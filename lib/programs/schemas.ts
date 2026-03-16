/**
 * Program Generation Schemas - V2
 * APEX COACH
 *
 * Comprehensive Zod validation schemas for AI-generated workout and nutrition programs.
 * Ensures 100% control over Claude AI outputs through strict validation.
 *
 * Features:
 * - Complete type safety for all program fields
 * - Cross-field validation (e.g., week counts, macro totals)
 * - French language validation
 * - Min/max constraints on all numeric and string fields
 */

import { z } from 'zod'

// ==========================================
// WORKOUT PROGRAM SCHEMAS
// ==========================================

/**
 * Schema for individual exercise in a workout
 */
export const ExerciseSchema = z.object({
  exercise_name: z
    .string()
    .min(3, 'Nom d\'exercice trop court (min 3 caractères)')
    .max(100, 'Nom d\'exercice trop long (max 100 caractères)'),

  sets: z
    .number()
    .int('Les séries doivent être un nombre entier')
    .min(1, 'Minimum 1 série')
    .max(10, 'Maximum 10 séries'),

  reps: z
    .string()
    .min(1, 'Reps requis')
    .max(30, 'Reps trop long')
    .describe('Répétitions: "10", "8-12", "30s", "AMRAP", etc.'),

  rest_seconds: z
    .number()
    .int('Le repos doit être un nombre entier')
    .min(0, 'Le repos ne peut pas être négatif')
    .max(600, 'Maximum 10 minutes de repos'),

  intensity: z.enum(['Faible', 'Modérée', 'Élevée', 'Maximale'], {
    message: 'Intensité invalide',
  }),

  notes: z
    .string()
    .max(200, 'Instructions trop longues (max 200 caractères)')
    .transform(val => val.trim().length < 3 ? 'Exécution contrôlée, mouvement fluide' : val)
    .describe('Instructions techniques courtes et essentielles'),

  muscles_targeted: z
    .array(z.string())
    .min(1, 'Au moins 1 groupe musculaire ciblé')
    .max(5, 'Maximum 5 groupes musculaires'),

  // Optional fields
  tempo: z
    .string()
    .regex(/^\d+-\d+-\d+-\d+$/, 'Format tempo: "3-0-1-0" (excentrique-pause-concentrique-pause)')
    .optional()
    .describe('Tempo d\'exécution (excentrique-pause-concentrique-pause)'),

  alternative_exercises: z
    .array(z.string())
    .max(3, 'Maximum 3 exercices alternatifs')
    .optional()
    .describe('Exercices alternatifs si équipement manquant'),
})

export type Exercise = z.infer<typeof ExerciseSchema>

/**
 * Schema for warmup section
 */
export const WarmupSchema = z.object({
  duration_minutes: z
    .number()
    .int()
    .min(3, 'Échauffement trop court (min 3 minutes)')
    .max(15, 'Échauffement trop long (max 15 minutes)'),

  exercises: z
    .array(z.string())
    .min(1, 'Au moins 1 exercice d\'échauffement')
    .max(8, 'Maximum 8 exercices d\'échauffement'),

  notes: z.string().max(300).optional().describe('Instructions supplémentaires'),
})

export type Warmup = z.infer<typeof WarmupSchema>

/**
 * Schema for cooldown section
 */
export const CooldownSchema = z.object({
  duration_minutes: z
    .number()
    .int()
    .min(3, 'Retour au calme trop court (min 3 minutes)')
    .max(10, 'Retour au calme trop long (max 10 minutes)'),

  exercises: z
    .array(z.string())
    .min(1, 'Au moins 1 exercice de retour au calme')
    .max(6, 'Maximum 6 exercices de retour au calme'),

  stretching_focus: z
    .array(z.string())
    .optional()
    .describe('Groupes musculaires à étirer en priorité'),
})

export type Cooldown = z.infer<typeof CooldownSchema>

/**
 * Schema for a training session
 */
export const SessionSchema = z.object({
  day: z.enum(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'], {
    message: 'Jour invalide',
  }),

  session_number: z
    .number()
    .int()
    .min(1)
    .max(14, 'Maximum 14 sessions par semaine'),

  type: z.enum(
    ['Force', 'Hypertrophie', 'Endurance', 'HIIT', 'Cardio', 'Mobilité', 'Circuit', 'Repos actif'],
    {
      message: 'Type de session invalide',
    }
  ),

  duration_minutes: z
    .number()
    .int()
    .min(15, 'Session trop courte (min 15 minutes)')
    .max(180, 'Session trop longue (max 3 heures)'),

  warmup: WarmupSchema,

  main_workout: z
    .array(ExerciseSchema)
    .min(3, 'Au moins 3 exercices par session')
    .max(15, 'Maximum 15 exercices par session'),

  cooldown: CooldownSchema,

  notes: z.string().max(1000).optional().describe('Instructions spécifiques à cette session'),

  intensity_level: z
    .number()
    .min(1)
    .max(10)
    .optional()
    .describe('Niveau d\'intensité global de la session (1-10)'),
})

export type Session = z.infer<typeof SessionSchema>

/**
 * Schema for a training week
 */
export const WeekSchema = z.object({
  week_number: z.number().int().min(1).max(52),

  focus: z
    .string()
    .min(5, 'Focus de la semaine trop court (min 5 caractères)')
    .max(100, 'Focus de la semaine trop long (max 100 caractères)')
    .describe('Objectif principal de cette semaine (court)'),

  sessions: z
    .array(SessionSchema)
    .min(1, 'Au moins 1 session par semaine')
    .max(7, 'Maximum 7 sessions par semaine'),

  progression_notes: z
    .string()
    .max(500)
    .optional()
    .describe('Comment progresser par rapport à la semaine précédente'),
})

export type Week = z.infer<typeof WeekSchema>

/**
 * Schema for nutrition guidelines in workout program
 */
/**
 * Schema for nutrition guidelines in workout program
 *
 * IMPORTANT: min réduits sur hydration et meal_timing car l'IA génère
 * des recommandations concises mais valides (ex: "2-3L par jour" = 13 chars).
 */
export const NutritionGuidelinesSchema = z.object({
  calories_range: z
    .string()
    .regex(/\d+\s*[-–]\s*\d+/, 'Format calories: "2000-2200"')
    .transform(val => {
      // Normalize to strict format: remove spaces, dashes variants, trailing text
      const match = val.match(/(\d+)\s*[-–]\s*(\d+)/)
      return match ? `${match[1]}-${match[2]}` : val
    })
    .describe('Plage calorique quotidienne'),

  protein_grams: z
    .number()
    .int()
    .min(50, 'Protéines trop faibles (min 50g)')
    .max(400, 'Protéines trop élevées (max 400g)'),

  carbs_grams: z
    .number()
    .int()
    .min(50, 'Glucides trop faibles (min 50g)')
    .max(800, 'Glucides trop élevés (max 800g)'),

  fats_grams: z
    .number()
    .int()
    .min(30, 'Lipides trop faibles (min 30g)')
    .max(200, 'Lipides trop élevés (max 200g)'),

  hydration: z
    .string()
    .min(5, 'Recommandations d\'hydratation trop courtes')
    .max(300, 'Recommandations d\'hydratation trop longues')
    .describe('Recommandations pour l\'hydratation'),

  meal_timing: z
    .string()
    .min(5, 'Timing des repas trop court')
    .max(500, 'Timing des repas trop long')
    .describe('Quand manger par rapport aux entraînements'),

  pre_workout_nutrition: z.string().max(300).optional(),

  post_workout_nutrition: z.string().max(300).optional(),
})

export type NutritionGuidelines = z.infer<typeof NutritionGuidelinesSchema>

/**
 * Schema for recovery recommendations
 */
/**
 * Schema for recovery recommendations
 *
 * IMPORTANT: sleep_hours min réduit à 1 car l'IA peut générer "8h" (2 chars)
 * ou "7-8h" (4 chars) qui sont des recommandations valides.
 * rest_days, stretching, injury_prevention min réduits à 3 pour la même raison.
 */
export const RecoverySchema = z.object({
  sleep_hours: z
    .string()
    .min(1, 'Recommandation de sommeil trop courte')
    .max(500, 'Recommandation de sommeil trop longue')
    .describe('Heures de sommeil recommandées'),

  rest_days: z
    .string()
    .min(3, 'Recommandations de repos trop courtes')
    .max(300, 'Recommandations de repos trop longues')
    .describe('Jours et gestion du repos'),

  stretching: z
    .string()
    .min(3, 'Routine d\'étirements trop courte')
    .max(500, 'Routine d\'étirements trop longue')
    .describe('Routine d\'étirements recommandée'),

  injury_prevention: z
    .string()
    .min(3, 'Prévention des blessures trop courte')
    .max(500, 'Prévention des blessures trop longue')
    .describe('Conseils pour prévenir les blessures'),

  foam_rolling: z.string().max(300).optional().describe('Recommandations pour le foam rolling'),

  active_recovery: z.string().max(300).optional().describe('Activités de récupération active'),
})

export type Recovery = z.infer<typeof RecoverySchema>

/**
 * Schema for progress tracking
 */
/**
 * Schema for progress tracking
 *
 * IMPORTANT: weekly_check et adjustment_criteria min réduits à 5 car l'IA
 * peut générer des critères concis comme "Si plateau > 2 sem" (18 chars)
 * qui sont valides mais échouaient avec min(20).
 */
export const ProgressTrackingSchema = z.object({
  key_metrics: z
    .array(z.string())
    .min(2, 'Au moins 2 métriques clés')
    .max(8, 'Maximum 8 métriques clés'),

  weekly_check: z
    .string()
    .min(5, 'Check hebdomadaire trop court')
    .max(500, 'Check hebdomadaire trop long')
    .describe('Quoi vérifier chaque semaine'),

  adjustment_criteria: z
    .string()
    .min(5, 'Critères d\'ajustement trop courts')
    .max(500, 'Critères d\'ajustement trop longs')
    .describe('Quand et comment ajuster le programme'),

  expected_results: z
    .string()
    .max(500)
    .optional()
    .describe('Résultats attendus à la fin du programme'),
})

export type ProgressTracking = z.infer<typeof ProgressTrackingSchema>

/**
 * Main workout program schema with cross-field validation
 */
export const WorkoutProgramSchema = z
  .object({
    title: z
      .string()
      .min(10, 'Titre trop court (min 10 caractères)')
      .max(100, 'Titre trop long (max 100 caractères)'),

    description: z
      .string()
      .min(10, 'Description trop courte (min 10 caractères)')
      .max(500, 'Description trop longue (max 500 caractères)'),

    duration_weeks: z
      .number()
      .int()
      .min(1, 'Au moins 1 semaine')
      .max(52, 'Maximum 52 semaines'),

    summary: z
      .string()
      .min(50, 'Résumé trop court (min 50 caractères)')
      .max(2000, 'Résumé trop long (max 2000 caractères)')
      .describe('Philosophie complète et approche du programme'),

    weeks: z.array(WeekSchema).min(1).max(52),

    nutrition_guidelines: NutritionGuidelinesSchema,

    recovery: RecoverySchema,

    progress_tracking: ProgressTrackingSchema,

    disclaimers: z
      .array(z.string())
      .min(2, 'Au moins 2 disclaimers')
      .max(10, 'Maximum 10 disclaimers'),

    // Metadata (added post-generation, not from AI)
    metadata: z
      .object({
        generated_at: z.string().datetime(),
        prompt_version: z.string(),
        model_version: z.string(),
        questionnaire_id: z.string().uuid(),
      })
      .optional(),
  })
  .refine(
    (data) => data.weeks.length === data.duration_weeks,
    {
      message: 'Le nombre de semaines doit correspondre à duration_weeks',
      path: ['weeks'],
    }
  )
  .refine(
    (data) => {
      // Vérifier que les numéros de semaine sont séquentiels (1, 2, 3...)
      for (let i = 0; i < data.weeks.length; i++) {
        if (data.weeks[i].week_number !== i + 1) {
          return false
        }
      }
      return true
    },
    {
      message: 'Les numéros de semaine doivent être séquentiels à partir de 1',
      path: ['weeks'],
    }
  )

export type WorkoutProgram = z.infer<typeof WorkoutProgramSchema>

/**
 * Lite workout program schema - Starter & Coaching plans
 * WITHOUT nutrition_guidelines (nutrition is Coaching Pro only)
 */
export const WorkoutProgramSchemaLite = z
  .object({
    title: z
      .string()
      .min(5, 'Titre trop court (min 5 caractères)')
      .max(100, 'Titre trop long (max 100 caractères)'),

    description: z
      .string()
      .min(10, 'Description trop courte (min 10 caractères)')
      .max(500, 'Description trop longue (max 500 caractères)'),

    duration_weeks: z
      .number()
      .int()
      .min(1, 'Au moins 1 semaine')
      .max(52, 'Maximum 52 semaines'),

    summary: z
      .string()
      .min(50, 'Résumé trop court (min 50 caractères)')
      .max(2000, 'Résumé trop long (max 2000 caractères)')
      .describe('Philosophie complète et approche du programme'),

    weeks: z.array(WeekSchema).min(1).max(52),

    // NO nutrition_guidelines for Lite version

    recovery: RecoverySchema,

    progress_tracking: ProgressTrackingSchema,

    disclaimers: z
      .array(z.string())
      .min(2, 'Au moins 2 disclaimers')
      .max(10, 'Maximum 10 disclaimers'),

    metadata: z
      .object({
        generated_at: z.string().datetime(),
        prompt_version: z.string(),
        model_version: z.string(),
        questionnaire_id: z.string().uuid(),
      })
      .optional(),
  })
  .refine(
    (data) => data.weeks.length === data.duration_weeks,
    {
      message: 'Le nombre de semaines doit correspondre à duration_weeks',
      path: ['weeks'],
    }
  )
  .refine(
    (data) => {
      for (let i = 0; i < data.weeks.length; i++) {
        if (data.weeks[i].week_number !== i + 1) {
          return false
        }
      }
      return true
    },
    {
      message: 'Les numéros de semaine doivent être séquentiels à partir de 1',
      path: ['weeks'],
    }
  )

export type WorkoutProgramLite = z.infer<typeof WorkoutProgramSchemaLite>

// ==========================================
// NUTRITION PLAN SCHEMAS
// ==========================================

/**
 * Schema for macronutrient distribution
 */
export const MacrosSchema = z
  .object({
    protein_grams: z.number().int().min(50).max(400),
    protein_percentage: z.number().min(10).max(50),
    carbs_grams: z.number().int().min(50).max(800),
    carbs_percentage: z.number().min(20).max(70),
    fats_grams: z.number().int().min(30).max(200),
    fats_percentage: z.number().min(15).max(50),
  })
  .refine(
    (data) => {
      const total =
        data.protein_percentage + data.carbs_percentage + data.fats_percentage
      return Math.abs(total - 100) < 1 // Tolérance 1% pour arrondi
    },
    {
      message: 'Les pourcentages de macros doivent totaliser 100% (±1%)',
      path: ['protein_percentage'],
    }
  )

export type Macros = z.infer<typeof MacrosSchema>

/**
 * Schema for a recipe
 * @deprecated Recipes feature removed - kept for backward compatibility
 */
export const RecipeSchema = z.object({
  name: z.string().min(3).max(100),
  ingredients: z.array(z.string()).min(2).max(20),
  instructions: z.array(z.string()).min(2).max(15),
  prep_time_minutes: z.number().int().min(5).max(180),
  cooking_tip: z.string().max(300).optional(),
})

/** @deprecated Recipes feature removed */
export type Recipe = z.infer<typeof RecipeSchema>

/**
 * Schema for a meal
 */
export const MealSchema = z.object({
  meal_type: z.enum(
    [
      'Petit-déjeuner',
      'Collation matin',
      'Déjeuner',
      'Collation après-midi',
      'Dîner',
      'Collation soir',
    ],
    {
      message: 'Type de repas invalide',
    }
  ),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format horaire: HH:MM (ex: "07:30")'),
  calories: z.number().int().min(50).max(1500),
  // Macros: min 0 pour les collations légères (fruit, yaourt nature, etc.)
  protein: z.number().int().min(0).max(100),
  carbs: z.number().int().min(0).max(200),
  fats: z.number().int().min(0).max(80),
  name: z.string().min(2).max(100),
  description: z.string().max(300).optional(),
  alternatives: z.array(z.string()).max(3).optional(),
})

export type Meal = z.infer<typeof MealSchema>

/**
 * Schema for a day's meal plan
 */
export const DayMealPlanSchema = z
  .object({
    day: z.enum(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'], {
      message: 'Jour invalide',
    }),
    meals: z.array(MealSchema).min(3, 'Au moins 3 repas par jour').max(6, 'Maximum 6 repas par jour'),
    daily_total: z.object({
      calories: z.number().int(),
      protein: z.number().int(),
      carbs: z.number().int(),
      fats: z.number().int(),
    }),
  })
  .refine(
    (data) => {
      const sumCalories = data.meals.reduce((sum, m) => sum + m.calories, 0)
      const sumProtein = data.meals.reduce((sum, m) => sum + m.protein, 0)
      const sumCarbs = data.meals.reduce((sum, m) => sum + m.carbs, 0)
      const sumFats = data.meals.reduce((sum, m) => sum + m.fats, 0)

      return (
        Math.abs(sumCalories - data.daily_total.calories) < 50 &&
        Math.abs(sumProtein - data.daily_total.protein) < 10 &&
        Math.abs(sumCarbs - data.daily_total.carbs) < 20 &&
        Math.abs(sumFats - data.daily_total.fats) < 10
      )
    },
    {
      message: 'Les totaux quotidiens ne correspondent pas à la somme des repas',
      path: ['daily_total'],
    }
  )

export type DayMealPlan = z.infer<typeof DayMealPlanSchema>

/**
 * Schema for shopping list
 */
export const ShoppingListSchema = z.object({
  proteins: z.array(z.string()).min(3).max(20),
  carbs: z.array(z.string()).min(3).max(20),
  fats: z.array(z.string()).min(2).max(15),
  vegetables: z.array(z.string()).min(5).max(25),
  fruits: z.array(z.string()).min(2).max(20),
  other: z.array(z.string()).max(30),
})

export type ShoppingList = z.infer<typeof ShoppingListSchema>

/**
 * Schema for hydration recommendations
 */
export const HydrationSchema = z.object({
  daily_water_liters: z.number().min(1.5).max(5),
  pre_workout: z.string().max(300),
  during_workout: z.string().max(300),
  post_workout: z.string().max(300),
  general_tips: z.string().max(300).optional(),
})

export type Hydration = z.infer<typeof HydrationSchema>

/**
 * Schema for a supplement recommendation
 *
 * IMPORTANT: dosage min réduit à 1 car l'IA génère des dosages courts valides
 * comme "5g", "1g", "3x/j" qui sont médicalement corrects.
 * Le min(3) précédent causait des échecs de validation récurrents.
 * Voir bug: supplements.recommended.X.dosage: Too small
 */
export const SupplementSchema = z.object({
  name: z.string().min(2).max(100),
  dosage: z.string().min(1).max(100),
  timing: z.string().min(3).max(300),
  optional: z.boolean(),
  notes: z.string().max(300).optional(),
})

export type Supplement = z.infer<typeof SupplementSchema>

/**
 * Schema for supplements section
 *
 * IMPORTANT: notes min réduit à 5 car l'IA peut générer des notes courtes
 * comme "Consulter un médecin." qui sont valides mais < 20 chars.
 */
export const SupplementsSchema = z.object({
  recommended: z.array(SupplementSchema).max(8),
  notes: z.string().min(5).max(500),
})

export type Supplements = z.infer<typeof SupplementsSchema>

/**
 * Schema for meal timing recommendations
 *
 * IMPORTANT: min réduits car l'IA génère souvent des recommandations concises
 * comme "2h avant l'effort" (17 chars) ou "Dans l'heure" (12 chars)
 * qui sont nutritionnellement valides.
 */
export const MealTimingSchema = z.object({
  pre_workout: z.string().min(5).max(300),
  post_workout: z.string().min(5).max(300),
  general: z.string().min(5).max(500),
})

export type MealTiming = z.infer<typeof MealTimingSchema>

/**
 * Main nutrition plan schema with cross-field validation
 */
export const NutritionPlanSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(20).max(500),
  daily_calories: z.number().int().min(1200).max(5000),
  macros: MacrosSchema,
  meal_plan: z
    .array(DayMealPlanSchema)
    .length(7, 'Le plan nutritionnel doit contenir exactement 7 jours'),
  shopping_list: ShoppingListSchema,
  hydration: HydrationSchema,
  supplements: SupplementsSchema,
  meal_timing: MealTimingSchema,
  tips: z.array(z.string()).min(3).max(10),
  disclaimers: z.array(z.string()).min(2).max(8),
})

export type NutritionPlan = z.infer<typeof NutritionPlanSchema>
