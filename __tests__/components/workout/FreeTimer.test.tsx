import React from 'react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { FreeTimer } from '@/components/workout/FreeTimer';

jest.mock('lucide-react-native', () => ({
  X: 'X',
}));

const defaultProps = {
  visible: true,
  remaining: 0,
  isRunning: false,
  onSelectPreset: jest.fn(),
  onStop: jest.fn(),
  onClose: jest.fn(),
};

describe('FreeTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le titre "Minuteur libre"', () => {
    render(<FreeTimer {...defaultProps} />);
    expect(screen.getByText('Minuteur libre')).toBeTruthy();
  });

  it('affiche les 5 presets', () => {
    render(<FreeTimer {...defaultProps} />);
    expect(screen.getByText('30 s')).toBeTruthy();
    expect(screen.getByText('1 min')).toBeTruthy();
    expect(screen.getByText('1 min 30')).toBeTruthy();
    expect(screen.getByText('2 min')).toBeTruthy();
    expect(screen.getByText('3 min')).toBeTruthy();
  });

  it('appelle onSelectPreset(60) au tap sur "1 min"', () => {
    render(<FreeTimer {...defaultProps} />);
    fireEvent.press(screen.getByText('1 min'));
    expect(defaultProps.onSelectPreset).toHaveBeenCalledWith(60);
  });

  it('appelle onSelectPreset(90) au tap sur "1 min 30"', () => {
    render(<FreeTimer {...defaultProps} />);
    fireEvent.press(screen.getByText('1 min 30'));
    expect(defaultProps.onSelectPreset).toHaveBeenCalledWith(90);
  });

  it('appelle onClose au tap sur le bouton fermer', () => {
    render(<FreeTimer {...defaultProps} />);
    fireEvent.press(screen.getByLabelText('Fermer'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('n\'affiche pas le bouton "Arrêter" quand isRunning=false', () => {
    render(<FreeTimer {...defaultProps} isRunning={false} />);
    expect(screen.queryByText('Arrêter')).toBeNull();
  });

  it('affiche le countdown et le bouton "Arrêter" quand isRunning=true', () => {
    render(<FreeTimer {...defaultProps} isRunning remaining={75} />);
    expect(screen.getByText('01:15')).toBeTruthy();
    expect(screen.getByText('Arrêter')).toBeTruthy();
  });

  it('appelle onStop au tap sur "Arrêter"', () => {
    render(<FreeTimer {...defaultProps} isRunning remaining={30} />);
    fireEvent.press(screen.getByText('Arrêter'));
    expect(defaultProps.onStop).toHaveBeenCalledTimes(1);
  });

  it('n\'est pas visible quand visible=false', () => {
    render(<FreeTimer {...defaultProps} visible={false} />);
    expect(screen.queryByText('Minuteur libre')).toBeNull();
  });
});
