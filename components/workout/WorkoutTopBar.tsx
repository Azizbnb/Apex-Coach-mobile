import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { ChevronLeft, Timer } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FreeTimer } from '@/components/workout/FreeTimer';
import { useFreeTimer } from '@/hooks/useFreeTimer';
import { colors } from '@/lib/constants';

interface WorkoutTopBarProps {
  /** Index 1-based de l'exercice courant (pour le compteur N/total) */
  currentIndex: number;
  totalExercises: number;
  completedCount: number;
  onBack: () => void;
}

/** Formate un nombre de secondes en affichage compact (ex: 1:30 ou 45s). */
function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

/**
 * Barre persistante en haut du flow d'entraînement.
 * Intègre un minuteur libre indépendant du timer de repos.
 */
export function WorkoutTopBar({
  currentIndex,
  totalExercises,
  completedCount,
  onBack,
}: WorkoutTopBarProps) {
  const [showTimerPanel, setShowTimerPanel] = useState(false);
  const { remaining, isRunning, start, stop } = useFreeTimer();

  const progress = totalExercises > 0 ? completedCount / totalExercises : 0;

  const handleSelectPreset = (seconds: number) => {
    start(seconds);
    setShowTimerPanel(false);
  };

  const handleStop = () => {
    stop();
    setShowTimerPanel(false);
  };

  return (
    <>
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

        {/* Bouton minuteur — montre le countdown quand actif */}
        <Pressable
          onPress={() => setShowTimerPanel(true)}
          accessibilityRole="button"
          accessibilityLabel={isRunning ? `Minuteur : ${formatCountdown(remaining)}` : 'Minuteur libre'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className={`rounded-full border items-center justify-center flex-row ${
            isRunning
              ? 'px-3 h-10 gap-1 border-apex-lime-500 bg-apex-lime-500/10'
              : 'w-10 h-10 border-apex-lime-500/40'
          }`}
        >
          <Timer size={16} color={colors.lime[500]} />
          {isRunning && (
            <Text variant="caption" className="text-apex-lime-500 tabular-nums">
              {formatCountdown(remaining)}
            </Text>
          )}
        </Pressable>

        <View className="flex-1 flex-row items-center gap-3">
          <Text variant="caption" className="text-apex-black-400 tabular-nums">
            {Math.min(currentIndex, totalExercises)}/{totalExercises}
          </Text>
          <View className="flex-1">
            <ProgressBar progress={progress} />
          </View>
        </View>
      </View>

      <FreeTimer
        visible={showTimerPanel}
        remaining={remaining}
        isRunning={isRunning}
        onSelectPreset={handleSelectPreset}
        onStop={handleStop}
        onClose={() => setShowTimerPanel(false)}
      />
    </>
  );
}
