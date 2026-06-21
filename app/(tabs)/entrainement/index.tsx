import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';

import { SafeView } from '@/components/ui/SafeView';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { WorkoutTopBar } from '@/components/workout/WorkoutTopBar';
import { WarmupCooldownCard } from '@/components/workout/WarmupCooldownCard';
import { ExercisePrepScreen } from '@/components/workout/ExercisePrepScreen';
import { ExerciseView, ExerciseTipBanner } from '@/components/workout/ExerciseView';
import { RestChoiceScreen } from '@/components/workout/RestChoiceScreen';
import { RestTimer } from '@/components/workout/RestTimer';
import { useWorkout } from '@/hooks/useWorkout';

export default function WorkoutScreen() {
  const {
    phase,
    session,
    currentWorkout,
    currentExercise,
    currentExerciseIndex,
    currentSet,
    totalExercises,
    completedCount,
    restSeconds,
    completeWarmup,
    startExercises,
    validateSet,
    chooseRest,
    skipRest,
    finishRest,
    skipExercise,
    completeCooldown,
    resetSession,
    reorderExercises,
  } = useWorkout();

  const [tipVisible, setTipVisible] = useState(false);

  // Reset l'affichage du conseil à chaque changement d'exercice/série/phase.
  useEffect(() => {
    setTipVisible(false);
  }, [currentExerciseIndex, currentSet, phase]);

  const handleBack = useCallback(() => {
    Alert.alert(
      'Quitter la séance ?',
      'Tes sets enregistrés seront perdus.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: () => {
            resetSession();
            router.replace('/(tabs)/programme');
          },
        },
      ]
    );
  }, [resetSession]);

  const handleViewStats = useCallback(() => {
    router.push('/(modals)/session-complete');
  }, []);

  const handleOpenFreeTimer = useCallback(() => {
    router.push('/(modals)/free-timer');
  }, []);

  // ───── Empty state : aucune séance active ───────────────────────────
  if (phase === 'idle' || !session || !currentWorkout) {
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

  // ───── Phase completed ──────────────────────────────────────────────
  if (phase === 'completed') {
    return (
      <SafeView>
        <View className="flex-1 items-center justify-center px-6 gap-4">
          <Text variant="h2" className="text-white text-center">
            Séance terminée !
          </Text>
          <Button variant="primary" onPress={handleViewStats}>
            Voir mes stats
          </Button>
        </View>
      </SafeView>
    );
  }

  const sessionLabel = `${session.day.toUpperCase()} — ${session.type.toUpperCase()}`;
  const currentAIExercise = session.main_workout[currentExerciseIndex];

  return (
    <SafeView>
      <WorkoutTopBar
        currentIndex={currentExerciseIndex + 1}
        totalExercises={totalExercises}
        completedCount={completedCount}
        onBack={handleBack}
        onTimerPress={handleOpenFreeTimer}
      />

      {/* ───── Phase warmup ───────────────────────────────────────── */}
      {phase === 'warmup' && (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          <Text variant="h2" className="text-white mb-1">
            {session.type}
          </Text>
          <Text variant="caption" className="text-apex-black-400 mb-4">
            {session.day} · {session.duration_minutes} min
          </Text>
          <WarmupCooldownCard
            type="warmup"
            durationMinutes={session.warmup.duration_minutes}
            exercises={session.warmup.exercises}
            onComplete={completeWarmup}
          />
        </ScrollView>
      )}

      {/* ───── Phase prep ─────────────────────────────────────────── */}
      {phase === 'prep' && (
        <ExercisePrepScreen
          sessionLabel={sessionLabel}
          exercises={currentWorkout.exercises}
          onStart={startExercises}
          onReorder={reorderExercises}
        />
      )}

      {/* ───── Phase exercise ─────────────────────────────────────── */}
      {phase === 'exercise' && currentExercise && currentAIExercise && (
        <>
          {tipVisible && currentAIExercise.notes && (
            <ExerciseTipBanner notes={currentAIExercise.notes} />
          )}
          <ExerciseView
            exercise={currentAIExercise}
            currentSet={currentSet}
            currentIndex={currentExerciseIndex + 1}
            totalExercises={totalExercises}
            onValidate={({ reps, weight }) =>
              validateSet({
                exerciseId: currentExercise.id,
                exerciseName: currentExercise.name,
                setNumber: currentSet,
                reps,
                weight,
              })
            }
            onSkip={skipExercise}
            onShowTip={
              currentAIExercise.notes
                ? () => setTipVisible((v) => !v)
                : undefined
            }
          />
        </>
      )}

      {/* ───── Phase restChoice ───────────────────────────────────── */}
      {phase === 'restChoice' && (
        <RestChoiceScreen
          completedSet={currentSet}
          totalSets={currentExercise?.sets ?? 0}
          restSeconds={restSeconds}
          onChooseRest={chooseRest}
          onSkipRest={skipRest}
        />
      )}

      {/* ───── Phase resting ──────────────────────────────────────── */}
      {phase === 'resting' && (
        <View className="flex-1 items-center justify-center px-6 gap-6">
          <View className="items-center gap-1">
            <Text variant="caption" className="text-apex-black-400">
              Exercice {currentExerciseIndex + 1} / {totalExercises}
            </Text>
            <Text variant="h2" className="text-white text-center">
              {currentExercise?.name}
            </Text>
          </View>
          <RestTimer
            duration={restSeconds}
            onFinish={finishRest}
            onSkip={finishRest}
          />
        </View>
      )}

      {/* ───── Phase cooldown ─────────────────────────────────────── */}
      {phase === 'cooldown' && session.cooldown && (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 16 }}
        >
          <Text variant="h2" className="text-white mb-1">
            Bien joué !
          </Text>
          <Text variant="caption" className="text-apex-black-400 mb-4">
            Termine par le retour au calme
          </Text>
          <WarmupCooldownCard
            type="cooldown"
            durationMinutes={session.cooldown.duration_minutes}
            exercises={session.cooldown.exercises}
            onComplete={completeCooldown}
          />
        </ScrollView>
      )}
    </SafeView>
  );
}
