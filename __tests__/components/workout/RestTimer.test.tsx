import React from 'react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { RestTimer } from '@/components/workout/RestTimer';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Medium: 'medium' },
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Circle: View,
    Svg: View,
  };
});

// État partagé du mock workout store
const mockWorkoutState = {
  timer: 90,
  setTimer: jest.fn((s: number) => { mockWorkoutState.timer = s; }),
  tickTimer: jest.fn(() => { mockWorkoutState.timer = Math.max(0, mockWorkoutState.timer - 1); }),
};

jest.mock('@/stores/workout', () => ({
  useWorkoutStore: jest.fn((selector: (s: typeof mockWorkoutState) => unknown) =>
    selector(mockWorkoutState)
  ),
}));

describe('RestTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockWorkoutState.timer = 90;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('affiche le compte à rebours initial formaté mm:ss', () => {
    render(<RestTimer duration={90} onFinish={jest.fn()} />);
    expect(screen.getByText('01:30')).toBeTruthy();
  });

  it('affiche le label "Repos"', () => {
    render(<RestTimer duration={60} onFinish={jest.fn()} />);
    expect(screen.getByText('Repos')).toBeTruthy();
  });

  it('affiche le bouton "Passer"', () => {
    render(<RestTimer duration={60} onFinish={jest.fn()} />);
    expect(screen.getByText('Passer')).toBeTruthy();
  });

  it('appelle onFinish et onSkip au tap sur "Passer"', () => {
    const onFinish = jest.fn();
    const onSkip = jest.fn();
    render(<RestTimer duration={60} onFinish={onFinish} onSkip={onSkip} />);
    fireEvent.press(screen.getByText('Passer'));
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('appelle uniquement onFinish quand onSkip est absent et que "Passer" est pressé', () => {
    const onFinish = jest.fn();
    render(<RestTimer duration={60} onFinish={onFinish} />);
    fireEvent.press(screen.getByText('Passer'));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('pose le bon accessibilityLabel sur l\'anneau', () => {
    render(<RestTimer duration={90} onFinish={jest.fn()} />);
    expect(screen.getByLabelText('Repos : 01:30')).toBeTruthy();
  });

  it('initialise le timer avec la durée fournie (appel setTimer)', () => {
    render(<RestTimer duration={45} onFinish={jest.fn()} />);
    expect(mockWorkoutState.setTimer).toHaveBeenCalledWith(45);
  });

  it('affiche 00:00 quand le timer vaut 0', () => {
    mockWorkoutState.timer = 0;
    render(<RestTimer duration={60} onFinish={jest.fn()} />);
    expect(screen.getByText('00:00')).toBeTruthy();
  });

  it('appelle les haptics au tap sur "Passer"', async () => {
    const Haptics = require('expo-haptics');
    const onFinish = jest.fn();
    render(<RestTimer duration={60} onFinish={onFinish} />);
    await act(async () => {
      fireEvent.press(screen.getByText('Passer'));
    });
    expect(Haptics.impactAsync).toHaveBeenCalled();
  });

  it('formate correctement une durée > 60 secondes', () => {
    mockWorkoutState.timer = 125;
    render(<RestTimer duration={125} onFinish={jest.fn()} />);
    expect(screen.getByText('02:05')).toBeTruthy();
  });

  it('n\'appelle pas onFinish si le timer n\'est pas à 0 au montage', () => {
    const onFinish = jest.fn();
    mockWorkoutState.timer = 30;
    render(<RestTimer duration={30} onFinish={onFinish} />);
    expect(onFinish).not.toHaveBeenCalled();
  });
});
