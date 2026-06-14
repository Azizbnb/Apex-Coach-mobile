/**
 * Résolution de l'état d'affichage de l'onglet Nutrition.
 *
 * Dérivé de la présence d'un plan + du statut de génération du programme.
 * Fonction pure et testable.
 */

import type { NutritionGenerationStatus } from '@/lib/api';

export type NutritionViewState = 'ready' | 'generating' | 'failed' | 'none';

export function resolveNutritionState(
  hasPlan: boolean,
  generation: Pick<NutritionGenerationStatus, 'status' | 'nutritionFailed'> | null
): NutritionViewState {
  if (hasPlan) return 'ready';
  if (generation?.status === 'generating') return 'generating';
  if (generation?.nutritionFailed) return 'failed';
  return 'none';
}
