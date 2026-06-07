import { render, screen, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { useSubscription } from '@/hooks/useSubscription';

jest.mock('@/hooks/useSubscription', () => ({ useSubscription: jest.fn() }));
const useSub = jest.mocked(useSubscription);

const base = {
  subscription: null,
  loading: false,
  fetch: jest.fn(async () => {}),
  planId: null,
  hasDashboard: false,
  hasNutrition: false,
  isActive: false,
  isTrial: false,
  isPromo: false,
  trialDaysLeft: null,
  promoDaysLeft: null,
};

describe('TrialBanner', () => {
  beforeEach(() => jest.clearAllMocks());

  it("ne s'affiche pas hors trial", () => {
    useSub.mockReturnValue({ ...base, isTrial: false });
    const { toJSON } = render(<TrialBanner />);
    expect(toJSON()).toBeNull();
  });

  it('affiche le compte à rebours en trial', () => {
    useSub.mockReturnValue({ ...base, isTrial: true, trialDaysLeft: 3 });
    render(<TrialBanner />);
    expect(screen.getByText("Plus que 3 jours d'essai gratuit")).toBeTruthy();
  });

  it('ouvre le paywall trial_j1 au dernier jour', () => {
    useSub.mockReturnValue({ ...base, isTrial: true, trialDaysLeft: 1 });
    render(<TrialBanner />);
    fireEvent.press(screen.getByRole('button'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(modals)/paywall',
      params: { trigger: 'trial_j1' },
    });
  });
});
