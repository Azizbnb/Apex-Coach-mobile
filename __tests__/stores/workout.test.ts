import { useWorkoutStore } from '@/stores/workout';
import type { SetLog } from '@/stores/workout';
import type { Workout } from '@/types';

const workoutFixture: Workout = {
  id: 'wk-1',
  user_id: 'user-1',
  title: 'Séance poitrine / triceps',
  exercises: [
    { id: 'ex-1', name: 'Développé couché', sets: 4, reps: 10, rest_seconds: 90 },
    { id: 'ex-2', name: 'Dips', sets: 3, reps: 12, rest_seconds: 60 },
  ],
  duration: 60,
  difficulty: 'medium',
  completed: false,
  created_at: '2026-05-05T00:00:00Z',
  updated_at: '2026-05-05T00:00:00Z',
};

// Réinitialise le store entre chaque test
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

describe('useWorkoutStore — état initial', () => {
  it('démarre sans session active', () => {
    const state = useWorkoutStore.getState();
    expect(state.sessionActive).toBeNull();
    expect(state.currentWorkout).toBeNull();
    expect(state.currentExerciseIndex).toBe(0);
    expect(state.sets).toHaveLength(0);
    expect(state.timer).toBe(0);
    expect(state.startedAt).toBeNull();
  });
});

describe('useWorkoutStore — startSession', () => {
  it('initialise la session avec le workout fourni', () => {
    const before = Date.now();
    useWorkoutStore.getState().startSession(workoutFixture);
    const after = Date.now();

    const state = useWorkoutStore.getState();
    expect(state.sessionActive).toBe('wk-1');
    expect(state.currentWorkout).toEqual(workoutFixture);
    expect(state.currentExerciseIndex).toBe(0);
    expect(state.sets).toHaveLength(0);
    expect(state.timer).toBe(0);
    expect(state.startedAt).toBeGreaterThanOrEqual(before);
    expect(state.startedAt).toBeLessThanOrEqual(after);
  });

  it('réinitialise les sets si une session précédente était active', () => {
    useWorkoutStore.getState().startSession(workoutFixture);
    useWorkoutStore.getState().logSet({
      exerciseId: 'ex-1',
      exerciseName: 'Développé couché',
      setNumber: 1,
      reps: 10,
      weight: 80,
    });
    useWorkoutStore.getState().startSession(workoutFixture);
    expect(useWorkoutStore.getState().sets).toHaveLength(0);
  });
});

describe('useWorkoutStore — logSet', () => {
  it('ajoute un set loggé avec timestamp', () => {
    useWorkoutStore.getState().startSession(workoutFixture);
    const before = Date.now();
    useWorkoutStore.getState().logSet({
      exerciseId: 'ex-1',
      exerciseName: 'Développé couché',
      setNumber: 1,
      reps: 10,
      weight: 80,
    });
    const after = Date.now();

    const { sets } = useWorkoutStore.getState();
    expect(sets).toHaveLength(1);
    expect(sets[0].exerciseId).toBe('ex-1');
    expect(sets[0].reps).toBe(10);
    expect(sets[0].weight).toBe(80);
    expect(sets[0].completedAt).toBeGreaterThanOrEqual(before);
    expect(sets[0].completedAt).toBeLessThanOrEqual(after);
  });

  it('accumule plusieurs sets sans écraser', () => {
    useWorkoutStore.getState().startSession(workoutFixture);
    const base: Omit<SetLog, 'completedAt'> = {
      exerciseId: 'ex-1',
      exerciseName: 'Développé couché',
      setNumber: 1,
      reps: 10,
    };
    useWorkoutStore.getState().logSet(base);
    useWorkoutStore.getState().logSet({ ...base, setNumber: 2 });
    expect(useWorkoutStore.getState().sets).toHaveLength(2);
  });
});

describe('useWorkoutStore — nextExercise', () => {
  it("incrémente l'index et remet le timer à 0", () => {
    useWorkoutStore.getState().startSession(workoutFixture);
    useWorkoutStore.getState().setTimer(60);
    useWorkoutStore.getState().nextExercise();

    const state = useWorkoutStore.getState();
    expect(state.currentExerciseIndex).toBe(1);
    expect(state.timer).toBe(0);
  });
});

describe('useWorkoutStore — finishSession', () => {
  it('remet tout le state à zéro', () => {
    useWorkoutStore.getState().startSession(workoutFixture);
    useWorkoutStore.getState().logSet({
      exerciseId: 'ex-1',
      exerciseName: 'Développé couché',
      setNumber: 1,
      reps: 8,
    });
    useWorkoutStore.getState().finishSession();

    const state = useWorkoutStore.getState();
    expect(state.sessionActive).toBeNull();
    expect(state.currentWorkout).toBeNull();
    expect(state.sets).toHaveLength(0);
    expect(state.startedAt).toBeNull();
  });
});

describe('useWorkoutStore — timer', () => {
  it('setTimer définit la valeur exacte', () => {
    useWorkoutStore.getState().setTimer(90);
    expect(useWorkoutStore.getState().timer).toBe(90);
  });

  it('tickTimer décrémente de 1', () => {
    useWorkoutStore.getState().setTimer(10);
    useWorkoutStore.getState().tickTimer();
    expect(useWorkoutStore.getState().timer).toBe(9);
  });

  it('tickTimer ne passe pas en dessous de 0', () => {
    useWorkoutStore.getState().setTimer(0);
    useWorkoutStore.getState().tickTimer();
    expect(useWorkoutStore.getState().timer).toBe(0);
  });
});
