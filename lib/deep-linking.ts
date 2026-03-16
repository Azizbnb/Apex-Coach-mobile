/**
 * Deep Linking — Sprint 3.
 *
 * Handles:
 * - Custom scheme: apexcoach://
 * - Universal links: https://apexcoach.app/...
 * - Password reset links → /(auth)/set-password
 * - Payment confirmation → /(payment)/checkout?status=success
 * - Referral/affiliate links
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
