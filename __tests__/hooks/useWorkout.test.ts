import { renderHook, act } from '@testing-library/react-native';
import { useWorkout } from '@/hooks/useWorkout';
import { useWorkoutStore } from '@/stores/workout';
import type { Workout } from '@/types';

const workoutFixture: Workout = {
  id: 'wk-42',
  user_id: 'user-1',
  title: 'Séance dos / biceps',
  exercises: [
    { id: 'ex-A', name: 'Tractions', sets: 4, reps: 8, rest_seconds: 120 },
    { id: 'ex-B', name: 'Curl barre', sets: 3, reps: 12, rest_seconds: 60 },
  ],
  duration: 45,
  difficulty: 'hard',
  completed: false,
  created_at: '2026-05-05T00:00:00Z',
  updated_at: '2026-05-05T00:00:00Z',
};

beforeEach(() => {
  useWorkoutStore.setState({
    sessionActive: null,
    currentWorkout: null,
    currentExerciseIndex: 0,
    sets: [],
    timer: 0,
    startedAt: null,
  });
});

describe('useWorkout — valeurs par défaut', () => {
  it('retourne un état vide au départ', () => {
    const { result } = renderHook(() => useWorkout());
    expect(result.current.sessionActive).toBeNull();
    expect(result.current.currentWorkout).toBeNull();
    expect(result.current.currentExercise).toBeNull();
    expect(result.current.currentExerciseSets).toHaveLength(0);
    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.totalExercises).toBe(0);
    expect(result.current.isLastExercise).toBe(false);
  });
});

describe('useWorkout — après startSession', () => {
  it('expose le bon exercice courant', () => {
    const { result } = renderHook(() => useWorkout());

    act(() => {
      result.current.startSession(workoutFixture);
    });

    expect(result.current.sessionActive).toBe('wk-42');
    expect(result.current.currentExercise?.id).toBe('ex-A');
    expect(result.current.totalExercises).toBe(2);
    expect(result.current.isLastExercise).toBe(false);
  });

  it('met à jour currentExercise après nextExercise', () => {
    const { result } = renderHook(() => useWorkout());

    act(() => {
      result.current.startSession(workoutFixture);
    });
    act(() => {
      result.current.nextExercise();
    });

    expect(result.current.currentExerciseIndex).toBe(1);
    expect(result.current.currentExercise?.id).toBe('ex-B');
    expect(result.current.isLastExercise).toBe(true);
  });
});

describe('useWorkout — currentExerciseSets', () => {
  it('filtre les sets par exercice courant', () => {
    const { result } = renderHook(() => useWorkout());

    act(() => {
      result.current.startSession(workoutFixture);
    });
    act(() => {
      result.current.logSet({
        exerciseId: 'ex-A',
        exerciseName: 'Tractions',
        setNumber: 1,
        reps: 8,
        weight: undefined,
      });
    });
    act(() => {
      result.current.logSet({
        exerciseId: 'ex-B',
        exerciseName: 'Curl barre',
        setNumber: 1,
        reps: 12,
        weight: 20,
      });
    });

    // currentExerciseIndex = 0 → exercice ex-A → 1 set
    expect(result.current.currentExerciseSets).toHaveLength(1);
    expect(result.current.currentExerciseSets[0].exerciseId).toBe('ex-A');
  });
});

describe('useWorkout — finishSession', () => {
  it('remet tout à zéro via le hook', () => {
    const { result } = renderHook(() => useWorkout());

    act(() => {
      result.current.startSession(workoutFixture);
    });
    act(() => {
      result.current.finishSession();
    });

    expect(result.current.sessionActive).toBeNull();
    expect(result.current.currentExercise).toBeNull();
    expect(result.current.sets).toHaveLength(0);
  });
});
