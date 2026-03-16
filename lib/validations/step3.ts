/**
 * Validation Schema for Step 3: Experience Level
 * APEX COACH - Multi-step Questionnaire
 *
 * Purpose: Validates user's fitness experience level and training background
 * Features: Cross-validation questions to detect over/underestimation
 */

import { z } from 'zod'

// Enum for fitness level
export const FitnessLevelEnum = z.enum([
  'beginner',      // Débutant
  'intermediate',  // Intermédiaire
  'advanced',      // Avancé
  'athlete',       // Athlète
])

// Enum for training experience
export const TrainingExperienceEnum = z.enum([
  'none',
  'less_than_6_months',
  '6_months_to_1_year',
  '1_to_2_years',
  'more_than_2_years',
])

// Enum for push-ups ability (validation croisée)
export const PushUpsAbilityEnum = z.enum([
  'none',           // Aucune
  'less_than_5',    // Moins de 5
  '5_to_10',        // 5 à 10
  '11_to_20',       // 11 à 20
  'more_than_20',   // Plus de 20
])

// Enum for running endurance (validation croisée)
export const RunningEnduranceEnum = z.enum([
  'less_than_5_min',    // Moins de 5 min
  '5_to_10_min',        // 5 à 10 min
  '10_to_20_min',       // 10 à 20 min
  'more_than_20_min',   // Plus de 20 min
])

// Enum for weight training experience (validation croisée)
export const WeightTrainingExpEnum = z.enum([
  'never',             // Jamais utilisé
  'few_times',         // Quelques fois
  'comfortable',       // À l'aise
  'very_experienced',  // Très expérimenté
])

// Enum for past injuries
export const PastInjuriesEnum = z.enum([
  'shoulder',    // Épaule
  'elbow',       // Coude
  'wrist',       // Poignet
  'back',        // Dos
  'hip',         // Hanche
  'knee',        // Genou
  'ankle',       // Cheville
  'neck',        // Nuque/cou
  'other',       // Autre
  'none',        // Aucune blessure
])

// Main Step 3 schema with cross-validation
export const Step3Schema = z.object({
  fitnessLevel: FitnessLevelEnum,
  trainingExperience: TrainingExperienceEnum,

  // Validation croisée (cross-validation questions)
  pushUpsAbility: PushUpsAbilityEnum,
  runningEndurance: RunningEnduranceEnum,
  weightTrainingExp: WeightTrainingExpEnum,

  // Optional field for previous programs
  previousPrograms: z.string().max(500, 'Maximum 500 caractères').optional(),

  // Past injuries
  pastInjuries: z
    .array(PastInjuriesEnum)
    .max(6, "Maximum 6 zones de blessures")
    .optional(),

  // Injury details (required if injuries selected and not 'none')
  injuryDetails: z
    .string()
    .max(500, "Maximum 500 caractères")
    .optional(),
})

// TypeScript type
export type Step3Data = z.infer<typeof Step3Schema>

