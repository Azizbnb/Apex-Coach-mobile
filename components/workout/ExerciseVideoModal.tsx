import { View, Modal, Pressable, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { X, VideoOff } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { colors, API_URL } from '@/lib/constants';
import { useExerciseVideo } from '@/hooks/useExerciseVideo';
import { buildVideoHtml } from '@/lib/workout/video-html';
import type { ExerciseVideoData } from '@/types';

interface ExerciseVideoModalProps {
  visible: boolean;
  exerciseName: string;
  onClose: () => void;
}

/**
 * Modal de démonstration vidéo d'un exercice (MuscleWiki).
 * Mirror mobile de `components/entrainement/ExerciseVideoModal.tsx` (web) :
 * fetch paresseux par nom, états skeleton / erreur / non-trouvé / player.
 *
 * Le player utilise une WebView (iframe YouTube ou `<video>` proxy) — même
 * rendu que le web, sans dépendre de `expo-video`.
 */
export function ExerciseVideoModal({
  visible,
  exerciseName,
  onClose,
}: ExerciseVideoModalProps) {
  const { video, isLoading, error } = useExerciseVideo(
    visible ? exerciseName : null
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/70 justify-end">
        {/* Zone de tap pour fermer (au-dessus de la feuille) */}
        <Pressable
          className="flex-1"
          accessibilityLabel="Fermer la vidéo"
          onPress={onClose}
        />

        <View className="bg-apex-black-900 rounded-t-2xl border-t border-x border-apex-black-700 overflow-hidden">
          {/* En-tête */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-apex-black-700">
            <Text
              variant="body"
              className="text-white font-semibold flex-1 pr-3"
              numberOfLines={1}
            >
              {exerciseName}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fermer la vidéo"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="h-8 w-8 rounded-full items-center justify-center active:bg-apex-black-800"
            >
              <X size={18} color={colors.black[400]} />
            </Pressable>
          </View>

          {/* Corps */}
          <View className="p-4 pb-6">
            {isLoading && <VideoStateBox loading />}
            {!isLoading && error && (
              <VideoStateBox message="Erreur de chargement, réessaie dans quelques instants" />
            )}
            {!isLoading && !error && !video && (
              <VideoStateBox message="Vidéo non disponible pour cet exercice" />
            )}
            {!isLoading && !error && video && (
              <VideoPlayer video={video} exerciseName={exerciseName} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface VideoStateBoxProps {
  loading?: boolean;
  message?: string;
}

/** Conteneur 16:9 pour les états skeleton / erreur / non-trouvé. */
function VideoStateBox({ loading, message }: VideoStateBoxProps) {
  return (
    <View
      className="rounded-xl bg-apex-black-800 items-center justify-center gap-2"
      style={{ aspectRatio: 16 / 9 }}
    >
      {loading ? (
        <ActivityIndicator color={colors.lime[500]} />
      ) : (
        <>
          <VideoOff size={28} color={colors.black[400]} />
          <Text
            variant="caption"
            className="text-apex-black-400 text-center px-6"
          >
            {message}
          </Text>
        </>
      )}
    </View>
  );
}

function VideoPlayer({
  video,
  exerciseName,
}: {
  video: ExerciseVideoData;
  exerciseName: string;
}) {
  const html = buildVideoHtml(video, API_URL);

  return (
    <>
      <View
        className="rounded-xl overflow-hidden bg-black"
        style={{ aspectRatio: 16 / 9 }}
      >
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction
          style={{ backgroundColor: '#000' }}
          accessibilityLabel={`Démonstration vidéo de ${exerciseName}`}
        />
      </View>

      {video.muscles.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5 mt-3">
          {video.muscles.map((muscle) => (
            <View
              key={muscle}
              className="px-2 py-0.5 rounded-full bg-apex-lime-500/10 border border-apex-lime-500/20"
            >
              <Text variant="caption" className="text-apex-lime-500/80">
                {muscle}
              </Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
}
