import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  className?: string;
}

const variantStyles: Record<TextVariant, string> = {
  h1: 'text-3xl font-bold text-white',
  h2: 'text-2xl font-bold text-white',
  h3: 'text-lg font-semibold text-white',
  body: 'text-base text-apex-black-300',
  caption: 'text-xs text-apex-black-400',
  label: 'text-sm font-medium text-apex-black-400',
};

export function ApexText({
  variant = 'body',
  className = '',
  children,
  ...props
}: TextProps) {
  return (
    <RNText className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </RNText>
  );
}
