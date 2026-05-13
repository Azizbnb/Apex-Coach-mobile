import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SetTracker } from '@/components/workout/SetTracker';
import type { Exercise } from '@/types';

// --- Mocks ---

const mockLogSet = jest.fn();

jest.mock('@/hooks/useWorkout', () => ({
  useWorkout: () => ({
    logSet: mockLogSet,
    currentExerciseSets: [],
  }),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: { Success: 'success' },
}));

// --- Données de test ---

const mockExercise: Exercise = {
  id: 'ex-1',
  name: 'Développé couché',
  sets: 4,
  reps: 10,
  rest_seconds: 90,
};

// --- Tests ---

describe('SetTracker', () => {
  beforeEach(() => {
    mockLogSet.mockClear();
  });

  it('affiche le numéro de set et le total', () => {
    render(<SetTracker exercise={mockExercise} setNumber={2} />);
    expect(screen.getByText('Set 2 / 4')).toBeTruthy();
  });

  it("affiche l'objectif en reps cibles", () => {
    render(<SetTracker exercise={mockExercise} setNumber={1} />);
    expect(screen.getByText('Objectif : 10 reps')).toBeTruthy();
  });

  it('affiche le champ de saisie des reps réalisées', () => {
    render(<SetTracker exercise={mockExercise} setNumber={1} />);
    expect(
      screen.getByLabelText('Nombre de répétitions réalisées')
    ).toBeTruthy();
  });

  it('affiche le champ de saisie du poids', () => {
    render(<SetTracker exercise={mockExercise} setNumber={1} />);
    expect(screen.getByLabelText('Poids utilisé en kilogrammes')).toBeTruthy();
  });

  it('affiche le bouton "Set terminé"', () => {
    render(<SetTracker exercise={mockExercise} setNumber={1} />);
    expect(screen.getByText('Set terminé')).toBeTruthy();
  });

  it('appelle logSet au tap sur "Set terminé"', () => {
    render(<SetTracker exercise={mockExercise} setNumber={1} />);
    fireEvent.press(screen.getByText('Set terminé'));
    expect(mockLogSet).toHaveBeenCalledTimes(1);
    expect(mockLogSet).toHaveBeenCalledWith(
      expect.objectContaining({
        exerciseId: 'ex-1',
        exerciseName: 'Développé couché',
        setNumber: 1,
        reps: 10,
      })
    );
  });

  it("n'appelle pas logSet si le champ reps est vide", () => {
    render(<SetTracker exercise={mockExercise} setNumber={1} />);
    fireEvent.changeText(
      screen.getByLabelText('Nombre de répétitions réalisées'),
      ''
    );
    fireEvent.press(screen.getByText('Set terminé'));
    expect(mockLogSet).not.toHaveBeenCalled();
  });

  it("n'appelle pas logSet si les reps sont à 0", () => {
    render(<SetTracker exercise={mockExercise} setNumber={1} />);
    fireEvent.changeText(
      screen.getByLabelText('Nombre de répétitions réalisées'),
      '0'
    );
    fireEvent.press(screen.getByText('Set terminé'));
    expect(mockLogSet).not.toHaveBeenCalled();
  });

  it('appelle le callback onSetLogged après le log', async () => {
    const onSetLogged = jest.fn();
    render(
      <SetTracker exercise={mockExercise} setNumber={1} onSetLogged={onSetLogged} />
    );
    fireEvent.press(screen.getByText('Set terminé'));
    await waitFor(() => expect(onSetLogged).toHaveBeenCalledTimes(1));
  });

  it('transmet le poids saisi dans logSet', () => {
    render(<SetTracker exercise={mockExercise} setNumber={1} />);
    fireEvent.changeText(
      screen.getByLabelText('Poids utilisé en kilogrammes'),
      '80'
    );
    fireEvent.press(screen.getByText('Set terminé'));
    expect(mockLogSet).toHaveBeenCalledWith(
      expect.objectContaining({ weight: 80 })
    );
  });

  it('transmet weight=undefined si le poids est vide', () => {
    render(<SetTracker exercise={mockExercise} setNumber={1} />);
    // Le champ poids est vide par défaut (pas de lastSet)
    fireEvent.press(screen.getByText('Set terminé'));
    expect(mockLogSet).toHaveBeenCalledWith(
      expect.objectContaining({ weight: undefined })
    );
  });
});
