import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LargeSecureStore } from '@/lib/secure-store';
import type { Workout, Exercise } from '@/types';
import type { AISession, AIExercise } from '@/lib/programs/adapter';

// Représente un set loggé lors d'une session
export interface SetLog {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  reps: number;
  weight?: number; // poids en kg, undefined = poids du corps
  completedAt: number; // timestamp Unix ms
}

/**
 * Machine d'état du flow d'entraînement (mirror du web `ActiveWorkout.tsx`) :
 *
 * idle ──startSession──▶ warmup ──completeWarmup──▶ prep ──startExercises──▶ exercise
 *                                                                              │
 *                          ┌────────────────────────────────────────────────────┘
 *                          │
 *                  ┌──validateSet (série N < total)──▶ restChoice
 *                  │                                       │
 *                  │              ┌──chooseRest──▶ resting ──finishRest──┐
 *                  │              │                                       │
 *                  │              └──skipRest─────────────────────────────┤
 *                  │                                                      │
 *                  ◀──────────────────(currentSet++)──────────────────────┘
 *
 *  validateSet (dernière série) ──▶ exercise suivant OU cooldown OU completed
 */
export type WorkoutPhase =
  | 'idle'
  | 'warmup'
  | 'prep'
  | 'exercise'
  | 'restChoice'
  | 'resting'
  | 'cooldown'
  | 'completed';

export type ExerciseStatus = 'pending' | 'completed' | 'skipped';

interface WorkoutState {
  // Phase machine
  phase: WorkoutPhase;

  // Session source (programme IA) — référence stable pour warmup/cooldown
  session: AISession | null;
  weekNumber: number | null;
  sessionIndex: number | null;

  // Compat avec composants existants (SetTracker, ExerciseCard) : Workout aplati
  sessionActive: string | null;
  currentWorkout: Workout | null;
  currentExerciseIndex: number;
  exerciseStatuses: ExerciseStatus[];
  currentSet: number; // 1-based, numéro de la série en cours pour l'exercice courant

  // Sets loggés (toutes séries, tous exercices)
  sets: SetLog[];

  // Chrono ascendant
  startedAt: number | null;

  // Timer repos (descendant) — utilisé par RestTimer modal
  timer: number;
  restSeconds: number; // durée de repos pour l'exercice courant

  // Actions cycle de vie
  startSession: (params: {
    session: AISession;
    workout: Workout;
    weekNumber: number;
    sessionIndex: number;
  }) => void;
  resetSession: () => void;
  finishSession: () => void;

  // Transitions phase
  completeWarmup: () => void;
  reorderExercises: (newExercises: Exercise[]) => void;
  startExercises: () => void;
  validateSet: (data: Omit<SetLog, 'completedAt'>) => void;
  chooseRest: () => void;
  skipRest: () => void;
  finishRest: () => void;
  skipExercise: () => void;
  completeCooldown: () => void;

  // Actions existantes (compat) — préservées pour ne pas casser les tests
  logSet: (set: Omit<SetLog, 'completedAt'>) => void;
  nextExercise: () => void;
  setTimer: (seconds: number) => void;
  tickTimer: () => void;
}

type PersistedWorkoutState = Pick<
  WorkoutState,
  | 'phase'
  | 'session'
  | 'weekNumber'
  | 'sessionIndex'
  | 'sessionActive'
  | 'currentWorkout'
  | 'currentExerciseIndex'
  | 'exerciseStatuses'
  | 'currentSet'
  | 'sets'
  | 'startedAt'
  | 'restSeconds'
>;

