import { View } from 'react-native';
import { router } from 'expo-router';
import { SafeView } from '@/components/ui/SafeView';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { openWebUrl } from '@/lib/web-browser';

/**
 * Welcome non-connecté (modèle Netflix).
 *
 * Point d'entrée des utilisateurs non authentifiés. La création de compte se fait
 * sur le web (essai gratuit), jamais dans l'app — CTA via openWebUrl (home, UTM auto).
 * Aucun prix affiché.
 */
export default function WelcomeScreen() {
  return (
    <SafeView>
      <View className="flex-1 px-6 justify-center">
        {/* Marque */}
        <View className="items-center mb-12">
          <Text className="text-5xl font-bold text-apex-lime-500">APEX</Text>
          <Text className="text-xl text-white font-light tracking-widest">COACH</Text>
        </View>

        {/* Accroche */}
        <Text variant="h1" className="text-center mb-4">
          Ton coach sportif IA, dans ta poche
        </Text>
        <Text variant="body" className="text-center mb-12">
          Programme d’entraînement personnalisé, suivi de progression et nutrition sur mesure.
          Crée ton compte et démarre ton essai gratuit.
        </Text>

        {/* Actions */}
        <Button
          variant="primary"
          onPress={() => openWebUrl('/', { medium: 'app', campaign: 'welcome_signup' })}
        >
          Créer mon compte
        </Button>
        <Button
          variant="ghost"
          onPress={() => router.push('/(auth)/login')}
          className="mt-3"
        >
          J’ai déjà un compte
        </Button>
      </View>
    </SafeView>
  );
}
