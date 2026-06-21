import { useMemo } from 'react';
import { View } from 'react-native';
import { Lock, BarChart3 } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { TrendCharts } from '@/components/bilan/TrendCharts';
import { WellnessRadar } from '@/components/bilan/WellnessRadar';
import { PainZonesChart } from '@/components/bilan/PainZonesChart';
import {
  aggregateTrendCharts,
  aggregateWellnessRadar,
  aggregatePainZones,
  hasEnoughData,
} from '@/lib/analytics/aggregate';
import { buildWebUrl } from '@/lib/web-browser';
import type { ProgramFeedback } from '@/types';

interface AnalyticsSectionProps {
  feedbacks: ProgramFeedback[];
  /** Accès Coaching Pro (gate analytics). */
  isPro: boolean;
}

// Modèle Netflix / Reader App : on pointe vers la home apexcoach.app (jamais une
// page prix ou checkout), UTM d'attribution injectés. Aucun prix affiché.
const PAYWALL_URL = buildWebUrl('/', {
  medium: 'paywall',
  campaign: 'analytics_gate',
});

/** Minimum de bilans pour débloquer les analytics (gate web : ≥4). */
const MIN_FEEDBACKS = 4;

/**
 * Section « Analytics » du Tab Bilan (S4-T04).
 *
 * 3 états :
 *   - !Pro            → bloc info + CTA paywall (zéro prix, redirige web)
 *   - <4 bilans       → empty state « continue tes bilans »
 *   - Pro & ≥4 bilans → TrendCharts + WellnessRadar + PainZonesChart
 *
 * Mirror direct de `app/(dashboard)/analytics/page.tsx`.
 */
export function AnalyticsSection({ feedbacks, isPro }: AnalyticsSectionProps) {
  const enough = hasEnoughData(feedbacks, MIN_FEEDBACKS);

  const trendData = useMemo(
    () => (isPro && enough ? aggregateTrendCharts(feedbacks) : null),
    [feedbacks, isPro, enough],
  );
  const radarAxes = useMemo(
    () => (isPro && enough ? aggregateWellnessRadar(feedbacks) : null),
    [feedbacks, isPro, enough],
  );
  const painZones = useMemo(
    () => (isPro && enough ? aggregatePainZones(feedbacks) : null),
    [feedbacks, isPro, enough],
  );

  if (!isPro) {
    return (
      <Card className="p-6 mb-4 items-center">
        <Lock size={40} color="#9CA3AF" />
        <Text variant="h3" className="mt-3 mb-1 text-center">
          Statistiques avancées
        </Text>
        <Text variant="body" className="text-apex-black-400 text-center mb-6">
          Visualise tes tendances, ton radar bien-être et tes zones sensibles
          avec l&apos;abonnement Coaching Pro.
        </Text>
        <FeatureGate
          icon={Lock}
          title="Coaching Pro requis"
          description="Tes statistiques détaillées sont disponibles avec l'abonnement Coaching Pro. Continue ton abonnement sur apexcoach.app."
          ctaUrl={PAYWALL_URL}
          ctaLabel="Voir mes options sur apexcoach.app"
        />
      </Card>
    );
  }

  if (!enough) {
    return (
      <Card className="p-6 mb-4 items-center">
        <BarChart3 size={40} color="#9CA3AF" />
        <Text variant="h3" className="mt-3 mb-1 text-center">
          Bientôt tes statistiques
        </Text>
        <Text variant="body" className="text-apex-black-400 text-center">
          Continue tes bilans pour débloquer tes stats. Il te faut au moins{' '}
          {MIN_FEEDBACKS} bilans hebdomadaires ({feedbacks.length}/{MIN_FEEDBACKS}
          ).
        </Text>
      </Card>
    );
  }

  return (
    <View className="mb-4">
      <Text variant="h3" className="mb-3">
        Tes statistiques
      </Text>

      {trendData && <TrendCharts data={trendData} className="mb-4" />}
      {radarAxes && <WellnessRadar axes={radarAxes} className="mb-4" />}
      {painZones && (
        <PainZonesChart zones={painZones} totalFeedbacks={feedbacks.length} />
      )}
    </View>
  );
}
