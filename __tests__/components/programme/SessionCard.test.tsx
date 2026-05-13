import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, jest } from '@jest/globals';

import { SessionCard } from '@/components/programme/SessionCard';

const defaultProps = {
  title: 'Séance A — Haut du corps',
  day: 'Lundi',
  durationMinutes: 45,
  exerciseCount: 6,
  onPress: jest.fn(),
};

describe('SessionCard', () => {
  it('affiche le titre de la séance', () => {
    render(<SessionCard {...defaultProps} />);
    expect(screen.getByText('Séance A — Haut du corps')).toBeTruthy();
  });

  it('affiche le jour', () => {
    render(<SessionCard {...defaultProps} />);
    expect(screen.getByText('Lundi')).toBeTruthy();
  });

  it('affiche la durée estimée en minutes', () => {
    render(<SessionCard {...defaultProps} />);
    expect(screen.getByText('45 min')).toBeTruthy();
  });

  it('affiche le nombre d\'exercices au pluriel', () => {
    render(<SessionCard {...defaultProps} />);
    expect(screen.getByText('6 exercices')).toBeTruthy();
  });

  it('affiche "exercice" au singulier pour 1 exercice', () => {
    render(<SessionCard {...defaultProps} exerciseCount={1} />);
    expect(screen.getByText('1 exercice')).toBeTruthy();
  });

  it('affiche le badge "À faire" par défaut (status absent)', () => {
    render(<SessionCard {...defaultProps} />);
    expect(screen.getByText('À faire')).toBeTruthy();
  });

  it('affiche le badge "À faire" quand status=pending', () => {
    render(<SessionCard {...defaultProps} status="pending" />);
    expect(screen.getByText('À faire')).toBeTruthy();
  });

  it('affiche le badge "Terminée" quand status=done', () => {
    render(<SessionCard {...defaultProps} status="done" />);
    expect(screen.getByText('Terminée')).toBeTruthy();
  });

  it('affiche le badge "Sautée" quand status=skipped', () => {
    render(<SessionCard {...defaultProps} status="skipped" />);
    expect(screen.getByText('Sautée')).toBeTruthy();
  });

  it('appelle onPress au tap', () => {
    const onPress = jest.fn();
    render(<SessionCard {...defaultProps} onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
