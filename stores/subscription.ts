import { create } from 'zustand';
import { subscriptionApi } from '@/lib/api';
import { hasDashboardAccess, hasNutritionAccess } from '@/lib/config/pricing';
import { daysUntil } from '@/lib/subscription/countdown';
import type { Subscription } from '@/types';
import type { PlanId } from '@/lib/config/pricing';

// Valid plan IDs for runtime validation
const VALID_PLAN_IDS: PlanId[] = ['starter', 'coaching', 'coaching_pro'];

function isValidPlanId(value: string | undefined): value is PlanId {
  return VALID_PLAN_IDS.includes(value as PlanId);
}

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
  trialDaysLeft: () => number | null;
  promoDaysLeft: () => number | null;
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
    if (!sub) return null;
    // Validate at runtime to prevent crash in pricing helpers
    return isValidPlanId(sub.subscription_type) ? sub.subscription_type : null;
  },

  hasDashboard: () => {
    return hasDashboardAccess(get().planId());
  },

  hasNutrition: () => {
    return hasNutritionAccess(get().planId());
  },

  isActive: () => {
    const sub = get().subscription;
    if (!sub) return false;
    if (sub.status === 'active') return true;
    // Canceled but still in billing period
    if (sub.status === 'canceled' && sub.cancel_at_period_end) {
      return !sub.current_period_end || new Date(sub.current_period_end) > new Date();
    }
    return false;
  },

  isTrial: () => {
    return !!get().subscription?.is_trial;
  },

  isPromo: () => {
    return !!get().subscription?.is_promo_subscription;
  },

  trialDaysLeft: () => {
    const sub = get().subscription;
    if (!sub?.is_trial) return null;
    return daysUntil(sub.trial_end_date);
  },

  promoDaysLeft: () => {
    const sub = get().subscription;
    if (!sub?.is_promo_subscription) return null;
    return daysUntil(sub.promo_end_date);
  },
}));
