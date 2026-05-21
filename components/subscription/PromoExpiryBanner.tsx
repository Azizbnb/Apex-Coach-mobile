import { View, Pressable } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Gift } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { useSubscription } from '@/hooks/useSubscription';
import { useSubscriptionStore } from '@/stores/subscription';
import { useTrialCountdown } from '@/hooks/useTrialCountdown';
import { colors } from '@/lib/constants';

type UrgencyLevel = 'neutre' | 'avertissement' | 'critique';

interface UrgencyStyle {
  container: string;
  label: string;
  iconColor: string;
}

const URGENCY_STYLES: Record<UrgencyLevel, UrgencyStyle> = {
  neutre: {
    container: 'bg-apex-black-800 border-apex-black-700',
    label: 'text-white',
    iconColor: colors.lime[500],
  },
  avertissement: {
    container: 'bg-amber-900/30 border-amber-600',
    label: 'text-amber-400',
    iconColor: colors.warning,
  },
  critique: {
    container: 'bg-red-900/30 border-red-600',
    label: 'text-red-400',
    iconColor: colors.error,
  },
};

function getUrgency(daysLeft: number, isExpired: boolean): UrgencyLevel {
  if (isExpired || daysLeft <= 1) return 'critique';
  if (daysLeft <= 7) return 'avertissement';
  return 'neutre';
}

export function PromoExpiryBanner() {
  const { isPromo } = useSubscription();
  const promoEndDate = useSubscriptionStore(
    (s) => s.subscription?.promo_end_date ?? s.subscription?.current_period_end ?? null
  );
  const { daysLeft, label, isExpired } = useTrialCountdown(promoEndDate);

  if (!isPromo) return null;

  const urgency = getUrgency(daysLeft, isExpired);
  const styles = URGENCY_STYLES[urgency];

  const message = isExpired
    ? 'Ton accès partenaire est expiré'
    : `Accès partenaire — ${label}`;
  const cta = 'Continuer sur apexcoach.app →';

  const handleTap = async () => {
    // S3-T20 : router.push('/(modals)/paywall?trigger=promo_expiring')
    await WebBrowser.openBrowserAsync(
      'https://www.apexcoach.app/pricing?utm_source=ios_app&utm_medium=app&utm_campaign=promo_banner'
    );
  };

  return (
    <Pressable
      onPress={handleTap}
      accessibilityRole="button"
      accessibilityLabel={`${message}. ${cta}`}
      className={`mx-4 mb-3 rounded-xl border px-4 py-3 flex-row items-center gap-3 ${styles.container}`}
    >
      <Gift size={18} color={styles.iconColor} />
      <View className="flex-1">
        <Text variant="label" className={`font-semibold ${styles.label}`}>{message}</Text>
        <Text variant="caption" className="text-apex-black-400 mt-0.5">{cta}</Text>
      </View>
    </Pressable>
  );
}
