import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <View
      className={`bg-apex-black-800 rounded-xl p-4 border border-apex-black-700 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
