import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/constants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  /** Progression de 0 à 1 (ex : 0.75 = 75%) */
  progress: number;
  size?: number;
  strokeWidth?: number;
  /** Texte optionnel sous le pourcentage */
  label?: string;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  label,
  className = '',
}: ProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const animatedOffset = useSharedValue(circumference * (1 - clamped));

  useEffect(() => {
    const target = circumference * (1 - Math.min(1, Math.max(0, progress)));
    animatedOffset.value = withTiming(target, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, circumference, animatedOffset]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: animatedOffset.value,
  }));

  const percentage = Math.round(clamped * 100);

  return (
    <View
      className={`items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      accessibilityRole="progressbar"
      accessibilityLabel={`Progression : ${percentage}%`}
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
    >
      {/* Rotation -90° pour démarrer l'arc en haut */}
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.black[700]}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.lime[500]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round"
          animatedProps={animatedProps}
        />
      </Svg>
      <View className="absolute items-center justify-center">
        <Text variant="label" className="text-white font-bold">
          {percentage}%
        </Text>
        {label ? (
          <Text variant="caption" className="text-apex-black-400 mt-0.5">
            {label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
