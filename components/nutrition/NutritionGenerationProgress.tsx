import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/lib/constants';

const MESSAGES_GENERATION = [
  'Génération de ton plan nutrition en cours…',
  'Analyse de tes préférences alimentaires…',
  'Calcul de tes macros personnalisées…',
  'Finalisation du plan en cours…',
];

const ROTATION_INTERVAL_MS = 2500;

interface NutritionGenerationProgressProps {
  status: 'generating' | 'failed';
  onRetry: () => void;
  retrying?: boolean;
}

export function NutritionGenerationProgress({
  status,
  onRetry,
  retrying = false,
}: NutritionGenerationProgressProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (status !== 'generating') return;
    const id = setInterval(
      () => setMsgIndex((i) => (i + 1) % MESSAGES_GENERATION.length),
      ROTATION_INTERVAL_MS
    );
    return () => clearInterval(id);
  }, [status]);

  if (status === 'failed') {
    return (
      <View
        testID="generation-failed"
        className="flex-1 items-center justify-center px-6"
      >
        <AlertCircle size={52} color={colors.error} />
        <Text variant="h2" className="text-center mt-5 mb-3">
          Échec de la génération
        </Text>
        <Text
          variant="body"
          className="text-apex-black-400 text-center mb-8"
        >
          Une erreur est survenue lors de la génération de ton plan nutrition.
          Réessaie ou contacte le support si le problème persiste.
        </Text>
        <Button
          variant="primary"
          onPress={onRetry}
          loading={retrying}
          className="w-full"
        >
          Réessayer
        </Button>
      </View>
    );
  }

  return (
    <View
      testID="generation-progress"
      className="flex-1 items-center justify-center px-6"
    >
      <ActivityIndicator
        size="large"
        color={colors.lime[500]}
        testID="generation-spinner"
      />
      <Text variant="h2" className="text-center mt-6 mb-3">
        Génération en cours
      </Text>
      <Text
        variant="body"
        className="text-apex-black-400 text-center"
        testID="generation-message"
      >
        {MESSAGES_GENERATION[msgIndex]}
      </Text>
      <Text variant="caption" className="text-apex-black-400 text-center mt-4">
        Cela peut prendre quelques instants…
      </Text>
    </View>
  );
}
