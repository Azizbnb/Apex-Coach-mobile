import { useSubscriptionStore } from '@/stores/subscription';

/**
 * Convenience hook for subscription — exposes store selectors with stable references.
 */
export function useSubscription() {
  const subscription = useSubscriptionStore((s) => s.subscription);
  const loading = useSubscriptionStore((s) => s.loading);
  const fetch = useSubscriptionStore((s) => s.fetch);
  const planId = useSubscriptionStore((s) => s.planId);
  const hasDashboard = useSubscriptionStore((s) => s.hasDashboard);
  const hasNutrition = useSubscriptionStore((s) => s.hasNutrition);
  const isActive = useSubscriptionStore((s) => s.isActive);
  const isTrial = useSubscriptionStore((s) => s.isTrial);
  const isPromo = useSubscriptionStore((s) => s.isPromo);

  return {
    subscription,
    loading,
    fetch,
    planId: planId(),
    hasDashboard: hasDashboard(),
    hasNutrition: hasNutrition(),
    isActive: isActive(),
    isTrial: isTrial(),
    isPromo: isPromo(),
  };
}
