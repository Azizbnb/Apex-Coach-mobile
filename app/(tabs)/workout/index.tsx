import { View, Text } from 'react-native';
import { SafeView } from '@/components/ui/SafeView';

export default function WorkoutScreen() {
  return (
    <SafeView>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-white mb-2">
          Entraînement
        </Text>
        <Text className="text-apex-black-400 text-center">
          Interface d'entraînement actif (Sprint 2)
        </Text>
      </View>
    </SafeView>
  );
}