// Helper function to calculate adjusted fitness level based on cross-validation
export function calculateAdjustedLevel(data: Step3Data): {
  adjustedLevel: z.infer<typeof FitnessLevelEnum>
  needsAdjustment: boolean
  warning?: string
} {
  const { fitnessLevel, pushUpsAbility, runningEndurance, weightTrainingExp } = data

  // Score calculation (0-100)
  let score = 0

  // Push-ups scoring
  if (pushUpsAbility === 'none') score += 0
  else if (pushUpsAbility === 'less_than_5') score += 15
  else if (pushUpsAbility === '5_to_10') score += 30
  else if (pushUpsAbility === '11_to_20') score += 50
  else if (pushUpsAbility === 'more_than_20') score += 70

  // Running scoring
  if (runningEndurance === 'less_than_5_min') score += 0
  else if (runningEndurance === '5_to_10_min') score += 15
  else if (runningEndurance === '10_to_20_min') score += 30
  else if (runningEndurance === 'more_than_20_min') score += 50

  // Weight training scoring
  if (weightTrainingExp === 'never') score += 0
  else if (weightTrainingExp === 'few_times') score += 10
  else if (weightTrainingExp === 'comfortable') score += 25
  else if (weightTrainingExp === 'very_experienced') score += 40

  // Normalize score (0-100)
  const normalizedScore = Math.round((score / 160) * 100)

  // Determine actual level based on score
  let calculatedLevel: z.infer<typeof FitnessLevelEnum>
  if (normalizedScore < 25) calculatedLevel = 'beginner'
  else if (normalizedScore < 50) calculatedLevel = 'intermediate'
  else if (normalizedScore < 75) calculatedLevel = 'advanced'
  else calculatedLevel = 'athlete'

  // Check if user's self-assessment matches calculated level
  const levelOrder = ['beginner', 'intermediate', 'advanced', 'athlete']
  const userLevelIndex = levelOrder.indexOf(fitnessLevel)
  const calculatedLevelIndex = levelOrder.indexOf(calculatedLevel)
  const difference = userLevelIndex - calculatedLevelIndex

  let needsAdjustment = false
  let warning: string | undefined

  if (difference > 1) {
    // User over-estimated significantly
    needsAdjustment = true
    warning = `Selon tes réponses, ton niveau semble plutôt "${getLevelDisplayName(calculatedLevel)}". Nous ajusterons l'intensité du programme en conséquence pour ta sécurité.`
  } else if (difference === 1) {
    // Mild over-estimation
    warning = `Tes réponses suggèrent un niveau légèrement inférieur. Nous commencerons progressivement pour éviter les blessures.`
  } else if (difference < -1) {
    // User under-estimated
    warning = `Tu sembles sous-estimer ton niveau ! Nous proposerons des exercices plus stimulants adaptés à tes capacités.`
  }

  return {
    adjustedLevel: needsAdjustment ? calculatedLevel : fitnessLevel,
    needsAdjustment,
    warning,
  }
}

// Helper function to get display name for fitness level
export function getLevelDisplayName(level: z.infer<typeof FitnessLevelEnum>): string {
  const names = {
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    athlete: 'Athlète',
  }
  return names[level]
}

// Helper function to get display name for training experience
export function getExperienceDisplayName(exp: z.infer<typeof TrainingExperienceEnum>): string {
  const names = {
    none: 'Aucune expérience',
    less_than_6_months: 'Moins de 6 mois',
    '6_months_to_1_year': '6 mois à 1 an',
    '1_to_2_years': '1 à 2 ans',
    more_than_2_years: 'Plus de 2 ans',
  }
  return names[exp]
}

// Helper function to get display name for past injuries
export function getInjuryDisplayName(injury: z.infer<typeof PastInjuriesEnum>): string {
  const names: Record<string, string> = {
    shoulder: 'Épaule',
    elbow: 'Coude',
    wrist: 'Poignet',
    back: 'Dos',
    hip: 'Hanche',
    knee: 'Genou',
    ankle: 'Cheville',
    neck: 'Nuque/Cou',
    other: 'Autre',
    none: 'Aucune blessure',
  }
  return names[injury] || injury
}

/** Past injuries list for UI display */
export const PAST_INJURIES_LIST = [
  { value: 'shoulder', label: 'Épaule', icon: '🦴' },
  { value: 'elbow', label: 'Coude', icon: '💪' },
  { value: 'wrist', label: 'Poignet', icon: '✋' },
  { value: 'back', label: 'Dos', icon: '🔙' },
  { value: 'hip', label: 'Hanche', icon: '🦵' },
  { value: 'knee', label: 'Genou', icon: '🦵' },
  { value: 'ankle', label: 'Cheville', icon: '🦶' },
  { value: 'neck', label: 'Nuque/Cou', icon: '🔝' },
  { value: 'other', label: 'Autre', icon: '❓' },
  { value: 'none', label: 'Aucune blessure', icon: '✅' },
]
