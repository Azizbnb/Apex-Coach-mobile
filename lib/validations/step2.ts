/**
 * Validation Schema for Step 2: Goals & Objectives
 * APEX COACH - Multi-step Questionnaire
 *
 * Purpose: Validates user goals and objectives with conditional logic
 * Features: Weight loss tracking, muscle gain focus, sport performance, event prep
 */

import { z } from 'zod'

// Enum for primary objectives
export const ObjectiveEnum = z.enum([
  'weight_loss',
  'muscle_gain',
  'sport_performance',
  'general_fitness',
  'event_preparation',
])

// Enum for secondary goals
export const SecondaryGoalsEnum = z.enum([
  'gain_strength',
  'improve_endurance',
  'gain_flexibility',
  'improve_cardio',
  'reduce_stress',
  'improve_posture',
])

// Enum for sport-specific performance goals
export const SportGoalsEnum = z.enum([
  'explosivity',        // Gain d'explosivité
  'endurance',          // Gain d'endurance
  'vertical_jump',      // Sauter plus haut
  'speed',              // Courir plus vite
  'agility',            // Agilité/changements de direction
  'strength',           // Force spécifique au sport
  'injury_prevention',  // Prévention blessures
  'recovery',           // Améliorer récupération
])

// Enum for muscle gain focus areas
export const MuscleGainFocusEnum = z.enum(['upper', 'lower', 'balanced'])

// Main Step 2 schema with conditional validation
export const Step2Schema = z
  .object({
    primaryObjective: ObjectiveEnum,

    // Conditional fields for weight loss
    targetWeightLoss: z
      .number()
      .min(1, "Minimum 1kg")
      .max(30, "Pour une perte > 30kg, consulte un nutritionniste")
      .optional(),

    weightLossTimeframe: z
      .number()
      .int("Doit être un nombre entier")
      .min(1, "Minimum 1 mois")
      .max(12, "Maximum 12 mois")
      .optional(),

    // Conditional field for muscle gain
    muscleGainFocus: MuscleGainFocusEnum.optional(),

    // Conditional field for sport performance (validated against SPORTS_LIST)
    sport: z.string().optional(),

    // Conditional fields for sport performance goals
    sportGoals: z
      .array(SportGoalsEnum)
      .max(4, "Sélectionne maximum 4 objectifs sportifs")
      .optional(),

    sportGoalDetails: z
      .string()
      .max(300, "Maximum 300 caractères")
      .optional(),

    // Conditional field for event preparation
    eventDate: z
      .string()
      .optional()
      .transform((str) => {
        if (!str) return undefined
        return new Date(str)
      }),

    // Secondary goals (max 3)
    secondaryGoals: z
      .array(SecondaryGoalsEnum)
      .max(3, "Sélectionne maximum 3 objectifs secondaires")
      .default([]),
  })
  .superRefine((data, ctx) => {
    // Validation for WEIGHT LOSS objective
    if (data.primaryObjective === 'weight_loss') {
      if (!data.targetWeightLoss) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indique combien de kg tu veux perdre",
          path: ['targetWeightLoss'],
        })
      }

      if (!data.weightLossTimeframe) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indique sur combien de mois",
          path: ['weightLossTimeframe'],
        })
      }

      // Check realistic weight loss rate
      if (data.targetWeightLoss && data.weightLossTimeframe) {
        const lossPerMonth = data.targetWeightLoss / data.weightLossTimeframe

        if (lossPerMonth > 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Perte de ${lossPerMonth.toFixed(1)}kg/mois est trop rapide. Maximum autorisé : 5 kg/mois.`,
            path: ['targetWeightLoss'],
          })
        }
      }
    }

    // Validation for MUSCLE GAIN objective
    if (data.primaryObjective === 'muscle_gain') {
      if (!data.muscleGainFocus) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sélectionne une zone prioritaire",
          path: ['muscleGainFocus'],
        })
      }
    }

    // Validation for SPORT PERFORMANCE objective
    if (data.primaryObjective === 'sport_performance') {
      if (!data.sport || data.sport.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indique quel sport tu pratiques",
          path: ['sport'],
        })
      }

      if (!data.sportGoals || data.sportGoals.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sélectionne au moins un objectif sportif",
          path: ['sportGoals'],
        })
      }
    }

    // Validation for EVENT PREPARATION objective
    if (data.primaryObjective === 'event_preparation') {
      if (!data.eventDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indique la date de ton événement",
          path: ['eventDate'],
        })
      } else {
        const eventDate = data.eventDate as Date
        const now = new Date()
        const daysUntil = Math.floor(
          (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysUntil < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La date ne peut pas être dans le passé",
            path: ['eventDate'],
          })
        } else if (daysUntil < 28) {
          // Warning but not blocking
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Seulement ${daysUntil} jours disponibles : le programme sera intensif et accéléré.`,
            path: ['eventDate'],
          })
        }
      }
    }
  })

