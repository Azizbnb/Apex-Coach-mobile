import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  type TextInputProps,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors } from '@/lib/constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export function Input({
  label,
  error,
  secureTextEntry,
  className = '',
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry !== undefined;
  const borderColor = error
    ? 'border-apex-error'
    : focused
      ? 'border-apex-lime-500'
      : 'border-apex-black-600';

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-apex-black-400 text-sm font-medium mb-1.5">
          {label}
        </Text>
      )}
      <View className="relative">
        <TextInput
          className={`
            bg-apex-black-800 text-white text-base
            h-12 px-4 rounded-xl border
            ${borderColor}
            ${isPassword ? 'pr-12' : ''}
          `}
          placeholderTextColor={colors.black[500]}
          selectionColor={colors.lime[500]}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3"
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.black[400]} />
            ) : (
              <Eye size={20} color={colors.black[400]} />
            )}
          </Pressable>
        )}
      </View>
      {error && (
        <Text className="text-apex-error text-xs mt-1">{error}</Text>
      )}
    </View>
  );
}
