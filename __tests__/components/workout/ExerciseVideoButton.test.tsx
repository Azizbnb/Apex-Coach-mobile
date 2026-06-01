import React from 'react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ExerciseVideoButton } from '@/components/workout/ExerciseVideoButton';
import { router } from 'expo-router';

jest.mock('lucide-react-native', () => ({
  Play: 'Play',
}));

describe('ExerciseVideoButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le label Démo', () => {
    render(<ExerciseVideoButton exerciseName="Squat" />);
    expect(screen.getByText('Démo')).toBeTruthy();
  });

  it('ouvre le modal exercise-video avec le nom de l exercice', () => {
    render(<ExerciseVideoButton exerciseName="Squat" />);
    fireEvent.press(screen.getByRole('button'));
    expect(router.push).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/(modals)/exercise-video',
        params: expect.objectContaining({ exerciseName: 'Squat' }),
      })
    );
  });

  it('inclut videoUrl dans les params si fourni', () => {
    render(
      <ExerciseVideoButton
        exerciseName="Squat"
        videoUrl="https://example.com/squat.mp4"
      />
    );
    fireEvent.press(screen.getByRole('button'));
    expect(router.push).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          videoUrl: 'https://example.com/squat.mp4',
        }),
      })
    );
  });

  it('n inclut pas videoUrl dans les params si absent', () => {
    render(<ExerciseVideoButton exerciseName="Squat" />);
    fireEvent.press(screen.getByRole('button'));
    const callArgs = (router.push as jest.Mock).mock.calls[0][0] as {
      params: Record<string, unknown>;
    };
    expect(callArgs.params.videoUrl).toBeUndefined();
  });
});
