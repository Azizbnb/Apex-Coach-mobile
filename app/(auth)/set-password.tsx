import { View, Text } from 'react-native';
import { SafeView } from '@/components/ui/SafeView';

export default function SetPasswordScreen() {
  return (
    <SafeView>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-white mb-2">
          Définir le mot de passe
        </Text>
        <Text className="text-apex-black-400 text-center">
          Configuration post-trial (Sprint 3)
        </Text>
      </View>
    </SafeView>
  );
}
