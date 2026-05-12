import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';

import { ExerciseCard } from '@/components/programme/ExerciseCard';
import type { Exercise } from '@/types';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn().mockResolvedValue({ type: 'cancel' }),
}));

const exercice: Exercise = {
  id: 'ex-1',
  name: 'Squat',
  sets: 3,
  reps: 10,
  rest_seconds: 60,
};

describe('ExerciseCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("affiche le nom de l'exercice", () => {
    render(<ExerciseCard exercise={exercice} />);
    expect(screen.getByText('Squat')).toBeTruthy();
  });

  it('affiche sets × reps', () => {
    render(<ExerciseCard exercise={exercice} />);
    expect(screen.getAllByText(/3 × 10/).length).toBeGreaterThan(0);
  });

  it('affiche le temps de repos en minutes (≥ 60 s)', () => {
    render(<ExerciseCard exercise={exercice} />);
    expect(screen.getByText(/Repos : 1 min/)).toBeTruthy();
  });

  it('affiche le temps de repos en secondes (< 60 s)', () => {
    render(<ExerciseCard exercise={{ ...exercice, rest_seconds: 45 }} />);
    expect(screen.getByText(/Repos : 45 s/)).toBeTruthy();
  });

  it("n'affiche pas le bouton play sans videoUrl", () => {
    render(<ExerciseCard exercise={exercice} />);
    expect(
      screen.queryByLabelText(/Voir la vidéo de démonstration/)
    ).toBeNull();
  });

  it('affiche le bouton play si videoUrl est fourni', () => {
    render(<ExerciseCard exercise={exercice} videoUrl="https://example.com/squat.mp4" />);
    expect(
      screen.getByLabelText('Voir la vidéo de démonstration pour Squat')
    ).toBeTruthy();
  });

  it('ouvre le browser au tap sur le bouton play', () => {
    render(<ExerciseCard exercise={exercice} videoUrl="https://example.com/squat.mp4" />);
    const playBtn = screen.getByLabelText('Voir la vidéo de démonstration pour Squat');
    fireEvent.press(playBtn);
    expect(WebBrowser.openBrowserAsync as jest.Mock).toHaveBeenCalledWith(
      'https://example.com/squat.mp4'
    );
  });

  it('appelle onPress au tap sur la carte', () => {
    const onPress = jest.fn();
    render(<ExerciseCard exercise={exercice} onPress={onPress} />);
    fireEvent.press(screen.getByLabelText(/Squat, 3 séries/));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('mode compact : affiche le nom et sets × reps', () => {
    render(<ExerciseCard exercise={exercice} compact />);
    expect(screen.getByText('Squat')).toBeTruthy();
    expect(screen.getByText(/3 × 10/)).toBeTruthy();
  });

  it('affiche les notes si présentes', () => {
    render(<ExerciseCard exercise={{ ...exercice, notes: 'Dos bien droit' }} />);
    expect(screen.getByText('Dos bien droit')).toBeTruthy();
  });
});
