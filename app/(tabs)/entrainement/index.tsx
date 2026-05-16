import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { Timer } from 'lucide-react-native';

import { SafeView } from '@/components/ui/SafeView';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ExerciseCard } from '@/components/programme/ExerciseCard';
import { SetTracker } from '@/components/workout/SetTracker';
import { useWorkout } from '@/hooks/useWorkout';
import { colors } from '@/lib/constants';

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function WorkoutScreen() {
  const {
    sessionActive,
    currentWorkout,
    currentExercise,
    currentExerciseIndex,
    currentExerciseSets,
    totalExercises,
    isLastExercise,
    startedAt,
    nextExercise,
    finishSession,
  } = useWorkout();

  // Tick à chaque seconde pour rafraîchir le chrono affiché
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const elapsedDisplay = startedAt
    ? formatElapsed(Math.floor((Date.now() - startedAt) / 1000))
    : '00:00';

  const setNumber = currentExerciseSets.length + 1;
  const setsComplete = currentExercise
    ? currentExerciseSets.length >= currentExercise.sets
    : false;

  const handleSetLogged = useCallback(() => {
    if (!currentExercise) return;
    const justLoggedAll = currentExerciseSets.length + 1 >= currentExercise.sets;
    if (justLoggedAll) {
      // Tous les sets de l'exo sont faits → on attend que l'user clique "Suivant" ou "Repos"
      return;
    }
    router.push({
      pathname: '/(modals)/rest-timer',
      params: { duration: String(currentExercise.rest_seconds) },
    });
  }, [currentExercise, currentExerciseSets.length]);

  const handleNext = useCallback(() => {
    if (isLastExercise) {
      router.push('/(modals)/session-complete');
    } else {
      nextExercise();
    }
  }, [isLastExercise, nextExercise]);

  const handleAbort = useCallback(() => {
    Alert.alert(
      'Abandonner la séance ?',
      'Tes sets enregistrés seront perdus.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Abandonner',
          style: 'destructive',
          onPress: () => {
            finishSession();
            router.replace('/(tabs)/programme');
          },
        },
      ]
    );
  }, [finishSession]);

  // État 1 : pas de session active → empty state
  if (!sessionActive || !currentWorkout || !currentExercise) {
    return (
      <SafeView>
        <View className="flex-1 items-center justify-center px-6 gap-4">
          <Text variant="h2" className="text-white text-center">
            Aucune séance en cours
          </Text>
          <Text variant="body" className="text-apex-black-400 text-center">
            Choisis une séance dans ton programme pour démarrer un entraînement.
          </Text>
          <Button
            variant="primary"
            onPress={() => router.push('/(tabs)/programme')}
            className="mt-4"
          >
            Voir mon programme
          </Button>
        </View>
      </SafeView>
    );
  }

  // État 2 : session active
  return (
    <SafeView>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* En-tête : titre + chrono + progression exo */}
        <View className="mt-4 mb-6">
          <Text variant="h2" className="text-white mb-1">
            {currentWorkout.title}
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1.5">
              <Timer size={14} color={colors.black[400]} />
              <Text variant="caption" className="text-apex-black-400 tabular-nums">
                {elapsedDisplay}
              </Text>
            </View>
            <Text variant="caption" className="text-apex-black-400">
              Exercice {currentExerciseIndex + 1} / {totalExercises}
            </Text>
          </View>
        </View>

        {/* Carte de l'exo courant (mode compact non — on veut tout voir) */}
        <ExerciseCard exercise={currentExercise} className="mb-4" />

        {/* Historique des sets déjà loggés sur cet exo */}
        {currentExerciseSets.length > 0 && (
          <View className="bg-apex-black-800 rounded-xl p-4 border border-apex-black-700 mb-4">
            <Text variant="label" className="text-apex-black-400 mb-2">
              Sets enregistrés
            </Text>
            {currentExerciseSets.map((s) => (
              <View key={s.completedAt} className="flex-row justify-between py-1">
                <Text variant="body" className="text-white">
                  Set {s.setNumber}
                </Text>
                <Text variant="body" className="text-apex-black-400">
                  {s.reps} reps{s.weight !== undefined ? ` × ${s.weight} kg` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Tracker du set suivant OU bouton "Exercice suivant" si tous les sets sont faits */}
        {setsComplete ? (
          <Button
            variant="primary"
            onPress={handleNext}
            className="mb-3"
            accessibilityLabel={
              isLastExercise ? 'Terminer la séance' : 'Passer à l\'exercice suivant'
            }
          >
            {isLastExercise ? 'Terminer la séance' : 'Exercice suivant'}
          </Button>
        ) : (
          <SetTracker
            exercise={currentExercise}
            setNumber={setNumber}
            onSetLogged={handleSetLogged}
            className="mb-3"
          />
        )}

        {/* Lien discret : abandonner la séance */}
        <Pressable
          onPress={handleAbort}
          accessibilityRole="button"
          accessibilityLabel="Abandonner la séance"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="self-center py-3 mt-2"
        >
          <Text variant="caption" className="text-apex-black-400 underline">
            Abandonner la séance
          </Text>
        </Pressable>
      </ScrollView>
    </SafeView>
  );
}
