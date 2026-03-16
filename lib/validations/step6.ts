/**
 * Validation Schema for Step 6: Equipment & Preferences
 * APEX COACH - Multi-step Questionnaire
 *
 * Purpose: Validates user's available equipment and training preferences
 * Features: Equipment categories, training preferences
 */

import { z } from 'zod'

// Enum for available equipment
export const EquipmentEnum = z.enum([
  // No equipment
  'none',

  // Minimal equipment
  'resistance_bands',
  'yoga_mat',
  'jump_rope',

  // Home equipment
  'dumbbells',
  'adjustable_dumbbells',
  'kettlebells',
  'pull_up_bar',
  'ab_wheel',

  // Intermediate
  'barbell',
  'bench',
  'squat_rack',
  'weight_plates',

  // Cardio
  'treadmill',
  'stationary_bike',
  'rowing_machine',
  'elliptical',

  // Full gym access
  'full_gym_access',
])

// Enum for training preferences
export const TrainingPreferenceEnum = z.enum([
  'strength_training',     // Musculation
  'cardio',                // Cardio
  'hiit',                  // HIIT
  'bodyweight',            // Poids du corps
  'functional',            // Fonctionnel
  'mobility_flexibility',  // Mobilité/Souplesse
  'sports_specific',       // Spécifique sport
])

// Enum for exercises to avoid
export const ExercisesToAvoidEnum = z.enum([
  'burpees',           // Burpees
  'running',           // Course à pied
  'jumping',           // Sauts/Plyométrie
  'squats',            // Squats
  'lunges',            // Fentes
  'deadlifts',         // Soulevé de terre
  'overhead_press',    // Développé épaules
  'pull_ups',          // Tractions
  'push_ups',          // Pompes
  'planks',            // Gainage
  'crunches',          // Abdos/Crunchs
  'high_impact',       // Exercices à impact élevé
  'none',              // Aucun exercice à éviter
])

// Enum for preferred training intensity
export const PreferredIntensityEnum = z.enum([
  'low',       // Faible (récupération active)
  'moderate',  // Modérée (progression douce)
  'high',      // Élevée (performances)
  'variable',  // Variable (selon les jours)
])

// Main Step 6 schema
export const Step6Schema = z.object({
  // Equipment
  availableEquipment: z.array(EquipmentEnum).min(1, 'Sélectionne au moins une option'),

  // Dumbbell weights (if dumbbells selected)
  dumbbellWeights: z.string().max(200, 'Maximum 200 caractères').optional(),

  // Training preferences
  trainingPreferences: z.array(TrainingPreferenceEnum).max(3, 'Maximum 3 préférences').optional(),

  // Exercise dislikes (legacy - free text)
  exerciseDislikes: z.string().max(500, 'Maximum 500 caractères').optional(),

  // Exercises to avoid (structured selection)
  exercisesToAvoid: z
    .array(ExercisesToAvoidEnum)
    .max(8, "Maximum 8 exercices à éviter")
    .optional(),

  // Preferred training intensity
  preferredIntensity: PreferredIntensityEnum.optional(),

  // Additional preferences
  additionalPreferences: z.string().max(1000, 'Maximum 1000 caractères').optional(),
})

// TypeScript type
export type Step6Data = z.infer<typeof Step6Schema>

// Helper to categorize equipment level
export function getEquipmentLevel(equipment: z.infer<typeof EquipmentEnum>[]): 'none' | 'minimal' | 'home' | 'intermediate' | 'full_gym' {
  if (equipment.includes('full_gym_access')) {
    return 'full_gym'
  }

  if (equipment.includes('none')) {
    return 'none'
  }

  const intermediateEquipment = ['barbell', 'squat_rack', 'bench', 'weight_plates']
  const hasIntermediate = equipment.some(e => intermediateEquipment.includes(e))
  if (hasIntermediate) {
    return 'intermediate'
  }

  const homeEquipment = ['dumbbells', 'adjustable_dumbbells', 'kettlebells', 'pull_up_bar']
  const hasHome = equipment.some(e => homeEquipment.includes(e))
  if (hasHome) {
    return 'home'
  }

  return 'minimal'
}

