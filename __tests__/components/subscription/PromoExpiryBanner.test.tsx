import { render, screen, fireEvent } from '@testing-library/react-native';
import { PromoExpiryBanner } from '@/components/subscription/PromoExpiryBanner';
import { useSubscription } from '@/hooks/useSubscription';
import { openWebUrl } from '@/lib/web-browser';

jest.mock('@/hooks/useSubscription', () => ({ useSubscription: jest.fn() }));
jest.mock('@/lib/web-browser', () => ({ openWebUrl: jest.fn() }));
const useSub = jest.mocked(useSubscription);
const mockOpen = jest.mocked(openWebUrl);

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

describe('PromoExpiryBanner', () => {
  beforeEach(() => jest.clearAllMocks());

  it("ne s'affiche pas hors promo", () => {
    useSub.mockReturnValue({ ...base, isPromo: false });
    const { toJSON } = render(<PromoExpiryBanner />);
    expect(toJSON()).toBeNull();
  });

  it("ne s'affiche pas si l'expiration est à plus de 7 jours", () => {
    useSub.mockReturnValue({ ...base, isPromo: true, promoDaysLeft: 10 });
    const { toJSON } = render(<PromoExpiryBanner />);
    expect(toJSON()).toBeNull();
  });

  it('affiche et ouvre la home au tap quand la promo expire bientôt', () => {
    useSub.mockReturnValue({ ...base, isPromo: true, promoDaysLeft: 2 });
    render(<PromoExpiryBanner />);
    expect(screen.getByText('Ton offre promo se termine dans 2 jours')).toBeTruthy();
    fireEvent.press(screen.getByRole('button'));
    expect(mockOpen).toHaveBeenCalledWith('/', { medium: 'app', campaign: 'promo_expiry' });
  });
});
