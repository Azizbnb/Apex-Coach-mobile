import { View, ActivityIndicator, Text } from 'react-native';

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
      <ActivityIndicator size={size} color="#84CC16" />
      {message && (
        <Text className="text-apex-black-400 mt-4 text-sm">{message}</Text>
      )}
    </View>
  );
}
