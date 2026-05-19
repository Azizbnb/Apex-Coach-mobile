import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Gesture } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import { SortableExerciseItem } from '@/components/workout/SortableExerciseItem';
import type { Exercise } from '@/types';

const mockExercise: Exercise = {
  id: 'ex-1',
  name: 'Développé couché',
  sets: 4,
  reps: 10,
  rest_seconds: 90,
};

const mockOnMoveUp = jest.fn();
const mockOnMoveDown = jest.fn();

// Le mock reanimated retourne { value: n } — cast explicite via unknown pour les tests
const makeSharedValue = (n: number) => ({ value: n }) as unknown as SharedValue<number>;

const defaultProps = {
  exercise: mockExercise,
  index: 1,
  total: 3,
  isActive: false,
  activeIndex: makeSharedValue(-1),
  dragY: makeSharedValue(0),
  panGesture: Gesture.Pan(),
  onMoveUp: mockOnMoveUp,
  onMoveDown: mockOnMoveDown,
};

beforeEach(() => {
  mockOnMoveUp.mockClear();
  mockOnMoveDown.mockClear();
});

describe('SortableExerciseItem', () => {
  it("affiche le nom de l'exercice", () => {
    render(<SortableExerciseItem {...defaultProps} />);
    expect(screen.getByText('Développé couché')).toBeTruthy();
  });

  it('affiche le numéro de position (index + 1)', () => {
    render(<SortableExerciseItem {...defaultProps} />);
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('affiche le résumé séries / reps / repos', () => {
    render(<SortableExerciseItem {...defaultProps} />);
    expect(screen.getByText(/4 séries/)).toBeTruthy();
    expect(screen.getByText(/10 reps/)).toBeTruthy();
    expect(screen.getByText(/1m30s/)).toBeTruthy();
  });

  it('formate correctement un repos < 60s', () => {
    const props = {
      ...defaultProps,
      exercise: { ...mockExercise, rest_seconds: 45 },
    };
    render(<SortableExerciseItem {...props} />);
    expect(screen.getByText(/45s/)).toBeTruthy();
  });

  it('formate correctement un repos en minutes rondes', () => {
    const props = {
      ...defaultProps,
      exercise: { ...mockExercise, rest_seconds: 120 },
    };
    render(<SortableExerciseItem {...props} />);
    expect(screen.getByText(/2 min/)).toBeTruthy();
  });
});
