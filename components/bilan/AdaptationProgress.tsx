import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/lib/constants';
import type { AdaptationStatus } from '@/hooks/usePollAdaptation';

/**
 * UX d'attente pendant l'adaptation IA (mirror logique post-submit du bilan web).
 *
 * Messages évolutifs pour donner du rythme pendant les ~2 min d'attente :
 *   "Analyse de ton bilan..." → "Ajustement de ton programme..."
 *   → "Régénération du plan nutrition..." (Pro) → "Prêt !"
 *
 * - `status === 'done'`     → animation succès + callback `onComplete`
 * - `status === 'timeout'`  → message + bouton "Réessayer" (`onRetry`)
 * - `status === 'error'`    → message + bouton "Réessayer" (`onRetry`)
 */

const BASE_MESSAGES = [
  'Analyse de ton bilan…',
  'Ajustement de ton programme…',
];

const NUTRITION_MESSAGE = 'Régénération du plan nutrition…';
const MESSAGE_INTERVAL_MS = 6_000;

interface AdaptationProgressProps {
  status: AdaptationStatus;
  /** Coaching Pro → ajoute l'étape de régénération nutrition. */
  isPro?: boolean;
  onComplete: () => void;
  onRetry: () => void;
}

export function AdaptationProgress({
  status,
  isPro = false,
  onComplete,
  onRetry,
}: AdaptationProgressProps) {
  const messages = isPro ? [...BASE_MESSAGES, NUTRITION_MESSAGE] : BASE_MESSAGES;
  const [messageIndex, setMessageIndex] = useState(0);

  const isActive = status === 'idle' || status === 'polling';
  const isError = status === 'timeout' || status === 'error';

  // Rotation des messages tant que l'adaptation tourne.
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isActive, messages.length]);

  // Succès → callback parent (fermeture modal + redirect).
  useEffect(() => {
    if (status === 'done') {
      const id = setTimeout(onComplete, 1200);
      return () => clearTimeout(id);
    }
  }, [status, onComplete]);

  // Pulse douce du halo pendant l'attente.
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (isActive) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
    // `pulse` est une shared value reanimated (référence stable).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (status === 'done') {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <CheckCircle2 size={64} color={colors.success} />
        <Text variant="h2" className="text-center mt-5 mb-2">
          Prêt !
        </Text>
        <Text variant="body" className="text-center">
          Ton programme a été adapté à ton bilan.
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <AlertTriangle size={56} color={colors.warning} />
        <Text variant="h3" className="text-center mt-4 mb-2">
          {status === 'timeout' ? 'L’adaptation prend du temps' : 'Une erreur est survenue'}
        </Text>
        <Text variant="body" className="text-center mb-6">
          {status === 'timeout'
            ? 'Ton bilan est bien enregistré. L’adaptation peut continuer en arrière-plan. Tu peux réessayer.'
            : 'Ton bilan est enregistré, mais l’adaptation n’a pas pu être confirmée. Réessaie dans un instant.'}
        </Text>
        <Button variant="primary" onPress={onRetry}>
          Réessayer
        </Button>
      </View>
    );
  }

  // Attente (idle / polling)
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Animated.View
        style={pulseStyle}
        className="w-28 h-28 rounded-full bg-apex-lime-500/10 items-center justify-center mb-6"
      >
        <ActivityIndicator size="large" color={colors.lime[500]} />
      </Animated.View>
      <Text variant="h3" className="text-center mb-2">
        {messages[messageIndex]}
      </Text>
      <Text variant="body" className="text-center">
        L’IA personnalise ta semaine. Ça prend généralement une à deux minutes.
      </Text>
    </View>
  );
}
