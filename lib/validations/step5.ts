/**
 * Validation Schema for Step 5: Health & Limitations
 * APEX COACH - Multi-step Questionnaire
 *
 * Purpose: Validates user's health information and physical limitations
 * Features: Medical disclaimers, exclusion logic, GDPR compliance
 * Note: This data MUST be encrypted (AES-256-GCM) before storage
 */

import { z } from 'zod'

// Enum for specific medical conditions
export const MedicalConditionEnum = z.enum([
  'heart_disease',        // Maladie cardiaque
  'high_blood_pressure',  // Hypertension
  'diabetes',             // Diabète
  'asthma',               // Asthme
  'pregnancy',            // Grossesse
  'eating_disorder',      // Trouble alimentaire
  'joint_problems',       // Problèmes articulaires
  'back_problems',        // Problèmes de dos
  'recent_surgery',       // Chirurgie récente (<6 mois)
  'other',                // Autre
])

// Enum for current pain/discomfort
export const PainLocationEnum = z.enum([
  'lower_back',    // Bas du dos
  'upper_back',    // Haut du dos
  'neck',          // Nuque/Cou
  'shoulders',     // Épaules
  'knees',         // Genoux
  'ankles',        // Chevilles
  'wrists',        // Poignets
  'hips',          // Hanches
  'other',         // Autre
])

// Main Step 5 schema
export const Step5Schema = z.object({
  // DISCLAIMER ACCEPTANCE (REQUIRED)
  disclaimerAccepted: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter le disclaimer médical pour continuer',
  }),

  // MEDICAL CONDITIONS
  medicalConditions: z.array(MedicalConditionEnum).default([]),
  medicalConditionsDetails: z.string().max(1000, 'Maximum 1000 caractères').optional(),

  // CURRENT PAIN/INJURIES
  currentPain: z.array(PainLocationEnum).default([]),
  painDetails: z.string().max(1000, 'Maximum 1000 caractères').optional(),

  // MEDICATIONS
  takingMedication: z.boolean(),
  medications: z.string().max(500, 'Maximum 500 caractères').optional(),

  // DOCTOR APPROVAL (for certain conditions)
  hasDoctorApproval: z.boolean().optional(),

  // ADDITIONAL LIMITATIONS
  physicalLimitations: z.string().max(1000, 'Maximum 1000 caractères').optional(),

  // GDPR CONSENT for sensitive health data
  healthDataConsent: z.boolean().refine((val) => val === true, {
    message: 'Vous devez consentir au traitement de vos données de santé',
  }),
}).superRefine((data, ctx) => {
  // If taking medication, require details
  if (data.takingMedication && (!data.medications || data.medications.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Veuillez préciser vos médicaments',
      path: ['medications'],
    })
  }
})

// TypeScript type
export type Step5Data = z.infer<typeof Step5Schema>

