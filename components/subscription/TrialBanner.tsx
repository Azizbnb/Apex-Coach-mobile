import { Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Clock } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { useSubscription } from '@/hooks/useSubscription';
import { colors } from '@/lib/constants';

/**
 * Banner d'essai gratuit (modèle Netflix).
 *
 * Affiché tant que l'utilisateur est en trial. Tap → paywall informational
 * (aucun prix). Ne s'affiche pas hors trial.
 */
export function TrialBanner() {
  const { isTrial, trialDaysLeft } = useSubscription();

  if (!isTrial || trialDaysLeft === null) return null;

  const trigger = trialDaysLeft <= 1 ? 'trial_j1' : 'trial_passive';
  const label =
    trialDaysLeft === 0
      ? 'Dernier jour de ton essai gratuit'
      : trialDaysLeft === 1
        ? "Plus qu'1 jour d'essai gratuit"
        : `Plus que ${trialDaysLeft} jours d'essai gratuit`;

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <Pressable
        onPress={() => router.push({ pathname: '/(modals)/paywall', params: { trigger } })}
        accessibilityRole="button"
        accessibilityLabel={`${label}. Voir comment continuer.`}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="flex-row items-center gap-3 bg-apex-warning/10 border border-apex-warning/30 rounded-xl px-4 py-3 mb-4"
      >
        <Clock size={18} color={colors.warning} />
        <Text className="flex-1 text-white text-sm font-medium">{label}</Text>
        <Text className="text-apex-warning text-sm font-semibold">Continuer →</Text>
      </Pressable>
    </Animated.View>
  );
}
