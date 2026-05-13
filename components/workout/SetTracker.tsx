import { useEffect, useState } from 'react';
import { View, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useWorkout } from '@/hooks/useWorkout';
import { colors } from '@/lib/constants';
import type { Exercise } from '@/types';

interface SetTrackerProps {
  exercise: Exercise;
  setNumber: number; // numéro du set courant (1-based)
  onSetLogged?: () => void; // callback optionnel post-log (ex: déclenche RestTimer)
  className?: string;
}

export function SetTracker({
  exercise,
  setNumber,
  onSetLogged,
  className = '',
}: SetTrackerProps) {
  const { logSet, currentExerciseSets } = useWorkout();

  const lastSet = currentExerciseSets[currentExerciseSets.length - 1];
  const [repsInput, setRepsInput] = useState(String(exercise.reps));
  const [weightInput, setWeightInput] = useState(
    lastSet?.weight !== undefined ? String(lastSet.weight) : ''
  );

  // Resynchronise les inputs au passage du set N au set N+1 (le composant reste monté).
  useEffect(() => {
    setRepsInput(String(exercise.reps));
    const last = currentExerciseSets[currentExerciseSets.length - 1];
    setWeightInput(last?.weight !== undefined ? String(last.weight) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setNumber]);

  const handleSetComplete = async () => {
    const reps = parseInt(repsInput, 10);
    if (isNaN(reps) || reps <= 0) return;

    const parsedWeight = weightInput.trim() ? parseFloat(weightInput) : undefined;
    const weight = parsedWeight !== undefined && !isNaN(parsedWeight) ? parsedWeight : undefined;

    logSet({ exerciseId: exercise.id, exerciseName: exercise.name, setNumber, reps, weight });

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSetLogged?.();
  };

  return (
    <View
      className={`bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700 ${className}`}
    >
      {/* En-tête : numéro de set et objectif */}
      <View className="flex-row items-center justify-between mb-4">
        <Text variant="h3" className="text-white">
          Set {setNumber} / {exercise.sets}
        </Text>
        <Text variant="caption" className="text-apex-black-400">
          Objectif : {exercise.reps} reps
        </Text>
      </View>

      {/* Suggestion poids basée sur le dernier set logué */}
      {lastSet?.weight !== undefined && (
        <Text variant="caption" className="text-apex-lime-500 mb-4">
          Poids suggéré : {lastSet.weight} kg
        </Text>
      )}

      {/* Inputs reps + poids */}
      <View className="flex-row gap-4 mb-6">
        <View className="flex-1">
          <Text variant="label" className="text-apex-black-400 mb-2">
            Reps réalisées
          </Text>
          <TextInput
            value={repsInput}
            onChangeText={setRepsInput}
            keyboardType="numeric"
            accessibilityLabel="Nombre de répétitions réalisées"
            placeholderTextColor={colors.black[400]}
            className="bg-apex-black-900 text-white rounded-xl px-4 h-12 border border-apex-black-700 text-base"
          />
        </View>
        <View className="flex-1">
          <Text variant="label" className="text-apex-black-400 mb-2">
            Poids (kg)
          </Text>
          <TextInput
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="decimal-pad"
            accessibilityLabel="Poids utilisé en kilogrammes"
            placeholder="Corps"
            placeholderTextColor={colors.black[400]}
            className="bg-apex-black-900 text-white rounded-xl px-4 h-12 border border-apex-black-700 text-base"
          />
        </View>
      </View>

      {/* Bouton de validation */}
      <Button
        onPress={handleSetComplete}
        variant="primary"
        accessibilityLabel={`Valider le set ${setNumber} sur ${exercise.sets}`}
      >
        Set terminé
      </Button>
    </View>
  );
}
