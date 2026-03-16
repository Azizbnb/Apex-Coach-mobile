/**
 * APEX COACH MOBILE - Configuration Pricing
 *
 * Version mobile adaptée : pas de Stripe Price IDs (checkout via web)
 * Source : lib/config/pricing.ts du projet web
 */

// Types
export type PlanId = 'starter' | 'coaching' | 'coaching_pro';
export type BillingInterval = 'one_time' | 'monthly' | 'yearly';

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PricingTier {
  id: PlanId;
  name: string;
  tagline: string;
  description: string;

  prices: {
    monthly?: number;
    yearly?: number;
    oneTime?: number;
  };

  features: PlanFeature[];
  badge?: 'popular' | 'best_value' | 'premium';
  cta: string;
  ctaVariant: 'primary' | 'secondary' | 'outline';

  accessLevel: number;
  dashboardAccess: boolean;
  nutritionAccess: boolean;
  aiAdjustments: 'none' | 'weekly' | 'unlimited';

  hidden?: boolean;
}

// ============================================
// CONFIGURATION PRINCIPALE
// ============================================

export const PRICING_CONFIG = {
  currency: 'EUR',
  currencySymbol: '\u20ac',
  locale: 'fr-FR',

  discounts: {
    yearly: {
      coaching: 0.45,
      coaching_pro: 0.33,
    },
  },

  trial: {
    enabled: true,
    days: 7,
    planEquivalent: 'coaching_pro' as PlanId,
  },

  limits: {
    maxProgramsStarter: 1,
    maxProgramsCoaching: 12,
    maxProgramsCoachingPro: -1,
  },
} as const;

// ============================================
// PLANS
// ============================================

export const PLANS: Record<PlanId, PricingTier> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'Découvre ton potentiel',
    description: 'Programme personnalisé unique, parfait pour commencer',
    hidden: true,

    prices: {
      oneTime: 29,
    },

    features: [
      { text: 'Programme 4 semaines personnalisé IA', included: true, highlight: true },
      { text: 'Export PDF téléchargeable', included: true },
      { text: 'Email récapitulatif', included: true },
      { text: 'Accès dashboard', included: false },
      { text: 'Réadaptation IA hebdomadaire', included: false },
      { text: 'Plan nutrition personnalisé', included: false },
    ],

    cta: 'Commencer',
    ctaVariant: 'outline',

    accessLevel: 1,
    dashboardAccess: false,
    nutritionAccess: false,
    aiAdjustments: 'none',
  },

  coaching: {
    id: 'coaching',
    name: 'Coaching',
    tagline: 'Progresse chaque semaine',
    description: "L'expérience complète avec suivi et adaptation IA",

    prices: {
      monthly: 14.90,
      yearly: 99,
    },

    features: [
      { text: 'Tout ce qui est inclus dans Starter', included: true },
      { text: 'Dashboard complet de suivi', included: true, highlight: true },
      { text: 'Réadaptation IA hebdomadaire', included: true, highlight: true },
      { text: 'Historique des programmes', included: true },
      { text: 'Support prioritaire (24h)', included: true },
      { text: 'Plan nutrition personnalisé', included: false },
      { text: 'Stats et analyses avancées', included: false },
    ],

    badge: 'popular',
    cta: 'Choisir Coaching',
    ctaVariant: 'primary',

    accessLevel: 2,
    dashboardAccess: true,
    nutritionAccess: false,
    aiAdjustments: 'weekly',
  },

  coaching_pro: {
    id: 'coaching_pro',
    name: 'Coaching Pro',
    tagline: 'Transformation totale',
    description: 'Programme sport + nutrition avec suivi personnalisé complet',

    prices: {
      monthly: 24.90,
      yearly: 199,
    },

    features: [
      { text: 'Tout ce qui est inclus dans Coaching', included: true },
      { text: 'Plan nutrition personnalisé IA', included: true, highlight: true },
      { text: 'Semaine type de repas + recettes', included: true, highlight: true },
      { text: 'Liste de courses générée', included: true },
      { text: 'Analyses biométriques avancées', included: true },
      { text: 'Export données complet (RGPD)', included: true },
    ],

    badge: 'premium',
    cta: 'Devenir membre Pro',
    ctaVariant: 'secondary',

    accessLevel: 3,
    dashboardAccess: true,
    nutritionAccess: true,
    aiAdjustments: 'weekly',
  },
};

// ============================================
// HELPERS
// ============================================

export function getPlan(planId: PlanId): PricingTier {
  return PLANS[planId];
}

export function formatPrice(amount: number, options?: { showCurrency?: boolean }): string {
  const formatted = new Intl.NumberFormat(PRICING_CONFIG.locale, {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return options?.showCurrency !== false
    ? `${formatted}${PRICING_CONFIG.currencySymbol}`
    : formatted;
}

export function calculateYearlySavings(planId: PlanId): number | null {
  const plan = PLANS[planId];
  if (!plan.prices.monthly || !plan.prices.yearly) return null;
  return plan.prices.monthly * 12 - plan.prices.yearly;
}

export function calculateSavingsPercent(planId: PlanId): number | null {
  const plan = PLANS[planId];
  if (!plan.prices.monthly || !plan.prices.yearly) return null;
  const yearlyIfMonthly = plan.prices.monthly * 12;
  return Math.round((1 - plan.prices.yearly / yearlyIfMonthly) * 100);
}

export function hasFeatureAccess(userPlanId: PlanId | null, requiredLevel: number): boolean {
  if (!userPlanId) return false;
  return PLANS[userPlanId].accessLevel >= requiredLevel;
}

export function hasDashboardAccess(planId: PlanId | null): boolean {
  if (!planId) return false;
  return PLANS[planId].dashboardAccess;
}

export function hasNutritionAccess(planId: PlanId | null): boolean {
  if (!planId) return false;
  return PLANS[planId].nutritionAccess;
}

export function getAllPlans(): PricingTier[] {
  return Object.values(PLANS);
}

export function getPlansForDisplay(): PricingTier[] {
  return Object.values(PLANS).filter(plan => !plan.hidden);
}

export function getPlanById(planId: PlanId): PricingTier {
  return PLANS[planId];
}

export function getPriceDescription(planId: PlanId, billingInterval?: 'monthly' | 'yearly'): string {
  const plan = PLANS[planId];
  if (planId === 'starter') {
    return `${formatPrice(plan.prices.oneTime || 29)} (paiement unique)`;
  }
  if (billingInterval === 'yearly') {
    return `${formatPrice(plan.prices.yearly || 0)}/an`;
  }
  return `${formatPrice(plan.prices.monthly || 0)}/mois`;
}

export const PRICING_PLANS = getPlansForDisplay();

export const PRICING_FEATURES = {
  showYearlySavings: true,
  showMonthlyEquivalent: true,
  enableUpsellModal: true,
  showSocialProof: true,
} as const;
