import { useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Clock, Flame, Activity, Dumbbell } from 'lucide-react-native';

import { SafeView } from '@/components/ui/SafeView';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ExerciseCard } from '@/components/programme/ExerciseCard';
import { useProgramStore } from '@/stores/program';
import { useWorkout } from '@/hooks/useWorkout';
import { useAuth } from '@/hooks/useAuth';
import {
  isAIProgramData,
  aiSessionToWorkout,
  aiExerciseToExercise,
  sortSessions,
} from '@/lib/programs/adapter';
import { colors } from '@/lib/constants';

type SessionDetailParams = {
  week?: string;
  session?: string;
};

export default function SessionDetailModal() {
  const { week, session: sessionParam } = useLocalSearchParams<SessionDetailParams>();
  const weekNumber = parseInt(week ?? '0', 10);
  const sessionIndex = parseInt(sessionParam ?? '0', 10);

  const program = useProgramStore((s) => s.program);
  const { startSession } = useWorkout();
  const { user } = useAuth();

  const session = useMemo(() => {
    if (!program || !isAIProgramData(program.program_data)) return null;
    const weekData = program.program_data.weeks.find(
      (w) => w.week_number === weekNumber
    );
    if (!weekData) return null;
    const sorted = sortSessions(weekData.sessions);
    return sorted[sessionIndex] ?? null;
  }, [program, weekNumber, sessionIndex]);

  if (!session) {
    return (
      <SafeView className="flex-1 bg-apex-black-900">
        <View className="flex-1 px-6 pt-4">
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Fermer"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="self-end p-2"
          >
            <X size={24} color={colors.black[400]} />
          </Pressable>
          <View className="flex-1 items-center justify-center">
            <Text variant="h3" className="text-white text-center">
              Séance introuvable
            </Text>
            <Text variant="caption" className="text-apex-black-400 mt-2 text-center">
              Ouvre une séance depuis ton programme.
            </Text>
          </View>
        </View>
      </SafeView>
    );
  }

  const handleStart = () => {
    if (!user) return;
    const workout = aiSessionToWorkout(session, weekNumber, sessionIndex, user.id);
    startSession(workout);
    router.dismissAll();
    router.replace('/(tabs)/workout');
  };

  return (
    <SafeView className="flex-1 bg-apex-black-900">
      {/* En-tête modal : close button + titre */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3 border-b border-apex-black-700">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Fermer la séance"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="p-2"
        >
          <X size={24} color={colors.black[400]} />
        </Pressable>
        <Text variant="h3" className="text-white">
          Semaine {weekNumber}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Bloc titre + métadonnées */}
        <View className="mt-4 mb-6">
          <Text variant="h2" className="text-white mb-1">
            {session.type}
          </Text>
          <Text variant="body" className="text-apex-black-400 mb-3">
            {session.day}
          </Text>
          <View className="flex-row flex-wrap gap-4">
            <View className="flex-row items-center gap-1.5">
              <Clock size={14} color={colors.black[400]} />
              <Text variant="caption" className="text-apex-black-400">
                {session.duration_minutes} min
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Dumbbell size={14} color={colors.black[400]} />
              <Text variant="caption" className="text-apex-black-400">
                {session.main_workout.length} exercice
                {session.main_workout.length > 1 ? 's' : ''}
              </Text>
            </View>
            {session.intensity_level !== undefined && (
              <View className="flex-row items-center gap-1.5">
                <Flame size={14} color={colors.black[400]} />
                <Text variant="caption" className="text-apex-black-400">
                  Intensité {session.intensity_level}/10
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Échauffement */}
        <View className="bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700 mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Activity size={16} color={colors.lime[500]} />
            <Text variant="h3" className="text-white">
              Échauffement · {session.warmup.duration_minutes} min
            </Text>
          </View>
          {session.warmup.exercises.map((ex, idx) => (
            <Text key={idx} variant="body" className="text-apex-black-400 mb-1">
              • {ex}
            </Text>
          ))}
        </View>

        {/* Liste des exercices principaux */}
        <Text variant="h3" className="text-white mb-3 mt-2">
          Exercices
        </Text>
        <View className="gap-3 mb-4">
          {session.main_workout.map((ex, idx) => (
            <ExerciseCard
              key={idx}
              exercise={aiExerciseToExercise(ex, weekNumber, sessionIndex, idx)}
            />
          ))}
        </View>

        {/* Retour au calme */}
        <View className="bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700 mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Activity size={16} color={colors.lime[500]} />
            <Text variant="h3" className="text-white">
              Retour au calme · {session.cooldown.duration_minutes} min
            </Text>
          </View>
          {session.cooldown.exercises.map((ex, idx) => (
            <Text key={idx} variant="body" className="text-apex-black-400 mb-1">
              • {ex}
            </Text>
          ))}
        </View>

        {/* Notes de coaching */}
        {session.notes && (
          <View className="bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700 mb-4">
            <Text variant="label" className="text-apex-black-400 mb-2">
              Notes du coach
            </Text>
            <Text variant="body" className="text-white">
              {session.notes}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* CTA fixe en bas */}
      <View className="px-4 pb-6 pt-3 border-t border-apex-black-700 bg-apex-black-900">
        <Button
          variant="primary"
          onPress={handleStart}
          accessibilityLabel={`Démarrer la séance ${session.type} de la semaine ${weekNumber}`}
        >
          Démarrer la séance
        </Button>
      </View>
    </SafeView>
  );
}
