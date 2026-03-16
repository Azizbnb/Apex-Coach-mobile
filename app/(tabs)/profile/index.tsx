import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeView } from '@/components/ui/SafeView';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/Badge';
import { LogOut, Settings, ChevronRight } from 'lucide-react-native';
import { colors } from '@/lib/constants';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { planId } = useSubscription();

  return (
    <SafeView>
      <ScrollView className="flex-1 px-4">
        <Text className="text-2xl font-bold text-white mt-4 mb-6">Profil</Text>

        {/* User info card */}
        <View className="bg-apex-black-800 rounded-xl p-4 mb-4 border border-apex-black-700">
          <Text className="text-white font-semibold text-lg">
            {profile?.full_name || user?.email || 'Utilisateur'}
          </Text>
          <Text className="text-apex-black-400 mt-1">{user?.email}</Text>
          {planId && (
            <View className="mt-3">
              <Badge
                label={planId === 'coaching_pro' ? 'Coaching Pro' : planId === 'coaching' ? 'Coaching' : 'Starter'}
                variant={planId === 'coaching_pro' ? 'premium' : 'default'}
              />
            </View>
          )}
        </View>

        {/* Settings link */}
        <Pressable className="bg-apex-black-800 rounded-xl p-4 mb-4 border border-apex-black-700 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Settings size={20} color={colors.black[400]} />
            <Text className="text-white ml-3">Paramètres</Text>
          </View>
          <ChevronRight size={20} color={colors.black[400]} />
        </Pressable>

        {/* Sign out */}
        <Pressable
          onPress={signOut}
          className="bg-apex-black-800 rounded-xl p-4 mb-4 border border-apex-black-700 flex-row items-center"
        >
          <LogOut size={20} color={colors.error} />
          <Text className="text-apex-error ml-3 font-medium">
            Se déconnecter
          </Text>
        </Pressable>
      </ScrollView>
    </SafeView>
  );
}
