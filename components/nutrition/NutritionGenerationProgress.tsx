import { View, ActivityIndicator } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/lib/constants';

interface NutritionGenerationProgressProps {
  failed: boolean;
  retrying: boolean;
  onRetry: () => void;
}

/**
 * État de génération du plan nutrition (mirror web NutritionGenerationProgress).
 * Deux modes : génération en cours (spinner) ou échec avec relance.
 */
export function NutritionGenerationProgress({
  failed,
  retrying,
  onRetry,
}: NutritionGenerationProgressProps) {
  if (failed) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <AlertTriangle size={48} color={colors.warning} />
        <Text variant="h3" className="text-center mt-4 mb-2">
          La génération a échoué
        </Text>
        <Text variant="body" className="text-center mb-6">
          Ton plan nutrition n’a pas pu être généré. Tu peux relancer la génération.
        </Text>
        <Button variant="primary" onPress={onRetry} loading={retrying}>
          Réessayer
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-6">
      <ActivityIndicator size="large" color={colors.lime[500]} />
      <Text variant="h3" className="text-center mt-4 mb-2">
        Ton plan nutrition se prépare…
      </Text>
      <Text variant="body" className="text-center">
        L’IA personnalise tes repas. Ça prend généralement une à deux minutes.
      </Text>
    </View>
  );
}
