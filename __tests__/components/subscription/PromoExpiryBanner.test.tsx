import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PromoExpiryBanner } from '@/components/subscription/PromoExpiryBanner';
import type { TrialCountdown } from '@/hooks/useTrialCountdown';

// --- Mocks ---

jest.mock('@/hooks/useSubscription');
jest.mock('@/stores/subscription');
jest.mock('@/hooks/useTrialCountdown', () => ({
  ...jest.requireActual('@/hooks/useTrialCountdown'),
  useTrialCountdown: jest.fn(),
}));

const { useSubscription } = jest.requireMock<typeof import('@/hooks/useSubscription')>('@/hooks/useSubscription');
const { useSubscriptionStore } = jest.requireMock<typeof import('@/stores/subscription')>('@/stores/subscription');
const { useTrialCountdown } = jest.requireMock<typeof import('@/hooks/useTrialCountdown')>('@/hooks/useTrialCountdown');

// --- Helpers ---

function setupMocks(opts: { isPromo: boolean; daysLeft: number; isExpired?: boolean }) {
  const isExpired = opts.isExpired ?? false;
  const label = isExpired ? 'Accès expiré' : `${opts.daysLeft} jours restants`;

  (useSubscription as jest.Mock).mockReturnValue({
    isPromo: opts.isPromo,
    subscription: null,
    loading: false,
    fetch: jest.fn(),
    planId: null,
    hasDashboard: false,
    hasNutrition: false,
    isActive: !isExpired,
    isTrial: false,
  });

  (useSubscriptionStore as unknown as jest.Mock).mockImplementation(
    (selector: (s: { subscription: { promo_end_date: string } | null }) => unknown) =>
      selector({ subscription: { promo_end_date: '2099-01-01T00:00:00Z' } })
  );

  (useTrialCountdown as jest.Mock).mockReturnValue({
    daysLeft: opts.daysLeft,
    hoursLeft: 0,
    label,
    isExpired,
  } satisfies TrialCountdown);
}

// --- Tests ---

describe('PromoExpiryBanner — rendu conditionnel', () => {
  it('est visible quand isPromo est true', () => {
    setupMocks({ isPromo: true, daysLeft: 10 });
    render(<PromoExpiryBanner />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('est absent quand isPromo est false', () => {
    setupMocks({ isPromo: false, daysLeft: 10 });
    render(<PromoExpiryBanner />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('PromoExpiryBanner — messages selon urgence', () => {
  it('affiche le countdown quand l\'accès est actif', () => {
    setupMocks({ isPromo: true, daysLeft: 5 });
    render(<PromoExpiryBanner />);
    expect(screen.getByText(/5 jours restants/i)).toBeTruthy();
  });

  it('affiche le message d\'expiration quand isExpired', () => {
    setupMocks({ isPromo: true, daysLeft: 0, isExpired: true });
    render(<PromoExpiryBanner />);
    expect(screen.getByText(/Ton accès partenaire est expiré/i)).toBeTruthy();
  });

  it('affiche le label de style avertissement pour J-7', () => {
    setupMocks({ isPromo: true, daysLeft: 7 });
    render(<PromoExpiryBanner />);
    expect(screen.getByText(/7 jours restants/i)).toBeTruthy();
  });

  it('affiche le label de style critique pour J-1', () => {
    setupMocks({ isPromo: true, daysLeft: 1 });
    render(<PromoExpiryBanner />);
    expect(screen.getByText(/1 jours restants/i)).toBeTruthy();
  });
});
