import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { Skeleton } from '@/components/ui/Skeleton';
import { colors } from '@/lib/constants';
import type {
  MetricSeries,
  TrendChartsData,
  TrendDirection,
} from '@/lib/analytics/aggregate';

interface TrendChartsProps {
  data: TrendChartsData;
  loading?: boolean;
  className?: string;
}

interface ChartConfig {
  key: keyof Pick<
    TrendChartsData,
    'completion' | 'difficulty' | 'energy' | 'stress'
  >;
  title: string;
  color: string;
  /** Échelle max fixe (completion = 100, ressentis = 5). */
  scaleMax: number;
  unit: string;
  /** Métrique principale mise en avant (lime). */
  primary?: boolean;
}

const CHARTS: readonly ChartConfig[] = [
  {
    key: 'completion',
    title: 'Complétion',
    color: colors.lime[500],
    scaleMax: 100,
    unit: '%',
    primary: true,
  },
  {
    key: 'difficulty',
    title: 'Difficulté',
    color: '#FBBF24',
    scaleMax: 5,
    unit: '/5',
  },
  { key: 'energy', title: 'Énergie', color: '#60A5FA', scaleMax: 5, unit: '/5' },
  { key: 'stress', title: 'Stress', color: '#F87171', scaleMax: 5, unit: '/5' },
];

const CHART_HEIGHT = 96;
const CHART_PAD_Y = 8;

const AnimatedView = Animated.View;

/** Construit le path SVG d'une polyligne à partir des points (x,y) en pixels. */
function buildLinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');
}

function TrendIcon({
  trend,
  color,
}: {
  trend: TrendDirection;
  color: string;
}) {
  if (trend === 'up') return <TrendingUp size={14} color={color} />;
  if (trend === 'down') return <TrendingDown size={14} color={color} />;
  return <Minus size={14} color={colors.black[400]} />;
}

function MiniChart({
  width,
  series,
  config,
}: {
  width: number;
  series: MetricSeries;
  config: ChartConfig;
}) {
  const innerH = CHART_HEIGHT - CHART_PAD_Y * 2;

  const coords = useMemo(() => {
    const pts = series.points
      .map((p, i) => ({ point: p, i }))
      .filter(({ point }) => point.value !== null);
    const n = series.points.length;
    const step = n > 1 ? width / (n - 1) : 0;

    return pts.map(({ point, i }) => {
      const ratio = Math.min(1, Math.max(0, (point.value as number) / config.scaleMax));
      const x = n > 1 ? i * step : width / 2;
      const y = CHART_PAD_Y + innerH * (1 - ratio);
      return { x, y };
    });
  }, [series.points, width, innerH, config.scaleMax]);

  const linePath = useMemo(() => buildLinePath(coords), [coords]);

  return (
    <Svg width={width} height={CHART_HEIGHT}>
      {/* Lignes de grille horizontales (0, 50%, 100% de l'échelle) */}
      {[0, 0.5, 1].map((g) => {
        const y = CHART_PAD_Y + innerH * (1 - g);
        return (
          <Line
            key={g}
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke={colors.black[700]}
            strokeWidth={1}
          />
        );
      })}

      {coords.length > 1 && (
        <Path
          d={linePath}
          stroke={config.color}
          strokeWidth={config.primary ? 2.5 : 2}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {coords.map((c, i) => (
        <Circle key={i} cx={c.x} cy={c.y} r={config.primary ? 3 : 2.5} fill={config.color} />
      ))}
    </Svg>
  );
}

/**
 * 4 mini-courbes des tendances hebdomadaires (complétion %, difficulté,
 * énergie, stress) tracées en `react-native-svg` pur. La complétion est la
 * métrique principale (apex-lime-500). Dark mode + animation d'entrée.
 *
 * Largeur du tracé déduite via un conteneur flex (la grille 2 colonnes fixe une
 * largeur stable de chart sur la majorité des écrans téléphone).
 */
export function TrendCharts({ data, loading = false, className = '' }: TrendChartsProps) {
  // Largeur interne d'un chart : carte pleine largeur - paddings card (16*2)
  // - padding interne (16*2). Approximé pour un rendu propre sur téléphone.
  const chartWidth = 260;

  if (loading) {
    return (
      <View className={`gap-3 ${className}`}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={140} borderRadius={16} />
        ))}
      </View>
    );
  }

  if (data.count === 0) {
    return (
      <View
        className={`bg-apex-black-800 rounded-2xl p-6 border border-apex-black-700 items-center ${className}`}
      >
        <Text variant="h3" className="text-center mb-1">
          Pas encore de tendances
        </Text>
        <Text variant="body" className="text-center text-apex-black-400">
          Complète tes bilans hebdomadaires pour visualiser ta progression.
        </Text>
      </View>
    );
  }

  return (
    <View className={`gap-3 ${className}`}>
      {CHARTS.map((config, index) => {
        const series = data[config.key];
        const avg = series.average;
        const trendColor =
          series.trend === 'up'
            ? colors.success
            : series.trend === 'down'
              ? colors.error
              : colors.black[400];

        return (
          <AnimatedView
            key={config.key}
            entering={FadeIn.delay(index * 80).duration(350)}
            className="bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <View
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <Text className="text-white font-semibold">{config.title}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                {avg !== null && (
                  <Text className="text-apex-black-400 text-sm">
                    moy. {avg}
                    {config.unit}
                  </Text>
                )}
                <TrendIcon trend={series.trend} color={trendColor} />
              </View>
            </View>

            <MiniChart width={chartWidth} series={series} config={config} />
          </AnimatedView>
        );
      })}
    </View>
  );
}