// TypeScript type
export type Step2Data = z.infer<typeof Step2Schema>

// Helper function to get objective display name
export function getObjectiveDisplayName(objective: string): string {
  const names: Record<string, string> = {
    weight_loss: 'Perte de poids/graisse',
    muscle_gain: 'Prise de masse musculaire',
    sport_performance: 'Amélioration des performances sportives',
    general_fitness: 'Remise en forme / Santé générale',
    event_preparation: 'Préparation à un événement',
  }
  return names[objective] || objective
}

// Helper function to get secondary goal display name
export function getSecondaryGoalDisplayName(goal: string): string {
  const names: Record<string, string> = {
    gain_strength: 'Gagner en force',
    improve_endurance: "Améliorer l'endurance cardiovasculaire",
    gain_flexibility: 'Gagner en souplesse',
    improve_cardio: 'Améliorer le cardio',
    reduce_stress: 'Réduire le stress',
    improve_posture: 'Améliorer la posture',
  }
  return names[goal] || goal
}

// Helper function to get muscle gain focus display name
export function getMuscleGainFocusDisplayName(focus: string): string {
  const names: Record<string, string> = {
    upper: 'Haut du corps',
    lower: 'Bas du corps',
    balanced: 'Développement harmonieux',
  }
  return names[focus] || focus
}

// Helper to calculate weight loss per month
export function calculateWeightLossRate(
  targetLoss: number,
  timeframe: number
): {
  lossPerMonth: number
  lossPerWeek: number
  isRealistic: boolean
  isAmbitious: boolean
  isTooFast: boolean
  recommendation: string
} {
  const lossPerMonth = targetLoss / timeframe
  const lossPerWeek = lossPerMonth / 4.33

  // Thresholds: realistic ≤4, ambitious 4-5, too fast >5
  const isRealistic = lossPerMonth <= 4
  const isAmbitious = lossPerMonth > 4 && lossPerMonth <= 5
  const isTooFast = lossPerMonth > 5

  let recommendation: string
  if (isTooFast) {
    recommendation = `Perte de ${lossPerMonth.toFixed(1)}kg/mois est trop rapide. Maximum autorisé : 5 kg/mois.`
  } else if (isAmbitious) {
    recommendation = "Objectif ambitieux ! La plupart des experts recommandent 2-4 kg/mois pour des résultats durables."
  } else {
    recommendation = "Objectif réaliste et durable !"
  }

  return {
    lossPerMonth: parseFloat(lossPerMonth.toFixed(2)),
    lossPerWeek: parseFloat(lossPerWeek.toFixed(2)),
    isRealistic,
    isAmbitious,
    isTooFast,
    recommendation,
  }
}

