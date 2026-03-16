import { View, Text } from 'react-native';
import { SafeView } from '@/components/ui/SafeView';
import { useSubscriptionStore } from '@/stores/subscription';
import { Lock } from 'lucide-react-native';

export default function NutritionScreen() {
  const hasNutrition = useSubscriptionStore((s) => s.hasNutrition());

  if (!hasNutrition) {
    return (
      <SafeView>
        <View className="flex-1 items-center justify-center px-6">
          <Lock size={48} color="#94A3B8" />
          <Text className="text-xl font-bold text-white mt-4 mb-2">
            Coaching Pro requis
          </Text>
          <Text className="text-apex-black-400 text-center">
            Passe au plan Coaching Pro pour accéder à ton plan nutrition
            personnalisé.
          </Text>
        </View>
      </SafeView>
    );
  }

  return (
    <SafeView>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-white mb-2">Nutrition</Text>
        <Text className="text-apex-black-400 text-center">
          Plan nutrition IA (Sprint 2)
        </Text>
      </View>
    </SafeView>
  );
}
