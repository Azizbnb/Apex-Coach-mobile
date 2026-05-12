import { Pressable, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Play, Clock, Dumbbell } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/constants';
import type { Exercise } from '@/types';

interface ExerciseCardProps {
  exercise: Exercise;
  /** URL vidéo de démonstration — affiche le bouton play si définie */
  videoUrl?: string;
  /** Variante compacte pour affichage en liste */
  compact?: boolean;
  /** Appelé au tap sur la carte — le parent navigue vers exercise-detail */
  onPress?: () => void;
  className?: string;
}

function formatRestTime(seconds: number): string {
  if (seconds >= 60) {
    return `${Math.round(seconds / 60)} min`;
  }
  return `${seconds} s`;
}

export function ExerciseCard({
  exercise,
  videoUrl,
  compact = false,
  onPress,
  className = '',
}: ExerciseCardProps) {
  const handlePlayPress = async () => {
    await WebBrowser.openBrowserAsync(videoUrl!);
  };

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${exercise.name}, ${exercise.sets} séries de ${exercise.reps} répétitions`}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        className={`flex-row items-center justify-between py-3 border-b border-apex-black-700 active:opacity-70 ${className}`}
      >
        <Text variant="body" className="text-white flex-1">
          {exercise.name}
        </Text>
        <Text variant="caption" className="text-apex-black-400">
          {exercise.sets} × {exercise.reps}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${exercise.name}, ${exercise.sets} séries de ${exercise.reps} répétitions, repos ${formatRestTime(exercise.rest_seconds)}`}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      className={`bg-apex-black-800 rounded-xl p-4 border border-apex-black-700 active:opacity-80 ${className}`}
    >
      {/* En-tête : nom de l'exercice + bouton play vidéo */}
      <View className="flex-row items-start justify-between gap-3">
        <Text variant="h3" className="text-white flex-1">
          {exercise.name}
        </Text>
        {videoUrl && (
          <Pressable
            onPress={handlePlayPress}
            accessibilityRole="link"
            accessibilityLabel={`Voir la vidéo de démonstration pour ${exercise.name}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="w-9 h-9 rounded-full bg-apex-lime-500/20 items-center justify-center"
          >
            <Play size={16} color={colors.lime[500]} fill={colors.lime[500]} />
          </Pressable>
        )}
      </View>

      {/* Métadonnées : sets × reps + temps de repos */}
      <View className="flex-row items-center gap-4 mt-3">
        <View className="flex-row items-center gap-1.5">
          <Dumbbell size={14} color={colors.black[400]} />
          <Text variant="caption" className="text-apex-black-400">
            {exercise.sets} × {exercise.reps}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Clock size={14} color={colors.black[400]} />
          <Text variant="caption" className="text-apex-black-400">
            Repos : {formatRestTime(exercise.rest_seconds)}
          </Text>
        </View>
      </View>

      {/* Notes de coaching (optionnelles) */}
      {exercise.notes && (
        <Text variant="caption" className="text-apex-black-400 mt-2 italic">
          {exercise.notes}
        </Text>
      )}
    </Pressable>
  );
}
