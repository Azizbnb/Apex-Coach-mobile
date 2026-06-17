import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';

import { SafeView } from '@/components/ui/SafeView';
import { Text } from '@/components/ui/Text';
import { FreeTimer } from '@/components/workout/FreeTimer';
import { colors } from '@/lib/constants';

/**
 * Modal plein écran exposant le minuteur libre pendant une séance.
 * Ouvert depuis le bouton minuteur de la `WorkoutTopBar`.
 */
export default function FreeTimerModal() {
  return (
    <SafeView className="flex-1 bg-apex-black-900">
      <View className="flex-row items-center justify-end px-4 pt-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Fermer le minuteur"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="p-2"
        >
          <X size={24} color={colors.black[400]} />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-6 gap-8">
        <View className="items-center gap-2">
          <Text variant="h2" className="text-white text-center">
            Minuteur libre
          </Text>
          <Text variant="body" className="text-apex-black-400 text-center">
            Chronomètre indépendant pour tes pauses ou tes efforts au temps
          </Text>
        </View>

        <FreeTimer />
      </View>
    </SafeView>
  );
}
