import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Polygon, Line, Circle } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/constants';
import type { WellnessRadarAxis } from '@/lib/analytics/aggregate';

interface WellnessRadarProps {
  /** Axes 0-5 (orientés « plus loin du centre = mieux »). */
  axes: WellnessRadarAxis[];
  /** Échelle max d'un axe (ressentis 1-5). */
  maxValue?: number;
  size?: number;
  className?: string;
}

const RING_LEVELS = [1, 2, 3, 4, 5];
const AnimatedView = Animated.View;

interface PointXY {
  x: number;
  y: number;
}

/**
 * Coordonnée d'un sommet sur l'axe `index` à un rayon `radius`.
 * Premier axe pointé vers le haut (-90°), puis sens horaire.
 */
function axisPoint(
  center: number,
  radius: number,
  index: number,
  total: number,
): PointXY {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

function pointsToString(points: PointXY[]): string {
  return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}

/**
 * Radar bien-être 6 axes (sommeil, énergie, motivation, courbatures, stress,
 * sans douleur) tracé en `react-native-svg` pur. Polygone de données en
 * apex-lime-500 sur grille sombre. Dark mode + animation d'entrée (fade).
 */
export function WellnessRadar({
  axes,
  maxValue = 5,
  size = 240,
  className = '',
}: WellnessRadarProps) {
  const center = size / 2;
  const labelPad = 28; // marge pour les labels autour du radar
  const maxRadius = center - labelPad;
  const total = axes.length;

  const { gridPolygons, axisLines, dataPoints, dataPolygon } = useMemo(() => {
    const grid = RING_LEVELS.map((level) => {
      const r = (maxRadius * level) / maxValue;
      const pts = axes.map((_, i) => axisPoint(center, r, i, total));
      return pointsToString(pts);
    });

    const lines = axes.map((_, i) => axisPoint(center, maxRadius, i, total));

    const dPoints = axes.map((axis, i) => {
      const clamped = Math.min(maxValue, Math.max(0, axis.value));
      const r = (maxRadius * clamped) / maxValue;
      return axisPoint(center, r, i, total);
    });

    return {
      gridPolygons: grid,
      axisLines: lines,
      dataPoints: dPoints,
      dataPolygon: pointsToString(dPoints),
    };
  }, [axes, center, maxRadius, maxValue, total]);

  if (total < 3) {
    return (
      <View
        className={`bg-apex-black-800 rounded-2xl p-6 border border-apex-black-700 items-center ${className}`}
      >
        <Text variant="body" className="text-center text-apex-black-400">
          Données insuffisantes pour le radar bien-être.
        </Text>
      </View>
    );
  }

  return (
    <AnimatedView
      entering={FadeIn.duration(400)}
      className={`bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700 ${className}`}
    >
      <Text className="text-white font-semibold mb-3">Bien-être global</Text>

      <View className="items-center">
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size}>
            {/* Anneaux concentriques */}
            {gridPolygons.map((poly, i) => (
              <Polygon
                key={`ring-${i}`}
                points={poly}
                stroke={colors.black[700]}
                strokeWidth={1}
                fill="none"
              />
            ))}

            {/* Rayons */}
            {axisLines.map((p, i) => (
              <Line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={p.x}
                y2={p.y}
                stroke={colors.black[700]}
                strokeWidth={1}
              />
            ))}

            {/* Polygone de données */}
            <Polygon
              points={dataPolygon}
              fill={colors.lime[500]}
              fillOpacity={0.2}
              stroke={colors.lime[500]}
              strokeWidth={2}
              strokeLinejoin="round"
            />

            {/* Sommets */}
            {dataPoints.map((p, i) => (
              <Circle key={`pt-${i}`} cx={p.x} cy={p.y} r={3} fill={colors.lime[500]} />
            ))}
          </Svg>

          {/* Labels positionnés autour du radar */}
          {axes.map((axis, i) => {
            const pos = axisPoint(center, maxRadius + 14, i, total);
            return (
              <View
                key={`label-${axis.key}`}
                style={{
                  position: 'absolute',
                  left: pos.x - 36,
                  top: pos.y - 10,
                  width: 72,
                }}
              >
                <Text
                  variant="caption"
                  className="text-apex-black-400 text-center"
                  numberOfLines={1}
                >
                  {axis.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </AnimatedView>
  );
}
