import { View, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import {
  PaywallInformational,
  type PaywallTrigger,
} from '@/components/subscription/PaywallInformational';
import { colors } from '@/lib/constants';

/** Parse le trigger sans cast (zéro `as any`) — fallback sur trial_passive. */
function parseTrigger(value: string | string[] | undefined): PaywallTrigger {
  const raw = Array.isArray(value) ? value[0] : value;
  switch (raw) {
    case 'trial_expired':
    case 'trial_j1':
    case 'feature_locked':
    case 'trial_passive':
      return raw;
    default:
      return 'trial_passive';
  }
}

export default function PaywallModal() {
  const params = useLocalSearchParams<{ trigger?: string }>();
  const trigger = parseTrigger(params.trigger);

  return (
    <View className="flex-1 bg-apex-black-900">
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Fermer"
        className="self-end p-4"
      >
        <X size={24} color={colors.black[400]} />
      </Pressable>
      <PaywallInformational trigger={trigger} onClose={() => router.back()} />
    </View>
  );
}
