import { renderHook, act } from '@testing-library/react-native';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as Haptics from 'expo-haptics';
import { useFreeTimer } from '@/hooks/useFreeTimer';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Medium: 'medium' },
}));

describe('useFreeTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('démarre avec remaining=0 et isRunning=false', () => {
    const { result } = renderHook(() => useFreeTimer());
    expect(result.current.remaining).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('start() passe isRunning à true et positionne remaining', () => {
    const { result } = renderHook(() => useFreeTimer());
    act(() => {
      result.current.start(60);
    });
    expect(result.current.isRunning).toBe(true);
    expect(result.current.remaining).toBe(60);
  });

  it('décrémente remaining chaque seconde', () => {
    const { result } = renderHook(() => useFreeTimer());
    act(() => { result.current.start(30); });
    act(() => { jest.advanceTimersByTime(3000); });
    expect(result.current.remaining).toBe(27);
  });

  it('stop() remet isRunning=false et remaining=0', () => {
    const { result } = renderHook(() => useFreeTimer());
    act(() => { result.current.start(60); });
    act(() => { result.current.stop(); });
    expect(result.current.isRunning).toBe(false);
    expect(result.current.remaining).toBe(0);
  });

  it('passe isRunning=false à l\'expiration naturelle', () => {
    const { result } = renderHook(() => useFreeTimer());
    act(() => { result.current.start(5); });
    act(() => { jest.advanceTimersByTime(5000); });
    expect(result.current.remaining).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('start() peut redémarrer un timer déjà en cours sans conflit', () => {
    const { result } = renderHook(() => useFreeTimer());
    act(() => { result.current.start(60); });
    act(() => { jest.advanceTimersByTime(2000); });
    act(() => { result.current.start(30); });
    // Nouveau timer de 30s, pas 58s (ancien)
    expect(result.current.remaining).toBe(30);
    expect(result.current.isRunning).toBe(true);
  });

  it('déclenche les haptics au démarrage', () => {
    const { result } = renderHook(() => useFreeTimer());
    act(() => { result.current.start(30); });
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
  });

  it('déclenche les haptics de succès à l\'expiration naturelle', async () => {
    const { result } = renderHook(() => useFreeTimer());
    act(() => { result.current.start(2); });
    await act(async () => { jest.advanceTimersByTime(2000); });
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
  });

  it('est indépendant du RestTimer (pas de store partagé)', () => {
    const { result: timer1 } = renderHook(() => useFreeTimer());
    const { result: timer2 } = renderHook(() => useFreeTimer());
    act(() => { timer1.current.start(60); });
    // timer2 n'est pas démarré → doit rester à 0
    expect(timer2.current.isRunning).toBe(false);
    expect(timer2.current.remaining).toBe(0);
  });
});
