import { View, ScrollView } from 'react-native';
import { Play } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DraggableExerciseList } from '@/components/workout/DraggableExerciseList';
import { colors } from '@/lib/constants';
import type { Exercise } from '@/types';

interface ExercisePrepScreenProps {
  sessionLabel: string; // ex: "LUNDI — FORCE"
  exercises: Exercise[];
  onStart: () => void;
  onReorder: (newExercises: Exercise[]) => void;
}

/**
 * Écran de préparation affiché avant le démarrage des exercices.
 * Mirror du composant web `ExercisePrepScreen.tsx`.
 *
 * L'ordre des exercices est réordonnable par glisser-déposer
 * (appui long sur une ligne) via `DraggableExerciseList`.
 */
export function ExercisePrepScreen({
  sessionLabel,
  exercises,
  onStart,
  onReorder,
}: ExercisePrepScreenProps) {
  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Badge session */}
        <View className="items-center mt-4 mb-2">
          <Badge label={sessionLabel} variant="premium" />
        </View>

        <Text variant="h1" className="text-white text-center mt-3 mb-2">
          Prêt pour la séance ?
        </Text>
        <Text variant="caption" className="text-apex-black-400 text-center mb-6">
          Maintiens une ligne appuyée pour réordonner les exercices.
        </Text>

        {/* Liste réordonnable */}
        <DraggableExerciseList exercises={exercises} onReorder={onReorder} />
      </ScrollView>

      {/* CTA fixe en bas */}
      <View className="px-4 pb-6 pt-3 border-t border-apex-black-700 bg-apex-black-900">
        <Button
          variant="primary"
          onPress={onStart}
          accessibilityLabel={`Démarrer la séance, ${exercises.length} exercices`}
        >
          {`▷  C'est parti !`}
        </Button>
        <View className="flex-row items-center justify-center gap-1.5 mt-3">
          <Play size={12} color={colors.black[400]} />
          <Text variant="caption" className="text-apex-black-400">
            {exercises.length} exercice{exercises.length > 1 ? 's' : ''} au programme
          </Text>
        </View>
      </View>
    </View>
  );
}
