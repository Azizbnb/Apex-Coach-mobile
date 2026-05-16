import { useWorkoutStore } from '@/stores/workout';
import type { SetLog } from '@/stores/workout';

/**
 * Convenience hook autour du store workout — sélecteurs atomiques pour
 * éviter les re-renders inutiles, plus quelques valeurs dérivées.
 */
export function useWorkout() {
  // State brut
  const phase = useWorkoutStore((s) => s.phase);
  const session = useWorkoutStore((s) => s.session);
  const weekNumber = useWorkoutStore((s) => s.weekNumber);
  const sessionIndex = useWorkoutStore((s) => s.sessionIndex);
  const sessionActive = useWorkoutStore((s) => s.sessionActive);
  const currentWorkout = useWorkoutStore((s) => s.currentWorkout);
  const currentExerciseIndex = useWorkoutStore((s) => s.currentExerciseIndex);
  const exerciseStatuses = useWorkoutStore((s) => s.exerciseStatuses);
  const currentSet = useWorkoutStore((s) => s.currentSet);
  const sets = useWorkoutStore((s) => s.sets);
  const timer = useWorkoutStore((s) => s.timer);
  const restSeconds = useWorkoutStore((s) => s.restSeconds);
  const startedAt = useWorkoutStore((s) => s.startedAt);

  // Actions (références stables — safe à destructurer)
  const startSession = useWorkoutStore((s) => s.startSession);
  const resetSession = useWorkoutStore((s) => s.resetSession);
  const finishSession = useWorkoutStore((s) => s.finishSession);
  const completeWarmup = useWorkoutStore((s) => s.completeWarmup);
  const reorderExercises = useWorkoutStore((s) => s.reorderExercises);
  const startExercises = useWorkoutStore((s) => s.startExercises);
  const validateSet = useWorkoutStore((s) => s.validateSet);
  const chooseRest = useWorkoutStore((s) => s.chooseRest);
  const skipRest = useWorkoutStore((s) => s.skipRest);
  const finishRest = useWorkoutStore((s) => s.finishRest);
  const skipExercise = useWorkoutStore((s) => s.skipExercise);
  const completeCooldown = useWorkoutStore((s) => s.completeCooldown);
  const logSet = useWorkoutStore((s) => s.logSet);
  const nextExercise = useWorkoutStore((s) => s.nextExercise);
  const setTimer = useWorkoutStore((s) => s.setTimer);
  const tickTimer = useWorkoutStore((s) => s.tickTimer);

  // Valeurs dérivées
  const elapsedSeconds = startedAt
    ? Math.floor((Date.now() - startedAt) / 1000)
    : 0;

  const currentExercise = currentWorkout?.exercises[currentExerciseIndex] ?? null;

  const currentExerciseSets: SetLog[] = currentExercise
    ? sets.filter((s) => s.exerciseId === currentExercise.id)
    : [];

  const totalExercises = currentWorkout?.exercises.length ?? 0;

  const isLastExercise =
    totalExercises > 0 && currentExerciseIndex === totalExercises - 1;

  const completedCount = exerciseStatuses.filter(
    (s) => s === 'completed'
  ).length;

  return {
    // State
    phase,
    session,
    weekNumber,
    sessionIndex,
    sessionActive,
    currentWorkout,
    currentExerciseIndex,
    exerciseStatuses,
    currentSet,
    sets,
    timer,
    restSeconds,
    startedAt,
    // Valeurs dérivées
    elapsedSeconds,
    currentExercise,
    currentExerciseSets,
    totalExercises,
    isLastExercise,
    completedCount,
    // Actions
    startSession,
    resetSession,
    finishSession,
    completeWarmup,
    reorderExercises,
    startExercises,
    validateSet,
    chooseRest,
    skipRest,
    finishRest,
    skipExercise,
    completeCooldown,
    logSet,
    nextExercise,
    setTimer,
    tickTimer,
  };
}
