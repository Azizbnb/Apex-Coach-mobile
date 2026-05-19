import { View, Text } from 'react-native';
import { Moon } from 'lucide-react-native';
import { colors } from '@/lib/constants';

const NIVEAU_LABELS: Record<string, string> = {
  strict: 'Strict',
  moderate: 'Modéré',
  light: 'Souple',
};

const NIVEAU_DESCRIPTIONS: Record<string, string> = {
  strict: 'Programme adapté pour jeûne strict (Ramadan, etc.)',
  moderate: 'Programme allégé pour jeûne modéré',
  light: 'Programme légèrement adapté',
};

interface FastingBannerProps {
  fastingLevel?: 'strict' | 'moderate' | 'light' | null;
  fastingEndDate?: string | null;
  className?: string;
}

function joursRestants(endDate: string): number | null {
  const fin = new Date(endDate);
  const now = new Date();
  const ms = fin.getTime() - now.getTime();
  if (ms <= 0) return null;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function FastingBanner({ fastingLevel, fastingEndDate, className = '' }: FastingBannerProps) {
  const niveau = fastingLevel ?? 'moderate';
  const jours = fastingEndDate ? joursRestants(fastingEndDate) : null;

  return (
    <View
      className={`bg-apex-black-800 border border-amber-600/50 rounded-2xl p-4 flex-row items-start gap-3 ${className}`}
      accessibilityRole="alert"
      accessibilityLabel="Mode jeûne actif"
    >
      <Moon size={20} color={colors.warning} className="mt-0.5 shrink-0" />
      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-1">
          <Text className="text-amber-400 font-semibold text-sm">
            Mode jeûne · {NIVEAU_LABELS[niveau]}
          </Text>
        </View>
        <Text className="text-apex-black-400 text-sm leading-5">
          {NIVEAU_DESCRIPTIONS[niveau]}
        </Text>
        {jours !== null && (
          <Text className="text-amber-400/70 text-xs mt-1">
            {jours} jour{jours > 1 ? 's' : ''} restant{jours > 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </View>
  );
}
