import { View, Pressable } from 'react-native';
import { CheckCircle2, Clock, Zap } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/constants';

interface RestChoiceScreenProps {
  completedSet: number;
  totalSets: number;
  restSeconds: number;
  onChooseRest: () => void;
  onSkipRest: () => void;
}

function formatRest(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s === 0 ? `${m} min` : `${m} min ${s.toString().padStart(2, '0')}s`;
  }
  return `${seconds}s`;
}

/**
 * Écran intermédiaire « Série validée ! » avec deux choix : prendre le repos
 * recommandé (lance le RestTimer plein écran) ou enchaîner directement la
 * série suivante.
 * Mirror du composant web `RestChoiceScreen.tsx`.
 */
export function RestChoiceScreen({
  completedSet,
  totalSets,
  restSeconds,
  onChooseRest,
  onSkipRest,
}: RestChoiceScreenProps) {
  const remaining = totalSets - completedSet;

  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* Check vert */}
      <View className="w-20 h-20 rounded-full bg-apex-lime-500/15 border border-apex-lime-500/30 items-center justify-center mb-5">
        <CheckCircle2 size={40} color={colors.lime[500]} />
      </View>

      {/* Titre */}
      <Text variant="h1" className="text-white text-center mb-2">
        Série {completedSet} validée !
      </Text>
      <Text variant="body" className="text-apex-black-400 text-center mb-8">
        {remaining > 0
          ? `Encore ${remaining} série${remaining > 1 ? 's' : ''} à faire`
          : 'Dernière série terminée'}
      </Text>

      {/* CTA Repos (recommandé) */}
      <Pressable
        onPress={onChooseRest}
        accessibilityRole="button"
        accessibilityLabel={`Prendre le temps de repos de ${formatRest(restSeconds)}`}
        className="w-full bg-apex-lime-500 active:bg-apex-lime-600 rounded-xl h-14 px-6 flex-row items-center justify-center gap-2.5 mb-3"
      >
        <Clock size={18} color={colors.black[900]} />
        <Text variant="label" className="text-apex-black-900 text-base font-bold">
          Repos ({formatRest(restSeconds)})
        </Text>
      </Pressable>

      {/* CTA Enchaîner directement */}
      <Pressable
        onPress={onSkipRest}
        accessibilityRole="button"
        accessibilityLabel="Enchaîner la série suivante sans repos"
        className="w-full bg-transparent border-2 border-apex-black-700 active:bg-apex-black-800 rounded-xl h-14 px-6 flex-row items-center justify-center gap-2.5"
      >
        <Zap size={16} color={colors.lime[500]} />
        <Text variant="label" className="text-white text-base font-semibold">
          Enchaîner directement
        </Text>
      </Pressable>
    </View>
  );
}
