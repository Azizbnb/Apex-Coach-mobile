import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, ClipboardCheck } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { colors } from '@/lib/constants';

interface OverviewProps {
  /** Semaine en cours (déjà calculée via progressive unlock). */
  currentWeek: number;
  /** True si le bilan de la semaine en cours a déjà été soumis. */
  bilanDone: boolean;
}

/**
 * Section « Overview » du Tab Bilan (S4-T04).
 *
 * Affiche la semaine en cours et un CTA :
 *   - bilan dû  → bouton « Faire mon bilan » qui ouvre le modal `bilan-formulaire`
 *   - bilan fait → état « Bilan complété ✓ » (lecture seule)
 *
 * Le calcul « dû ou non » est piloté par le parent (props) pour rester testable.
 */
export function Overview({ currentWeek, bilanDone }: OverviewProps) {
  const router = useRouter();

  return (
    <Card className="p-5 mb-4">
      <Text variant="label" className="mb-1">
        Cette semaine
      </Text>
      <Text variant="h2" className="mb-4">
        Semaine {currentWeek}
      </Text>

      {bilanDone ? (
        <View
          className="flex-row items-center bg-apex-success/10 border border-apex-success/30 rounded-xl p-4"
          accessibilityRole="text"
          accessibilityLabel="Bilan de la semaine complété"
        >
          <CheckCircle2 size={22} color={colors.success} />
          <Text className="text-apex-success font-semibold ml-3">
            Bilan complété
          </Text>
        </View>
      ) : (
        <>
          <View className="flex-row items-center mb-4">
            <ClipboardCheck size={20} color={colors.lime[500]} />
            <Text variant="body" className="ml-2 flex-1">
              Ton bilan hebdomadaire est prêt. Remplis-le pour débloquer ton
              programme adapté.
            </Text>
          </View>
          <Button
            variant="primary"
            accessibilityLabel="Faire mon bilan hebdomadaire"
            onPress={() =>
              router.push({
                pathname: '/(modals)/bilan-formulaire',
                params: { weekNumber: String(currentWeek) },
              })
            }
          >
            Faire mon bilan
          </Button>
        </>
      )}
    </Card>
  );
}
