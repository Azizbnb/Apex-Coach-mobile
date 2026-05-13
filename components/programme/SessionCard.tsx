import { Pressable, View } from 'react-native';
import { Clock, Dumbbell, ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/lib/constants';

export type SessionStatus = 'pending' | 'done' | 'skipped';

export interface SessionCardProps {
  title: string;
  day: string;
  durationMinutes: number;
  exerciseCount: number;
  status?: SessionStatus;
  onPress: () => void;
  className?: string;
}

const STATUS_BADGE: Record<
  SessionStatus,
  { label: string; variant: 'default' | 'success' | 'warning' }
> = {
  pending: { label: 'À faire', variant: 'default' },
  done: { label: 'Terminée', variant: 'success' },
  skipped: { label: 'Sautée', variant: 'warning' },
};

export function SessionCard({
  title,
  day,
  durationMinutes,
  exerciseCount,
  status = 'pending',
  onPress,
  className = '',
}: SessionCardProps) {
  const badge = STATUS_BADGE[status];
  const exerciseLabel = `${exerciseCount} exercice${exerciseCount > 1 ? 's' : ''}`;
  const accessLabel = `${title}, ${day}, ${durationMinutes} minutes, ${exerciseLabel}, ${badge.label}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessLabel}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      className={`bg-apex-black-800 rounded-xl p-4 border border-apex-black-700 active:opacity-75 ${className}`}
    >
      {/* Titre + badge état */}
      <View className="flex-row items-start justify-between mb-2">
        <Text variant="h3" className="text-white flex-1 mr-3">
          {title}
        </Text>
        <Badge label={badge.label} variant={badge.variant} />
      </View>

      {/* Jour de la séance */}
      <Text variant="label" className="text-apex-black-400 mb-3">
        {day}
      </Text>

      {/* Métadonnées : durée + exercices + chevron */}
      <View className="flex-row items-center">
        <View className="flex-row items-center gap-1 mr-4">
          <Clock size={14} color={colors.black[400]} />
          <Text variant="caption">{durationMinutes} min</Text>
        </View>
        <View className="flex-row items-center gap-1 flex-1">
          <Dumbbell size={14} color={colors.black[400]} />
          <Text variant="caption">{exerciseLabel}</Text>
        </View>
        <ChevronRight size={18} color={colors.black[400]} />
      </View>
    </Pressable>
  );
}
