import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Text } from '@/components/ui/Text';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/lib/constants';
import { formatStopwatch } from '@/lib/workout/format-duration';

type TimerStatus = 'idle' | 'running' | 'paused';

interface TargetPreset {
  label: string;
  /** Durée cible en secondes, `null` = mode libre (sans objectif) */
  seconds: number | null;
}

const TARGET_PRESETS: readonly TargetPreset[] = [
  { label: 'Libre', seconds: null },
  { label: '30s', seconds: 30 },
  { label: '1 min', seconds: 60 },
  { label: '2 min', seconds: 120 },
  { label: '5 min', seconds: 300 },
];

interface FreeTimerProps {
  className?: string;
}

/**
 * Minuteur libre (chronomètre ascendant) utilisable pendant la séance,
 * indépendamment du flow d'exercices guidés et du RestTimer.
 *
 * - Démarrer / Pause / Reprendre / Réinitialiser
 * - Affichage MM:SS (ou HH:MM:SS au-delà d'une heure)
 * - Durée cible optionnelle : vibration de succès quand l'objectif est atteint
 */
export function FreeTimer({ className = '' }: FreeTimerProps) {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [target, setTarget] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reachedTarget = useRef(false);

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Tick une fois par seconde uniquement quand le minuteur tourne.
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    }
    return stopInterval;
  }, [status, stopInterval]);

  // Vibration de succès une seule fois lorsque la cible est atteinte.
  useEffect(() => {
    if (
      target !== null &&
      !reachedTarget.current &&
      elapsed >= target &&
      elapsed > 0
    ) {
      reachedTarget.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => null
      );
    }
  }, [elapsed, target]);

  const handleToggle = useCallback(() => {
    setStatus((s) => (s === 'running' ? 'paused' : 'running'));
  }, []);

  const handleReset = useCallback(() => {
    stopInterval();
    setStatus('idle');
    setElapsed(0);
    reachedTarget.current = false;
  }, [stopInterval]);

  const handleSelectTarget = useCallback((seconds: number | null) => {
    setTarget(seconds);
    reachedTarget.current = false;
  }, []);

  const isRunning = status === 'running';
  const canReset = status !== 'idle' || elapsed > 0;
  const targetReached = target !== null && elapsed >= target && elapsed > 0;
  const progress = target !== null ? Math.min(elapsed / target, 1) : 0;
  const label = formatStopwatch(elapsed);

  return (
    <View className={`items-center gap-8 ${className}`}>
      {/* Affichage principal */}
      <View
        className="items-center gap-2"
        accessibilityRole="timer"
        accessibilityLabel={`Minuteur libre : ${label}`}
      >
        <Text variant="h1" className="text-white tabular-nums text-6xl">
          {label}
        </Text>
        {targetReached ? (
          <View className="flex-row items-center gap-1.5">
            <CheckCircle2 size={16} color={colors.success} />
            <Text variant="caption" className="text-apex-success">
              Objectif atteint
            </Text>
          </View>
        ) : (
          <Text variant="caption" className="text-apex-black-400">
            {target !== null
              ? `Objectif : ${formatStopwatch(target)}`
              : 'Chronomètre libre'}
          </Text>
        )}
      </View>

      {/* Barre de progression vers la cible */}
      {target !== null && (
        <View className="w-full px-2">
          <ProgressBar progress={progress} />
        </View>
      )}

      {/* Sélection de la durée cible */}
      <View className="flex-row flex-wrap items-center justify-center gap-2">
        {TARGET_PRESETS.map((preset) => {
          const active = target === preset.seconds;
          return (
            <Pressable
              key={preset.label}
              onPress={() => handleSelectTarget(preset.seconds)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Objectif ${preset.label}`}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              className={`rounded-full px-4 py-2 border ${
                active
                  ? 'bg-apex-lime-500/15 border-apex-lime-500'
                  : 'bg-transparent border-apex-black-700'
              }`}
            >
              <Text
                variant="caption"
                className={active ? 'text-apex-lime-500' : 'text-apex-black-400'}
              >
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Contrôles */}
      <View className="flex-row items-center gap-4">
        <Pressable
          onPress={handleReset}
          disabled={!canReset}
          accessibilityRole="button"
          accessibilityLabel="Réinitialiser le minuteur"
          accessibilityState={{ disabled: !canReset }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className={`w-14 h-14 rounded-full border border-apex-black-700 items-center justify-center ${
            canReset ? 'active:opacity-70' : 'opacity-30'
          }`}
        >
          <RotateCcw size={22} color={colors.black[400]} />
        </Pressable>

        <Pressable
          onPress={handleToggle}
          accessibilityRole="button"
          accessibilityLabel={isRunning ? 'Mettre en pause' : 'Démarrer le minuteur'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="w-20 h-20 rounded-full bg-apex-lime-500 active:bg-apex-lime-600 items-center justify-center"
        >
          {isRunning ? (
            <Pause size={32} color={colors.black[900]} fill={colors.black[900]} />
          ) : (
            <Play size={32} color={colors.black[900]} fill={colors.black[900]} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
