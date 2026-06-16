/**
 * APEX COACH MOBILE — Scrubber RGPD pour Sentry
 *
 * Retire toute donnée personnelle des events avant envoi à Sentry.
 * Fonction pure et testable, sans aucune dépendance au SDK natif
 * (seul un `import type` est utilisé, effacé à la compilation).
 *
 * Règle : zéro PII dans Sentry. On conserve uniquement `user.id` (UUID),
 * qui n'est pas une donnée personnelle directe.
 */

import type { Event } from '@sentry/react-native';

export const SCRUB_PLACEHOLDER = '[Filtré]';

/**
 * Clés considérées comme personnelles. Comparées sous forme canonique
 * (minuscules, sans accents, sans séparateurs) — donc `first_name`,
 * `firstName`, `first-name` et `prénom` matchent tous.
 */
const PII_KEYS = new Set<string>([
  // Identité
  'email',
  'fullname',
  'firstname',
  'lastname',
  'prenom',
  'nom',
  'username',
  // Contact
  'phone',
  'phonenumber',
  'telephone',
  'mobile',
  'tel',
  // Naissance
  'dateofbirth',
  'birthdate',
  'datenaissance',
  'dob',
  // Données de santé (Step 5 — sensibles RGPD)
  'medicalconditions',
  'medicalconditionsdetails',
  'currentpain',
  'paindetails',
  'takingmedication',
  'medications',
  'hasdoctorapproval',
  'physicallimitations',
  'healthdataconsent',
  'healthdata',
]);

// Détecte une adresse email dans un texte libre (défense en profondeur)
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function canonicalKey(key: string): string {
  return key
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents (combining marks)
    .replace(/œ/g, 'oe') // ligature œ (non décomposée par NFD)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ''); // séparateurs (_ - espaces)
}

function isPiiKey(key: string): boolean {
  return PII_KEYS.has(canonicalKey(key));
}

function redactString(value: string): string {
  return value.replace(EMAIL_REGEX, SCRUB_PLACEHOLDER);
}

/**
 * Parcourt récursivement une valeur et masque toute PII détectée par clé,
 * ainsi que les emails trouvés dans les chaînes de texte libre.
 */
function redactDeep(value: unknown, seen: WeakSet<object>): unknown {
  if (typeof value === 'string') {
    return redactString(value);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (seen.has(value)) {
    return value; // protection contre les références circulaires
  }
  seen.add(value);

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      value[i] = redactDeep(value[i], seen);
    }
    return value;
  }

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (isPiiKey(key)) {
      record[key] = SCRUB_PLACEHOLDER;
    } else {
      record[key] = redactDeep(record[key], seen);
    }
  }
  return record;
}

/**
 * Scrubber `beforeSend`. Mutation in-place de l'event puis retour.
 * - `user` réduit à `{ id }` (on jette email, username, ip_address)
 * - toutes les clés PII masquées en profondeur
 * - emails masqués dans le texte libre (message, breadcrumbs…)
 */
export function scrubSentryEvent<E extends Event>(event: E | null): E | null {
  if (!event) return event;

  // user : ne conserver que l'UUID
  if (event.user) {
    const id = event.user.id;
    event.user = typeof id === 'string' || typeof id === 'number' ? { id } : {};
  }

  redactDeep(event, new WeakSet<object>());
  return event;
}
