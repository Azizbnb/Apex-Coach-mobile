import { View, Text } from 'react-native';
import { SafeView } from '@/components/ui/SafeView';

/**
 * Welcome / onboarding slides — Sprint 3.
 * Will contain the trial questionnaire flow that replaces traditional signup.
 */
export default function WelcomeScreen() {
  return (
    <SafeView>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-white mb-2">
          Bienvenue sur APEX Coach
        </Text>
        <Text className="text-apex-black-400 text-center">
          Onboarding questionnaire (Sprint 3)
        </Text>
      </View>
    </SafeView>
  );
}
