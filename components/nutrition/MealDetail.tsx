import { useRef } from 'react';
import { View, Text, Modal, ScrollView, Pressable } from 'react-native';
import { X, Clock, ChevronRight } from 'lucide-react-native';
import { colors } from '@/lib/constants';
import type { Food, Meal } from '@/types';

interface MealDetailProps {
  meal: Meal | null;
  visible: boolean;
  onClose: () => void;
  onFoodPress: (food: Food) => void;
}

export function MealDetail({ meal, visible, onClose, onFoodPress }: MealDetailProps) {
  // Conserve le dernier meal non-null pour permettre l'animation de fermeture
  // pageSheet (le parent passe meal=null APRÈS avoir mis visible=false).
  const mealRef = useRef<Meal | null>(meal);
  if (meal) mealRef.current = meal;
  const displayMeal = mealRef.current;

  if (!displayMeal) return null;

  const totalCalories = displayMeal.foods.reduce((acc, f) => acc + f.calories, 0);

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
          <View className="flex-1 mr-4">
            <Text className="text-white font-bold text-lg" numberOfLines={1}>
              {displayMeal.name}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              <Clock size={12} color={colors.black[400]} />
              <Text className="text-apex-black-400 text-xs">{displayMeal.time}</Text>
              <Text className="text-apex-black-400 text-xs">
                {' · '}{displayMeal.foods.length} aliment{displayMeal.foods.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="p-2 rounded-full bg-apex-black-800 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Fermer le détail du repas"
          >
            <X size={18} color={colors.black[400]} />
          </Pressable>
        </View>

        {/* Total calories */}
        <View className="px-6 py-3 border-b border-apex-black-700">
          <Text className="text-apex-lime-500 font-semibold text-sm">
            {totalCalories} kcal au total
          </Text>
        </View>

        {/* Liste des aliments */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-2 pb-8">
            {displayMeal.foods.map((food, index) => (
              <Pressable
                key={`${food.name}-${index}`}
                onPress={() => onFoodPress(food)}
                className="flex-row items-center justify-between py-4 border-b border-apex-black-700 active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel={`Voir le détail de ${food.name}`}
              >
                <View className="flex-1 mr-3">
                  <Text className="text-white font-medium text-sm mb-1">{food.name}</Text>
                  <Text className="text-apex-black-400 text-xs">{food.quantity}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-apex-lime-500 text-xs font-semibold">
                    {food.calories} kcal
                  </Text>
                  <ChevronRight size={14} color={colors.black[400]} />
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
