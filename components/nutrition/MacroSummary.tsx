import { View, Text } from 'react-native';
import type { ViewProps } from 'react-native';

interface MacroSummaryProps extends ViewProps {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  className?: string;
  hideHeader?: boolean;
}

interface MacroDef {
  key: 'protein' | 'carbs' | 'fats';
  label: string;
  color: string;
  calPerGram: number;
}

const MACROS: MacroDef[] = [
  { key: 'protein', label: 'Protéines', color: '#84CC16', calPerGram: 4 },
  { key: 'carbs', label: 'Glucides', color: '#60A5FA', calPerGram: 4 },
  { key: 'fats', label: 'Lipides', color: '#FBBF24', calPerGram: 9 },
];

export function MacroSummary({
  calories,
  protein,
  carbs,
  fats,
  className = '',
  hideHeader = false,
  ...props
}: MacroSummaryProps) {
  const values = { protein, carbs, fats };
  const totalCals =
    protein * 4 + carbs * 4 + fats * 9;

  return (
    <View
      className={`bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700 ${className}`}
      {...props}
    >
      {!hideHeader && (
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white font-bold text-base">Macros du jour</Text>
          <Text className="text-apex-lime-500 font-bold text-lg">
            {calories} kcal
          </Text>
        </View>
      )}

      {MACROS.map(({ key, label, color, calPerGram }) => {
        const grams = values[key];
        const ratio = totalCals > 0 ? (grams * calPerGram) / totalCals : 0;
        const pct = Math.round(ratio * 100);

        return (
          <View key={key} className="mb-3 last:mb-0">
            <View className="flex-row justify-between mb-1">
              <Text className="text-apex-black-400 text-sm">{label}</Text>
              <Text className="text-white text-sm font-medium">
                {grams}g · {pct}%
              </Text>
            </View>
            <View className="h-2 rounded-full bg-apex-black-700 overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
