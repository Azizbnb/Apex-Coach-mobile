/**
 * Validation Schema for Step 4: Availability & Constraints
 * APEX COACH - Multi-step Questionnaire
 *
 * Purpose: Validates user's time availability and training constraints
 * Features: Realistic frequency validation, warning system
 */

import { z } from 'zod'

// Enum for training frequency
export const TrainingFrequencyEnum = z.enum([
  '1_to_2_days',   // 1-2 jours/semaine
  '3_to_4_days',   // 3-4 jours/semaine
  '5_to_6_days',   // 5-6 jours/semaine
  'every_day',     // 7 jours/semaine
])

// Enum for session duration preference
export const SessionDurationEnum = z.enum([
  'less_than_30_min',   // Moins de 30 min
  '30_to_45_min',       // 30-45 min
  '45_to_60_min',       // 45-60 min
  'more_than_60_min',   // Plus de 60 min
])

// Enum for preferred training time
export const PreferredTimeEnum = z.enum([
  'morning',    // Matin
  'afternoon',  // Après-midi
  'evening',    // Soir
  'flexible',   // Flexible
])

// Enum for training location
export const TrainingLocationEnum = z.enum([
  'home',      // À domicile
  'gym',       // Salle de sport
  'outdoor',   // Extérieur
  'mixed',     // Mixte
])

// Enum for sleep hours (lifestyle)
export const SleepHoursEnum = z.enum([
  'less_than_5',   // Moins de 5h
  '5_to_6',        // 5-6h
  '6_to_7',        // 6-7h
  '7_to_8',        // 7-8h
  'more_than_8',   // Plus de 8h
])

// Enum for stress level (lifestyle)
export const StressLevelEnum = z.enum([
  'low',           // Faible
  'moderate',      // Modéré
  'high',          // Élevé
  'very_high',     // Très élevé
])

// Enum for work type (lifestyle)
export const WorkTypeEnum = z.enum([
  'sedentary',           // Sédentaire (bureau)
  'moderately_active',   // Modérément actif
  'physically_demanding',// Physiquement exigeant
])

// Main Step 4 schema
export const Step4Schema = z.object({
  trainingFrequency: TrainingFrequencyEnum,
  sessionDuration: SessionDurationEnum,
  preferredTime: PreferredTimeEnum,
  trainingLocation: TrainingLocationEnum,
  constraints: z.string().max(500, 'Maximum 500 caractères').optional(),

  // Lifestyle fields
  sleepHours: SleepHoursEnum.optional(),
  stressLevel: StressLevelEnum.optional(),
  workType: WorkTypeEnum.optional(),

  // Fasting declaration fields (generic: Ramadan, Carême, intermittent, etc.)
  followingFasting: z.boolean().optional(),
  fastingLevel: z.enum(['strict', 'moderate', 'light']).optional(),
  fastingStartDate: z.string().optional(),
  fastingEndDate: z.string().optional(),

  // DEPRECATED: Kept for backward compatibility with existing questionnaire data
  followingRamadan: z.boolean().optional(),
  ramadanStartDate: z.string().optional(),
  ramadanEndDate: z.string().optional(),
})
  // Refinement 1: Dates and level required if following fasting
  .refine(
    (data) => {
      if (data.followingFasting === true) {
        return data.fastingStartDate && data.fastingEndDate && data.fastingLevel
      }
      return true
    },
    {
      message: 'Les dates et le niveau de jeûne sont requis',
      path: ['fastingStartDate'],
    }
  )
  // Refinement 2: End date must be after start date
  .refine(
    (data) => {
      if (data.fastingStartDate && data.fastingEndDate) {
        const start = new Date(data.fastingStartDate)
        const end = new Date(data.fastingEndDate)
        return end > start
      }
      return true
    },
    {
      message: 'La date de fin doit être après la date de début',
      path: ['fastingEndDate'],
    }
  )
  // Refinement 3: Maximum 50 days duration (Lent is ~46 days, with margin)
  .refine(
    (data) => {
      if (data.fastingStartDate && data.fastingEndDate) {
        const start = new Date(data.fastingStartDate)
        const end = new Date(data.fastingEndDate)
        const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        return durationDays <= 50
      }
      return true
    },
    {
      message: 'La période de jeûne ne peut pas dépasser 50 jours',
      path: ['fastingEndDate'],
    }
  )
  // Backward compatibility: support old Ramadan fields
  .refine(
    (data) => {
      if (data.followingRamadan === true && !data.followingFasting) {
        return data.ramadanStartDate && data.ramadanEndDate
      }
      return true
    },
    {
      message: 'Les dates de début et fin sont requises',
      path: ['ramadanStartDate'],
    }
  )

// TypeScript type
export type Step4Data = z.infer<typeof Step4Schema>

