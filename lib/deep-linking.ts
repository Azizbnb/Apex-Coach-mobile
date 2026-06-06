/**
 * Deep Linking — Sprint 3.
 *
 * Handles:
 * - Custom scheme: apexcoach://
 * - Universal links: https://apexcoach.app/...
 * - Password reset links → /(auth)/set-password
 * - Referral/affiliate links
 *
 * Note : aucun flux de paiement in-app (modèle Netflix). La conversion se fait
 * sur le web via lib/web-browser.ts, jamais via une route mobile.
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
