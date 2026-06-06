import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@/lib/constants';

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    if (!initialized) return;

    if (session) {
      router.replace('/(tabs)/programme');
    } else {
      router.replace('/(onboarding)/welcome');
    }
  }, [session, initialized]);

  return (
    <View className="flex-1 items-center justify-center bg-apex-black-900">
      <ActivityIndicator size="large" color={colors.lime[500]} />
    </View>
  );
}
