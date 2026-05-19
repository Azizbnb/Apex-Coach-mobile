import { View, Text } from 'react-native';
import { Lock } from 'lucide-react-native';
import { colors } from '@/lib/constants';

interface NextUnlockBannerProps {
  weekNumber: number;
  unlockDate: Date;
  className?: string;
}

function formatDateFR(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function calculeCountdown(date: Date): { jours: number; heures: number } {
  const ms = date.getTime() - Date.now();
  if (ms <= 0) return { jours: 0, heures: 0 };
  const heuresTotal = Math.floor(ms / (1000 * 60 * 60));
  return {
    jours: Math.floor(heuresTotal / 24),
    heures: heuresTotal % 24,
  };
}

function labelCountdown(jours: number, heures: number): string {
  if (jours > 0) {
    return `Dans ${jours} jour${jours > 1 ? 's' : ''}`;
  }
  if (heures > 0) {
    return `Dans ${heures} heure${heures > 1 ? 's' : ''}`;
  }
  return 'Bientôt disponible';
}

export function NextUnlockBanner({ weekNumber, unlockDate, className = '' }: NextUnlockBannerProps) {
  const { jours, heures } = calculeCountdown(unlockDate);

  return (
    <View
      className={`bg-apex-black-800 border border-apex-black-700 rounded-2xl p-4 flex-row items-start gap-3 ${className}`}
      accessibilityRole="text"
      accessibilityLabel={`Semaine ${weekNumber} disponible dans ${jours} jours`}
    >
      <Lock size={20} color={colors.lime[500]} className="mt-0.5 shrink-0" />
      <View className="flex-1">
        <Text className="text-white font-semibold text-sm mb-1">
          Semaine {weekNumber} · {labelCountdown(jours, heures)}
        </Text>
        <Text className="text-apex-black-400 text-sm">
          Disponible le {formatDateFR(unlockDate)}
        </Text>
      </View>
    </View>
  );
}
