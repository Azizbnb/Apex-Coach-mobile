import { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { useSharedValue, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Play } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SortableExerciseItem, ITEM_HEIGHT } from '@/components/workout/SortableExerciseItem';
import { useWorkoutStore } from '@/stores/workout';
import { colors } from '@/lib/constants';
import type { Exercise } from '@/types';

interface ExercisePrepScreenProps {
  sessionLabel: string;
  exercises: Exercise[];
  onStart: () => void;
}

export function ExercisePrepScreen({
  sessionLabel,
  exercises,
  onStart,
}: ExercisePrepScreenProps) {
  const reorderExercises = useWorkoutStore((s) => s.reorderExercises);
  const [localOrder, setLocalOrder] = useState<Exercise[]>(exercises);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const activeIndex = useSharedValue(-1);
  const dragY = useSharedValue(0);

  const commitReorder = useCallback(
    (from: number, to: number) => {
      activeIndex.value = -1;
      dragY.value = 0;
      setActiveIdx(null);
      if (from === to) return;
      setLocalOrder((prev) => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        reorderExercises(next);
        return next;
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [reorderExercises, activeIndex, dragY],
  );

  const createGesture = useCallback(
    (fromIndex: number, total: number) =>
      Gesture.Pan()
        .activateAfterLongPress(200)
        .onStart(() => {
          'worklet';
          activeIndex.value = fromIndex;
          dragY.value = 0;
          runOnJS(setActiveIdx)(fromIndex);
        })
        .onUpdate((e) => {
          'worklet';
          dragY.value = e.translationY;
        })
        .onEnd(() => {
          'worklet';
          const toIndex = Math.round(
            Math.max(0, Math.min(total - 1, fromIndex + dragY.value / ITEM_HEIGHT)),
          );
          runOnJS(commitReorder)(fromIndex, toIndex);
        }),
    [activeIndex, dragY, commitReorder],
  );

  const moveItem = useCallback(
    (from: number, direction: 1 | -1) => {
      const to = from + direction;
      if (to < 0 || to >= localOrder.length) return;
      setLocalOrder((prev) => {
        const next = [...prev];
        [next[from], next[to]] = [next[to], next[from]];
        reorderExercises(next);
        return next;
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [localOrder.length, reorderExercises],
  );

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        scrollEnabled={activeIdx === null}
      >
        <View className="items-center mt-4 mb-2">
          <Badge label={sessionLabel} variant="premium" />
        </View>
        <Text variant="h1" className="text-white text-center mt-3 mb-2">
          Prêt pour la séance ?
        </Text>
        <Text variant="caption" className="text-apex-black-400 text-center mb-6">
          Maintiens et glisse l'icône pour réordonner les exercices.
        </Text>

        <View className="gap-2">
          {localOrder.map((ex, idx) => (
            <SortableExerciseItem
              key={ex.id}
              exercise={ex}
              index={idx}
              total={localOrder.length}
              isActive={activeIdx === idx}
              activeIndex={activeIndex}
              dragY={dragY}
              panGesture={createGesture(idx, localOrder.length)}
              onMoveUp={() => moveItem(idx, -1)}
              onMoveDown={() => moveItem(idx, 1)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="px-4 pb-6 pt-3 border-t border-apex-black-700 bg-apex-black-900">
        <Button
          variant="primary"
          onPress={onStart}
          accessibilityLabel={`Démarrer la séance, ${localOrder.length} exercices`}
        >
          {`▷  C'est parti !`}
        </Button>
        <View className="flex-row items-center justify-center gap-1.5 mt-3">
          <Play size={12} color={colors.black[400]} />
          <Text variant="caption" className="text-apex-black-400">
            {localOrder.length} exercice{localOrder.length > 1 ? 's' : ''} au programme
          </Text>
        </View>
      </View>
    </View>
  );
}
