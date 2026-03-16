import { View, Text } from 'react-native';

type BadgeVariant = 'default' | 'premium' | 'success' | 'warning' | 'error';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-apex-lime-500/20',
  premium: 'bg-amber-500/20',
  success: 'bg-apex-success/20',
  warning: 'bg-apex-warning/20',
  error: 'bg-apex-error/20',
};

const variantTextStyles: Record<BadgeVariant, string> = {
  default: 'text-apex-lime-500',
  premium: 'text-amber-400',
  success: 'text-apex-success',
  warning: 'text-apex-warning',
  error: 'text-apex-error',
};

export function Badge({ label, variant = 'default', className = '' }: BadgeProps) {
  return (
    <View
      className={`self-start px-3 py-1 rounded-full ${variantStyles[variant]} ${className}`}
    >
      <Text
        className={`text-xs font-semibold ${variantTextStyles[variant]}`}
      >
        {label}
      </Text>
    </View>
  );
}