// Helper to calculate days until event
export function calculateDaysUntilEvent(eventDate: Date): {
  days: number
  weeks: number
  isUrgent: boolean
  message: string
} {
  const now = new Date()
  const days = Math.floor(
    (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
  const weeks = Math.floor(days / 7)

  const isUrgent = days < 28
  const message = isUrgent
    ? `Délai court (${weeks} semaines) - Programme intensif recommandé`
    : `Tu as ${weeks} semaines pour te préparer - Excellent !`

  return {
    days,
    weeks,
    isUrgent,
    message,
  }
}

// ============================================================================
// SPORTS LIST - Comprehensive list of sports requiring physical preparation
// ============================================================================

/** Sports categories for organized display */
export const SPORTS_BY_CATEGORY = {
  team_sports: {
    label: 'Sports collectifs',
    sports: [
      { value: 'football', label: 'Football', icon: '⚽' },
      { value: 'basketball', label: 'Basketball', icon: '🏀' },
      { value: 'volleyball', label: 'Volleyball', icon: '🏐' },
      { value: 'handball', label: 'Handball', icon: '🤾' },
      { value: 'rugby', label: 'Rugby', icon: '🏉' },
      { value: 'hockey', label: 'Hockey', icon: '🏒' },
      { value: 'water_polo', label: 'Water-polo', icon: '🤽' },
    ],
  },
  racket_sports: {
    label: 'Sports de raquette',
    sports: [
      { value: 'tennis', label: 'Tennis', icon: '��' },
      { value: 'padel', label: 'Padel', icon: '🎾' },
      { value: 'badminton', label: 'Badminton', icon: '🏸' },
      { value: 'squash', label: 'Squash', icon: '🎾' },
      { value: 'table_tennis', label: 'Tennis de table', icon: '🏓' },
    ],
  },
  endurance_sports: {
    label: 'Sports d\'endurance',
    sports: [
      { value: 'running', label: 'Course à pied', icon: '🏃' },
      { value: 'trail', label: 'Trail / Ultra-trail', icon: '🏔️' },
      { value: 'cycling', label: 'Cyclisme route', icon: '🚴' },
      { value: 'mountain_biking', label: 'VTT', icon: '🚵' },
      { value: 'swimming', label: 'Natation', icon: '🏊' },
      { value: 'triathlon', label: 'Triathlon', icon: '🏊' },
      { value: 'rowing', label: 'Aviron', icon: '🚣' },
      { value: 'cross_country_skiing', label: 'Ski de fond', icon: '⛷️' },
    ],
  },
  combat_sports: {
    label: 'Sports de combat',
    sports: [
      { value: 'boxing', label: 'Boxe anglaise', icon: '🥊' },
      { value: 'kickboxing', label: 'Kickboxing', icon: '🥊' },
      { value: 'muay_thai', label: 'Muay Thaï', icon: '🥊' },
      { value: 'mma', label: 'MMA', icon: '🥋' },
      { value: 'judo', label: 'Judo', icon: '🥋' },
      { value: 'karate', label: 'Karaté', icon: '🥋' },
      { value: 'taekwondo', label: 'Taekwondo', icon: '🥋' },
      { value: 'brazilian_jiu_jitsu', label: 'Jiu-Jitsu brésilien', icon: '🥋' },
      { value: 'wrestling', label: 'Lutte', icon: '🤼' },
      { value: 'fencing', label: 'Escrime', icon: '🤺' },
    ],
  },
  strength_sports: {
    label: 'Sports de force',
    sports: [
      { value: 'powerlifting', label: 'Powerlifting', icon: '🏋️' },
      { value: 'weightlifting', label: 'Haltérophilie', icon: '🏋️' },
      { value: 'strongman', label: 'Strongman', icon: '💪' },
      { value: 'crossfit', label: 'CrossFit', icon: '🏋️' },
      { value: 'bodybuilding', label: 'Bodybuilding', icon: '💪' },
    ],
  },
  winter_sports: {
    label: 'Sports d\'hiver',
    sports: [
      { value: 'alpine_skiing', label: 'Ski alpin', icon: '⛷️' },
      { value: 'snowboard', label: 'Snowboard', icon: '🏂' },
      { value: 'ice_skating', label: 'Patinage', icon: '⛸️' },
      { value: 'biathlon', label: 'Biathlon', icon: '🎿' },
    ],
  },
  water_sports: {
    label: 'Sports nautiques',
    sports: [
      { value: 'surfing', label: 'Surf', icon: '🏄' },
      { value: 'kitesurfing', label: 'Kitesurf', icon: '🪁' },
      { value: 'wakeboard', label: 'Wakeboard', icon: '🏄' },
      { value: 'sailing', label: 'Voile', icon: '⛵' },
      { value: 'kayak', label: 'Kayak / Canoë', icon: '🛶' },
      { value: 'diving', label: 'Plongée', icon: '🤿' },
    ],
  },
  outdoor_sports: {
    label: 'Sports outdoor',
    sports: [
      { value: 'climbing', label: 'Escalade', icon: '🧗' },
      { value: 'hiking', label: 'Randonnée / Trekking', icon: '🥾' },
      { value: 'golf', label: 'Golf', icon: '⛳' },
      { value: 'horse_riding', label: 'Équitation', icon: '🏇' },
      { value: 'archery', label: 'Tir à l\'arc', icon: '🏹' },
    ],
  },
  athletics: {
    label: 'Athlétisme',
    sports: [
      { value: 'sprinting', label: 'Sprint', icon: '🏃' },
      { value: 'long_jump', label: 'Saut en longueur', icon: '🏃' },
      { value: 'high_jump', label: 'Saut en hauteur', icon: '🏃' },
      { value: 'pole_vault', label: 'Saut à la perche', icon: '🏃' },
      { value: 'throwing', label: 'Lancers (poids, disque, javelot)', icon: '🏃' },
      { value: 'decathlon', label: 'Décathlon / Heptathlon', icon: '🏅' },
    ],
  },
  gymnastics_dance: {
    label: 'Gymnastique & Danse',
    sports: [
      { value: 'gymnastics', label: 'Gymnastique artistique', icon: '🤸' },
      { value: 'rhythmic_gymnastics', label: 'Gymnastique rythmique', icon: '🎀' },
      { value: 'trampoline', label: 'Trampoline', icon: '🤸' },
      { value: 'parkour', label: 'Parkour / Freerunning', icon: '🏃' },
      { value: 'dance_sport', label: 'Danse sportive', icon: '💃' },
      { value: 'pole_dance', label: 'Pole dance', icon: '💃' },
    ],
  },
}

/** Sport item type */
export interface SportItem {
  value: string
  label: string
  icon: string
}

/** Sport category type */
export interface SportCategory {
  label: string
  sports: SportItem[]
}

/** Flat list of all sports for selection */
export const SPORTS_LIST: SportItem[] = Object.values(SPORTS_BY_CATEGORY).flatMap(
  (category) => category.sports
)

/** Sport values for Zod enum validation */
export const SPORT_VALUES = SPORTS_LIST.map((s) => s.value) as [string, ...string[]]

/** Zod enum for sport validation */
export const SportEnum = z.enum(SPORT_VALUES)

/** Helper to get sport display name */
export function getSportDisplayName(sportValue: string): string {
  const sport = SPORTS_LIST.find((s) => s.value === sportValue)
  return sport?.label || sportValue
}

/** Helper to get sport icon */
export function getSportIcon(sportValue: string): string {
  const sport = SPORTS_LIST.find((s) => s.value === sportValue)
  return sport?.icon || '🏆'
}

/** Helper to get sport goal display name */
export function getSportGoalDisplayName(goal: string): string {
  const names: Record<string, string> = {
    explosivity: "Gain d'explosivité",
    endurance: "Gain d'endurance",
    vertical_jump: 'Sauter plus haut',
    speed: 'Courir plus vite',
    agility: 'Agilité / Changements de direction',
    strength: 'Force spécifique au sport',
    injury_prevention: 'Prévention des blessures',
    recovery: 'Améliorer la récupération',
  }
  return names[goal] || goal
}

/** Sport goals list for UI display */
export const SPORT_GOALS_LIST = [
  { value: 'explosivity', label: "Gain d'explosivité", icon: '💥' },
  { value: 'endurance', label: "Gain d'endurance", icon: '🏃' },
  { value: 'vertical_jump', label: 'Sauter plus haut', icon: '⬆️' },
  { value: 'speed', label: 'Courir plus vite', icon: '⚡' },
  { value: 'agility', label: 'Agilité', icon: '🔄' },
  { value: 'strength', label: 'Force spécifique', icon: '💪' },
  { value: 'injury_prevention', label: 'Prévention blessures', icon: '🛡️' },
  { value: 'recovery', label: 'Récupération', icon: '🧘' },
]

// ============================================================================
// SPORT → GOALS MAPPING - Contextual filtering of goals per sport
// ============================================================================

/** Mapping sport → objectifs pertinents */
export const SPORT_GOAL_MAPPING: Record<string, string[]> = {
  // Sports collectifs (différenciés selon le type d'effort)
  football: ['explosivity', 'speed', 'agility', 'endurance', 'injury_prevention', 'recovery'],
  basketball: ['explosivity', 'vertical_jump', 'agility', 'speed', 'strength', 'recovery'],
  volleyball: ['vertical_jump', 'explosivity', 'agility', 'strength', 'injury_prevention', 'recovery'],
  handball: ['explosivity', 'speed', 'agility', 'strength', 'endurance', 'injury_prevention'],
  rugby: ['strength', 'explosivity', 'speed', 'agility', 'injury_prevention', 'recovery'],
  hockey: ['speed', 'agility', 'endurance', 'explosivity', 'strength', 'injury_prevention'],
  water_polo: ['endurance', 'strength', 'agility', 'recovery'],

  // Sports de raquette
  tennis: ['agility', 'speed', 'endurance', 'explosivity', 'injury_prevention', 'recovery'],
  padel: ['agility', 'speed', 'endurance', 'explosivity', 'injury_prevention', 'recovery'],
  badminton: ['agility', 'speed', 'explosivity', 'endurance', 'injury_prevention'],
  squash: ['agility', 'speed', 'endurance', 'explosivity', 'recovery'],
  table_tennis: ['agility', 'speed', 'explosivity'],

  // Sports d'endurance
  running: ['endurance', 'strength', 'recovery', 'injury_prevention'],
  trail: ['endurance', 'strength', 'recovery', 'injury_prevention'],
  cycling: ['endurance', 'strength', 'recovery', 'injury_prevention'],
  mountain_biking: ['endurance', 'strength', 'agility', 'recovery'],
  swimming: ['endurance', 'strength', 'recovery', 'injury_prevention'],
  triathlon: ['endurance', 'strength', 'recovery', 'injury_prevention'],
  rowing: ['endurance', 'strength', 'explosivity', 'recovery'],
  cross_country_skiing: ['endurance', 'strength', 'recovery'],

  // Sports de combat
  boxing: ['explosivity', 'endurance', 'strength', 'agility', 'speed', 'recovery'],
  kickboxing: ['explosivity', 'endurance', 'strength', 'agility', 'speed', 'recovery'],
  muay_thai: ['explosivity', 'endurance', 'strength', 'agility', 'speed', 'recovery'],
  mma: ['explosivity', 'endurance', 'strength', 'agility', 'speed', 'recovery'],
  judo: ['strength', 'explosivity', 'agility', 'endurance', 'recovery'],
  karate: ['explosivity', 'speed', 'agility', 'strength', 'recovery'],
  taekwondo: ['explosivity', 'speed', 'agility', 'strength', 'recovery'],
  brazilian_jiu_jitsu: ['strength', 'explosivity', 'agility', 'endurance', 'recovery'],
  wrestling: ['strength', 'explosivity', 'agility', 'endurance', 'recovery'],
  fencing: ['speed', 'agility', 'explosivity', 'endurance'],

  // Sports de force
  powerlifting: ['strength', 'explosivity', 'recovery', 'injury_prevention'],
  weightlifting: ['strength', 'explosivity', 'recovery', 'injury_prevention'],
  strongman: ['strength', 'explosivity', 'recovery', 'injury_prevention'],
  crossfit: ['endurance', 'strength', 'explosivity', 'agility', 'recovery'],
  bodybuilding: ['strength', 'recovery'],

  // Sports d'hiver
  alpine_skiing: ['explosivity', 'agility', 'strength', 'injury_prevention'],
  snowboard: ['explosivity', 'agility', 'strength', 'injury_prevention'],
  ice_skating: ['agility', 'endurance', 'strength', 'explosivity'],
  biathlon: ['endurance', 'strength', 'recovery'],

  // Sports nautiques
  surfing: ['strength', 'agility', 'endurance', 'recovery'],
  kitesurfing: ['strength', 'agility', 'endurance', 'recovery'],
  wakeboard: ['strength', 'agility', 'endurance', 'recovery'],
  sailing: ['endurance', 'strength'],
  kayak: ['endurance', 'strength', 'recovery'],
  diving: ['endurance', 'recovery'],

  // Sports outdoor
  climbing: ['strength', 'endurance', 'agility', 'recovery', 'injury_prevention'],
  hiking: ['endurance', 'strength', 'recovery'],
  golf: ['strength', 'agility', 'injury_prevention'],
  horse_riding: ['strength', 'agility', 'recovery'],
  archery: ['strength', 'recovery'],

  // Athlétisme
  sprinting: ['explosivity', 'speed', 'strength'],
  long_jump: ['explosivity', 'speed', 'strength'],
  high_jump: ['vertical_jump', 'explosivity', 'strength'],
  pole_vault: ['explosivity', 'strength', 'agility'],
  throwing: ['strength', 'explosivity', 'recovery'],
  decathlon: ['endurance', 'strength', 'explosivity', 'speed', 'agility', 'recovery'],

  // Gymnastique & Danse
  gymnastics: ['strength', 'agility', 'explosivity', 'vertical_jump', 'injury_prevention', 'recovery'],
  rhythmic_gymnastics: ['agility', 'strength', 'injury_prevention'],
  trampoline: ['vertical_jump', 'agility', 'explosivity', 'strength'],
  parkour: ['explosivity', 'agility', 'strength', 'vertical_jump', 'injury_prevention'],
  dance_sport: ['agility', 'endurance', 'strength', 'injury_prevention'],
  pole_dance: ['strength', 'agility', 'endurance', 'recovery'],
}

/** Objectifs par défaut si sport non trouvé */
const DEFAULT_SPORT_GOALS = ['explosivity', 'endurance', 'strength', 'agility', 'injury_prevention', 'recovery']

/** Récupère les objectifs pertinents pour un sport donné */
export function getGoalsForSport(sport: string): string[] {
  return SPORT_GOAL_MAPPING[sport] || DEFAULT_SPORT_GOALS
}

/** Filtre la liste des objectifs pour un sport donné */
export function getFilteredGoalsList(sport: string) {
  const relevantGoals = getGoalsForSport(sport)
  return SPORT_GOALS_LIST.filter(goal => relevantGoals.includes(goal.value))
}