/** Trouve le prochain exercice "pending" à partir d'un index donné (exclu). */
function nextPendingIndex(statuses: ExerciseStatus[], fromIndex: number): number {
  for (let i = fromIndex + 1; i < statuses.length; i++) {
    if (statuses[i] === 'pending') return i;
  }
  return -1;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      phase: 'idle',
      session: null,
      weekNumber: null,
      sessionIndex: null,
      sessionActive: null,
      currentWorkout: null,
      currentExerciseIndex: 0,
      exerciseStatuses: [],
      currentSet: 1,
      sets: [],
      startedAt: null,
      timer: 0,
      restSeconds: 0,

      startSession: ({ session, workout, weekNumber, sessionIndex }) =>
        set({
          phase: session.warmup ? 'warmup' : 'prep',
          session,
          weekNumber,
          sessionIndex,
          sessionActive: workout.id,
          currentWorkout: workout,
          currentExerciseIndex: 0,
          exerciseStatuses: workout.exercises.map(() => 'pending'),
          currentSet: 1,
          sets: [],
          timer: 0,
          restSeconds: 0,
          startedAt: Date.now(),
        }),

      resetSession: () =>
        set({
          phase: 'idle',
          session: null,
          weekNumber: null,
          sessionIndex: null,
          sessionActive: null,
          currentWorkout: null,
          currentExerciseIndex: 0,
          exerciseStatuses: [],
          currentSet: 1,
          sets: [],
          timer: 0,
          restSeconds: 0,
          startedAt: null,
        }),

      finishSession: () =>
        set({
          phase: 'completed',
        }),

      completeWarmup: () => set({ phase: 'prep' }),

      reorderExercises: (newExercises) =>
        set((state) =>
          state.currentWorkout
            ? {
                currentWorkout: { ...state.currentWorkout, exercises: newExercises },
                exerciseStatuses: newExercises.map(() => 'pending'),
                currentExerciseIndex: 0,
              }
            : state
        ),

      startExercises: () =>
        set((state) => {
          const firstEx = state.currentWorkout?.exercises[0];
          return {
            phase: 'exercise',
            currentSet: 1,
            restSeconds: firstEx?.rest_seconds ?? 60,
          };
        }),

      validateSet: (data) => {
        const state = get();
        const ex = state.currentWorkout?.exercises[state.currentExerciseIndex];
        if (!ex) return;

        const newSets: SetLog[] = [
          ...state.sets,
          { ...data, completedAt: Date.now() },
        ];

        // Pas dernière série → restChoice
        if (state.currentSet < ex.sets) {
          set({
            sets: newSets,
            phase: 'restChoice',
            restSeconds: ex.rest_seconds || 60,
          });
          return;
        }

        // Dernière série → marque exo complété + transition
        const newStatuses = [...state.exerciseStatuses];
        newStatuses[state.currentExerciseIndex] = 'completed';

        const next = nextPendingIndex(newStatuses, state.currentExerciseIndex);
        if (next === -1) {
          // Tous les exos faits → cooldown si dispo, sinon completed
          set({
            sets: newSets,
            exerciseStatuses: newStatuses,
            phase: state.session?.cooldown ? 'cooldown' : 'completed',
            currentSet: 1,
          });
        } else {
          const nextEx = state.currentWorkout?.exercises[next];
          set({
            sets: newSets,
            exerciseStatuses: newStatuses,
            currentExerciseIndex: next,
            currentSet: 1,
            phase: 'exercise',
            restSeconds: nextEx?.rest_seconds ?? 60,
          });
        }
      },

      chooseRest: () => set({ phase: 'resting' }),

      skipRest: () =>
        set((state) => ({
          phase: 'exercise',
          currentSet: state.currentSet + 1,
          timer: 0,
        })),

      finishRest: () =>
        set((state) => ({
          phase: 'exercise',
          currentSet: state.currentSet + 1,
          timer: 0,
        })),

      skipExercise: () => {
        const state = get();
        const newStatuses = [...state.exerciseStatuses];
        newStatuses[state.currentExerciseIndex] = 'skipped';
        const next = nextPendingIndex(newStatuses, state.currentExerciseIndex);
        if (next === -1) {
          set({
            exerciseStatuses: newStatuses,
            phase: state.session?.cooldown ? 'cooldown' : 'completed',
            currentSet: 1,
          });
        } else {
          const nextEx = state.currentWorkout?.exercises[next];
          set({
            exerciseStatuses: newStatuses,
            currentExerciseIndex: next,
            currentSet: 1,
            phase: 'exercise',
            restSeconds: nextEx?.rest_seconds ?? 60,
          });
        }
      },

      completeCooldown: () => set({ phase: 'completed' }),

      // ── Actions héritées (compat tests existants) ──────────────────────

      logSet: (setData) =>
        set((state) => ({
          sets: [...state.sets, { ...setData, completedAt: Date.now() }],
        })),

      nextExercise: () =>
        set((state) => ({
          currentExerciseIndex: state.currentExerciseIndex + 1,
          timer: 0,
        })),

      setTimer: (seconds: number) => set({ timer: seconds }),

      tickTimer: () =>
        set((state) => ({ timer: Math.max(0, state.timer - 1) })),
    }),
    {
      name: 'apex-workout-session',
      storage: createJSONStorage(() => LargeSecureStore),
      partialize: (state): PersistedWorkoutState => ({
        phase: state.phase,
        session: state.session,
        weekNumber: state.weekNumber,
        sessionIndex: state.sessionIndex,
        sessionActive: state.sessionActive,
        currentWorkout: state.currentWorkout,
        currentExerciseIndex: state.currentExerciseIndex,
        exerciseStatuses: state.exerciseStatuses,
        currentSet: state.currentSet,
        sets: state.sets,
        startedAt: state.startedAt,
        restSeconds: state.restSeconds,
      }),
    }
  )
);

export type { Exercise, AISession, AIExercise };
