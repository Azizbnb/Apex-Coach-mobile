import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeView } from '@/components/ui/SafeView';

/**
 * Signup screen — redirects to onboarding flow (Sprint 3).
 * In the mobile app, signup happens through the trial onboarding questionnaire,
 * not through a traditional signup form.
 */
export default function SignupScreen() {
  useEffect(() => {
    // Sprint 3: redirect to onboarding welcome screen
    // router.replace('/(onboarding)/welcome');
  }, []);

  return (
    <SafeView>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-white mb-2">
          Créer un compte
        </Text>
        <Text className="text-apex-black-400 text-center">
          Inscription via le flow onboarding (Sprint 3)
        </Text>
      </View>
    </SafeView>
  );
}
