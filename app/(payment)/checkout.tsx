import { View, Text } from 'react-native';
import { SafeView } from '@/components/ui/SafeView';

/**
 * Checkout screen — Sprint 4.
 * Opens Stripe checkout via in-app browser (Reader Model: 0% Apple/Google commission).
 */
export default function CheckoutScreen() {
  return (
    <SafeView>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-white mb-2">
          Paiement
        </Text>
        <Text className="text-apex-black-400 text-center">
          Stripe Checkout via navigateur (Sprint 4)
        </Text>
      </View>
    </SafeView>
  );
}
