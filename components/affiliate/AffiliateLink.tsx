import { useCallback } from 'react';
import { Platform, Pressable, Text } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ExternalLink } from 'lucide-react-native';
import { affiliateApi } from '@/lib/api';
import { colors } from '@/lib/constants';

export interface AffiliateLinkProps {
  /** URL brute du produit partenaire */
  url: string;
  /** Libellé affiché (ex : "Amazon", "Décathlon") */
  label: string;
  /** Nom du produit pour l'accessibilité et le tracking */
  productName: string;
  /** Slug du partenaire pour le tracking (ex : "amazon") */
  partnerSlug: string;
  /** Page source pour le tracking analytics */
  sourcePage?: string;
  className?: string;
}

/** Source UTM dérivée de la plateforme native (CLAUDE.md §1 attribution mobile). */
const UTM_SOURCE = Platform.OS === 'ios' ? 'ios_app' : 'android_app';

function addUtmParams(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('utm_source', UTM_SOURCE);
    parsed.searchParams.set('utm_medium', 'affiliate');
    return parsed.toString();
  } catch {
    return url;
  }
}

export function AffiliateLink({
  url,
  label,
  productName,
  partnerSlug,
  sourcePage = 'unknown',
  className = '',
}: AffiliateLinkProps) {
  const openLink = useCallback(async () => {
    const trackedUrl = addUtmParams(url);
    await WebBrowser.openBrowserAsync(trackedUrl);
    affiliateApi
      .trackClick({
        partner_slug: partnerSlug,
        product_name: productName,
        product_url: url,
        source_page: sourcePage,
        source_component: 'AffiliateLink',
      })
      .catch(() => undefined);
  }, [url, productName, partnerSlug, sourcePage]);

  return (
    <Pressable
      onPress={openLink}
      accessibilityRole="link"
      accessibilityLabel={`Voir ${productName} sur ${label}`}
      hitSlop={8}
      className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg bg-apex-black-700 ${className}`}
    >
      <ExternalLink size={12} color={colors.lime[500]} />
      <Text className="text-apex-lime-500 text-sm font-medium">{label}</Text>
    </Pressable>
  );
}
