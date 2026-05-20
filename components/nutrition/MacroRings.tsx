import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { ViewProps } from 'react-native';
import { MacroRingsChart } from '@/components/nutrition/MacroRingsChart';
import { MacroSummary } from '@/components/nutrition/MacroSummary';
import { useSettings } from '@/hooks/useSettings';

interface MacroRingsProps extends ViewProps {
  calories: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  className?: string;
}

const MACRO_COLORS: Record<string, string> = {
  protein: '#84CC16',
  carbs: '#60A5FA',
  fats: '#FBBF24',
};

const MACRO_LABELS: Record<string, string> = {
  protein: 'Protéines',
  carbs: 'Glucides',
  fats: 'Lipides',
};

function MacroLegend({
  protein,
  carbs,
  fats,
}: {
  protein: number;
  carbs: number;
  fats: number;
}) {
  const entries = [
    { key: 'protein', value: protein },
    { key: 'carbs', value: carbs },
    { key: 'fats', value: fats },
  ] as const;

  return (
    <View className="flex-row justify-around mt-4 w-full">
      {entries.map(({ key, value }) => (
        <View key={key} className="items-center gap-1">
          <View
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: MACRO_COLORS[key] }}
          />
          <Text className="text-apex-black-400 text-xs">{MACRO_LABELS[key]}</Text>
          <Text className="text-white text-sm font-medium">{value}g</Text>
        </View>
      ))}
    </View>
  );
}

export function MacroRings({
  calories,
  targetCalories,
  protein,
  carbs,
  fats,
  className = '',
  ...props
}: MacroRingsProps) {
  const { macroViewMode, toggleMacroViewMode, load } = useSettings();

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const proteinesRatio = targetCalories > 0 ? (protein * 4) / targetCalories : 0;
  const glucidesRatio = targetCalories > 0 ? (carbs * 4) / targetCalories : 0;
  const lipidesRatio = targetCalories > 0 ? (fats * 9) / targetCalories : 0;

  return (
    <View
      className={`bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700 ${className}`}
      {...props}
    >
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white font-bold text-base">Macros du jour</Text>
        <TouchableOpacity
          onPress={toggleMacroViewMode}
          className="px-3 py-1 bg-apex-black-700 rounded-full"
          accessibilityLabel={macroViewMode === 'rings' ? 'Passer en vue barres' : 'Passer en vue anneaux'}
        >
          <Text className="text-apex-lime-500 text-xs font-medium">
            {macroViewMode === 'rings' ? 'Barres' : 'Anneaux'}
          </Text>
        </TouchableOpacity>
      </View>

      {macroViewMode === 'rings' ? (
        <View className="items-center">
          <MacroRingsChart
            proteinesRatio={proteinesRatio}
            glucidesRatio={glucidesRatio}
            lipidesRatio={lipidesRatio}
            calories={calories}
            targetCalories={targetCalories}
          />
          <MacroLegend protein={protein} carbs={carbs} fats={fats} />
        </View>
      ) : (
        <MacroSummary
          calories={calories}
          protein={protein}
          carbs={carbs}
          fats={fats}
          hideHeader
          className="border-0 p-0 bg-transparent"
        />
      )}
    </View>
  );
}
