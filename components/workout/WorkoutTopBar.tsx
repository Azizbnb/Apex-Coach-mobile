import { View, Pressable } from 'react-native';
import { ChevronLeft, Timer } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/lib/constants';

interface WorkoutTopBarProps {
  /** Index 0-based de l'exercice courant (pour le compteur N/total) */
  currentIndex: number;
  totalExercises: number;
  completedCount: number;
  onBack: () => void;
  onTimerPress?: () => void;
}

/**
 * Barre persistante en haut du flow d'entraînement.
 * Mirror du composant web `WorkoutTopBar.tsx` (barre back · timer · progression).
 */
export function WorkoutTopBar({
  currentIndex,
  totalExercises,
  completedCount,
  onBack,
  onTimerPress,
}: WorkoutTopBarProps) {
  const progress = totalExercises > 0 ? completedCount / totalExercises : 0;

  return (
    <View className="flex-row items-center px-4 pt-2 pb-3 gap-3 border-b border-apex-black-700 bg-apex-black-900">
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Quitter la séance"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="p-1"
      >
        <ChevronLeft size={24} color={colors.black[400]} />
      </Pressable>

      {onTimerPress && (
        <Pressable
          onPress={onTimerPress}
          accessibilityRole="button"
          accessibilityLabel="Minuteur libre"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="w-10 h-10 rounded-full border border-apex-lime-500/40 items-center justify-center"
        >
          <Timer size={18} color={colors.lime[500]} />
        </Pressable>
      )}

      <View className="flex-1 flex-row items-center gap-3">
        <Text variant="caption" className="text-apex-black-400 tabular-nums">
          {Math.min(currentIndex, totalExercises)}/{totalExercises}
        </Text>
        <View className="flex-1">
          <ProgressBar progress={progress} />
        </View>
      </View>
    </View>
  );
}
