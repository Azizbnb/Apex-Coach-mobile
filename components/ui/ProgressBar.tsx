import { View } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0–1
  className?: string;
}

export function ProgressBar({ progress, className = '' }: ProgressBarProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <View className={`h-2 rounded-full bg-apex-black-700 overflow-hidden ${className}`}>
      <View
        className="h-full rounded-full bg-apex-lime-500"
        style={{ width: `${clampedProgress * 100}%` }}
      />
    </View>
  );
}
