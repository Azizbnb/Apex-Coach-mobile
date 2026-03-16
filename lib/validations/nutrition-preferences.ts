/**
 * Validation Schema for Nutrition Preferences
 * APEX COACH - Coaching Pro
 *
 * Purpose: Validates user's nutrition preferences for meal prep generation
 * Features: Dietary restrictions, allergies, intolerances, preferences
 * Usage: Post-payment questionnaire for Coaching Pro users (optional, can be skipped)
 */

import { z } from 'zod'
import type {
  DietaryRestriction,
  FoodAllergy,
  FoodIntolerance,
  CuisineType,
  BudgetLevel,
  MealPrepTime,
  RecipeComplexity,
} from '@/types'

// Enum for dietary restrictions
export const DietaryRestrictionEnum = z.enum([
  'vegetarian',
  'vegan',
  'pescatarian',
  'halal',
  'kosher',
  'gluten_free',
  'dairy_free',
  'paleo',
  'keto',
  'none',
])

// Enum for food allergies
export const FoodAllergyEnum = z.enum([
  'gluten',
  'lactose',
  'nuts',
  'peanuts',
  'tree_nuts',
  'shellfish',
  'eggs',
  'soy',
  'fish',
  'sesame',
  'none',
])

// Enum for food intolerances
export const FoodIntoleranceEnum = z.enum([
  'lactose',
  'gluten',
  'fructose',
  'histamine',
  'fodmap',
  'none',
])

// Enum for cuisine types
export const CuisineTypeEnum = z.enum([
  'mediterranean',
  'asian',
  'italian',
  'french',
  'mexican',
  'indian',
  'middle_eastern',
  'american',
  'japanese',
  'thai',
])

// Enum for budget levels
export const BudgetLevelEnum = z.enum(['low', 'medium', 'high', 'unlimited'])

// Enum for meal prep time
export const MealPrepTimeEnum = z.enum(['minimal', 'moderate', 'extensive'])

// Enum for recipe complexity
export const RecipeComplexityEnum = z.enum(['simple', 'intermediate', 'complex'])

// Main Nutrition Preferences schema
export const NutritionPreferencesSchema = z.object({
  // Dietary restrictions (can select multiple)
  dietary_restrictions: z
    .array(DietaryRestrictionEnum)
    .default([])
    .refine(
      (arr) => {
        // If 'none' is selected, it should be the only selection
        if (arr.includes('none' as DietaryRestriction)) {
          return arr.length === 1
        }
        return true
      },
      { message: "Si 'Aucune' est sélectionné, il ne peut y avoir d'autres restrictions" }
    ),

  // Allergies (can select multiple)
  allergies: z
    .array(FoodAllergyEnum)
    .default([])
    .refine(
      (arr) => {
        // If 'none' is selected, it should be the only selection
        if (arr.includes('none' as FoodAllergy)) {
          return arr.length === 1
        }
        return true
      },
      { message: "Si 'Aucune' est sélectionné, il ne peut y avoir d'autres allergies" }
    ),

  // Intolerances (can select multiple)
  intolerances: z
    .array(FoodIntoleranceEnum)
    .default([])
    .refine(
      (arr) => {
        // If 'none' is selected, it should be the only selection
        if (arr.includes('none' as FoodIntolerance)) {
          return arr.length === 1
        }
        return true
      },
      { message: "Si 'Aucune' est sélectionné, il ne peut y avoir d'autres intolérances" }
    ),

  // Disliked foods (free text)
  disliked_foods: z
    .string()
    .max(500, 'Maximum 500 caractères')
    .optional()
    .transform((str) => (str === '' ? undefined : str)),

  // Cuisine preferences (max 5)
  cuisine_preferences: z
    .array(CuisineTypeEnum)
    .max(5, 'Sélectionne maximum 5 types de cuisine')
    .default([]),

  // Budget level
  weekly_budget: BudgetLevelEnum.optional(),

  // Meal prep time available
  meal_prep_time: MealPrepTimeEnum.optional(),

  // Meals per day
  meals_per_day: z
    .number()
    .int('Doit être un nombre entier')
    .min(2, 'Minimum 2 repas par jour')
    .max(6, 'Maximum 6 repas par jour')
    .default(3),

  // Recipe complexity preference
  recipe_complexity: RecipeComplexityEnum.default('simple'),

  // Supplements (free text)
  supplements: z
    .string()
    .max(500, 'Maximum 500 caractères')
    .optional()
    .transform((str) => (str === '' ? undefined : str)),

  // Preferred beverages (free text, comma-separated)
  preferred_beverages: z
    .string()
    .max(300, 'Maximum 300 caractères')
    .optional()
    .transform((str) => (str === '' ? undefined : str)),

  // Additional restrictions (free text)
  additional_restrictions: z
    .string()
    .max(1000, 'Maximum 1000 caractères')
    .optional()
    .transform((str) => (str === '' ? undefined : str)),
})

