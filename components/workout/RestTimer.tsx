import { useEffect, useRef, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/constants';
import { useWorkoutStore } from '@/stores/workout';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 200;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface RestTimerProps {
  /** Durée de repos en secondes */
  duration: number;
  onFinish: () => void;
  onSkip?: () => void;
  className?: string;
}

export function RestTimer({ duration, onFinish, onSkip, className = '' }: RestTimerProps) {
  const timer = useWorkoutStore((s) => s.timer);
  const setTimer = useWorkoutStore((s) => s.setTimer);
  const tickTimer = useWorkoutStore((s) => s.tickTimer);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFinished = useRef(false);

  const animatedOffset = useSharedValue(0);
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: animatedOffset.value,
  }));

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    hasFinished.current = false;
    setTimer(duration);
    animatedOffset.value = withTiming(CIRCUMFERENCE, {
      duration: duration * 1000,
      easing: Easing.linear,
    });

    intervalRef.current = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => {
      stopInterval();
    };
  }, [duration, setTimer, tickTimer, animatedOffset, stopInterval]);

  useEffect(() => {
    if (timer <= 0 && !hasFinished.current) {
      hasFinished.current = true;
      stopInterval();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);
      onFinish();
    }
  }, [timer, onFinish, stopInterval]);

  const handleSkip = useCallback(() => {
    stopInterval();
    setTimer(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
    onSkip?.();
    onFinish();
  }, [stopInterval, setTimer, onSkip, onFinish]);

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const label = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <View className={`items-center gap-6 ${className}`}>
      <View
        accessibilityRole="timer"
        accessibilityLabel={`Repos : ${label}`}
        accessibilityValue={{ min: 0, max: duration, now: timer }}
      >
        <Svg
          width={SIZE}
          height={SIZE}
          style={{ transform: [{ rotate: '-90deg' }] }}
        >
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.black[700]}
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.lime[500]}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeLinecap="round"
            animatedProps={animatedProps}
          />
        </Svg>
        <View className="absolute inset-0 items-center justify-center">
          <Text variant="h1" className="text-white tabular-nums">
            {label}
          </Text>
          <Text variant="caption" className="text-apex-black-400 mt-1">
            Repos
          </Text>
        </View>
      </View>

      <Pressable
        onPress={handleSkip}
        accessibilityRole="button"
        accessibilityLabel="Passer le temps de repos"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="border border-apex-black-700 rounded-xl px-8 py-3 active:opacity-70"
      >
        <Text variant="label" className="text-apex-black-400">
          Passer
        </Text>
      </Pressable>
    </View>
  );
}
