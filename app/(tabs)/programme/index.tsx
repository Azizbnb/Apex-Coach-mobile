import { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeView } from '@/components/ui/SafeView';
import { useProgramStore } from '@/stores/program';
import { useSubscriptionStore } from '@/stores/subscription';

export default function ProgrammeScreen() {
  const { program, loading, fetch } = useProgramStore();
  const subscriptionFetch = useSubscriptionStore((s) => s.fetch);

  useEffect(() => {
    fetch();
    subscriptionFetch();
  }, [fetch, subscriptionFetch]);

  if (loading) {
    return (
      <SafeView>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#84CC16" />
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
      <ScrollView className="flex-1 px-4">
        <Text className="text-2xl font-bold text-white mt-4 mb-2">
          {program.title || 'Mon Programme'}
        </Text>
        <Text className="text-apex-black-400 mb-6">
          {program.description || `Programme ${program.duration_weeks} semaines`}
        </Text>

        {/* Week cards will be implemented in Sprint 2 */}
        <View className="bg-apex-black-800 rounded-xl p-4 mb-4 border border-apex-black-700">
          <Text className="text-white font-semibold text-lg mb-1">
            Statut : {program.status}
          </Text>
          <Text className="text-apex-black-400">
            {program.duration_weeks} semaines
          </Text>
        </View>
      </ScrollView>
    </SafeView>
  );
}
