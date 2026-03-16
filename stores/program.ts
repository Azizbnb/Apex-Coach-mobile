import { create } from 'zustand';
import { programApi } from '@/lib/api';
import {
  isWeekUnlocked,
  getProgressiveUnlockInfo,
  shouldApplyProgressiveUnlock,
} from '@/lib/subscription/progressive-unlock';
import type { PlanType } from '@/types';

interface ProgramData {
  id: string;
  status: string;
  title: string;
  description: string;
  program_data: unknown;
  nutrition_plan: unknown;
  start_date: string | null;
  duration_weeks: number;
  created_at: string;
}

interface ProgramState {
  program: ProgramData | null;
  loading: boolean;
  error: string | null;

  fetch: () => Promise<void>;

  // Progressive unlock helpers
  isWeekAvailable: (weekNumber: number, planId: PlanType, startDate: string) => boolean;
  getUnlockInfo: (planId: PlanType, startDate: string) => ReturnType<typeof getProgressiveUnlockInfo>;
}

export const useProgramStore = create<ProgramState>((set) => ({
  program: null,
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const program = await programApi.getCurrent();
      set({ program });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur de chargement' });
    } finally {
      set({ loading: false });
    }
  },

  isWeekAvailable: (weekNumber: number, planId: PlanType, startDate: string) => {
    if (!shouldApplyProgressiveUnlock(planId)) return true;
    return isWeekUnlocked(new Date(startDate), weekNumber);
  },

  getUnlockInfo: (planId: PlanType, startDate: string) => {
    return getProgressiveUnlockInfo(new Date(startDate));
  },
}));
