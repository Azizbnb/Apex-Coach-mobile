import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 160;
const CENTER = SIZE / 2;
const STROKE = 11;

// Glucides (externe) → Protéines (milieu) → Lipides (interne)
const RING_CONFIGS = [
  { color: '#60A5FA', radius: 62 }, // glucides
  { color: '#84CC16', radius: 48 }, // protéines
  { color: '#FBBF24', radius: 34 }, // lipides
] as const;

function AnimatedRing({
  radius,
  color,
  ratio,
}: {
  radius: number;
  color: string;
  ratio: number;
}) {
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Math.min(Math.max(ratio, 0), 1), {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [ratio]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <>
      <Circle
        cx={CENTER}
        cy={CENTER}
        r={radius}
        stroke="#1F2937"
        strokeWidth={STROKE}
        fill="none"
        strokeLinecap="round"
      />
      <AnimatedCircle
        cx={CENTER}
        cy={CENTER}
        r={radius}
        stroke={color}
        strokeWidth={STROKE}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={String(circumference)}
        animatedProps={animatedProps}
        rotation="-90"
        origin={`${CENTER},${CENTER}`}
      />
    </>
  );
}

interface MacroRingsChartProps {
  proteinesRatio: number;
  glucidesRatio: number;
  lipidesRatio: number;
  calories: number;
  targetCalories: number;
}

export function MacroRingsChart({
  proteinesRatio,
  glucidesRatio,
  lipidesRatio,
  calories,
  targetCalories,
}: MacroRingsChartProps) {
  const ratios = [glucidesRatio, proteinesRatio, lipidesRatio];

  return (
    <View style={{ width: SIZE, height: SIZE }} className="items-center justify-center">
      <Svg
        width={SIZE}
        height={SIZE}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {RING_CONFIGS.map(({ color, radius }, i) => (
          <AnimatedRing key={color} radius={radius} color={color} ratio={ratios[i]} />
        ))}
      </Svg>
      <View className="items-center">
        <Text className="text-white font-bold text-xl" testID="calories-value">
          {calories}
        </Text>
        <Text className="text-apex-black-400 text-xs" testID="target-calories">
          {'/ '}{targetCalories}{' kcal'}
        </Text>
      </View>
    </View>
  );
}
