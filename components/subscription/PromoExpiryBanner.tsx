import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Tag } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { useSubscription } from '@/hooks/useSubscription';
import { openWebUrl } from '@/lib/web-browser';
import { colors } from '@/lib/constants';

/**
 * Banner d'expiration de code promo (modèle Netflix).
 *
 * Affiché uniquement quand une promo expire dans 7 jours ou moins.
 * Tap → home apexcoach.app (gestion du compte), jamais une page prix (décision 1B).
 */
export function PromoExpiryBanner() {
  const { isPromo, promoDaysLeft } = useSubscription();

  if (!isPromo || promoDaysLeft === null || promoDaysLeft > 7) return null;

  const label =
    promoDaysLeft === 0
      ? "Ton offre promo se termine aujourd'hui"
      : promoDaysLeft === 1
        ? 'Ton offre promo se termine demain'
        : `Ton offre promo se termine dans ${promoDaysLeft} jours`;

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <Pressable
        onPress={() => openWebUrl('/', { medium: 'app', campaign: 'promo_expiry' })}
        accessibilityRole="button"
        accessibilityLabel={`${label}. Gérer sur le web.`}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="flex-row items-center gap-3 bg-apex-warning/10 border border-apex-warning/30 rounded-xl px-4 py-3 mb-4"
      >
        <Tag size={18} color={colors.warning} />
        <Text className="flex-1 text-white text-sm font-medium">{label}</Text>
        <Text className="text-apex-warning text-sm font-semibold">Gérer →</Text>
      </Pressable>
    </Animated.View>
  );
}
