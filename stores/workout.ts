import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LargeSecureStore } from '@/lib/secure-store';
import type { Workout, Exercise } from '@/types';

// Représente un set loggé lors d'une session
export interface SetLog {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  reps: number;
  weight?: number; // poids en kg, undefined = poids du corps
  completedAt: number; // timestamp Unix ms
}

interface WorkoutState {
  // État de la session active
  sessionActive: string | null; // ID du workout, null si aucune session
  currentWorkout: Workout | null;
  currentExerciseIndex: number;
  sets: SetLog[];
  timer: number; // secondes restantes du timer de repos
  startedAt: number | null; // timestamp Unix ms du début de session

  // Actions
  startSession: (workout: Workout) => void;
  logSet: (set: Omit<SetLog, 'completedAt'>) => void;
  nextExercise: () => void;
  finishSession: () => void;
  setTimer: (seconds: number) => void;
  tickTimer: () => void;
}

// Champs persistés dans SecureStore — timer exclu (reprend à 0 au retour)
type PersistedWorkoutState = Pick<
  WorkoutState,
  'sessionActive' | 'currentWorkout' | 'currentExerciseIndex' | 'sets' | 'startedAt'
>;

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      sessionActive: null,
      currentWorkout: null,
      currentExerciseIndex: 0,
      sets: [],
      timer: 0,
      startedAt: null,

      startSession: (workout: Workout) =>
        set({
          sessionActive: workout.id,
          currentWorkout: workout,
          currentExerciseIndex: 0,
          sets: [],
          timer: 0,
          startedAt: Date.now(),
        }),

      logSet: (setData) =>
        set((state) => ({
          sets: [...state.sets, { ...setData, completedAt: Date.now() }],
        })),

      nextExercise: () =>
        set((state) => ({
          currentExerciseIndex: state.currentExerciseIndex + 1,
          timer: 0,
        })),

      finishSession: () =>
        set({
          sessionActive: null,
          currentWorkout: null,
          currentExerciseIndex: 0,
          sets: [],
          timer: 0,
          startedAt: null,
        }),

      setTimer: (seconds: number) => set({ timer: seconds }),

      tickTimer: () =>
        set((state) => ({ timer: Math.max(0, state.timer - 1) })),
    }),
    {
      name: 'apex-workout-session',
      storage: createJSONStorage(() => LargeSecureStore),
      partialize: (state): PersistedWorkoutState => ({
        sessionActive: state.sessionActive,
        currentWorkout: state.currentWorkout,
        currentExerciseIndex: state.currentExerciseIndex,
        sets: state.sets,
        startedAt: state.startedAt,
      }),
    }
  )
);

// Export du type Exercise pour les composants workout
export type { Exercise };