// Display name helpers
export function getEquipmentDisplayName(equipment: z.infer<typeof EquipmentEnum>): string {
  const names = {
    none: 'Aucun équipement',

    // Minimal
    resistance_bands: 'Bandes élastiques',
    yoga_mat: 'Tapis de yoga',
    jump_rope: 'Corde à sauter',

    // Home
    dumbbells: 'Haltères',
    adjustable_dumbbells: 'Haltères ajustables',
    kettlebells: 'Kettlebells',
    pull_up_bar: 'Barre de traction',
    ab_wheel: 'Roue abdominale',

    // Intermediate
    barbell: 'Barre de musculation',
    bench: 'Banc de musculation',
    squat_rack: 'Rack à squat',
    weight_plates: 'Disques de poids',

    // Cardio
    treadmill: 'Tapis de course',
    stationary_bike: 'Vélo d\'appartement',
    rowing_machine: 'Rameur',
    elliptical: 'Vélo elliptique',

    // Full gym
    full_gym_access: 'Accès salle de sport complète',
  }
  return names[equipment]
}

export function getTrainingPreferenceDisplayName(pref: z.infer<typeof TrainingPreferenceEnum>): string {
  const names = {
    strength_training: 'Musculation',
    cardio: 'Cardio',
    hiit: 'HIIT',
    bodyweight: 'Poids du corps',
    functional: 'Fonctionnel',
    mobility_flexibility: 'Mobilité/Souplesse',
    sports_specific: 'Spécifique sport',
  }
  return names[pref]
}

export function getExerciseToAvoidDisplayName(exercise: z.infer<typeof ExercisesToAvoidEnum>): string {
  const names: Record<string, string> = {
    burpees: 'Burpees',
    running: 'Course à pied',
    jumping: 'Sauts/Plyométrie',
    squats: 'Squats',
    lunges: 'Fentes',
    deadlifts: 'Soulevé de terre',
    overhead_press: 'Développé épaules',
    pull_ups: 'Tractions',
    push_ups: 'Pompes',
    planks: 'Gainage',
    crunches: 'Abdos/Crunchs',
    high_impact: 'Exercices à impact élevé',
    none: 'Aucun exercice à éviter',
  }
  return names[exercise] || exercise
}

export function getPreferredIntensityDisplayName(intensity: z.infer<typeof PreferredIntensityEnum>): string {
  const names: Record<string, string> = {
    low: 'Faible (récupération active)',
    moderate: 'Modérée (progression douce)',
    high: 'Élevée (performances)',
    variable: 'Variable (selon les jours)',
  }
  return names[intensity] || intensity
}

/** Exercises to avoid list for UI display */
export const EXERCISES_TO_AVOID_LIST = [
  { value: 'burpees', label: 'Burpees', icon: '🏃' },
  { value: 'running', label: 'Course à pied', icon: '🏃' },
  { value: 'jumping', label: 'Sauts/Plyométrie', icon: '⬆️' },
  { value: 'squats', label: 'Squats', icon: '🦵' },
  { value: 'lunges', label: 'Fentes', icon: '🦿' },
  { value: 'deadlifts', label: 'Soulevé de terre', icon: '🏋️' },
  { value: 'overhead_press', label: 'Développé épaules', icon: '💪' },
  { value: 'pull_ups', label: 'Tractions', icon: '🧗' },
  { value: 'push_ups', label: 'Pompes', icon: '🤸' },
  { value: 'planks', label: 'Gainage', icon: '🧘' },
  { value: 'crunches', label: 'Abdos/Crunchs', icon: '🔄' },
  { value: 'high_impact', label: 'Exercices à impact élevé', icon: '⚡' },
  { value: 'none', label: 'Aucun exercice à éviter', icon: '✅' },
]

/** Preferred intensity list for UI display */
export const PREFERRED_INTENSITY_LIST = [
  { value: 'low', label: 'Faible', description: 'Récupération active, douceur', icon: '🌿' },
  { value: 'moderate', label: 'Modérée', description: 'Progression douce et régulière', icon: '📈' },
  { value: 'high', label: 'Élevée', description: 'Performances et défis', icon: '🔥' },
  { value: 'variable', label: 'Variable', description: 'Selon les jours et l\'énergie', icon: '🔄' },
]
