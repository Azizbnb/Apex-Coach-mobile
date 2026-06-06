import { buildWebUrl, getUtmSource } from '@/lib/web-browser';

// jest-expo fixe Platform.OS à 'ios' par défaut.
describe('lib/web-browser', () => {
  describe('getUtmSource', () => {
    it('retourne ios_app sur iOS (default jest-expo)', () => {
      expect(getUtmSource()).toBe('ios_app');
    });
  });

  describe('buildWebUrl', () => {
    it('construit une URL absolue sur apexcoach.app avec UTM par défaut', () => {
      const url = new URL(buildWebUrl('/'));
      expect(url.origin).toBe('https://apexcoach.app');
      expect(url.searchParams.get('utm_source')).toBe('ios_app');
      expect(url.searchParams.get('utm_medium')).toBe('app');
    });

    it('normalise un chemin sans slash initial', () => {
      const url = new URL(buildWebUrl('redeem'));
      expect(url.pathname).toBe('/redeem');
    });

    it('applique medium et campaign', () => {
      const url = new URL(buildWebUrl('/', { medium: 'paywall', campaign: 'nutrition_gate' }));
      expect(url.searchParams.get('utm_medium')).toBe('paywall');
      expect(url.searchParams.get('utm_campaign')).toBe('nutrition_gate');
    });

    it('fusionne les paramètres additionnels', () => {
      const url = new URL(buildWebUrl('/', { params: { ref: 'partenaire' } }));
      expect(url.searchParams.get('ref')).toBe('partenaire');
      expect(url.searchParams.get('utm_source')).toBe('ios_app');
    });

    it('laisse params surcharger un UTM explicitement', () => {
      const url = new URL(buildWebUrl('/', { params: { utm_source: 'newsletter' } }));
      expect(url.searchParams.get('utm_source')).toBe('newsletter');
    });

    it('accepte une URL absolue apexcoach.app telle quelle', () => {
      const url = new URL(buildWebUrl('https://apexcoach.app/redeem'));
      expect(url.pathname).toBe('/redeem');
      expect(url.searchParams.get('utm_source')).toBe('ios_app');
    });
  });
});
