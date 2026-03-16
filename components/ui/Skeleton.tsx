import { useEffect, useRef } from 'react';
import { Animated, type DimensionValue, type ViewProps } from 'react-native';

interface SkeletonProps extends ViewProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`bg-apex-black-700 ${className}`}
      style={[{ width, height, borderRadius, opacity }, style]}
      {...props}
    />
  );
}
