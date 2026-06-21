import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { SafeView } from '@/components/ui/SafeView';
import { Text } from '@/components/ui/Text';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  BilanForm,
  type BilanCompletion,
  type BilanSkipSummary,
} from '@/components/bilan/BilanForm';
import { AdaptationProgress } from '@/components/bilan/AdaptationProgress';
import { usePollAdaptation } from '@/hooks/usePollAdaptation';
import { useSubscription } from '@/hooks/useSubscription';
import { apiFetch, programApi, profileApi, ApiError } from '@/lib/api';
import { colors } from '@/lib/constants';
import type { BilanSubmitBody } from '@/lib/validations/bilan';

// ==========================================
// Types des réponses session (mirror routes web)
// ==========================================

interface SessionCompletionRow {
  week_number: number;
  session_number: number;
  exercises_completed: number;
  exercises_total: number;
}

interface SkipSummaryRow {
  exerciseName: string;
  count: number;
  sessions: number[];
  muscles: string[];
}

type Phase = 'loading' | 'form' | 'adapting';

/**
 * Modal plein écran du bilan hebdomadaire (mirror `/bilan/formulaire`).
 *
 * Flux :
 *   1. mount → charge le contexte (`GET /api/session/complete?week=N`
 *      + `GET /api/session/skips?week=N`) + programme + profil (jeûne).
 *   2. submit → `POST /api/feedback` → toast succès → `POST /api/program/adapt`
 *      → bascule sur `AdaptationProgress` (polling via `usePollAdaptation`).
 *   3. adaptation terminée → ferme le modal + redirect Tab Programme.
 *
 * NB endpoints vérifiés contre le repo web réel (21/06/2026) :
 *   - feedback : `FeedbackSchema` (cf. lib/validations/bilan.ts).
 *   - adapt : body `{ week_number }`, réponse synchrone (pas de colonne
 *     `adaptation_status`). Le polling observe `program_feedback.suggestions_applied`.
 */
export default function BilanFormulaireModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ weekNumber?: string }>();
  const weekNumber = Math.max(1, parseInt(params.weekNumber ?? '1', 10) || 1);

  const { planId } = useSubscription();
  const isPro = planId === 'coaching_pro';

  const [phase, setPhase] = useState<Phase>('loading');
  const [submitting, setSubmitting] = useState(false);

  const [completion, setCompletion] = useState<BilanCompletion>({
    exercisesCompleted: 0,
    exercisesTotal: 0,
    rate: 0,
  });
  const [skips, setSkips] = useState<BilanSkipSummary[]>([]);
  const [programId, setProgramId] = useState<string | null>(null);
  const [isFastingActive, setIsFastingActive] = useState(false);
  const [fastingLevel, setFastingLevel] = useState<
    'strict' | 'moderate' | 'light' | null
  >(null);
  const [pollEnabled, setPollEnabled] = useState(false);

  const { status, retry } = usePollAdaptation({
    programId,
    weekNumber,
    enabled: pollEnabled,
  });

  // --- Chargement du contexte au mount ---
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [completeRes, skipsRes, program, profile] = await Promise.all([
          apiFetch<{ completions: SessionCompletionRow[] }>(
            `/session/complete?week=${weekNumber}`
          ).catch(() => ({ completions: [] })),
          apiFetch<{ summary: SkipSummaryRow[] }>(
            `/session/skips?week=${weekNumber}`
          ).catch(() => ({ summary: [] })),
          programApi.getCurrent().catch(() => null),
          profileApi.get().catch(() => null),
        ]);

        if (cancelled) return;

        const rows = completeRes?.completions ?? [];
        const exercisesCompleted = rows.reduce(
          (sum, r) => sum + (r.exercises_completed ?? 0),
          0
        );
        const exercisesTotal = rows.reduce(
          (sum, r) => sum + (r.exercises_total ?? 0),
          0
        );
        const rate =
          exercisesTotal > 0
            ? Math.round((exercisesCompleted / exercisesTotal) * 100)
            : 0;

        setCompletion({ exercisesCompleted, exercisesTotal, rate });
        setSkips(skipsRes?.summary ?? []);
        setProgramId(program?.id ?? null);
        setIsFastingActive(!!profile?.is_fasting_mode);
        setFastingLevel(profile?.fasting_level ?? null);
        setPhase('form');
      } catch {
        if (cancelled) return;
        setPhase('form');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [weekNumber]);

  const close = useCallback(() => {
    router.back();
  }, [router]);

  // --- Submit ---
  const handleSubmit = useCallback(
    async (body: BilanSubmitBody) => {
      setSubmitting(true);
      try {
        // 1. Enregistrer le bilan.
        await apiFetch('/feedback', {
          method: 'POST',
          body: JSON.stringify(body),
        });

        // 2. Si l'utilisateur arrête le jeûne → désactiver le mode (non-bloquant).
        if (isFastingActive && body.continue_fasting === false) {
          try {
            await apiFetch('/profile/fasting', {
              method: 'PATCH',
              body: JSON.stringify({
                is_fasting_mode: false,
                fasting_level: null,
                fasting_start_date: null,
                fasting_end_date: null,
                fasting_notes: null,
              }),
            });
          } catch {
            // Le bilan est déjà enregistré — on ignore.
          }
        }

        // 3. Déclencher l'adaptation IA (Coaching / Pro). Réponse synchrone côté
        //    serveur ; on bascule sur l'écran d'attente + polling de confirmation.
        setPhase('adapting');
        setPollEnabled(true);
        apiFetch('/program/adapt', {
          method: 'POST',
          body: JSON.stringify({ week_number: weekNumber }),
        }).catch(() => {
          // L'échec de l'appel n'interrompt pas le polling : le serveur peut
          // avoir appliqué l'adaptation malgré une coupure réseau. Le timeout
          // du hook prendra le relais si rien n'aboutit.
        });
      } catch (e) {
        const message =
          e instanceof ApiError ? e.message : 'Impossible d’envoyer ton bilan.';
        Alert.alert('Erreur', message);
        setSubmitting(false);
      }
    },
    [isFastingActive, weekNumber]
  );

  // --- Fin de l'adaptation → fermer + redirect Programme ---
  const handleAdaptationComplete = useCallback(() => {
    router.replace('/(tabs)/programme');
  }, [router]);

  return (
    <SafeView className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-apex-black-700">
        <Text variant="h3">Mon bilan</Text>
        {phase !== 'adapting' && (
          <Pressable onPress={close} hitSlop={8} accessibilityLabel="Fermer">
            <X size={24} color={colors.black[400]} />
          </Pressable>
        )}
      </View>

      {phase === 'loading' && (
        <LoadingSpinner message="Chargement de ta semaine…" />
      )}

      {phase === 'form' && (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          <BilanForm
            weekNumber={weekNumber}
            completion={completion}
            skippedExercises={skips}
            planType={planId}
            isFastingActive={isFastingActive}
            fastingLevel={fastingLevel}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        </ScrollView>
      )}

      {phase === 'adapting' && (
        <AdaptationProgress
          status={status}
          isPro={isPro}
          onComplete={handleAdaptationComplete}
          onRetry={retry}
        />
      )}
    </SafeView>
  );
}
