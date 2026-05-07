import { View, Text, Pressable } from 'react-native';
import { ChevronRight, Clock } from 'lucide-react-native';
import { colors } from '@/lib/constants';
import type { Meal } from '@/types';

interface MealPlanCardProps {
  meal: Meal;
  onPress?: () => void;
  className?: string;
}

function mealMacros(meal: Meal) {
  return meal.foods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fats: acc.fats + f.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
}

export function MealPlanCard({ meal, onPress, className = '' }: MealPlanCardProps) {
  const totals = mealMacros(meal);

  return (
    <Pressable
      onPress={onPress}
      className={`bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700 active:opacity-80 ${className}`}
      accessibilityRole="button"
      accessibilityLabel={`Repas ${meal.name}, ${totals.calories} calories`}
    >
      {/* En-tête */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Clock size={14} color={colors.black[400]} />
          <Text className="text-apex-black-400 text-xs">{meal.time}</Text>
        </View>
        {onPress && <ChevronRight size={16} color={colors.black[400]} />}
      </View>

      <Text className="text-white font-bold text-base mb-3">{meal.name}</Text>

      {/* Liste des aliments */}
      {meal.foods.slice(0, 4).map((food, index) => (
        <View key={index} className="flex-row justify-between mb-1">
          <Text className="text-apex-black-400 text-sm flex-1 mr-2" numberOfLines={1}>
            {food.name}
          </Text>
          <Text className="text-apex-black-400 text-sm">{food.quantity}</Text>
        </View>
      ))}
      {meal.foods.length > 4 && (
        <Text className="text-apex-black-400 text-xs mt-1">
          +{meal.foods.length - 4} aliment{meal.foods.length - 4 > 1 ? 's' : ''}
        </Text>
      )}

      {/* Macros totaux du repas */}
      <View className="flex-row gap-3 mt-3 pt-3 border-t border-apex-black-700">
        <Text className="text-apex-lime-500 font-semibold text-sm">
          {totals.calories} kcal
        </Text>
        <Text className="text-apex-black-400 text-sm">P {totals.protein}g</Text>
        <Text className="text-apex-black-400 text-sm">G {totals.carbs}g</Text>
        <Text className="text-apex-black-400 text-sm">L {totals.fats}g</Text>
      </View>
    </Pressable>
  );
}
