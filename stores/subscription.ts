import { create } from 'zustand';
import { subscriptionApi } from '@/lib/api';
import { hasDashboardAccess, hasNutritionAccess } from '@/lib/config/pricing';
import type { Subscription } from '@/types';
import type { PlanId } from '@/lib/config/pricing';

interface SubscriptionState {
  subscription: Subscription | null;
  loading: boolean;

  fetch: () => Promise<void>;

  // Derived getters
  planId: () => PlanId | null;
  hasDashboard: () => boolean;
  hasNutrition: () => boolean;
  isActive: () => boolean;
  isTrial: () => boolean;
  isPromo: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const subscription = await subscriptionApi.getCurrent();
      set({ subscription });
    } catch {
      set({ subscription: null });
    } finally {
      set({ loading: false });
    }
  },

  planId: () => {
    const sub = get().subscription;
    return (sub?.subscription_type as PlanId) ?? null;
  },

  hasDashboard: () => {
    return hasDashboardAccess(get().planId());
  },

  hasNutrition: () => {
    return hasNutritionAccess(get().planId());
  },

  isActive: () => {
    const sub = get().subscription;
    return sub?.status === 'active' || sub?.status === 'canceled';
  },

  isTrial: () => {
    const sub = get().subscription;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !!(sub as any)?.is_trial;
  },

  isPromo: () => {
    const sub = get().subscription;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return !!(sub as any)?.is_promo_subscription;
  },
}));
