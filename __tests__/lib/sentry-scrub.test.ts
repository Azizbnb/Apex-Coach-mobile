import { scrubSentryEvent, SCRUB_PLACEHOLDER } from '@/lib/monitoring/scrub';
import type { Event } from '@sentry/react-native';

describe('lib/monitoring/scrub — scrubSentryEvent', () => {
  it('retourne null/undefined tel quel', () => {
    expect(scrubSentryEvent(null)).toBeNull();
  });

  it('réduit user à son id (UUID) et jette email/username/ip', () => {
    const event = {
      user: {
        id: 'a1b2c3d4-0000-4000-8000-000000000000',
        email: 'aziz@example.com',
        username: 'aziz',
        ip_address: '88.120.10.4',
      },
    } as Event;

    const out = scrubSentryEvent(event)!;
    expect(out.user).toEqual({ id: 'a1b2c3d4-0000-4000-8000-000000000000' });
    expect(out.user).not.toHaveProperty('email');
    expect(out.user).not.toHaveProperty('username');
    expect(out.user).not.toHaveProperty('ip_address');
  });

  it('masque les données identité, contact et naissance (variantes de casse/accents)', () => {
    const event = {
      extra: {
        email: 'jean@test.fr',
        firstName: 'Jean',
        prénom: 'Jean',
        last_name: 'Dupont',
        nom: 'Dupont',
        phone: '+33612345678',
        telephone: '0612345678',
        date_of_birth: '1990-01-01',
        dob: '1990-01-01',
      },
    } as unknown as Event;

    const extra = scrubSentryEvent(event)!.extra as Record<string, unknown>;
    for (const key of Object.keys(extra)) {
      expect(extra[key]).toBe(SCRUB_PLACEHOLDER);
    }
  });

  it('masque les données de santé sensibles (Step 5)', () => {
    const event = {
      contexts: {
        questionnaire: {
          medicalConditions: ['diabetes', 'heart_disease'],
          medicalConditionsDetails: 'Diabète type 2',
          currentPain: ['lower_back'],
          painDetails: 'Douleur chronique',
          takingMedication: true,
          medications: 'Metformine',
          physicalLimitations: 'Genou gauche',
          healthDataConsent: true,
        },
      },
    } as unknown as Event;

    const q = (scrubSentryEvent(event)!.contexts as Record<string, Record<string, unknown>>)
      .questionnaire;
    expect(q.medicalConditions).toBe(SCRUB_PLACEHOLDER);
    expect(q.medicalConditionsDetails).toBe(SCRUB_PLACEHOLDER);
    expect(q.currentPain).toBe(SCRUB_PLACEHOLDER);
    expect(q.painDetails).toBe(SCRUB_PLACEHOLDER);
    expect(q.medications).toBe(SCRUB_PLACEHOLDER);
    expect(q.physicalLimitations).toBe(SCRUB_PLACEHOLDER);
  });

  it('masque les emails trouvés dans le texte libre (message, breadcrumbs)', () => {
    const event = {
      message: 'Echec login pour contact@apexcoach.app sur /login',
      breadcrumbs: [
        { message: 'POST /auth réussi pour autre@mail.com', category: 'http' },
      ],
    } as unknown as Event;

    const out = scrubSentryEvent(event)!;
    expect(out.message).toBe(`Echec login pour ${SCRUB_PLACEHOLDER} sur /login`);
    expect(out.breadcrumbs![0].message).toBe(`POST /auth réussi pour ${SCRUB_PLACEHOLDER}`);
  });

  it('conserve les champs techniques non personnels', () => {
    const event = {
      level: 'error',
      tags: { platform: 'ios', user_plan: 'coaching_pro' },
      user: { id: 'uuid-123' },
      extra: { route: '/programme', statusCode: 500 },
    } as unknown as Event;

    const out = scrubSentryEvent(event)!;
    expect(out.level).toBe('error');
    expect(out.tags).toEqual({ platform: 'ios', user_plan: 'coaching_pro' });
    expect(out.user).toEqual({ id: 'uuid-123' });
    expect((out.extra as Record<string, unknown>).route).toBe('/programme');
    expect((out.extra as Record<string, unknown>).statusCode).toBe(500);
  });

  it('gère les références circulaires sans boucler', () => {
    const circular: Record<string, unknown> = { email: 'x@y.fr' };
    circular.self = circular;
    const event = { extra: circular } as unknown as Event;

    expect(() => scrubSentryEvent(event)).not.toThrow();
    expect((scrubSentryEvent(event)!.extra as Record<string, unknown>).email).toBe(
      SCRUB_PLACEHOLDER
    );
  });
});
