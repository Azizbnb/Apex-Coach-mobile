/**
 * Validation Schema for Step 1: Profile
 * APEX COACH - Multi-step Questionnaire
 *
 * Purpose: Validates basic profile information (age, height, weight, sex)
 * Used for: Metabolic calculations (BMI, BMR) and personalization
 */

import { z } from 'zod'

export const Step1Schema = z
  .object({
    firstName: z
      .string()
      .min(2, "Prénom trop court (minimum 2 caractères)")
      .max(50, "Prénom trop long (maximum 50 caractères)")
      .regex(
        /^[a-zA-ZÀ-ÿ\s\-']+$/,
        "Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes"
      )
      .transform((str) => str.trim()),

    age: z
      .number()
      .int("L'âge doit être un nombre entier")
      .min(16, "Tu dois avoir au moins 16 ans pour utiliser ce service")
      .max(
        80,
        "Pour ta sécurité, contacte-nous directement pour un programme adapté"
      ),

    sex: z.enum(['male', 'female', 'other']),

    height: z
      .number()
      .int("La taille doit être un nombre entier")
      .min(140, "Vérifie ta taille (minimum 140 cm)")
      .max(220, "Vérifie ta taille (maximum 220 cm)"),

    weight: z
      .number()
      .min(40, "Vérifie ton poids (minimum 40 kg)")
      .max(200, "Vérifie ton poids (maximum 200 kg)"),
  })
  .refine(
    // Cross-field validation: BMI calculation
    (data) => {
      const bmi = data.weight / Math.pow(data.height / 100, 2)
      return bmi >= 15 && bmi <= 45
    },
    {
      message:
        "Les valeurs de taille et poids semblent incohérentes. Vérifie-les attentivement.",
      path: ['weight'], // Display error on weight field
    }
  )

// TypeScript type derived from schema
export type Step1Data = z.infer<typeof Step1Schema>

// Helper function to calculate BMI
export function calculateBMI(height: number, weight: number): number {
  return parseFloat((weight / Math.pow(height / 100, 2)).toFixed(2))
}

// Helper function to calculate BMR (Basal Metabolic Rate) using Harris-Benedict equation
export function calculateBMR(
  age: number,
  height: number,
  weight: number,
  sex: 'male' | 'female' | 'other'
): number {
  if (sex === 'male') {
    return Math.round(88.362 + 13.397 * weight + 4.799 * height - 5.677 * age)
  } else if (sex === 'female') {
    return Math.round(447.593 + 9.247 * weight + 3.098 * height - 4.33 * age)
  } else {
    // For 'other', use average of both formulas
    const maleBMR = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    const femaleBMR = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
    return Math.round((maleBMR + femaleBMR) / 2)
  }
}

// Helper function to get BMI category
export function getBMICategory(bmi: number): {
  category: string
  color: string
  warning?: string
} {
  if (bmi < 18.5) {
    return {
      category: 'Sous-poids',
      color: 'text-blue-600',
      warning:
        'Un IMC faible peut nécessiter une approche particulière. Considère de consulter un professionnel.',
    }
  } else if (bmi < 25) {
    return {
      category: 'Poids normal',
      color: 'text-green-600',
    }
  } else if (bmi < 30) {
    return {
      category: 'Surpoids',
      color: 'text-orange-600',
    }
  } else {
    return {
      category: 'Obésité',
      color: 'text-red-600',
      warning:
        'Pour ta sécurité, nous te recommandons de consulter un médecin avant de commencer un programme intensif.',
    }
  }
}

// Validation flags for backend risk assessment
export interface Step1ValidationFlags {
  underweightRisk: boolean
  obesityRisk: boolean
  extremeAgeRisk: boolean
  warningLevel: 'none' | 'low' | 'medium' | 'high'
}

export function getValidationFlags(data: Step1Data): Step1ValidationFlags {
  const bmi = calculateBMI(data.height, data.weight)

  const flags: Step1ValidationFlags = {
    underweightRisk: bmi < 18.5,
    obesityRisk: bmi > 30,
    extremeAgeRisk: data.age > 70,
    warningLevel: 'none',
  }

  // Determine warning level
  if (flags.obesityRisk || flags.extremeAgeRisk) {
    flags.warningLevel = 'high'
  } else if (flags.underweightRisk) {
    flags.warningLevel = 'medium'
  } else if (bmi > 27 || data.age > 65) {
    flags.warningLevel = 'low'
  }

  return flags
}