// Exclusion logic - determine if user should be blocked from program generation
export function checkMedicalExclusion(
  data: Step5Data,
  age: number
): {
  isExcluded: boolean
  exclusionReason?: string
  requiresDoctorApproval: boolean
  warnings: string[]
} {
  const warnings: string[] = []
  let isExcluded = false
  let exclusionReason: string | undefined
  let requiresDoctorApproval = false

  // Safe access with defaults to prevent undefined errors
  const medicalConditions = data.medicalConditions ?? []
  const currentPain = data.currentPain ?? []

  // ABSOLUTE EXCLUSIONS (cannot proceed without medical approval)

  // 1. Pregnancy
  if (medicalConditions.includes('pregnancy')) {
    isExcluded = true
    exclusionReason = 'Grossesse détectée : Un programme d\'entraînement pendant la grossesse nécessite l\'approbation expresse d\'un médecin. Nous ne pouvons pas générer de programme sans cette validation.'
    return { isExcluded, exclusionReason, requiresDoctorApproval: true, warnings }
  }

  // 2. Eating disorder
  if (medicalConditions.includes('eating_disorder')) {
    isExcluded = true
    exclusionReason = 'Trouble alimentaire détecté : Pour ta sécurité, nous ne pouvons pas proposer de programme incluant des recommandations nutritionnelles sans suivi médical. Nous te recommandons vivement de consulter un professionnel de santé.'
    return { isExcluded, exclusionReason, requiresDoctorApproval: true, warnings }
  }

  // 3. Multiple serious conditions + age > 60
  const seriousConditions = medicalConditions.filter(c =>
    ['heart_disease', 'high_blood_pressure', 'diabetes', 'recent_surgery'].includes(c)
  )
  if (seriousConditions.length >= 2 && age > 60) {
    isExcluded = true
    exclusionReason = 'Multiples conditions médicales détectées : Avec plusieurs conditions de santé et un âge supérieur à 60 ans, nous recommandons fortement un suivi médical personnalisé avant de commencer un programme d\'entraînement.'
    return { isExcluded, exclusionReason, requiresDoctorApproval: true, warnings }
  }

  // CONDITIONS REQUIRING DOCTOR APPROVAL (can proceed with approval)

  if (medicalConditions.includes('heart_disease')) {
    requiresDoctorApproval = true
    warnings.push('⚠️ Maladie cardiaque : Un avis médical est FORTEMENT recommandé avant de commencer tout programme d\'entraînement.')
  }

  if (medicalConditions.includes('high_blood_pressure') && !data.hasDoctorApproval) {
    warnings.push('💊 Hypertension : Assure-toi que ta tension est contrôlée. Certains exercices intenses seront exclus.')
  }

  if (medicalConditions.includes('diabetes')) {
    warnings.push('🩸 Diabète : Surveille ta glycémie avant/après l\'entraînement. Adapte ton programme selon tes besoins.')
  }

  if (medicalConditions.includes('asthma')) {
    warnings.push('💨 Asthme : Garde toujours ton inhalateur à portée de main. Les exercices seront adaptés.')
  }

  if (medicalConditions.includes('recent_surgery')) {
    requiresDoctorApproval = true
    warnings.push('🏥 Chirurgie récente : Un programme progressif sera proposé, mais un avis médical est indispensable.')
  }

  // PAIN/INJURY WARNINGS

  if (currentPain.includes('lower_back') || currentPain.includes('upper_back')) {
    warnings.push('🔴 Douleurs dorsales détectées : Les exercices à fort impact sur le dos seront modifiés ou exclus.')
  }

  if (currentPain.includes('knees')) {
    warnings.push('🦵 Douleurs aux genoux : Les exercices à impact élevé (sauts, course) seront limités.')
  }

  if (currentPain.length >= 3) {
    warnings.push('⚠️ Douleurs multiples : Un programme très progressif sera proposé. Consulte un professionnel si les douleurs persistent.')
  }

  return {
    isExcluded,
    exclusionReason,
    requiresDoctorApproval,
    warnings,
  }
}

// Display name helpers
export function getMedicalConditionDisplayName(condition: z.infer<typeof MedicalConditionEnum>): string {
  const names = {
    heart_disease: 'Maladie cardiaque',
    high_blood_pressure: 'Hypertension',
    diabetes: 'Diabète',
    asthma: 'Asthme',
    pregnancy: 'Grossesse',
    eating_disorder: 'Trouble alimentaire',
    joint_problems: 'Problèmes articulaires',
    back_problems: 'Problèmes de dos',
    recent_surgery: 'Chirurgie récente',
    other: 'Autre',
  }
  return names[condition]
}

export function getPainLocationDisplayName(location: z.infer<typeof PainLocationEnum>): string {
  const names = {
    lower_back: 'Bas du dos',
    upper_back: 'Haut du dos',
    neck: 'Nuque/Cou',
    shoulders: 'Épaules',
    knees: 'Genoux',
    ankles: 'Chevilles',
    wrists: 'Poignets',
    hips: 'Hanches',
    other: 'Autre',
  }
  return names[location]
}
