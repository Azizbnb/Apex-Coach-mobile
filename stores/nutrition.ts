import { create } from 'zustand';
import { nutritionApi } from '@/lib/api';
import type { NutritionPreferences, NutritionPlan } from '@/types';

interface NutritionState {
  preferences: NutritionPreferences | null;
  nutritionPlan: NutritionPlan | null;
  loading: boolean;
  retrying: boolean;

  fetchPreferences: () => Promise<void>;
  fetchPlan: () => Promise<void>;
  retryGeneration: () => Promise<void>;
}

export const useNutritionStore = create<NutritionState>((set) => ({
  preferences: null,
  nutritionPlan: null,
  loading: false,
  retrying: false,

  fetchPreferences: async () => {
    set({ loading: true });
    try {
      const preferences = await nutritionApi.getPreferences();
      set({ preferences });
    } catch {
      // Non-critical
    } finally {
      set({ loading: false });
    }
  },

  fetchPlan: async () => {
    set({ loading: true });
    try {
      const plan = await nutritionApi.getNutritionPlan();
      set({ nutritionPlan: plan });
    } catch {
      // Non-critical
    } finally {
      set({ loading: false });
    }
  },

  retryGeneration: async () => {
    set({ retrying: true });
    try {
      await nutritionApi.retryNutrition();
      // Bascule l'état local sur 'generating' avant le prochain poll
      set((state) => ({
        nutritionPlan: state.nutritionPlan
          ? { ...state.nutritionPlan, status: 'generating' }
          : null,
      }));
    } catch {
      // L'écran garde l'état 'failed' — l'utilisateur peut réessayer
    } finally {
      set({ retrying: false });
    }
  },
}));
