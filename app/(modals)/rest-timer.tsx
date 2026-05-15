import { useCallback } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { SafeView } from '@/components/ui/SafeView';
import { Text } from '@/components/ui/Text';
import { RestTimer } from '@/components/workout/RestTimer';

/** Paramètres de route : `duration` en secondes (string, converti en number) */
type RestTimerParams = {
  duration?: string;
};

const DEFAULT_DURATION = 90;

/** Parse une durée depuis un paramètre d'URL en se protégeant de NaN/négatifs/non-finis. */
function parseDuration(raw: string | undefined): number {
  if (!raw) return DEFAULT_DURATION;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DURATION;
}

export default function RestTimerModal() {
  const { duration: durationParam } = useLocalSearchParams<RestTimerParams>();
  const duration = parseDuration(durationParam);

  const handleFinish = useCallback(() => {
    router.back();
  }, []);

  return (
    <SafeView className="flex-1 bg-apex-black-900">
      <View className="flex-1 items-center justify-center px-6 gap-8">
        <View className="items-center gap-2">
          <Text variant="h2" className="text-white text-center">
            Temps de repos
          </Text>
          <Text variant="body" className="text-apex-black-400 text-center">
            Récupère avant la prochaine série
          </Text>
        </View>

        <RestTimer
          duration={duration}
          onFinish={handleFinish}
          onSkip={handleFinish}
        />
      </View>
    </SafeView>
  );
}