// Helper function to check if training frequency is realistic for fitness level
export function validateTrainingLoad(
  frequency: z.infer<typeof TrainingFrequencyEnum>,
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'athlete'
): {
  isRealistic: boolean
  warning?: string
  riskLevel: 'low' | 'medium' | 'high'
} {
  // Score frequency (1-4)
  const frequencyScore = {
    '1_to_2_days': 1,
    '3_to_4_days': 2,
    '5_to_6_days': 3,
    'every_day': 4,
  }[frequency]

  // Recommended max frequency by level
  const recommendedMax = {
    beginner: 2,      // 3-4 days max
    intermediate: 3,  // 5-6 days max
    advanced: 4,      // 7 days ok
    athlete: 4,       // 7 days ok
  }[fitnessLevel]

  const difference = frequencyScore - recommendedMax

  if (difference > 1) {
    // High risk - too much training for level
    return {
      isRealistic: false,
      warning: `⚠️ ATTENTION : ${getFrequencyDisplayName(frequency)} est trop intense pour un niveau ${getLevelDisplayName(fitnessLevel)}. Risque élevé de blessure et burn-out. Nous recommandons 3-4 séances max pour commencer.`,
      riskLevel: 'high',
    }
  } else if (difference === 1) {
    // Medium risk
    return {
      isRealistic: false,
      warning: `💡 ${getFrequencyDisplayName(frequency)} est ambitieux pour ton niveau. Assure-toi d'avoir suffisamment de récupération entre les séances.`,
      riskLevel: 'medium',
    }
  } else if (frequencyScore === 1 && fitnessLevel === 'athlete') {
    // Too little for athlete
    return {
      isRealistic: true,
      warning: `Tu es athlète mais ne t'entraînes que ${getFrequencyDisplayName(frequency)}. C'est parfait si tu cherches du maintien, mais limité pour progresser.`,
      riskLevel: 'low',
    }
  }

  return {
    isRealistic: true,
    riskLevel: 'low',
  }
}

// Helper function to check if session duration is appropriate
export function validateSessionDuration(
  duration: z.infer<typeof SessionDurationEnum>,
  frequency: z.infer<typeof TrainingFrequencyEnum>
): {
  warning?: string
} {
  // Very long sessions with high frequency = overtraining risk
  if (duration === 'more_than_60_min' && (frequency === '5_to_6_days' || frequency === 'every_day')) {
    return {
      warning: 'Des séances longues (>60 min) avec une fréquence élevée augmentent le risque de sur-entraînement. Prévois des jours de récupération.',
    }
  }

  // Very short sessions may limit progress
  if (duration === 'less_than_30_min' && frequency === '1_to_2_days') {
    return {
      warning: 'Moins de 30 min, 1-2 fois/semaine peut limiter tes progrès. Essaie d\'augmenter soit la durée, soit la fréquence.',
    }
  }

  return {}
}

// Display name helpers
export function getFrequencyDisplayName(freq: z.infer<typeof TrainingFrequencyEnum>): string {
  const names = {
    '1_to_2_days': '1-2 séances/semaine',
    '3_to_4_days': '3-4 séances/semaine',
    '5_to_6_days': '5-6 séances/semaine',
    'every_day': '7 séances/semaine',
  }
  return names[freq]
}

export function getDurationDisplayName(dur: z.infer<typeof SessionDurationEnum>): string {
  const names = {
    'less_than_30_min': 'Moins de 30 minutes',
    '30_to_45_min': '30-45 minutes',
    '45_to_60_min': '45-60 minutes',
    'more_than_60_min': 'Plus de 60 minutes',
  }
  return names[dur]
}

export function getTimeDisplayName(time: z.infer<typeof PreferredTimeEnum>): string {
  const names = {
    morning: 'Matin',
    afternoon: 'Après-midi',
    evening: 'Soir',
    flexible: 'Flexible',
  }
  return names[time]
}

export function getLocationDisplayName(loc: z.infer<typeof TrainingLocationEnum>): string {
  const names = {
    home: 'À domicile',
    gym: 'Salle de sport',
    outdoor: 'Extérieur',
    mixed: 'Mixte',
  }
  return names[loc]
}

function getLevelDisplayName(level: 'beginner' | 'intermediate' | 'advanced' | 'athlete'): string {
  const names = {
    beginner: 'débutant',
    intermediate: 'intermédiaire',
    advanced: 'avancé',
    athlete: 'athlète',
  }
  return names[level]
}

// Lifestyle helper functions
export function getSleepHoursDisplayName(sleep: z.infer<typeof SleepHoursEnum>): string {
  const names: Record<string, string> = {
    less_than_5: 'Moins de 5h',
    '5_to_6': '5-6 heures',
    '6_to_7': '6-7 heures',
    '7_to_8': '7-8 heures',
    more_than_8: 'Plus de 8h',
  }
  return names[sleep] || sleep
}

export function getStressLevelDisplayName(stress: z.infer<typeof StressLevelEnum>): string {
  const names: Record<string, string> = {
    low: 'Faible',
    moderate: 'Modéré',
    high: 'Élevé',
    very_high: 'Très élevé',
  }
  return names[stress] || stress
}

