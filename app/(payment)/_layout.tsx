import { Stack } from 'expo-router';
import { BACKGROUND_COLOR } from '@/lib/constants';

export default function PaymentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: BACKGROUND_COLOR },
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="checkout" />
    </Stack>
  );
}
