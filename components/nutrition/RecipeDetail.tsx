import { View, Text, Modal, ScrollView, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '@/lib/constants';
import type { Food } from '@/types';

interface RecipeDetailProps {
  food: Food | null;
  visible: boolean;
  onClose: () => void;
}

interface NutritionRow {
  label: string;
  value: string;
}

export function RecipeDetail({ food, visible, onClose }: RecipeDetailProps) {
  if (!food) return null;

  const rows: NutritionRow[] = [
    { label: 'Calories', value: `${food.calories} kcal` },
    { label: 'Protéines', value: `${food.protein}g` },
    { label: 'Glucides', value: `${food.carbs}g` },
    { label: 'Lipides', value: `${food.fats}g` },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-apex-black-900">
        {/* En-tête */}
        <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-apex-black-700">
          <Text className="text-white font-bold text-lg flex-1 mr-4" numberOfLines={2}>
            {food.name}
          </Text>
          <Pressable
            onPress={onClose}
            className="p-2 rounded-full bg-apex-black-800 active:opacity-70"
            accessibilityLabel="Fermer le détail de la recette"
          >
            <X size={18} color={colors.black[400]} />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          <Text className="text-apex-black-400 text-sm mb-6">
            Quantité : {food.quantity}
          </Text>

          <Text className="text-white font-semibold text-base mb-3">
            Valeurs nutritionnelles
          </Text>

          {rows.map((row) => (
            <View
              key={row.label}
              className="flex-row justify-between items-center py-3 border-b border-apex-black-700"
            >
              <Text className="text-apex-black-400 text-sm">{row.label}</Text>
              <Text className="text-white font-medium text-sm">{row.value}</Text>
            </View>
          ))}

          <View className="h-8" />
        </ScrollView>
      </View>
    </Modal>
  );
}
