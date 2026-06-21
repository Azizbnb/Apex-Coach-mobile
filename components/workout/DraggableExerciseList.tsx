import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { GripVertical } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withSpring,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/constants';
import { formatRest } from '@/lib/workout/format-duration';
import { clamp, listToPositions, positionsMove } from '@/lib/workout/reorder';
import type { Exercise } from '@/types';

/** Hauteur d'un emplacement (contenu + marge sous la carte). */
const ROW_HEIGHT = 76;
const LONG_PRESS_MS = 220;

interface DraggableExerciseListProps {
  exercises: Exercise[];
  onReorder: (newExercises: Exercise[]) => void;
}

/**
 * Liste d'exercices réordonnable par glisser-déposer.
 *
 * Implémentation sans dépendance externe : `react-native-gesture-handler`
 * (Pan activé après un appui long, pour cohabiter avec le ScrollView parent)
 * + `react-native-reanimated` pour l'animation des décalages. La logique de
 * réordonnancement vit dans `lib/workout/reorder.ts` (testée à part).
 */
export function DraggableExerciseList({
  exercises,
  onReorder,
}: DraggableExerciseListProps) {
  const positions = useSharedValue<Record<string, number>>(
    listToPositions(exercises.map((e) => e.id))
  );
  const draggingId = useSharedValue<string | null>(null);

  // Réinitialise les positions si la liste source change (nouvelle séance).
  const idsKey = exercises.map((e) => e.id).join('|');
  useEffect(() => {
    positions.value = listToPositions(exercises.map((e) => e.id));
    draggingId.value = null;
    // idsKey capture l'identité de la liste sans dépendre de la ref tableau.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  const handleDragEnd = useCallback(() => {
    const map = positions.value;
    const ordered = exercises
      .slice()
      .sort((a, b) => (map[a.id] ?? 0) - (map[b.id] ?? 0));
    // Évite un commit inutile si rien n'a bougé.
    const changed = ordered.some((e, i) => e.id !== exercises[i].id);
    if (changed) {
      onReorder(ordered);
    }
  }, [exercises, onReorder, positions]);

  if (exercises.length <= 1) {
    return (
      <View className="gap-2">
        {exercises.map((ex, idx) => (
          <StaticRow key={ex.id} exercise={ex} index={idx} />
        ))}
      </View>
    );
  }

  return (
    <View style={{ height: exercises.length * ROW_HEIGHT }}>
      {exercises.map((ex, idx) => (
        <DraggableRow
          key={ex.id}
          exercise={ex}
          index={idx}
          count={exercises.length}
          positions={positions}
          draggingId={draggingId}
          onDragEnd={handleDragEnd}
        />
      ))}
    </View>
  );
}

interface RowVisualProps {
  exercise: Exercise;
  index: number;
}

/** Contenu visuel d'une ligne (partagé entre version statique et draggable). */
function RowContent({ exercise, index }: RowVisualProps) {
  return (
    <View className="flex-row items-center gap-3 bg-apex-black-800 rounded-xl px-3 py-3 border border-apex-black-700">
      <GripVertical size={18} color={colors.black[400]} />
      <View className="w-8 h-8 rounded-full bg-apex-lime-500/15 border border-apex-lime-500/30 items-center justify-center">
        <Text variant="caption" className="text-apex-lime-500 font-bold">
          {index + 1}
        </Text>
      </View>
      <View className="flex-1">
        <Text variant="body" className="text-white font-semibold">
          {exercise.name}
        </Text>
        <Text variant="caption" className="text-apex-black-400">
          {exercise.sets} séries · {exercise.reps} reps ·{' '}
          {formatRest(exercise.rest_seconds)} repos
        </Text>
      </View>
    </View>
  );
}

function StaticRow({ exercise, index }: RowVisualProps) {
  return <RowContent exercise={exercise} index={index} />;
}

interface DraggableRowProps extends RowVisualProps {
  count: number;
  positions: SharedValue<Record<string, number>>;
  draggingId: SharedValue<string | null>;
  onDragEnd: () => void;
}

function DraggableRow({
  exercise,
  index,
  count,
  positions,
  draggingId,
  onDragEnd,
}: DraggableRowProps) {
  const id = exercise.id;
  const top = useSharedValue(index * ROW_HEIGHT);
  const isActive = useSharedValue(false);

  // Anime la ligne vers son emplacement courant tant qu'elle n'est pas saisie.
  useAnimatedReaction(
    () => positions.value[id],
    (slot) => {
      if (slot === undefined) return;
      if (!isActive.value) {
        top.value = withSpring(slot * ROW_HEIGHT, {
          damping: 20,
          stiffness: 200,
        });
      }
    }
  );

  const pan = Gesture.Pan()
    .activateAfterLongPress(LONG_PRESS_MS)
    .onStart(() => {
      isActive.value = true;
      draggingId.value = id;
    })
    .onUpdate((event) => {
      const slot = positions.value[id] ?? index;
      const nextTop = slot * ROW_HEIGHT + event.translationY;
      top.value = nextTop;
      const newSlot = clamp(
        Math.round(nextTop / ROW_HEIGHT),
        0,
        count - 1
      );
      if (newSlot !== slot) {
        positions.value = positionsMove(positions.value, slot, newSlot);
      }
    })
    .onEnd(() => {
      const slot = positions.value[id] ?? index;
      top.value = withSpring(slot * ROW_HEIGHT, {
        damping: 20,
        stiffness: 200,
      });
      isActive.value = false;
      draggingId.value = null;
      runOnJS(onDragEnd)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: ROW_HEIGHT,
    paddingBottom: 12,
    transform: [
      { translateY: top.value },
      { scale: withSpring(isActive.value ? 1.03 : 1) },
    ],
    zIndex: isActive.value ? 10 : 0,
    elevation: isActive.value ? 10 : 0,
    opacity: isActive.value ? 0.95 : 1,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      accessibilityRole="adjustable"
      accessibilityLabel={`${exercise.name}, position ${index + 1} sur ${count}`}
      accessibilityHint="Appui long puis glisser pour réordonner"
    >
      <GestureDetector gesture={pan}>
        <View>
          <RowContent exercise={exercise} index={index} />
        </View>
      </GestureDetector>
    </Animated.View>
  );
}
