import { useWorkoutStore } from '@/stores/workout';
import type { SetLog } from '@/stores/workout';

export function useWorkout() {
  // Sélecteurs atomiques — un état = un sélecteur (évite les re-renders inutiles)
  const sessionActive = useWorkoutStore((s) => s.sessionActive);
  const currentWorkout = useWorkoutStore((s) => s.currentWorkout);
  const currentExerciseIndex = useWorkoutStore((s) => s.currentExerciseIndex);
  const sets = useWorkoutStore((s) => s.sets);
  const timer = useWorkoutStore((s) => s.timer);
  const startedAt = useWorkoutStore((s) => s.startedAt);

  // Actions (références stables — safe à destructer)
  const startSession = useWorkoutStore((s) => s.startSession);
  const logSet = useWorkoutStore((s) => s.logSet);
  const nextExercise = useWorkoutStore((s) => s.nextExercise);
  const finishSession = useWorkoutStore((s) => s.finishSession);
  const setTimer = useWorkoutStore((s) => s.setTimer);
  const tickTimer = useWorkoutStore((s) => s.tickTimer);

  // Valeurs dérivées calculées à partir du state
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

  return {
    // State
    sessionActive,
    currentWorkout,
    currentExerciseIndex,
    sets,
    timer,
    startedAt,
    // Valeurs dérivées
    elapsedSeconds,
    currentExercise,
    currentExerciseSets,
    totalExercises,
    isLastExercise,
    // Actions
    startSession,
    logSet,
    nextExercise,
    finishSession,
    setTimer,
    tickTimer,
  };
}
