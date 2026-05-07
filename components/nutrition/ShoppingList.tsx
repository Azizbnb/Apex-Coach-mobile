import { View, Text, Modal, ScrollView, Pressable } from 'react-native';
import { X, ShoppingCart } from 'lucide-react-native';
import { colors } from '@/lib/constants';
import type { Meal } from '@/types';

interface ShoppingItem {
  name: string;
  quantity: string;
}

interface ShoppingListProps {
  meals: Meal[];
  visible: boolean;
  onClose: () => void;
}

function buildShoppingList(meals: Meal[]): ShoppingItem[] {
  const map = new Map<string, string>();
  meals.forEach((meal) => {
    meal.foods.forEach((food) => {
      const existing = map.get(food.name);
      map.set(food.name, existing ? `${existing} + ${food.quantity}` : food.quantity);
    });
  });
  return Array.from(map.entries()).map(([name, quantity]) => ({ name, quantity }));
}

export function ShoppingList({ meals, visible, onClose }: ShoppingListProps) {
  const items = buildShoppingList(meals);

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
          <View className="flex-row items-center gap-3">
            <ShoppingCart size={20} color={colors.lime[500]} />
            <Text className="text-white font-bold text-lg">Liste de courses</Text>
          </View>
          <Pressable
            onPress={onClose}
            className="p-2 rounded-full bg-apex-black-800 active:opacity-70"
            accessibilityLabel="Fermer la liste de courses"
          >
            <X size={18} color={colors.black[400]} />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          <Text className="text-apex-black-400 text-sm mb-4">
            {items.length} ingrédient{items.length !== 1 ? 's' : ''} pour la semaine
          </Text>

          {items.map((item, index) => (
            <View
              key={index}
              className="flex-row justify-between items-center py-3 border-b border-apex-black-700"
            >
              <Text className="text-white text-base flex-1 mr-4">{item.name}</Text>
              <Text className="text-apex-black-400 text-sm">{item.quantity}</Text>
            </View>
          ))}

          {items.length === 0 && (
            <Text className="text-apex-black-400 text-center mt-8">
              Aucun ingrédient trouvé dans le plan.
            </Text>
          )}

          <View className="h-8" />
        </ScrollView>
      </View>
    </Modal>
  );
}
