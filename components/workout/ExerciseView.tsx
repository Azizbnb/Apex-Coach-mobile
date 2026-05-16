import { useEffect, useState } from 'react';
import { View, TextInput, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { Play, Zap, Info, ChevronLeft, ChevronRight } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/lib/constants';
import type { AIExercise } from '@/lib/programs/adapter';

interface ExerciseViewProps {
  exercise: AIExercise;
  /** Numéro de la série en cours (1-based) */
  currentSet: number;
  /** Index global de l'exercice (1-based, ex: "Exercice 2 / 5") */
  currentIndex: number;
  totalExercises: number;
  videoUrl?: string;
  onValidate: (data: { reps: number; weight?: number }) => void;
  onSkip: () => void;
  onPrev?: () => void;
  onShowTip?: () => void;
}

function formatRestTime(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s === 0 ? `${m} min` : `${m} min ${s.toString().padStart(2, '0')}s`;
  }
  return `${seconds} s`;
}

/**
 * Vue exercice "1-par-1" : badges muscles, nom, démo, gros chiffre reps,
 * série courante / total avec dots, intensité, validation série.
 * Mirror du composant web `ExerciseView.tsx`.
 */
export function ExerciseView({
  exercise,
  currentSet,
  currentIndex,
  totalExercises,
  videoUrl,
  onValidate,
  onSkip,
  onPrev,
  onShowTip,
}: ExerciseViewProps) {
  const repsTarget = exercise.reps;
  // Pour l'input "reps réalisées" : on prend la première valeur numérique du target
  const initialReps = (() => {
    const match = repsTarget.match(/\d+/);
    return match ? match[0] : '';
  })();

  const [repsInput, setRepsInput] = useState(initialReps);
  const [weightInput, setWeightInput] = useState('');

  // Resync à chaque changement de série (1 composant monté pour tout l'exo)
  useEffect(() => {
    setRepsInput(initialReps);
    setWeightInput('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSet]);

  const handleValidate = async () => {
    const reps = parseInt(repsInput, 10);
    if (Number.isNaN(reps) || reps <= 0) return;
    const parsedWeight = weightInput.trim() ? parseFloat(weightInput) : undefined;
    const weight =
      parsedWeight !== undefined && !Number.isNaN(parsedWeight)
        ? parsedWeight
        : undefined;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => null
    );
    onValidate({ reps, weight });
  };

  const handleDemoPress = async () => {
    if (!videoUrl) return;
    await WebBrowser.openBrowserAsync(videoUrl);
  };

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Badges muscles ciblés */}
        {exercise.muscles_targeted && exercise.muscles_targeted.length > 0 && (
          <View className="flex-row flex-wrap gap-2 justify-center mt-4 mb-3">
            {exercise.muscles_targeted.map((m) => (
              <View
                key={m}
                className="bg-apex-lime-500/10 border border-apex-lime-500/30 rounded-full px-3 py-1"
              >
                <Text variant="caption" className="text-apex-lime-500 font-semibold uppercase">
                  {m}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Nom de l'exercice */}
        <Text variant="h1" className="text-white text-center mb-3">
          {exercise.exercise_name}
        </Text>

        {/* Bouton Démo (optionnel) */}
        {videoUrl && (
          <View className="items-center mb-6">
            <Pressable
              onPress={handleDemoPress}
              accessibilityRole="link"
              accessibilityLabel={`Voir la démo de ${exercise.exercise_name}`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="flex-row items-center gap-2 bg-apex-lime-500/15 border border-apex-lime-500/30 rounded-full px-4 py-2 active:opacity-70"
            >
              <Play size={14} color={colors.lime[500]} fill={colors.lime[500]} />
              <Text variant="caption" className="text-apex-lime-500 font-semibold">
                Démo
              </Text>
            </Pressable>
          </View>
        )}

        {/* Gros chiffre reps */}
        <View className="items-center mb-3">
          <Text className="text-white text-7xl font-bold tabular-nums">
            {repsTarget}
          </Text>
          <Text variant="label" className="text-apex-black-400 uppercase tracking-wider mt-1">
            Répétitions
          </Text>
        </View>

        {/* Série courante + dots progress */}
        <View className="items-center mb-3">
          <Text variant="body" className="text-white">
            Série <Text className="text-apex-lime-500 font-bold">{currentSet}</Text> sur {exercise.sets}
          </Text>
          <View className="flex-row gap-2 mt-2">
            {Array.from({ length: exercise.sets }).map((_, i) => {
              const completed = i < currentSet - 1;
              const active = i === currentSet - 1;
              return (
                <View
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${
                    completed
                      ? 'bg-apex-lime-500'
                      : active
                        ? 'bg-apex-lime-500 border-2 border-apex-lime-500/40'
                        : 'bg-apex-black-700'
                  }`}
                />
              );
            })}
          </View>
        </View>

        {/* Repos prévu */}
        <Text variant="caption" className="text-apex-black-400 text-center mb-3">
          Repos prévu : {formatRestTime(exercise.rest_seconds)}
        </Text>

        {/* Badge intensité */}
        {exercise.intensity && (
          <View className="items-center mb-6">
            <View className="flex-row items-center gap-1.5 bg-apex-black-800 border border-apex-black-700 rounded-full px-3 py-1.5">
              <Zap size={12} color={colors.lime[500]} />
              <Text variant="caption" className="text-white">
                {exercise.intensity}
              </Text>
            </View>
          </View>
        )}

        {/* Inputs reps réalisées + poids */}
        <View className="flex-row gap-3 mb-6">
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
              className="bg-apex-black-800 text-white rounded-xl px-4 h-12 border border-apex-black-700 text-base"
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
              className="bg-apex-black-800 text-white rounded-xl px-4 h-12 border border-apex-black-700 text-base"
            />
          </View>
        </View>

        {/* Validation série */}
        <Button
          variant="primary"
          onPress={handleValidate}
          accessibilityLabel={`Valider la série ${currentSet} sur ${exercise.sets}`}
        >
          {`✓  Valider série ${currentSet}`}
        </Button>
      </ScrollView>

      {/* Footer : Préc / Conseil / Passer */}
      <View className="flex-row items-center justify-between px-4 py-3 border-t border-apex-black-700 bg-apex-black-900">
        <Pressable
          onPress={onPrev}
          disabled={!onPrev || currentIndex === 1}
          accessibilityRole="button"
          accessibilityLabel="Exercice précédent"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className={`flex-row items-center gap-1 ${!onPrev || currentIndex === 1 ? 'opacity-40' : 'active:opacity-70'}`}
        >
          <ChevronLeft size={16} color={colors.black[400]} />
          <Text variant="caption" className="text-apex-black-400">
            Préc.
          </Text>
        </Pressable>

        {onShowTip && exercise.notes && (
          <Pressable
            onPress={onShowTip}
            accessibilityRole="button"
            accessibilityLabel="Voir les conseils du coach"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <Info size={16} color={colors.black[400]} />
            <Text variant="caption" className="text-apex-black-400">
              Conseil
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel="Passer cet exercice"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Text variant="caption" className="text-apex-black-400">
            Passer
          </Text>
          <ChevronRight size={16} color={colors.black[400]} />
        </Pressable>
      </View>
    </View>
  );
}

interface ExerciseTipBannerProps {
  notes: string;
}

/** Petite bannière de conseil (affichable au-dessus de la vue exercice). */
export function ExerciseTipBanner({ notes }: ExerciseTipBannerProps) {
  return (
    <View className="bg-apex-black-800 border border-apex-lime-500/20 rounded-xl px-4 py-3 mx-4 mt-2">
      <Text variant="label" className="text-apex-lime-500 mb-1">
        Conseil du coach
      </Text>
      <Text variant="body" className="text-white">
        {notes}
      </Text>
    </View>
  );
}