// TypeScript types
export type NutritionPreferencesFormData = z.input<typeof NutritionPreferencesSchema>
export type NutritionPreferencesData = z.output<typeof NutritionPreferencesSchema>

// Display name helpers
export function getDietaryRestrictionDisplayName(restriction: DietaryRestriction): string {
  const names: Record<DietaryRestriction, string> = {
    vegetarian: 'Végétarien',
    vegan: 'Végan',
    pescatarian: 'Pescatarien',
    halal: 'Halal',
    kosher: 'Casher',
    gluten_free: 'Sans gluten',
    dairy_free: 'Sans lactose',
    paleo: 'Paléo',
    keto: 'Keto',
    none: 'Aucune',
  }
  return names[restriction]
}

export function getFoodAllergyDisplayName(allergy: FoodAllergy): string {
  const names: Record<FoodAllergy, string> = {
    gluten: 'Gluten',
    lactose: 'Lactose',
    nuts: 'Fruits à coque (tous)',
    peanuts: 'Arachides',
    tree_nuts: 'Noix',
    shellfish: 'Fruits de mer',
    eggs: 'Œufs',
    soy: 'Soja',
    fish: 'Poisson',
    sesame: 'Sésame',
    none: 'Aucune',
  }
  return names[allergy]
}

export function getFoodIntoleranceDisplayName(intolerance: FoodIntolerance): string {
  const names: Record<FoodIntolerance, string> = {
    lactose: 'Lactose',
    gluten: 'Gluten',
    fructose: 'Fructose',
    histamine: 'Histamine',
    fodmap: 'FODMAP',
    none: 'Aucune',
  }
  return names[intolerance]
}

export function getCuisineTypeDisplayName(cuisine: CuisineType): string {
  const names: Record<CuisineType, string> = {
    mediterranean: 'Méditerranéenne',
    asian: 'Asiatique',
    italian: 'Italienne',
    french: 'Française',
    mexican: 'Mexicaine',
    indian: 'Indienne',
    middle_eastern: 'Moyen-Orient',
    american: 'Américaine',
    japanese: 'Japonaise',
    thai: 'Thaïlandaise',
  }
  return names[cuisine]
}

export function getBudgetLevelDisplayName(budget: BudgetLevel): string {
  const names: Record<BudgetLevel, string> = {
    low: 'Économique (< 50€/semaine)',
    medium: 'Modéré (50-100€/semaine)',
    high: 'Confortable (100-150€/semaine)',
    unlimited: 'Illimité (> 150€/semaine)',
  }
  return names[budget]
}

export function getMealPrepTimeDisplayName(time: MealPrepTime): string {
  const names: Record<MealPrepTime, string> = {
    minimal: 'Minimal (< 30 min/jour)',
    moderate: 'Modéré (30-60 min/jour)',
    extensive: 'Étendu (> 60 min/jour)',
  }
  return names[time]
}

export function getRecipeComplexityDisplayName(complexity: RecipeComplexity): string {
  const names: Record<RecipeComplexity, string> = {
    simple: 'Simple (recettes faciles)',
    intermediate: 'Intermédiaire (quelques techniques)',
    complex: 'Complexe (techniques avancées)',
  }
  return names[complexity]
}

// Helper to check if user has critical allergies (needs extra caution)
export function hasCriticalAllergies(allergies: FoodAllergy[]): boolean {
  const criticalAllergies: FoodAllergy[] = ['nuts', 'peanuts', 'shellfish', 'fish']
  return allergies.some((allergy) => criticalAllergies.includes(allergy))
}

// Helper to generate summary for display
export function getNutritionPreferencesSummary(
  data: NutritionPreferencesFormData
): {
  has_restrictions: boolean
  restriction_count: number
  allergy_count: number
  intolerance_count: number
  is_complex: boolean
} {
  const restrictionCount = (data.dietary_restrictions || []).filter((r) => r !== 'none').length
  const allergyCount = (data.allergies || []).filter((a) => a !== 'none').length
  const intoleranceCount = (data.intolerances || []).filter((i) => i !== 'none').length

  const totalRestrictions = restrictionCount + allergyCount + intoleranceCount

  return {
    has_restrictions: totalRestrictions > 0,
    restriction_count: restrictionCount,
    allergy_count: allergyCount,
    intolerance_count: intoleranceCount,
    is_complex: totalRestrictions >= 3 || hasCriticalAllergies(data.allergies || []),
  }
}