export function getWorkTypeDisplayName(work: z.infer<typeof WorkTypeEnum>): string {
  const names: Record<string, string> = {
    sedentary: 'Sédentaire (bureau)',
    moderately_active: 'Modérément actif',
    physically_demanding: 'Physiquement exigeant',
  }
  return names[work] || work
}

/** Sleep hours list for UI display */
export const SLEEP_HOURS_LIST = [
  { value: 'less_than_5', label: 'Moins de 5h', icon: '😴', warning: true },
  { value: '5_to_6', label: '5-6 heures', icon: '🌙' },
  { value: '6_to_7', label: '6-7 heures', icon: '😊' },
  { value: '7_to_8', label: '7-8 heures', icon: '✨', recommended: true },
  { value: 'more_than_8', label: 'Plus de 8h', icon: '💤' },
]

/** Stress level list for UI display */
export const STRESS_LEVEL_LIST = [
  { value: 'low', label: 'Faible', icon: '😌' },
  { value: 'moderate', label: 'Modéré', icon: '😐' },
  { value: 'high', label: 'Élevé', icon: '😰' },
  { value: 'very_high', label: 'Très élevé', icon: '😫' },
]

/** Work type list for UI display */
export const WORK_TYPE_LIST = [
  { value: 'sedentary', label: 'Sédentaire (bureau)', icon: '💻' },
  { value: 'moderately_active', label: 'Modérément actif', icon: '🚶' },
  { value: 'physically_demanding', label: 'Physiquement exigeant', icon: '🏗️' },
]

// ==========================================
// FASTING HELPERS
// ==========================================

/**
 * Format fasting weeks for display
 * Groups consecutive weeks: [1,2,3,5,6] → "Sem. 1-3, Sem. 5-6"
 */
export function formatFastingWeeks(weeks?: number[]): string {
  if (!weeks || weeks.length === 0) return 'Aucune'

  // Deduplicate and sort
  const sorted = [...new Set(weeks)].sort((a, b) => a - b)

  // Group consecutive weeks
  const groups: number[][] = []
  let currentGroup: number[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      currentGroup.push(sorted[i])
    } else {
      groups.push(currentGroup)
      currentGroup = [sorted[i]]
    }
  }
  groups.push(currentGroup)

  return groups.map(group => {
    if (group.length === 1) return `Sem. ${group[0]}`
    return `Sem. ${group[0]}-${group[group.length - 1]}`
  }).join(', ')
}

/** @deprecated Use formatFastingWeeks instead */
export const formatRamadanWeeks = formatFastingWeeks

/**
 * Get fasting level display name in French
 */
export function getFastingLevelDisplayName(level: 'strict' | 'moderate' | 'light'): string {
  const names: Record<string, string> = {
    strict: 'Strict',
    moderate: 'Modéré',
    light: 'Souple',
  }
  return names[level] || level
}

/**
 * Get fasting level description in French
 */
export function getFastingLevelDescription(level: 'strict' | 'moderate' | 'light'): string {
  const descriptions: Record<string, string> = {
    strict: 'Aucune nourriture ni eau jusqu\'au soir',
    moderate: 'Eau autorisée, alimentation très réduite',
    light: 'Restrictions alimentaires ciblées (ex : pas de viande certains jours)',
  }
  return descriptions[level] || ''
}

/** Fasting level list for UI display */
export const FASTING_LEVEL_LIST = [
  { value: 'strict' as const, label: 'Strict', icon: '🚫', description: 'Aucune nourriture ni eau jusqu\'au soir (ex : Ramadan)' },
  { value: 'moderate' as const, label: 'Modéré', icon: '💧', description: 'Eau autorisée, alimentation très réduite (ex : Carême strict)' },
  { value: 'light' as const, label: 'Souple', icon: '🍃', description: 'Restrictions ciblées (ex : pas de viande, repas allégés)' },
]

/**
 * Helper to normalize fasting data from questionnaire
 * Handles backward compatibility with old Ramadan-specific fields
 */
export function normalizeFastingData(step4: Partial<Step4Data>): {
  isFollowingFasting: boolean
  fastingLevel: 'strict' | 'moderate' | 'light' | undefined
  startDate: string | undefined
  endDate: string | undefined
} {
  // New fasting fields take priority
  if (step4.followingFasting) {
    return {
      isFollowingFasting: true,
      fastingLevel: step4.fastingLevel,
      startDate: step4.fastingStartDate,
      endDate: step4.fastingEndDate,
    }
  }

  // Backward compatibility: old Ramadan fields
  if (step4.followingRamadan) {
    return {
      isFollowingFasting: true,
      fastingLevel: 'strict', // Ramadan is always strict
      startDate: step4.ramadanStartDate,
      endDate: step4.ramadanEndDate,
    }
  }

  return {
    isFollowingFasting: false,
    fastingLevel: undefined,
    startDate: undefined,
    endDate: undefined,
  }
}
