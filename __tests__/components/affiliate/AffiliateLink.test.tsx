import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AffiliateLink } from '@/components/affiliate/AffiliateLink';

const mockOpenBrowserAsync = jest.fn().mockResolvedValue({ type: 'cancel' });
const mockTrackClick = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: (...args: unknown[]) => mockOpenBrowserAsync(...args),
}));

jest.mock('@/lib/api', () => ({
  affiliateApi: {
    trackClick: (...args: unknown[]) => mockTrackClick(...args),
  },
}));

const defaultProps = {
  url: 'https://www.amazon.fr/s?k=tapis+yoga',
  label: 'Amazon',
  productName: 'Tapis de yoga / fitness',
  partnerSlug: 'amazon',
  sourcePage: 'equipment',
};

describe('AffiliateLink', () => {
  beforeEach(() => {
    mockOpenBrowserAsync.mockClear();
    mockTrackClick.mockClear();
  });

  it('affiche le libellé du partenaire', () => {
    render(<AffiliateLink {...defaultProps} />);
    expect(screen.getByText('Amazon')).toBeTruthy();
  });

  it('a le rôle accessibilité "link"', () => {
    render(<AffiliateLink {...defaultProps} />);
    expect(screen.getByRole('link')).toBeTruthy();
  });

  it("expose un accessibilityLabel mentionnant le nom du produit et le partenaire", () => {
    render(<AffiliateLink {...defaultProps} />);
    expect(
      screen.getByLabelText('Voir Tapis de yoga / fitness sur Amazon')
    ).toBeTruthy();
  });

  it('ouvre le navigateur avec UTM au tap', async () => {
    render(<AffiliateLink {...defaultProps} />);
    fireEvent.press(screen.getByRole('link'));
    await waitFor(() => {
      expect(mockOpenBrowserAsync).toHaveBeenCalledTimes(1);
      const calledUrl: string = mockOpenBrowserAsync.mock.calls[0][0];
      expect(calledUrl).toContain('utm_source=ios_app');
      expect(calledUrl).toContain('utm_medium=affiliate');
      expect(calledUrl).toContain('amazon.fr');
    });
  });

  it('appelle affiliateApi.trackClick avec les bons paramètres après ouverture', async () => {
    render(<AffiliateLink {...defaultProps} />);
    fireEvent.press(screen.getByRole('link'));
    await waitFor(() => {
      expect(mockTrackClick).toHaveBeenCalledWith({
        partner_slug: 'amazon',
        product_name: 'Tapis de yoga / fitness',
        product_url: 'https://www.amazon.fr/s?k=tapis+yoga',
        source_page: 'equipment',
        source_component: 'AffiliateLink',
      });
    });
  });

  it("n'échoue pas si le tracking retourne une erreur (fire-and-forget)", async () => {
    mockTrackClick.mockRejectedValueOnce(new Error('Network error'));
    render(<AffiliateLink {...defaultProps} />);
    fireEvent.press(screen.getByRole('link'));
    await waitFor(() => {
      expect(mockOpenBrowserAsync).toHaveBeenCalledTimes(1);
    });
  });
});
