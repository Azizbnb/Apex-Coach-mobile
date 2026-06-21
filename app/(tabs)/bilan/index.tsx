import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { ClipboardList } from 'lucide-react-native';

import { SafeView } from '@/components/ui/SafeView';
import { Text } from '@/components/ui/Text';
import { Skeleton } from '@/components/ui/Skeleton';
import { Overview } from '@/components/bilan/Overview';
import { History } from '@/components/bilan/History';
import { AnalyticsSection } from '@/components/bilan/AnalyticsSection';
import { useProgramStore } from '@/stores/program';
import { useSubscription } from '@/hooks/useSubscription';
import { feedbackApi } from '@/lib/api';
import { getProgressiveUnlockInfo } from '@/lib/subscription/progressive-unlock';
import { colors } from '@/lib/constants';
import type { ProgramFeedback } from '@/types';

function BilanSkeleton() {
  return (
    <View className="px-4 gap-4">
      <Skeleton height={160} borderRadius={16} />
      <Skeleton height={180} borderRadius={16} />
      <Skeleton height={220} borderRadius={16} />
    </View>
  );
}

/**
 * Tab Bilan consolidé (S4-T04).
 *
 * 3 sections dans un ScrollView (Skeleton + pull-to-refresh) :
 *   1. Overview   — semaine en cours + CTA « Faire mon bilan » / « Bilan complété »
 *   2. Historique — bilans précédents (déplier pour le détail)
 *   3. Analytics  — gated Pro + ≥4 bilans (sinon info / empty state)
 *
 * Mirror web : `app/(dashboard)/bilan/page.tsx` + `app/(dashboard)/analytics/page.tsx`.
 */
export default function BilanScreen() {
  const program = useProgramStore((s) => s.program);
  const fetchProgram = useProgramStore((s) => s.fetch);
  const { planId, hasNutrition } = useSubscription();

  const [feedbacks, setFeedbacks] = useState<ProgramFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const startDate = program?.start_date ?? program?.created_at ?? null;

  // Semaine en cours via le progressive unlock (fallback 1 si pas de date).
  const currentWeek = useMemo(() => {
    if (!startDate) return 1;
    const info = getProgressiveUnlockInfo(new Date(startDate));
    return Math.max(1, info.currentWeek);
  }, [startDate]);

  // Bilan de la semaine en cours déjà soumis ?
  const bilanDone = useMemo(
    () => feedbacks.some((f) => f.week_number === currentWeek),
    [feedbacks, currentWeek],
  );

  // Analytics réservé Coaching Pro (même gate que la nutrition).
  const isPro = hasNutrition || planId === 'coaching_pro';

  const loadFeedbacks = useCallback(async () => {
    const id = program?.id;
    if (!id) {
      setFeedbacks([]);
      return;
    }
    try {
      const rows = await feedbackApi.getForProgram(id);
      setFeedbacks(rows);
    } catch {
      // Échec silencieux : on garde l'écran fonctionnel (sections vides).
      setFeedbacks([]);
    }
  }, [program?.id]);

  // Chargement initial : programme puis bilans.
  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      if (!program) await fetchProgram();
      if (!cancelled) {
        await loadFeedbacks();
        if (!cancelled) setLoading(false);
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
    // program?.id pilote le rechargement des bilans une fois le programme prêt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProgram();
    await loadFeedbacks();
    setRefreshing(false);
  }, [fetchProgram, loadFeedbacks]);

  if (loading) {
    return (
      <SafeView>
        <View className="px-4 pt-4 pb-2">
          <Text variant="h1">Bilan</Text>
        </View>
        <BilanSkeleton />
      </SafeView>
    );
  }

  return (
    <SafeView>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.lime[500]}
          />
        }
      >
        <View className="px-4 pt-4 pb-8">
          <View className="flex-row items-center gap-2 mb-4">
            <ClipboardList size={26} color={colors.lime[500]} />
            <Text variant="h1">Bilan</Text>
          </View>

          <Overview currentWeek={currentWeek} bilanDone={bilanDone} />
          <History feedbacks={feedbacks} />
          <AnalyticsSection feedbacks={feedbacks} isPro={isPro} />
        </View>
      </ScrollView>
    </SafeView>
  );
}
