import { useState } from 'react';
import { View, Modal, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { accountApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

const CONFIRM_WORD = 'SUPPRIMER';

type Step = 'idle' | 'warning' | 'confirm';

/**
 * Suppression de compte (mirror web DeleteAccountButton).
 *
 * Obligatoire pour les stores (Apple + Google). Confirmation en 2 étapes :
 * 1) avertissement, 2) saisie du mot « SUPPRIMER ». Puis purge serveur async,
 * signout et retour au Welcome non-connecté.
 */
export function DeleteAccountButton() {
  const [step, setStep] = useState<Step>('idle');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const signOut = useAuthStore((s) => s.signOut);

  const matches = confirmText.trim().toUpperCase() === CONFIRM_WORD;

  const close = () => {
    setStep('idle');
    setConfirmText('');
  };

  const onDelete = async () => {
    if (loading || !matches) return;
    setLoading(true);
    try {
      await accountApi.deleteAccount();
      await signOut();
      close();
      router.replace('/(onboarding)/welcome');
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : 'La suppression a échoué. Réessaie plus tard.';
      Alert.alert('Erreur', message);
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="destructive" onPress={() => setStep('warning')}>
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
            {step === 'warning' ? (
              <>
                <Text variant="h3" className="mb-2">
                  Supprimer ton compte ?
                </Text>
                <Text variant="body" className="mb-6">
                  Cette action est définitive et irréversible. Ton programme, ton suivi
                  et toutes tes données seront supprimés.
                </Text>
                <Button variant="destructive" onPress={() => setStep('confirm')}>
                  Continuer
                </Button>
                <Button variant="ghost" onPress={close} className="mt-3">
                  Annuler
                </Button>
              </>
            ) : (
              <>
                <Text variant="h3" className="mb-2">
                  Confirme la suppression
                </Text>
                <Text variant="body" className="mb-4">
                  Saisis « {CONFIRM_WORD} » pour confirmer la suppression définitive.
                </Text>
                <Input
                  value={confirmText}
                  onChangeText={setConfirmText}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  placeholder={CONFIRM_WORD}
                  accessibilityLabel="Saisir SUPPRIMER pour confirmer"
                />
                <Button
                  variant="destructive"
                  onPress={onDelete}
                  loading={loading}
                  disabled={!matches}
                >
                  Supprimer définitivement
                </Button>
                <Button variant="ghost" onPress={close} className="mt-3">
                  Annuler
                </Button>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
