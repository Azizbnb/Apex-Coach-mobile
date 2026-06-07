import { Fragment } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/constants';

interface MacroRingsProps {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const MACROS = [
  { key: 'protein', label: 'Protéines', color: '#84CC16', calPerGram: 4 },
  { key: 'carbs', label: 'Glucides', color: '#60A5FA', calPerGram: 4 },
  { key: 'fats', label: 'Lipides', color: '#FBBF24', calPerGram: 9 },
] as const;

/**
 * Anneaux concentriques des macros (part calorique de chaque macro).
 * Anneau externe = protéines, médian = glucides, interne = lipides.
 * Centre = total kcal. Légende grammes + pourcentage à droite.
 */
export function MacroRings({
  calories,
  protein,
  carbs,
  fats,
  size = 160,
  strokeWidth = 12,
  className = '',
}: MacroRingsProps) {
  const grams = { protein, carbs, fats };
  const totalCals = protein * 4 + carbs * 4 + fats * 9;
  const gap = 4;
  const center = size / 2;

  const ratioOf = (key: 'protein' | 'carbs' | 'fats', calPerGram: number) =>
    totalCals > 0 ? (grams[key] * calPerGram) / totalCals : 0;

  return (
    <View
      className={`bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700 ${className}`}
    >
      <View className="flex-row items-center gap-5">
        {/* Anneaux */}
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
            {MACROS.map((m, i) => {
              const radius = center - strokeWidth / 2 - i * (strokeWidth + gap);
              const circumference = 2 * Math.PI * radius;
              const ratio = Math.min(1, Math.max(0, ratioOf(m.key, m.calPerGram)));
              return (
                <Fragment key={m.key}>
                  <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={colors.black[700]}
                    strokeWidth={strokeWidth}
                    fill="none"
                  />
                  <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={m.color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - ratio)}
                    strokeLinecap="round"
                  />
                </Fragment>
              );
            })}
          </Svg>
          <View
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            className="items-center justify-center"
          >
            <Text className="text-white font-bold text-xl">{calories}</Text>
            <Text variant="caption" className="text-apex-black-400">
              kcal
            </Text>
          </View>
        </View>

        {/* Légende */}
        <View className="flex-1 gap-3">
          {MACROS.map((m) => {
            const pct = Math.round(ratioOf(m.key, m.calPerGram) * 100);
            return (
              <View key={m.key} className="flex-row items-center gap-2">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: m.color }}
                />
                <Text className="text-apex-black-400 text-sm flex-1">{m.label}</Text>
                <Text className="text-white text-sm font-medium">
                  {grams[m.key]}g · {pct}%
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
