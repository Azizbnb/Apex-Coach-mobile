/**
 * Deep Linking — Sprint 3.
 *
 * Handles:
 * - Custom scheme: apexcoach://
 * - Universal links: https://apexcoach.app/...
 * - Referral/affiliate links
 *
 * Note : aucun flux de paiement in-app (modèle Netflix). La conversion se fait
 * sur le web via lib/web-browser.ts, jamais via une route mobile.
 *
 * Reset de mot de passe : géré en **handoff web**. L'email branded
 * (POST /api/auth/send-password-reset) contient un lien
 * `https://apexcoach.app/auth/callback?token_hash=…&type=recovery` qui ouvre
 * le navigateur ; l'utilisateur redéfinit son mot de passe sur le web puis
 * revient se connecter. Pas d'écran set-password in-app (token serveur web-only).
 */

import { DEEP_LINK_SCHEME, UNIVERSAL_LINK_HOST } from '@/lib/constants';

export function getDeepLinkConfig() {
  return {
    prefixes: [
      `${DEEP_LINK_SCHEME}://`,
      `https://${UNIVERSAL_LINK_HOST}`,
    ],
  };
}

export function parseDeepLink(url: string): { path: string; params: Record<string, string> } | null {
  try {
    const parsed = new URL(url);
    const params: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return { path: parsed.pathname, params };
  } catch {
    return null;
  }
}
