import { View, Pressable } from 'react-native';
import { Clock } from 'lucide-react-native';
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
  if (isExpired || daysLeft === 0) return 'critique';
  if (daysLeft <= 3) return 'avertissement';
  return 'neutre';
}

export function TrialBanner() {
  const { isTrial } = useSubscription();
  const endDateISO = useSubscriptionStore(
    (s) => s.subscription?.trial_end_date ?? s.subscription?.current_period_end ?? null
  );
  const { daysLeft, label, isExpired } = useTrialCountdown(endDateISO);

  if (!isTrial) return null;

  const urgency = getUrgency(daysLeft, isExpired);
  const styles = URGENCY_STYLES[urgency];

  const message = isExpired ? 'Ton essai gratuit est terminé' : `Essai gratuit — ${label}`;
  const cta = 'Continuer sur apexcoach.app →';

  const handleTap = () => {
    // S3-T20 : ouverture du modal paywall — à activer quand /(modals)/paywall existe
    // router.push('/(modals)/paywall?trigger=trial_expiring');
  };

  return (
    <Pressable
      onPress={handleTap}
      accessibilityRole="button"
      accessibilityLabel={`${message}. ${cta}`}
      className={`mx-4 mb-3 rounded-xl border px-4 py-3 flex-row items-center gap-3 ${styles.container}`}
    >
      <Clock size={18} color={styles.iconColor} />
      <View className="flex-1">
        <Text variant="label" className={`font-semibold ${styles.label}`}>{message}</Text>
        <Text variant="caption" className="text-apex-black-400 mt-0.5">{cta}</Text>
      </View>
    </Pressable>
  );
}
