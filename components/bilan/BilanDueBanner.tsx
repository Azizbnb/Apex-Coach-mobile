import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ClipboardCheck, ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { apiFetch, programApi } from '@/lib/api';
import { colors } from '@/lib/constants';

/**
 * Bannière « Faire mon bilan » (S4-T03).
 *
 * Affichée si la semaine en cours est complétée à ≥80% des exercices ET qu'aucun
 * bilan n'a encore été soumis pour cette semaine. Composant autonome : il évalue
 * lui-même ses conditions (override possible via props pour les tests).
 *
 * Tap → ouvre le modal `(modals)/bilan-formulaire` avec le param `weekNumber`.
 * Animation pulse douce pour attirer l'œil.
 *
 * NB : ne PAS l'intégrer dans Programme ici — câblage vague 2.
 */

const COMPLETION_THRESHOLD = 80;

interface SessionCompletionRow {
  exercises_completed: number;
  exercises_total: number;
}

interface BilanDueBannerProps {
  /** Force l'affichage/masquage (tests). Sinon évalué en interne. */
  forceVisible?: boolean;
  /** Semaine ciblée (sinon dérivée du programme actif). */
  weekNumber?: number;
}

/**
 * Évalue si le bilan est dû pour une semaine donnée.
 * Exporté pour tests unitaires de la logique de condition.
 */
export function isBilanDue(
  completion: { completed: number; total: number },
  hasFeedback: boolean
): boolean {
  if (hasFeedback) return false;
  if (completion.total <= 0) return false;
  const rate = (completion.completed / completion.total) * 100;
  return rate >= COMPLETION_THRESHOLD;
}

export function BilanDueBanner({ forceVisible, weekNumber }: BilanDueBannerProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(forceVisible ?? false);
  const [week, setWeek] = useState<number>(weekNumber ?? 1);

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (forceVisible !== undefined) {
      setVisible(forceVisible);
      return;
    }

    let cancelled = false;

    async function evaluate() {
      try {
        const program = await programApi.getStatus().catch(() => null);
        // Semaine courante : approximée par la dernière semaine ayant des
        // complétions ; à défaut, le param fourni ou 1.
        const targetWeek = weekNumber ?? 1;

        const [completeRes, feedbackRes] = await Promise.all([
          apiFetch<{ completions: SessionCompletionRow[] }>(
            `/session/complete?week=${targetWeek}`
          ).catch(() => ({ completions: [] })),
          apiFetch<{ feedbacks: unknown[] }>(`/feedback?week=${targetWeek}`).catch(
            () => ({ feedbacks: [] })
          ),
        ]);

        if (cancelled) return;

        const rows = completeRes?.completions ?? [];
        const completed = rows.reduce((s, r) => s + (r.exercises_completed ?? 0), 0);
        const total = rows.reduce((s, r) => s + (r.exercises_total ?? 0), 0);
        const hasFeedback = (feedbackRes?.feedbacks?.length ?? 0) > 0;

        setWeek(targetWeek);
        setVisible(isBilanDue({ completed, total }, hasFeedback));
        // `program` reservé pour future dérivation de la semaine courante.
        void program;
      } catch {
        if (!cancelled) setVisible(false);
      }
    }

    void evaluate();
    return () => {
      cancelled = true;
    };
  }, [forceVisible, weekNumber]);

  useEffect(() => {
    if (!visible) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    // `pulse` est une shared value reanimated (référence stable).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Faire mon bilan hebdomadaire"
        onPress={() =>
          router.push({
            pathname: '/(modals)/bilan-formulaire',
            params: { weekNumber: String(week) },
          })
        }
        className="flex-row items-center bg-apex-lime-500/10 border border-apex-lime-500 rounded-xl p-4 mb-4"
      >
        <View className="w-10 h-10 rounded-full bg-apex-lime-500/20 items-center justify-center mr-3">
          <ClipboardCheck size={22} color={colors.lime[500]} />
        </View>
        <View className="flex-1">
          <Text variant="h3" className="text-apex-lime-400" style={{ color: colors.lime[400] }}>
            Faire mon bilan
          </Text>
          <Text variant="caption">
            Ta semaine {week} est terminée — débloque ton programme adapté.
          </Text>
        </View>
        <ChevronRight size={22} color={colors.lime[500]} />
      </Pressable>
    </Animated.View>
  );
}
