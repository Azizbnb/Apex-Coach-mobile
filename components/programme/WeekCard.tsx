import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, ChevronRight, Dumbbell } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/lib/constants';

interface WeekCardProps {
  weekNumber: number;
  sessionCount: number;
  progressPercent: number;
  isUnlocked: boolean;
  unlockDate?: Date;
  daysUntilUnlock?: number | null;
  className?: string;
}

function formatUnlockDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

export function WeekCard({
  weekNumber,
  sessionCount,
  progressPercent,
  isUnlocked,
  unlockDate,
  daysUntilUnlock,
  className = '',
}: WeekCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (!isUnlocked) return;
    router.push(`/(tabs)/programme/${weekNumber}` as never);
  };

  const unlockLabel = unlockDate
    ? daysUntilUnlock === 1
      ? 'Débloquée demain'
      : `Disponible dès le ${formatUnlockDate(unlockDate)}`
    : 'Bientôt disponible';

  return (
    <Pressable
      onPress={handlePress}
      disabled={!isUnlocked}
      accessibilityRole="button"
      accessibilityLabel={
        isUnlocked
          ? `Semaine ${weekNumber}, ${sessionCount} séance${sessionCount > 1 ? 's' : ''}, ${progressPercent}% complété`
          : `Semaine ${weekNumber} verrouillée. ${unlockLabel}`
      }
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      className={`
        bg-apex-black-800 rounded-2xl p-4 border
        ${isUnlocked ? 'border-apex-black-700 active:opacity-80' : 'border-apex-black-700 opacity-60'}
        ${className}
      `}
    >
      {/* En-tête : numéro de semaine + indicateur */}
      <View className="flex-row items-center justify-between mb-3">
        <Text variant="h3" className="text-white">
          Semaine {weekNumber}
        </Text>
        {isUnlocked ? (
          <ChevronRight size={20} color={colors.lime[500]} />
        ) : (
          <Lock size={18} color={colors.black[400]} />
        )}
      </View>

      {/* Séances */}
      <View className="flex-row items-center gap-2 mb-3">
        <Dumbbell size={14} color={colors.black[400]} />
        <Text variant="caption" className="text-apex-black-400">
          {sessionCount} séance{sessionCount > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Progression ou message de verrouillage */}
      {isUnlocked ? (
        <View className="gap-1">
          <Text variant="caption" className="text-apex-black-400 text-right">
            {progressPercent}%
          </Text>
          <ProgressBar progress={progressPercent / 100} />
        </View>
      ) : (
        <Text variant="caption" className="text-apex-black-400">
          {unlockLabel}
        </Text>
      )}
    </Pressable>
  );
}
