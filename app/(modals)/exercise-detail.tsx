import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';

export default function ExerciseDetailModal() {
  return (
    <View className="flex-1 bg-apex-black-900 px-6 pt-4">
      <Pressable onPress={() => router.back()} className="self-end p-2">
        <X size={24} color="#94A3B8" />
      </Pressable>
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-bold text-white mb-2">
          Détail exercice
        </Text>
        <Text className="text-apex-black-400 text-center">
          Sprint 2
        </Text>
      </View>
    </View>
  );
}
