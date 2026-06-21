import { useState, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/lib/constants';
import { sortByWeek, PAIN_ZONE_LABELS } from '@/lib/analytics/aggregate';
import type { ProgramFeedback } from '@/types';

interface HistoryProps {
  feedbacks: ProgramFeedback[];
}

/** Variante de badge selon le taux de complétion (mirror seuils web). */
function completionVariant(rate: number): 'success' | 'warning' | 'error' {
  if (rate >= 75) return 'success';
  if (rate >= 50) return 'warning';
  return 'error';
}

function formatDate(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('fr-FR');
}

/** Ligne « libellé : valeur » du détail déplié. */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text variant="caption">{label}</Text>
      <Text className="text-white text-xs font-medium">{value}</Text>
    </View>
  );
}

function ratingText(value: number | null | undefined): string {
  return typeof value === 'number' ? `${value}/5` : '—';
}

/**
 * Détail déplié d'un bilan (ressentis + poids + zones de douleur).
 * État inline, pas de modal (cf. ticket S4-T04).
 */
function FeedbackDetail({ feedback }: { feedback: ProgramFeedback }) {
  const painLabels =
    Array.isArray(feedback.pain_locations) && feedback.pain_locations.length > 0
      ? feedback.pain_locations
          .map((z) => PAIN_ZONE_LABELS[z] ?? z)
          .join(', ')
      : 'Aucune';

  return (
    <View className="mt-3 pt-3 border-t border-apex-black-700">
      <DetailRow label="Difficulté" value={ratingText(feedback.difficulty_rating)} />
      <DetailRow label="Énergie" value={ratingText(feedback.energy_level)} />
      <DetailRow label="Courbatures" value={ratingText(feedback.muscle_soreness)} />
      <DetailRow label="Motivation" value={ratingText(feedback.motivation_level)} />
      <DetailRow label="Sommeil" value={ratingText(feedback.sleep_quality)} />
      <DetailRow label="Stress" value={ratingText(feedback.stress_level)} />
      {typeof feedback.weight_kg === 'number' && (
        <DetailRow label="Poids" value={`${feedback.weight_kg} kg`} />
      )}
      <DetailRow label="Zones de douleur" value={painLabels} />
    </View>
  );
}

/**
 * Section « Historique » du Tab Bilan (S4-T04).
 *
 * Liste des bilans précédents (semaine, date, taux de complétion), du plus récent
 * au plus ancien. Tap sur une ligne → déplie/replie le détail inline.
 * Mirror direct de `app/(dashboard)/bilan/page.tsx` (historique des bilans).
 */
export function History({ feedbacks }: HistoryProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setExpanded((curr) => (curr === id ? null : id));
  }, []);

  if (feedbacks.length === 0) {
    return (
      <Card className="p-5 mb-4">
        <Text variant="h3" className="mb-1">
          Historique des bilans
        </Text>
        <Text variant="body" className="text-apex-black-400">
          Tes bilans précédents apparaîtront ici.
        </Text>
      </Card>
    );
  }

  // Plus récent en premier.
  const ordered = sortByWeek(feedbacks).reverse();

  return (
    <Card className="p-5 mb-4">
      <Text variant="h3" className="mb-3">
        Historique des bilans
      </Text>

      <View className="gap-2">
        {ordered.map((feedback) => {
          const isOpen = expanded === feedback.id;
          const rate =
            typeof feedback.completion_rate === 'number'
              ? feedback.completion_rate
              : 0;

          return (
            <Pressable
              key={feedback.id}
              accessibilityRole="button"
              accessibilityLabel={`Bilan semaine ${feedback.week_number}`}
              accessibilityState={{ expanded: isOpen }}
              onPress={() => toggle(feedback.id)}
              className="bg-apex-black-900 rounded-xl p-3 border border-apex-black-700"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-white font-medium">
                    Semaine {feedback.week_number}
                  </Text>
                  <Text variant="caption">{formatDate(feedback.feedback_date)}</Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Badge
                    label={`${Math.round(rate)}%`}
                    variant={completionVariant(rate)}
                  />
                  {isOpen ? (
                    <ChevronDown size={18} color={colors.black[400]} />
                  ) : (
                    <ChevronRight size={18} color={colors.black[400]} />
                  )}
                </View>
              </View>

              {isOpen && <FeedbackDetail feedback={feedback} />}
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}
