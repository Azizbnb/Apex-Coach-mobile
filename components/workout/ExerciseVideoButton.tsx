import { Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Play } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/constants';

interface ExerciseVideoButtonProps {
  exerciseName: string;
  /** URL vidéo directe (si déjà connue). Si absent, le modal la fetchera lui-même. */
  videoUrl?: string;
  loading?: boolean;
}

/**
 * Bouton « Démo » qui ouvre le modal `exercise-video` en plein écran.
 * Passe le nom de l'exercice (et l'URL si disponible) en paramètre de route.
 */
export function ExerciseVideoButton({
  exerciseName,
  videoUrl,
  loading = false,
}: ExerciseVideoButtonProps) {
  const handlePress = () => {
    router.push({
      pathname: '/(modals)/exercise-video',
      params: {
        exerciseName,
        ...(videoUrl ? { videoUrl } : {}),
      },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Voir la démo de ${exerciseName}`}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      className="flex-row items-center gap-2 bg-apex-lime-500/15 border border-apex-lime-500/30 rounded-full px-4 py-2 active:opacity-70"
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.lime[500]} />
      ) : (
        <Play size={14} color={colors.lime[500]} fill={colors.lime[500]} />
      )}
      <Text variant="caption" className="text-apex-lime-500 font-semibold">
        Démo
      </Text>
    </Pressable>
  );
}
