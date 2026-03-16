import { Stack } from 'expo-router';
import { BACKGROUND_COLOR } from '@/lib/constants';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: BACKGROUND_COLOR },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
    </Stack>
  );
}
