import { useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { X, Trophy, Timer, Dumbbell, CheckCircle2 } from 'lucide-react-native';

import { SafeView } from '@/components/ui/SafeView';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useWorkout } from '@/hooks/useWorkout';
import { colors } from '@/lib/constants';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m} min ${String(s).padStart(2, '0')}s`;
}

export default function SessionCompleteModal() {
  const {
    currentWorkout,
    sets,
    elapsedSeconds,
    totalExercises,
    finishSession,
  } = useWorkout();

  // Snapshot des stats avant que finishSession ne reset le store
  const stats = useMemo(
    () => ({
      title: currentWorkout?.title ?? 'Séance',
      totalSets: sets.length,
      totalExercises,
      totalReps: sets.reduce((sum, s) => sum + s.reps, 0),
      totalVolume: sets.reduce(
        (sum, s) => sum + s.reps * (s.weight ?? 0),
        0
      ),
      duration: elapsedSeconds,
    }),
    [currentWorkout, sets, elapsedSeconds, totalExercises]
  );

  const handleFinish = () => {
    finishSession();
    router.dismissAll();
    router.replace('/(tabs)/programme');
  };

  return (
    <SafeView className="flex-1 bg-apex-black-900">
      <View className="flex-row justify-end px-4 pt-2">
        <Pressable
          onPress={handleFinish}
          accessibilityLabel="Fermer"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="p-2"
        >
          <X size={24} color={colors.black[400]} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Trophée + félicitations */}
        <View className="items-center mt-4 mb-8">
          <View className="w-20 h-20 rounded-full bg-apex-lime-500/20 items-center justify-center mb-4">
            <Trophy size={40} color={colors.lime[500]} />
          </View>
          <Text variant="h1" className="text-white text-center mb-2">
            Séance terminée !
          </Text>
          <Text variant="body" className="text-apex-black-400 text-center">
            {stats.title}
          </Text>
        </View>

        {/* Stats */}
        <View className="bg-apex-black-800 rounded-2xl p-5 border border-apex-black-700 mb-3">
          <View className="flex-row items-center gap-3 mb-4">
            <Timer size={20} color={colors.lime[500]} />
            <View className="flex-1">
              <Text variant="caption" className="text-apex-black-400">
                Durée
              </Text>
              <Text variant="h3" className="text-white tabular-nums">
                {formatDuration(stats.duration)}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3 mb-4">
            <Dumbbell size={20} color={colors.lime[500]} />
            <View className="flex-1">
              <Text variant="caption" className="text-apex-black-400">
                Exercices · Sets
              </Text>
              <Text variant="h3" className="text-white">
                {stats.totalExercises} exercices · {stats.totalSets} sets
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <CheckCircle2 size={20} color={colors.lime[500]} />
            <View className="flex-1">
              <Text variant="caption" className="text-apex-black-400">
                Volume total
              </Text>
              <Text variant="h3" className="text-white">
                {stats.totalReps} reps
                {stats.totalVolume > 0
                  ? ` · ${stats.totalVolume.toFixed(0)} kg`
                  : ''}
              </Text>
            </View>
          </View>
        </View>

        <Text variant="caption" className="text-apex-black-400 text-center mb-8">
          Tes sets sont enregistrés. Continue sur la même lancée !
        </Text>
      </ScrollView>

      <View className="px-6 pb-6 pt-3 border-t border-apex-black-700">
        <Button
          variant="primary"
          onPress={handleFinish}
          accessibilityLabel="Retour au programme"
        >
          Retour au programme
        </Button>
      </View>
    </SafeView>
  );
}
