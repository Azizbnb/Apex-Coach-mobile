import { View, Text, Modal, ScrollView, Pressable } from 'react-native';
import { X, ShoppingCart } from 'lucide-react-native';
import { colors } from '@/lib/constants';
import { ShoppingCategorySection } from './ShoppingCategorySection';
import type { Meal } from '@/types';

type Category = 'Légumes' | 'Protéines' | 'Féculents' | 'Épicerie' | 'Autres';

export const CATEGORY_ORDER: Category[] = ['Légumes', 'Protéines', 'Féculents', 'Épicerie', 'Autres'];

const CATEGORY_KEYWORDS: Record<Exclude<Category, 'Autres'>, string[]> = {
  'Légumes': ['tomate', 'courgette', 'brocoli', 'epinard', 'carotte', 'concombre', 'salade', 'poivron', 'oignon', 'ail', 'champignon', 'aubergine', 'chou', 'laitue', 'celeri', 'poireau', 'radis', 'betterave', 'artichaut', 'avocat', 'fenouil', 'asperge'],
  'Protéines': ['poulet', 'boeuf', 'porc', 'saumon', 'thon', 'oeuf', 'whey', 'fromage', 'yaourt', 'dinde', 'crevette', 'tofu', 'seitan', 'cottage', 'ricotta', 'maquereau', 'sardine', 'lait', 'veau', 'agneau', 'proteine'],
  'Féculents': ['riz', 'pate', 'pain', 'avoine', 'flocon', 'quinoa', 'lentille', 'pois chiche', 'haricot blanc', 'millet', 'boulgour', 'farine', 'semoule', 'tortilla', 'patate', 'cereale', 'pomme de terre'],
  'Épicerie': ['huile', 'sauce', 'moutarde', 'vinaigre', 'sel', 'poivre', 'amande', 'noix', 'beurre', 'miel', 'cacahuete', 'graine', 'tahini', 'cacao', 'chocolat'],
};

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function classifyFood(name: string): Category {
  const n = normalize(name);
  for (const cat of CATEGORY_ORDER.filter((c): c is Exclude<Category, 'Autres'> => c !== 'Autres')) {
    if (CATEGORY_KEYWORDS[cat].some((kw) => n.includes(kw))) return cat;
  }
  return 'Autres';
}

function buildCategorizedList(meals: Meal[]): Map<Category, { name: string; quantity: string }[]> {
  const aggregate = new Map<string, { quantity: string; category: Category }>();
  meals.forEach((meal) => {
    meal.foods.forEach((food) => {
      const prev = aggregate.get(food.name);
      aggregate.set(food.name, {
        quantity: prev ? `${prev.quantity} + ${food.quantity}` : food.quantity,
        category: prev?.category ?? classifyFood(food.name),
      });
    });
  });
  const result = new Map<Category, { name: string; quantity: string }[]>(
    CATEGORY_ORDER.map((c) => [c, []])
  );
  Array.from(aggregate.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'fr'))
    .forEach(([name, { quantity, category }]) => {
      result.get(category)!.push({ name, quantity });
    });
  return result;
}

interface ShoppingListProps {
  meals: Meal[];
  visible: boolean;
  onClose: () => void;
}

export function ShoppingList({ meals, visible, onClose }: ShoppingListProps) {
  const categorized = buildCategorizedList(meals);
  const uniqueCount = CATEGORY_ORDER.reduce((sum, c) => sum + (categorized.get(c)?.length ?? 0), 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-apex-black-900">
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
            {uniqueCount} ingrédient{uniqueCount !== 1 ? 's' : ''} pour la semaine
          </Text>

          {CATEGORY_ORDER.map((category) => (
            <ShoppingCategorySection
              key={category}
              category={category}
              items={categorized.get(category) ?? []}
            />
          ))}

          {uniqueCount === 0 && (
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
