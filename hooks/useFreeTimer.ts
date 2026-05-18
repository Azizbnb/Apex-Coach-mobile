import { useState, useRef, useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';

export interface FreeTimerState {
  remaining: number;
  isRunning: boolean;
  start: (seconds: number) => void;
  stop: () => void;
}

/**
 * Gère un minuteur libre (countdown) indépendant du RestTimer.
 * Le timer tourne via setInterval et est nettoyé au démontage.
 */
export function useFreeTimer(): FreeTimerState {
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Détecte l'expiration naturelle du timer
  useEffect(() => {
    if (!isRunning || remaining > 0) return;
    clearTimer();
    setIsRunning(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
  }, [remaining, isRunning, clearTimer]);

  // Nettoyage au démontage du composant parent
  useEffect(() => () => clearTimer(), [clearTimer]);

  const start = useCallback(
    (seconds: number) => {
      clearTimer();
      setRemaining(seconds);
      setIsRunning(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    },
    [clearTimer]
  );

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setRemaining(0);
  }, [clearTimer]);

  return { remaining, isRunning, start, stop };
}
