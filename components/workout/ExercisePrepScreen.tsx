import { View, ScrollView } from 'react-native';
import { Play, GripVertical } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/lib/constants';
import type { Exercise } from '@/types';

interface ExercisePrepScreenProps {
  sessionLabel: string; // ex: "LUNDI — FORCE"
  exercises: Exercise[];
  onStart: () => void;
}

function formatRest(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s === 0 ? `${m} min` : `${m}m${s}s`;
  }
  return `${seconds}s`;
}

/**
 * Écran de préparation affiché avant le démarrage des exercices.
 * Mirror du composant web `ExercisePrepScreen.tsx`.
 *
 * Note v1 : le drag-and-drop pour réordonner les exercices n'est pas
 * implémenté en mobile pour ce MVP (suit en v2 via react-native-reanimated +
 * react-native-gesture-handler). L'ordre affiché est celui généré par l'IA.
 */
export function ExercisePrepScreen({
  sessionLabel,
  exercises,
  onStart,
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
          Vérifie l'ordre des exercices avant de te lancer.
        </Text>

        {/* Liste numérotée */}
        <View className="gap-2">
          {exercises.map((ex, idx) => (
            <View
              key={ex.id}
              className="flex-row items-center gap-3 bg-apex-black-800 rounded-xl px-3 py-3 border border-apex-black-700"
            >
              <GripVertical size={18} color={colors.black[400]} />
              <View className="w-8 h-8 rounded-full bg-apex-lime-500/15 border border-apex-lime-500/30 items-center justify-center">
                <Text variant="caption" className="text-apex-lime-500 font-bold">
                  {idx + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text variant="body" className="text-white font-semibold">
                  {ex.name}
                </Text>
                <Text variant="caption" className="text-apex-black-400">
                  {ex.sets} séries · {ex.reps} reps · {formatRest(ex.rest_seconds)} repos
                </Text>
              </View>
            </View>
          ))}
        </View>
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
