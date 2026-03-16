import { z } from 'zod'

/**
 * Schema de validation pour la création d'un avis
 * - Rating : 1 à 5 étoiles (entier)
 * - Comment : 10 à 1000 caractères
 * - Tags : 1 à 3 tags sélectionnés parmi les prédéfinis
 */
export const CreateReviewSchema = z.object({
  rating: z
    .number()
    .int('La note doit être un nombre entier')
    .min(1, 'La note minimum est 1 étoile')
    .max(5, 'La note maximum est 5 étoiles'),

  comment: z
    .string()
    .min(10, 'Ton commentaire doit faire au moins 10 caractères')
    .max(1000, 'Ton commentaire ne doit pas dépasser 1000 caractères')
    .transform((str) => str.trim()),

  tags: z
    .array(z.string().min(1).max(100))
    .min(1, 'Sélectionne au moins 1 tag')
    .max(3, 'Tu peux sélectionner au maximum 3 tags'),
})

export type CreateReviewData = z.infer<typeof CreateReviewSchema>

/**
 * Schema de validation pour la mise à jour d'un avis (tous les champs optionnels)
 */
export const UpdateReviewSchema = CreateReviewSchema.partial()

export type UpdateReviewData = z.infer<typeof UpdateReviewSchema>

/**
 * Schema de validation pour la modération admin
 */
export const ModerateReviewSchema = z.object({
  review_id: z.string().uuid('ID de l\'avis invalide'),
  action: z.enum(['approve', 'reject'], {
    message: 'Action invalide (approve ou reject)',
  }),
  notes: z
    .string()
    .max(500, 'Les notes de modération ne doivent pas dépasser 500 caractères')
    .optional(),
})

export type ModerateReviewData = z.infer<typeof ModerateReviewSchema>
