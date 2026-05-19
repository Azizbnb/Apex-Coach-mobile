import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import type { GestureType } from 'react-native-gesture-handler';
import { GripVertical } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/constants';
import type { Exercise } from '@/types';

export const ITEM_HEIGHT = 64;

const AnimatedView = Animated.createAnimatedComponent(View);

export interface SortableExerciseItemProps {
  exercise: Exercise;
  index: number;
  total: number;
  isActive: boolean;
  activeIndex: SharedValue<number>;
  dragY: SharedValue<number>;
  panGesture: GestureType;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function formatRest(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s === 0 ? `${m} min` : `${m}m${s}s`;
  }
  return `${seconds}s`;
}

export function SortableExerciseItem({
  exercise,
  index,
  total,
  isActive,
  activeIndex,
  dragY,
  panGesture,
  onMoveUp,
  onMoveDown,
}: SortableExerciseItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    if (activeIndex.value === index) {
      return { transform: [{ translateY: dragY.value }], zIndex: 10, opacity: 0.92 };
    }
    const from = activeIndex.value;
    if (from === -1) return {};
    const to = Math.round(Math.max(0, Math.min(total - 1, from + dragY.value / ITEM_HEIGHT)));
    if (from < to && index > from && index <= to) {
      return { transform: [{ translateY: -ITEM_HEIGHT }] };
    }
    if (from > to && index >= to && index < from) {
      return { transform: [{ translateY: ITEM_HEIGHT }] };
    }
    return {};
  });

  const accessibilityActions = [
    ...(index > 0 ? [{ name: 'moveUp', label: 'Monter' }] : []),
    ...(index < total - 1 ? [{ name: 'moveDown', label: 'Descendre' }] : []),
  ];

  return (
    <AnimatedView style={animatedStyle}>
      <View
        className={`flex-row items-center gap-3 rounded-xl px-3 border ${
          isActive
            ? 'bg-apex-black-700 border-apex-lime-500/40'
            : 'bg-apex-black-800 border-apex-black-700'
        }`}
        style={{ height: ITEM_HEIGHT }}
        accessibilityRole="none"
        accessibilityActions={accessibilityActions}
        onAccessibilityAction={({ nativeEvent: { actionName } }) => {
          if (actionName === 'moveUp') onMoveUp();
          if (actionName === 'moveDown') onMoveDown();
        }}
      >
        <GestureDetector gesture={panGesture}>
          <View className="py-4 pr-2" accessibilityLabel="Glisser pour réordonner">
            <GripVertical
              size={18}
              color={isActive ? colors.lime[500] : colors.black[400]}
            />
          </View>
        </GestureDetector>

        <View className="w-7 h-7 rounded-full bg-apex-lime-500/15 border border-apex-lime-500/30 items-center justify-center">
          <Text variant="caption" className="text-apex-lime-500 font-bold">
            {index + 1}
          </Text>
        </View>

        <View className="flex-1">
          <Text variant="body" className="text-white font-semibold" numberOfLines={1}>
            {exercise.name}
          </Text>
          <Text variant="caption" className="text-apex-black-400">
            {exercise.sets} séries · {exercise.reps} reps · {formatRest(exercise.rest_seconds)} repos
          </Text>
        </View>
      </View>
    </AnimatedView>
  );
}
