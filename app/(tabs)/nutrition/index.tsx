import { View, Text } from 'react-native';
import { SafeView } from '@/components/ui/SafeView';
import { useSubscription } from '@/hooks/useSubscription';
import { Lock } from 'lucide-react-native';
import { colors } from '@/lib/constants';

export default function NutritionScreen() {
  const { hasNutrition } = useSubscription();

  if (!hasNutrition) {
    return (
      <SafeView>
        <View className="flex-1 items-center justify-center px-6">
          <Lock size={48} color={colors.black[400]} />
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
