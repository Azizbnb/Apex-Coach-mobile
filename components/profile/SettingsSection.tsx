import type { ReactNode } from 'react';
import { View, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/constants';

/**
 * Section de réglages (S4-T06) — titre + liste de lignes.
 *
 * `SettingsRow` : ligne cliquable (icône + libellé + chevron) qui ouvre un modal
 * ou déclenche une action. Le contenu monté en place (jeûne, mot de passe, avis)
 * passe par `children` directement dans la section.
 */

interface SettingsSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({ title, children, className = '' }: SettingsSectionProps) {
  return (
    <View className={className}>
      {title ? (
        <Text className="text-apex-black-400 text-sm font-medium mb-3">{title}</Text>
      ) : null}
      <View className="gap-3">{children}</View>
    </View>
  );
}

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  /** Texte secondaire (ex. statut). */
  hint?: string;
  onPress: () => void;
  /** Variante destructive (texte rouge). */
  destructive?: boolean;
}

export function SettingsRow({
  icon: Icon,
  label,
  hint,
  onPress,
  destructive = false,
}: SettingsRowProps) {
  const iconColor = destructive ? colors.error : colors.black[400];
  const labelClass = destructive ? 'text-apex-error' : 'text-white';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700 flex-row items-center justify-between"
    >
      <View className="flex-row items-center flex-1">
        <Icon size={20} color={iconColor} />
        <Text className={`ml-3 font-medium ${labelClass}`}>{label}</Text>
      </View>
      <View className="flex-row items-center">
        {hint ? (
          <Text className="text-apex-black-400 text-sm mr-2">{hint}</Text>
        ) : null}
        <ChevronRight size={20} color={colors.black[400]} />
      </View>
    </Pressable>
  );
}
