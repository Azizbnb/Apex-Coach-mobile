import { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { SafeView } from '@/components/ui/SafeView';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ChangeObjectiveForm } from '@/components/settings/ChangeObjectiveForm';
import { AdaptationProgress } from '@/components/bilan/AdaptationProgress';
import { usePollProgramReady } from '@/hooks/usePollProgramReady';
import { useSubscription } from '@/hooks/useSubscription';
import { useProgramStore } from '@/stores/program';
import { supabase } from '@/lib/supabase/client';
import { colors } from '@/lib/constants';
import type { ChangeObjectiveResult } from '@/lib/api';

/**
 * Modal "Changer d'objectif" (S4-T07).
 *
 * Flux : chargement de l'objectif actuel → ChangeObjectiveForm (warning / select /
 * confirm) → POST change-objective → AdaptationProgress (polling du nouveau
 * programme) → retour Programme.
 */

interface Step2Data {
  primaryObjective?: string;
}

export default function ChangeObjectiveModal() {
  const { hasNutrition } = useSubscription();
  const refetchProgram = useProgramStore((s) => s.fetch);

  const [currentObjective, setCurrentObjective] = useState<string | null>(null);
  const [loadingObjective, setLoadingObjective] = useState(true);
  const [result, setResult] = useState<ChangeObjectiveResult | null>(null);

  const { status, retry } = usePollProgramReady({
    programId: result?.newProgramId ?? null,
    enabled: !!result,
  });

  // Charge l'objectif actuel depuis le questionnaire (lecture RLS-protégée).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setLoadingObjective(false);
        return;
      }
      const { data } = await supabase
        .from('questionnaire_responses')
        .select('step_2_data')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      const step2 = (data?.step_2_data ?? {}) as Step2Data;
      setCurrentObjective(step2.primaryObjective ?? '');
      setLoadingObjective(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/programme');
  };

  const onAdaptationComplete = () => {
    void refetchProgram();
    router.replace('/(tabs)/programme');
  };

  return (
    <SafeView>
      {!result && (
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          className="self-end p-4"
        >
          <X size={24} color={colors.black[400]} />
        </Pressable>
      )}

      {result ? (
        <AdaptationProgress
          status={status}
          isPro={hasNutrition}
          onComplete={onAdaptationComplete}
          onRetry={retry}
        />
      ) : loadingObjective ? (
        <LoadingSpinner message="Chargement…" />
      ) : (
        <View className="flex-1">
          <ChangeObjectiveForm
            currentObjective={currentObjective ?? ''}
            onSubmitted={setResult}
            onCancel={close}
          />
        </View>
      )}
    </SafeView>
  );
}
