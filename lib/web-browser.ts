/**
 * Helper de redirection vers le web (apexcoach.app) — modèle Netflix.
 *
 * Centralise TOUTE ouverture de lien externe et injecte automatiquement les
 * paramètres UTM d'attribution selon la plateforme (ios_app / android_app).
 * Toute redirection web doit passer par ce helper (cf. skill apex-mobile-paywall).
 *
 * IMPORTANT (décision 1B, 06/06/2026) : les paywalls / feature gates pointent vers
 * la HOME apexcoach.app, jamais vers une page prix (/pricing) ni un checkout.
 * Aucun prix ni bouton d'achat n'est jamais affiché dans l'app (conformité Reader App).
 */

import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { API_URL, colors } from '@/lib/constants';

/** Canal d'attribution pour le paramètre utm_medium. */
export type UtmMedium = 'app' | 'paywall' | 'profile' | 'redeem';

export interface WebBrowserOptions {
  /** utm_medium (défaut: 'app'). */
  medium?: UtmMedium;
  /** utm_campaign (optionnel). */
  campaign?: string;
  /** Paramètres de requête additionnels, fusionnés en dernier (peuvent surcharger les UTM). */
  params?: Record<string, string>;
}

/** Source d'attribution dérivée de la plateforme courante. */
export function getUtmSource(): string {
  switch (Platform.OS) {
    case 'ios':
      return 'ios_app';
    case 'android':
      return 'android_app';
    default:
      return 'web_app';
  }
}

/**
 * Construit une URL absolue vers apexcoach.app avec les UTM d'attribution.
 * Fonction pure (testable) — n'ouvre rien.
 *
 * @param path Chemin relatif (ex. "/", "/redeem") ou URL absolue apexcoach.app.
 * @param opts Canal/campagne + paramètres additionnels.
 */
export function buildWebUrl(path: string = '/', opts: WebBrowserOptions = {}): string {
  const base = path.startsWith('http')
    ? path
    : `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const url = new URL(base);

  url.searchParams.set('utm_source', getUtmSource());
  url.searchParams.set('utm_medium', opts.medium ?? 'app');
  if (opts.campaign) {
    url.searchParams.set('utm_campaign', opts.campaign);
  }

  // Fusionnés en dernier : l'appelant peut surcharger explicitement n'importe quel param.
  if (opts.params) {
    for (const [key, value] of Object.entries(opts.params)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

/**
 * Ouvre une page apexcoach.app dans le navigateur in-app, UTM injectés.
 * Présentation feuille (PAGE_SHEET) + contrôles aux couleurs Apex.
 */
export function openWebUrl(
  path: string = '/',
  opts: WebBrowserOptions = {}
): Promise<WebBrowser.WebBrowserResult> {
  return WebBrowser.openBrowserAsync(buildWebUrl(path, opts), {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    controlsColor: colors.lime[500],
  });
}
