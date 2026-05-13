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

export default function RestTimerModal() {
  const { duration: durationParam } = useLocalSearchParams<RestTimerParams>();
  const duration = durationParam ? Math.max(1, parseInt(durationParam, 10)) : DEFAULT_DURATION;

  function handleFinish() {
    router.back();
  }

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
