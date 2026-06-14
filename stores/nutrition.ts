import { create } from 'zustand';
import { nutritionApi } from '@/lib/api';
import type { NutritionGenerationStatus } from '@/lib/api';
import type { NutritionPreferences, NutritionPlan } from '@/types';

interface NutritionState {
  preferences: NutritionPreferences | null;
  nutritionPlan: NutritionPlan | null;
  loading: boolean;

  generation: NutritionGenerationStatus | null;
  retrying: boolean;

  fetchPreferences: () => Promise<void>;
  fetchPlan: () => Promise<void>;
  fetchGeneration: () => Promise<void>;
  retryNutrition: () => Promise<void>;
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  preferences: null,
  nutritionPlan: null,
  loading: false,
  generation: null,
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

  fetchGeneration: async () => {
    try {
      const generation = await nutritionApi.getGenerationStatus();
      set({ generation });
    } catch {
      // Non-critical
    }
  },

  retryNutrition: async () => {
    const { generation, retrying } = get();
    if (retrying || !generation?.programId) return;
    set({ retrying: true });
    try {
      await nutritionApi.retryNutrition(generation.programId);
      // Recharge plan + statut après la relance.
      await Promise.all([get().fetchPlan(), get().fetchGeneration()]);
    } finally {
      set({ retrying: false });
    }
  },
}));
