import { useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { SafeView } from '@/components/ui/SafeView';
import { Text } from '@/components/ui/Text';
import { SessionCard } from '@/components/programme/SessionCard';
import { useProgramStore } from '@/stores/program';
import { isAIProgramData, sortSessions } from '@/lib/programs/adapter';
import { colors } from '@/lib/constants';

export default function WeekDetailScreen() {
  const { weekNumber } = useLocalSearchParams<{ weekNumber: string }>();
  const weekNum = parseInt(weekNumber ?? '0', 10);

  const program = useProgramStore((s) => s.program);
  const loading = useProgramStore((s) => s.loading);

  const week = useMemo(() => {
    if (!program || !isAIProgramData(program.program_data)) return null;
    return (
      program.program_data.weeks.find((w) => w.week_number === weekNum) ?? null
    );
  }, [program, weekNum]);

  if (loading) {
    return (
      <SafeView>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.lime[500]} />
        </View>
      </SafeView>
    );
  }

  if (!week) {
    return (
      <SafeView>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center px-6 gap-3">
          <Text variant="h2" className="text-white text-center">
            Semaine introuvable
          </Text>
          <Text variant="body" className="text-apex-black-400 text-center">
            Cette semaine n'existe pas encore dans ton programme.
          </Text>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Retour au programme"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="mt-2"
          >
            <Text variant="label" className="text-apex-lime-500 underline">
              Retour
            </Text>
          </Pressable>
        </View>
      </SafeView>
    );
  }

  const sortedSessions = sortSessions(week.sessions);

  return (
    <SafeView>
      <Stack.Screen options={{ headerShown: false }} />

      {/* En-tête : back + titre semaine */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Retour"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="p-2 mr-1"
        >
          <ChevronLeft size={24} color={colors.black[400]} />
        </Pressable>
        <Text variant="h2" className="text-white">
          Semaine {week.week_number}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Focus de la semaine */}
        <View className="bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700 mb-6">
          <Text variant="label" className="text-apex-black-400 mb-1">
            Objectif de la semaine
          </Text>
          <Text variant="body" className="text-white">
            {week.focus}
          </Text>
          {week.progression_notes && (
            <Text variant="caption" className="text-apex-black-400 mt-3 italic">
              {week.progression_notes}
            </Text>
          )}
        </View>

        {/* Liste des sessions */}
        <Text variant="h3" className="text-white mb-3">
          Séances
        </Text>
        <View className="gap-3">
          {sortedSessions.map((session, idx) => (
            <SessionCard
              key={`${session.day}-${session.session_number}`}
              title={session.type}
              day={session.day}
              durationMinutes={session.duration_minutes}
              exerciseCount={session.main_workout.length}
              onPress={() =>
                router.push({
                  pathname: '/(modals)/session-detail',
                  params: { week: String(weekNum), session: String(idx) },
                })
              }
            />
          ))}
        </View>
      </ScrollView>
    </SafeView>
  );
}
