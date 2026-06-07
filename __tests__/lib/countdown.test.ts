import { daysUntil } from '@/lib/subscription/countdown';

describe('lib/subscription/countdown', () => {
  const now = new Date('2026-06-06T12:00:00Z');

  it('retourne null si pas de date', () => {
    expect(daysUntil(null, now)).toBeNull();
    expect(daysUntil(undefined, now)).toBeNull();
  });

  it('retourne null pour une date invalide', () => {
    expect(daysUntil('pas-une-date', now)).toBeNull();
  });

  it('retourne 0 pour une date déjà passée', () => {
    expect(daysUntil('2026-06-01T12:00:00Z', now)).toBe(0);
  });

  it('arrondit au jour supérieur', () => {
    // +2 jours et 1h → 3 jours (ceil)
    expect(daysUntil('2026-06-08T13:00:00Z', now)).toBe(3);
  });

  it('compte exactement les jours pleins', () => {
    expect(daysUntil('2026-06-13T12:00:00Z', now)).toBe(7);
    expect(daysUntil('2026-06-07T12:00:00Z', now)).toBe(1);
  });
});
