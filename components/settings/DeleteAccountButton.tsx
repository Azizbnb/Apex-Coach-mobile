import { useState } from 'react';
import { View, Modal } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { accountApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

const CONFIRM_WORD = 'SUPPRIMER';

type Step = 'idle' | 'confirm' | 'password';

/**
 * Suppression de compte (mirror web DeleteAccountButton).
 *
 * Obligatoire pour les stores (Apple + Google). 3 étapes : avertissement +
 * saisie « SUPPRIMER », puis re-authentification par mot de passe
 * (POST /api/user/delete-account { password }). Purge serveur async →
 * signout → retour au Welcome non-connecté.
 */
export function DeleteAccountButton() {
  const [step, setStep] = useState<Step>('idle');
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const signOut = useAuthStore((s) => s.signOut);

  const close = () => {
    setStep('idle');
    setConfirmText('');
    setPassword('');
    setError('');
  };

  const goToPassword = () => {
    if (confirmText.trim().toUpperCase() !== CONFIRM_WORD) {
      setError(`Saisis « ${CONFIRM_WORD} » pour confirmer.`);
      return;
    }
    setError('');
    setStep('password');
  };

  const onDelete = async () => {
    if (loading || !password) {
      if (!password) setError('Mot de passe requis');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await accountApi.deleteAccount(password);
      await signOut();
      close();
      router.replace('/(onboarding)/welcome');
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'La suppression a échoué. Réessaie plus tard.'
      );
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="destructive" onPress={() => setStep('confirm')}>
        Supprimer mon compte
      </Button>

      <Modal
        visible={step !== 'idle'}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <View className="flex-1 bg-black/70 justify-center px-6">
          <View className="bg-apex-black-800 rounded-2xl p-6 border border-apex-black-700">
            <Text variant="h3" className="mb-2">
              Suppression définitive du compte
            </Text>
            <Text variant="body" className="mb-4">
              Cette action est irréversible : profil, programmes, nutrition, suivi et
              réponses au questionnaire (données de santé incluses) seront supprimés.
              Si tu as un abonnement actif, résilie-le d’abord.
            </Text>

            {step === 'confirm' ? (
              <Input
                value={confirmText}
                onChangeText={setConfirmText}
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder={CONFIRM_WORD}
                accessibilityLabel="Saisir SUPPRIMER pour confirmer"
                error={error || undefined}
              />
            ) : (
              <Input
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Ton mot de passe"
                accessibilityLabel="Mot de passe"
                error={error || undefined}
              />
            )}

            {step === 'confirm' ? (
              <Button variant="destructive" onPress={goToPassword}>
                Continuer
              </Button>
            ) : (
              <Button
                variant="destructive"
                onPress={onDelete}
                loading={loading}
                disabled={!password}
              >
                Supprimer définitivement
              </Button>
            )}
            <Button variant="ghost" onPress={close} className="mt-3">
              Annuler
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}
