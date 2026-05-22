import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { colors } from '@/lib/constants';

export interface ShoppingItem {
  name: string;
  quantity: string;
}

interface Props {
  category: string;
  items: ShoppingItem[];
}

export function ShoppingCategorySection({ category, items }: Props) {
  const [expanded, setExpanded] = useState(true);

  if (items.length === 0) return null;

  return (
    <View className="mb-2">
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        className="flex-row items-center justify-between py-3 border-b border-apex-black-700 active:opacity-70"
        accessibilityRole="button"
        accessibilityLabel={`Catégorie ${category}`}
      >
        <Text className="text-apex-lime-500 font-semibold text-sm uppercase tracking-wider">
          {category}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-apex-black-400 text-xs">{items.length}</Text>
          {expanded
            ? <ChevronUp size={16} color={colors.black[400]} />
            : <ChevronDown size={16} color={colors.black[400]} />}
        </View>
      </Pressable>

      {expanded && items.map((item, index) => (
        <View
          key={index}
          className="flex-row justify-between items-center py-3 border-b border-apex-black-700/50 pl-2"
        >
          <Text className="text-white text-base flex-1 mr-4">{item.name}</Text>
          <Text className="text-apex-black-400 text-sm">{item.quantity}</Text>
        </View>
      ))}
    </View>
  );
}
