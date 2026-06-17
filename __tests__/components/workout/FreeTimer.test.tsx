import React from 'react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { FreeTimer } from '@/components/workout/FreeTimer';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Medium: 'medium' },
}));

// Mock lucide-react-native (les icônes ne sont pas testées visuellement)
jest.mock('lucide-react-native', () => ({
  Play: 'Play',
  Pause: 'Pause',
  RotateCcw: 'RotateCcw',
  CheckCircle2: 'CheckCircle2',
}));

/** Avance le chrono de `n` secondes (fake timers). */
function advanceSeconds(n: number) {
  act(() => {
    jest.advanceTimersByTime(n * 1000);
  });
}

describe('FreeTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('affiche 00:00 au montage', () => {
    render(<FreeTimer />);
    expect(screen.getByText('00:00')).toBeTruthy();
  });

  it('affiche le label "Chronomètre libre" sans cible', () => {
    render(<FreeTimer />);
    expect(screen.getByText('Chronomètre libre')).toBeTruthy();
  });

  it('démarre et incrémente le temps chaque seconde', () => {
    render(<FreeTimer />);
    fireEvent.press(screen.getByLabelText('Démarrer le minuteur'));
    advanceSeconds(3);
    expect(screen.getByText('00:03')).toBeTruthy();
  });

  it('met en pause et fige le temps', () => {
    render(<FreeTimer />);
    fireEvent.press(screen.getByLabelText('Démarrer le minuteur'));
    advanceSeconds(2);
    fireEvent.press(screen.getByLabelText('Mettre en pause'));
    advanceSeconds(5);
    expect(screen.getByText('00:02')).toBeTruthy();
  });

  it('reprend après une pause', () => {
    render(<FreeTimer />);
    fireEvent.press(screen.getByLabelText('Démarrer le minuteur'));
    advanceSeconds(2);
    fireEvent.press(screen.getByLabelText('Mettre en pause'));
    fireEvent.press(screen.getByLabelText('Démarrer le minuteur'));
    advanceSeconds(3);
    expect(screen.getByText('00:05')).toBeTruthy();
  });

  it('réinitialise le temps à 00:00', () => {
    render(<FreeTimer />);
    fireEvent.press(screen.getByLabelText('Démarrer le minuteur'));
    advanceSeconds(4);
    fireEvent.press(screen.getByLabelText('Réinitialiser le minuteur'));
    expect(screen.getByText('00:00')).toBeTruthy();
  });

  it('affiche l\'objectif sélectionné', () => {
    render(<FreeTimer />);
    fireEvent.press(screen.getByLabelText('Objectif 1 min'));
    expect(screen.getByText('Objectif : 01:00')).toBeTruthy();
  });

  it('déclenche la vibration de succès quand la cible est atteinte', () => {
    const Haptics = require('expo-haptics');
    render(<FreeTimer />);
    fireEvent.press(screen.getByLabelText('Objectif 30s'));
    fireEvent.press(screen.getByLabelText('Démarrer le minuteur'));
    advanceSeconds(30);
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Objectif atteint')).toBeTruthy();
  });

  it('ne vibre pas tant que la cible n\'est pas atteinte', () => {
    const Haptics = require('expo-haptics');
    render(<FreeTimer />);
    fireEvent.press(screen.getByLabelText('Objectif 1 min'));
    fireEvent.press(screen.getByLabelText('Démarrer le minuteur'));
    advanceSeconds(30);
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });

  it('passe au format HH:MM:SS au-delà d\'une heure', () => {
    render(<FreeTimer />);
    fireEvent.press(screen.getByLabelText('Démarrer le minuteur'));
    advanceSeconds(3661);
    expect(screen.getByText('01:01:01')).toBeTruthy();
  });
});
