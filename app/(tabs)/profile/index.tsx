import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import {
  Target,
  Clock,
  KeyRound,
  ShieldCheck,
  ExternalLink,
  LogOut,
} from 'lucide-react-native';
import { SafeView } from '@/components/ui/SafeView';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { SettingsSection, SettingsRow } from '@/components/profile/SettingsSection';
import { ReviewSection } from '@/components/profile/ReviewSection';
import { FastingToggleForm } from '@/components/settings/FastingToggleForm';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';
import { GdprExportButton } from '@/components/settings/GdprExportButton';
import { DeleteAccountButton } from '@/components/settings/DeleteAccountButton';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { openWebUrl } from '@/lib/web-browser';
import { colors } from '@/lib/constants';

/**
 * Écran Profil complet (S4-T06).
 *
 * Header (nom éditable + plan) · Mesures · Mon abonnement (CTA web home) ·
 * Réglages (objectif, jeûne, mot de passe) · Mon avis · Données & confidentialité ·
 * Footer (liens légaux web, version app, déconnexion).
 */

/** Formate la date de renouvellement/fin de période en français. */
function formatPeriodEnd(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { subscription, planId, isTrial, isActive } = useSubscription();

  const [showFasting, setShowFasting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const name = profile?.full_name ?? '';
  const email = user?.email ?? '';

  const periodEnd = formatPeriodEnd(
    subscription?.trial_end_date ?? subscription?.current_period_end ?? undefined
  );
  const renews = isActive && !subscription?.cancel_at_period_end;

  const appVersion =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '—';

  const onSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeView>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 48 }}>
        <Text className="text-2xl font-bold text-white mt-4 mb-6">Profil</Text>

        <View className="gap-6">
          <ProfileHeader
            name={name}
            email={email}
            planId={planId}
            isTrial={isTrial}
          />

          <ProfileStats profile={profile} />

          {/* Mon abonnement */}
          <View>
            <Text className="text-apex-black-400 text-sm font-medium mb-3">
              Mon abonnement
            </Text>
            <View className="bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700">
              <Text className="text-white font-medium">
                {isTrial
                  ? 'Essai gratuit'
                  : planId === 'coaching_pro'
                    ? 'Coaching Pro'
                    : planId === 'coaching'
                      ? 'Coaching'
                      : 'Compte gratuit'}
              </Text>
              {periodEnd ? (
                <Text variant="caption" className="mt-1">
                  {isTrial
                    ? `Essai jusqu’au ${periodEnd}`
                    : renews
                      ? `Renouvellement le ${periodEnd}`
                      : `Accès jusqu’au ${periodEnd}`}
                </Text>
              ) : null}
              <Button
                variant="secondary"
                onPress={() => openWebUrl('/', { medium: 'profile' })}
                className="mt-4"
              >
                Gérer mon abonnement
              </Button>
            </View>
          </View>

          {/* Réglages */}
          <SettingsSection title="Réglages">
            <SettingsRow
              icon={Target}
              label="Changer mon objectif"
              onPress={() => router.push('/(modals)/change-objective')}
            />

            <SettingsRow
              icon={Clock}
              label="Mode jeûne"
              onPress={() => setShowFasting((v) => !v)}
            />
            {showFasting ? <FastingToggleForm /> : null}

            <SettingsRow
              icon={KeyRound}
              label="Mot de passe"
              onPress={() => setShowPassword((v) => !v)}
            />
            {showPassword ? <ChangePasswordForm /> : null}
          </SettingsSection>

          {/* Mon avis */}
          <ReviewSection />

          {/* Données & confidentialité (RGPD + suppression — obligatoire stores) */}
          <View>
            <Text className="text-apex-black-400 text-sm font-medium mb-3">
              Données & confidentialité
            </Text>
            <View className="gap-3">
              <GdprExportButton />
              <DeleteAccountButton />
            </View>
          </View>

          {/* Footer : liens légaux + version + déconnexion */}
          <View>
            <View className="gap-3">
              <Pressable
                onPress={() => openWebUrl('/legal/terms', { medium: 'profile' })}
                accessibilityRole="link"
                accessibilityLabel="Conditions générales"
                className="flex-row items-center"
              >
                <ExternalLink size={16} color={colors.black[400]} />
                <Text className="text-apex-black-400 ml-2">
                  Conditions générales
                </Text>
              </Pressable>
              <Pressable
                onPress={() => openWebUrl('/legal/privacy', { medium: 'profile' })}
                accessibilityRole="link"
                accessibilityLabel="Politique de confidentialité"
                className="flex-row items-center"
              >
                <ShieldCheck size={16} color={colors.black[400]} />
                <Text className="text-apex-black-400 ml-2">
                  Politique de confidentialité
                </Text>
              </Pressable>
              <Pressable
                onPress={() => openWebUrl('/legal/mentions', { medium: 'profile' })}
                accessibilityRole="link"
                accessibilityLabel="Mentions légales"
                className="flex-row items-center"
              >
                <ExternalLink size={16} color={colors.black[400]} />
                <Text className="text-apex-black-400 ml-2">Mentions légales</Text>
              </Pressable>
            </View>

            <Text variant="caption" className="mt-4">
              Version {appVersion}
            </Text>

            <Pressable
              onPress={onSignOut}
              accessibilityRole="button"
              accessibilityLabel="Se déconnecter"
              className="bg-apex-black-800 rounded-2xl p-4 mt-4 border border-apex-black-700 flex-row items-center"
            >
              <LogOut size={20} color={colors.error} />
              <Text className="text-apex-error ml-3 font-medium">
                Se déconnecter
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeView>
  );
}
