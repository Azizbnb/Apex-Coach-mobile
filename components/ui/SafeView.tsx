import { SafeAreaView } from 'react-native-safe-area-context';
import type { ViewProps } from 'react-native';

interface SafeViewProps extends ViewProps {
  className?: string;
}

export function SafeView({ className = '', children, ...props }: SafeViewProps) {
  return (
    <SafeAreaView
      className={`flex-1 bg-apex-black-900 ${className}`}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
}
