/**
 * APEX COACH MOBILE — Intégration Sentry
 *
 * Activation pilotée par `EXPO_PUBLIC_SENTRY_DSN` :
 * - DSN vide / absent  → Sentry ne s'initialise pas, l'app fonctionne (no-op).
 * - DSN présent        → init + scrubber RGPD + tags.
 *
 * Le DSN n'est JAMAIS hardcodé : uniquement via variable d'environnement.
 */

import type { ComponentType } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';
import { scrubSentryEvent } from './scrub';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

/** Vrai uniquement si un DSN non vide est fourni. */
export const isSentryEnabled =
  typeof SENTRY_DSN === 'string' && SENTRY_DSN.trim().length > 0;

/**
 * Initialise Sentry. À appeler une seule fois, avant le render du RootLayout.
 * No-op si aucun DSN n'est configuré.
 */
export function initSentry(): void {
  if (!isSentryEnabled) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    // Ne jamais envoyer de PII par défaut (IP, headers, cookies…)
    sendDefaultPii: false,
    // Scrubber RGPD strict — dernier rempart avant l'envoi
    beforeSend: (event) => scrubSentryEvent(event),
    beforeBreadcrumb: (breadcrumb) => {
      // Les breadcrumbs de saisie peuvent fuiter du texte tapé par l'user
      if (breadcrumb.category === 'console' && __DEV__) return null;
      return breadcrumb;
    },
    environment: __DEV__ ? 'development' : 'production',
    // Pas de profiling/replay : on reste minimal et conforme.
    tracesSampleRate: 0,
  });

  Sentry.setTag('platform', Platform.OS);
  Sentry.setTag(
    'app_version',
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? 'unknown'
  );
}

/**
 * Met à jour le contexte utilisateur Sentry.
 * - `userId` : UUID seul (aucune autre donnée). `null` → reset.
 * - `plan`   : 'trial' | 'coaching' | 'coaching_pro' | null.
 */
export function setSentryUser(params: {
  userId: string | null;
  plan: string | null;
}): void {
  if (!isSentryEnabled) return;

  Sentry.setUser(params.userId ? { id: params.userId } : null);
  Sentry.setTag('user_plan', params.plan ?? 'anonymous');
}

/**
 * Wrappe le composant racine pour la capture automatique des erreurs
 * de rendu (équivaut à un ErrorBoundary global). Identité si Sentry off.
 */
export function withSentry<P extends Record<string, unknown>>(
  RootComponent: ComponentType<P>
): ComponentType<P> {
  return isSentryEnabled ? Sentry.wrap(RootComponent) : RootComponent;
}
