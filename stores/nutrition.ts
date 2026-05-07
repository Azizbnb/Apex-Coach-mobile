import { create } from 'zustand';
import { nutritionApi } from '@/lib/api';
import type { NutritionPreferences, NutritionPlan } from '@/types';

interface NutritionState {
  preferences: NutritionPreferences | null;
  nutritionPlan: NutritionPlan | null;
  loading: boolean;

  fetchPreferences: () => Promise<void>;
  fetchPlan: () => Promise<void>;
}

export const useNutritionStore = create<NutritionState>((set) => ({
  preferences: null,
  nutritionPlan: null,
  loading: false,

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
}));
