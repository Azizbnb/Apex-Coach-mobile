import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center bg-apex-black-900 px-6">
      <Text className="text-6xl font-bold text-apex-lime-500 mb-4">404</Text>
      <Text className="text-lg text-white mb-8">Page introuvable</Text>
      <Pressable
        onPress={() => router.replace('/')}
        className="bg-apex-lime-500 px-6 py-3 rounded-lg"
      >
        <Text className="text-apex-black-900 font-semibold text-base">
          Retour
        </Text>
      </Pressable>
    </View>
  );
}
