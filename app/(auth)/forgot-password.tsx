import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeView } from '@/components/ui/SafeView';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { colors } from '@/lib/constants';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuthStore();

  const handleSubmit = async () => {
    setError('');

    if (!email.trim()) {
      setError('Entre ton adresse email');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'envoi"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="px-6"
        >
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center mt-4 mb-8"
          >
            <ArrowLeft size={20} color={colors.lime[500]} />
            <Text className="text-apex-lime-500 ml-2 font-medium">Retour</Text>
          </Pressable>

          {sent ? (
            /* Success state */
            <View className="flex-1 items-center justify-center">
              <CheckCircle size={64} color={colors.success} />
              <Text className="text-2xl font-bold text-white mt-6 mb-2">
                Email envoyé !
              </Text>
              <Text className="text-apex-black-400 text-center mb-8">
                Un email de réinitialisation a été envoyé à{' '}
                <Text className="text-white font-medium">{email}</Text>.
                Vérifie ta boîte de réception.
              </Text>
              <Button
                variant="secondary"
                onPress={() => router.replace('/(auth)/login')}
              >
                Retour à la connexion
              </Button>
            </View>
          ) : (
            /* Form state */
            <View className="flex-1 justify-center">
              <Text className="text-2xl font-bold text-white mb-2">
                Mot de passe oublié
              </Text>
              <Text className="text-apex-black-400 mb-8">
                Entre ton email pour recevoir un lien de réinitialisation
              </Text>

              {error ? (
                <View className="bg-apex-error/10 border border-apex-error/30 rounded-xl p-3 mb-4">
                  <Text className="text-apex-error text-sm">{error}</Text>
                </View>
              ) : null}

              <Input
                label="Email"
                placeholder="ton@email.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                onSubmitEditing={handleSubmit}
              />

              <Button onPress={handleSubmit} loading={loading} className="mt-4">
                Envoyer le lien
              </Button>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeView>
  );
}
