import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native';
import { colors } from '@/lib/constants';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'default' | 'lg';

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: string;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-apex-lime-500 active:bg-apex-lime-600',
  secondary: 'bg-transparent border-2 border-apex-lime-500 active:bg-apex-lime-500/10',
  ghost: 'bg-transparent active:bg-apex-black-800',
  destructive: 'bg-apex-error active:bg-red-600',
};

const variantTextStyles: Record<ButtonVariant, string> = {
  primary: 'text-apex-black-900 font-bold',
  secondary: 'text-apex-lime-500 font-semibold',
  ghost: 'text-white font-medium',
  destructive: 'text-white font-semibold',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 rounded-lg',
  default: 'h-12 px-6 rounded-xl',
  lg: 'h-14 px-8 rounded-xl',
};

const sizeTextStyles: Record<ButtonSize, string> = {
  sm: 'text-sm',
  default: 'text-base',
  lg: 'text-lg',
};

export function Button({
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      className={`
        flex-row items-center justify-center
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isDisabled ? 'opacity-50' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.black[900] : colors.lime[500]}
        />
      ) : (
        <Text className={`${variantTextStyles[variant]} ${sizeTextStyles[size]}`}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
