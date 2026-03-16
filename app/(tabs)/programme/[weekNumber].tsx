import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeView } from '@/components/ui/SafeView';

export default function WeekDetailScreen() {
  const { weekNumber } = useLocalSearchParams<{ weekNumber: string }>();

  return (
    <SafeView>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-white mb-2">
          Semaine {weekNumber}
        </Text>
        <Text className="text-apex-black-400 text-center">
          Détails de la semaine (Sprint 2)
        </Text>
      </View>
    </SafeView>
  );
}
