import { Stack } from 'expo-router';
import { BACKGROUND_COLOR } from '@/lib/constants';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: BACKGROUND_COLOR },
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="exercise-detail" />
      <Stack.Screen name="session-complete" />
      <Stack.Screen name="paywall" />
      <Stack.Screen
        name="bilan-formulaire"
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="change-objective"
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="leave-review"
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="rest-timer"
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="free-timer"
        options={{ presentation: 'fullScreenModal' }}
      />
    </Stack>
  );
}
