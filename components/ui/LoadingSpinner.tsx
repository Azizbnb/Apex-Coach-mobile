import { View, ActivityIndicator, Text } from 'react-native';
import { colors } from '@/lib/constants';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  className?: string;
}

export function LoadingSpinner({
  message,
  size = 'large',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <View className={`flex-1 items-center justify-center bg-apex-black-900 ${className}`}>
      <ActivityIndicator size={size} color={colors.lime[500]} />
      {message && (
        <Text className="text-apex-black-400 mt-4 text-sm">{message}</Text>
      )}
    </View>
  );
}
