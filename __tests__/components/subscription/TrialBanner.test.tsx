import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { computeCountdown } from '@/hooks/useTrialCountdown';
import type { TrialCountdown } from '@/hooks/useTrialCountdown';

// --- Mocks ---

jest.mock('@/hooks/useSubscription');
jest.mock('@/stores/subscription');
jest.mock('@/hooks/useTrialCountdown', () => ({
  ...jest.requireActual('@/hooks/useTrialCountdown'),
  useTrialCountdown: jest.fn(),
}));

// Typed references to mocks (après jest.mock, avant les tests)
const { useSubscription } = jest.requireMock<typeof import('@/hooks/useSubscription')>('@/hooks/useSubscription');
const { useSubscriptionStore } = jest.requireMock<typeof import('@/stores/subscription')>('@/stores/subscription');
const { useTrialCountdown } = jest.requireMock<typeof import('@/hooks/useTrialCountdown')>('@/hooks/useTrialCountdown');

// --- Helpers ---

function setupMocks(opts: { isTrial: boolean; daysLeft: number; isExpired?: boolean }) {
  const isExpired = opts.isExpired ?? false;
  const label = isExpired ? 'Essai expiré' : `${opts.daysLeft} jours restants`;

  (useSubscription as jest.Mock).mockReturnValue({
    isTrial: opts.isTrial,
    subscription: null,
    loading: false,
    fetch: jest.fn(),
    planId: null,
    hasDashboard: false,
    hasNutrition: false,
    isActive: opts.isTrial,
    isPromo: false,
  });

  (useSubscriptionStore as unknown as jest.Mock).mockImplementation(
    (selector: (s: { subscription: { current_period_end: string } | null }) => unknown) =>
      selector({ subscription: { current_period_end: '2099-01-01T00:00:00Z' } })
  );

  (useTrialCountdown as jest.Mock).mockReturnValue({
    daysLeft: opts.daysLeft,
    hoursLeft: 0,
    label,
    isExpired,
  } satisfies TrialCountdown);
}

// --- Tests ---

describe('TrialBanner — rendu conditionnel', () => {
  it('est visible quand isTrial est true', () => {
    setupMocks({ isTrial: true, daysLeft: 5 });
    render(<TrialBanner />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('est absent quand isTrial est false', () => {
    setupMocks({ isTrial: false, daysLeft: 5 });
    render(<TrialBanner />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('TrialBanner — countdown formaté', () => {
  it('affiche le label de countdown quand l\'essai est actif', () => {
    setupMocks({ isTrial: true, daysLeft: 4 });
    render(<TrialBanner />);
    expect(screen.getByText(/4 jours restants/i)).toBeTruthy();
  });

  it('affiche le message d\'expiration quand isExpired', () => {
    setupMocks({ isTrial: true, daysLeft: 0, isExpired: true });
    render(<TrialBanner />);
    expect(screen.getByText(/Ton essai gratuit est terminé/i)).toBeTruthy();
  });
});

describe('computeCountdown (helper unitaire)', () => {
  it('retourne isExpired=true pour une date passée', () => {
    const result = computeCountdown('2000-01-01T00:00:00Z');
    expect(result.isExpired).toBe(true);
    expect(result.daysLeft).toBe(0);
  });

  it('retourne le bon nombre de jours pour une date future à +50h', () => {
    // +50h garantit daysLeft = 2 malgré quelques ms d'exécution
    const future = new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString();
    const result = computeCountdown(future);
    expect(result.isExpired).toBe(false);
    expect(result.daysLeft).toBe(2);
  });

  it('retourne isExpired=true pour null ou undefined', () => {
    expect(computeCountdown(null).isExpired).toBe(true);
    expect(computeCountdown(undefined).isExpired).toBe(true);
  });
});
