import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ShieldCheck } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/constants';
import type { PainZoneFrequency } from '@/lib/analytics/aggregate';

interface PainZonesChartProps {
  zones: PainZoneFrequency[];
  /** Nombre total de bilans (pour l'affichage « x/y semaines »). */
  totalFeedbacks: number;
  className?: string;
}

const AnimatedView = Animated.View;

/**
 * Couleur de barre selon l'intensité (part de bilans concernés).
 * Vert (rare) → ambre (fréquent) → rouge (récurrent).
 */
function intensityColor(ratio: number): string {
  if (ratio >= 0.6) return colors.error;
  if (ratio >= 0.3) return colors.warning;
  return colors.lime[500];
}

/**
 * Zones de douleur les plus fréquentes en barres horizontales (heatmap
 * simplifiée). Largeur ∝ fréquence, couleur ∝ intensité. Vues NativeWind pures
 * (pas de SVG nécessaire ici). Dark mode + animation d'entrée + empty state.
 */
export function PainZonesChart({
  zones,
  totalFeedbacks,
  className = '',
}: PainZonesChartProps) {
  if (zones.length === 0) {
    return (
      <View
        className={`bg-apex-black-800 rounded-2xl p-6 border border-apex-black-700 items-center ${className}`}
      >
        <ShieldCheck size={40} color={colors.success} />
        <Text variant="h3" className="text-center mt-3 mb-1">
          Aucune douleur signalée
        </Text>
        <Text variant="body" className="text-center text-apex-black-400">
          Tu n’as rapporté aucune zone douloureuse dans tes bilans. Continue
          comme ça.
        </Text>
      </View>
    );
  }

  const maxCount = Math.max(...zones.map((z) => z.count), 1);

  return (
    <View
      className={`bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700 ${className}`}
    >
      <Text className="text-white font-semibold mb-1">Zones sensibles</Text>
      <Text variant="caption" className="text-apex-black-400 mb-4">
        Fréquence sur {totalFeedbacks} bilan{totalFeedbacks > 1 ? 's' : ''}
      </Text>

      <View className="gap-3">
        {zones.map((zone, index) => {
          const barRatio = zone.count / maxCount;
          const color = intensityColor(zone.ratio);
          const pct = Math.round(zone.ratio * 100);
          return (
            <View key={zone.zone}>
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-white text-sm">{zone.label}</Text>
                <Text variant="caption" className="text-apex-black-400">
                  {zone.count}× · {pct}%
                </Text>
              </View>
              <View className="h-2.5 rounded-full bg-apex-black-700 overflow-hidden">
                <AnimatedView
                  entering={FadeIn.delay(index * 60).duration(400)}
                  style={{
                    width: `${Math.max(6, barRatio * 100)}%`,
                    backgroundColor: color,
                  }}
                  className="h-full rounded-full"
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
