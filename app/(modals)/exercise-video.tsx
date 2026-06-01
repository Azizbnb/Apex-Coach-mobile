import { useEffect } from 'react';
import { View, Pressable, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { X } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { colors } from '@/lib/constants';
import { useExerciseVideo } from '@/hooks/useExerciseVideo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16; // ratio 16:9

export default function ExerciseVideoModal() {
  const { exerciseName, videoUrl: rawVideoUrl } = useLocalSearchParams<{
    exerciseName: string;
    videoUrl?: string;
  }>();

  const { videoUrl, loading, error } = useExerciseVideo(exerciseName, rawVideoUrl);

  const player = useVideoPlayer(videoUrl ?? '', (p) => {
    p.loop = false;
  });

  // Pause quand on quitte le modal
  useEffect(() => {
    return () => { player.pause(); };
  }, [player]);

  const handleClose = () => router.back();

  return (
    <View className="flex-1 bg-apex-black-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4">
        <Text variant="h3" className="text-white flex-1 mr-4" numberOfLines={1}>
          {exerciseName ?? 'Démo exercice'}
        </Text>
        <Pressable
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Fermer la démo"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="p-2 rounded-full bg-apex-black-800 active:opacity-70"
        >
          <X size={20} color={colors.black[400]} />
        </Pressable>
      </View>

      {/* Zone vidéo */}
      <View
        style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT }}
        className="bg-black"
      >
        {loading && (
          <View className="flex-1 items-center justify-center">
            <LoadingSpinner message="Chargement de la vidéo…" />
          </View>
        )}

        {!loading && (error || !videoUrl) && (
          <View className="flex-1 items-center justify-center px-8">
            <Text variant="body" className="text-apex-black-400 text-center mb-2">
              Démo bientôt disponible
            </Text>
            <Text variant="caption" className="text-apex-black-400 text-center">
              La vidéo pour cet exercice n'est pas encore disponible.
            </Text>
          </View>
        )}

        {!loading && videoUrl && !error && (
          <VideoView
            player={player}
            style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT }}
            contentFit="contain"
            nativeControls
            allowsFullscreen
          />
        )}
      </View>

      {/* Corps informatif sous la vidéo */}
      <View className="flex-1 px-4 pt-6">
        <Text variant="label" className="text-apex-black-400 uppercase tracking-wider mb-3">
          Conseils d'exécution
        </Text>
        <Text variant="body" className="text-white leading-relaxed">
          Exécutez le mouvement de façon contrôlée, en maintenant la tension musculaire
          tout au long de la répétition. Respirez régulièrement et évitez les à-coups.
        </Text>
      </View>

      {/* Bouton fermer en bas */}
      <View className="px-4 pb-8">
        <Button variant="secondary" onPress={handleClose}>
          Fermer
        </Button>
      </View>
    </View>
  );
}
