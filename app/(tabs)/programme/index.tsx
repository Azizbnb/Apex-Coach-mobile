import { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';

import { SafeView } from '@/components/ui/SafeView';
import { WeekCard } from '@/components/programme/WeekCard';
import { FastingBanner } from '@/components/programme/FastingBanner';
import { NextUnlockBanner } from '@/components/programme/NextUnlockBanner';
import { EquipmentRecs } from '@/components/affiliate/EquipmentRecs';
import { useAuthStore } from '@/stores/auth';
import { useProgramStore } from '@/stores/program';
import { useSubscriptionStore } from '@/stores/subscription';
import {
  isWeekUnlocked,
  shouldApplyProgressiveUnlock,
  getUnlockDateForWeek,
} from '@/lib/subscription/progressive-unlock';
import { isAIProgramData } from '@/lib/programs/adapter';
import { colors } from '@/lib/constants';

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function isFastingActive(profile: ReturnType<typeof useAuthStore.getState>['profile']): boolean {
  if (!profile?.is_fasting_mode) return false;
  const { fasting_start_date, fasting_end_date } = profile;
  if (!fasting_start_date || !fasting_end_date) return true;
  const now = Date.now();
  return now >= new Date(fasting_start_date).getTime() && now <= new Date(fasting_end_date).getTime();
}

export default function ProgrammeScreen() {
  const { program, loading, fetch } = useProgramStore();
  const subscriptionFetch = useSubscriptionStore((s) => s.fetch);
  const planId = useSubscriptionStore((s) => s.planId);
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
    fetch();
    subscriptionFetch();
  }, [fetch, subscriptionFetch]);

  const currentPlanId = planId();

  // start_date pilote le progressive unlock — fallback créé_at si null
  const startDate = useMemo(() => {
    if (!program) return null;
    const raw = program.start_date ?? program.created_at;
    return raw ? new Date(raw) : null;
  }, [program]);

  // Liste des semaines parsée depuis program_data
  const weeks = useMemo(() => {
    if (!program || !isAIProgramData(program.program_data)) return [];
    return program.program_data.weeks;
  }, [program]);

  const isProgressive = shouldApplyProgressiveUnlock(currentPlanId);

  // Prochaine semaine verrouillée (pour NextUnlockBanner) — avant tout return conditionnel
  const nextLockedWeek = useMemo(() => {
    if (!isProgressive || !startDate || weeks.length === 0) return null;
    for (const week of weeks) {
      if (!isWeekUnlocked(startDate, week.week_number)) {
        return { weekNumber: week.week_number, unlockDate: getUnlockDateForWeek(startDate, week.week_number) };
      }
    }
    return null;
  }, [isProgressive, startDate, weeks]);

  const showFasting = isFastingActive(profile);
  const showEquipmentRecs = !!program;

  if (loading) {
    return (
      <SafeView>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.lime[500]} />
          <Text className="text-apex-black-400 mt-4">Chargement...</Text>
        </View>
      </SafeView>
    );
  }

  if (!program) {
    return (
      <SafeView>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl font-bold text-white mb-2">
            Aucun programme
          </Text>
          <Text className="text-apex-black-400 text-center">
            Ton programme est en cours de génération par l'IA.
          </Text>
        </View>
      </SafeView>
    );
  }

  return (
    <SafeView>
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Text className="text-2xl font-bold text-white mt-4 mb-2">
          {program.title || 'Mon Programme'}
        </Text>
        <Text className="text-apex-black-400 mb-6">
          {program.description || `Programme ${program.duration_weeks} semaines`}
        </Text>

        {showFasting && (
          <FastingBanner
            fastingLevel={profile?.fasting_level}
            fastingEndDate={profile?.fasting_end_date}
            className="mb-4"
          />
        )}

        {nextLockedWeek && (
          <NextUnlockBanner
            weekNumber={nextLockedWeek.weekNumber}
            unlockDate={nextLockedWeek.unlockDate}
            className="mb-4"
          />
        )}

        {weeks.length === 0 ? (
          <View className="bg-apex-black-800 rounded-xl p-4 mb-4 border border-apex-black-700">
            <Text className="text-white font-semibold text-lg mb-1">
              Statut : {program.status}
            </Text>
            <Text className="text-apex-black-400">
              {program.duration_weeks} semaines
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {weeks.map((week) => {
              const unlockDate = startDate
                ? getUnlockDateForWeek(startDate, week.week_number)
                : undefined;
              const isUnlocked =
                !isProgressive ||
                (startDate
                  ? isWeekUnlocked(startDate, week.week_number)
                  : true);
              const daysUntilUnlock =
                isUnlocked || !unlockDate
                  ? null
                  : Math.max(0, daysBetween(new Date(), unlockDate));

              return (
                <WeekCard
                  key={week.week_number}
                  weekNumber={week.week_number}
                  sessionCount={week.sessions.length}
                  progressPercent={0}
                  isUnlocked={isUnlocked}
                  unlockDate={unlockDate}
                  daysUntilUnlock={daysUntilUnlock}
                />
              );
            })}
          </View>
        )}

        {showEquipmentRecs && (
          <EquipmentRecs sourcePage="programme" className="mt-4" />
        )}
      </ScrollView>
    </SafeView>
  );
}
