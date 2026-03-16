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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, loading } = useAuthStore();

  const handleLogin = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email et mot de passe requis');
      return;
    }

    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)/programme');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erreur de connexion';
      if (message.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect');
      } else {
        setError(message);
      }
    }
  };

  return (
    <SafeView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          className="px-6"
        >
          {/* Logo / Brand */}
          <View className="items-center mb-12">
            <Text className="text-4xl font-bold text-apex-lime-500">
              APEX
            </Text>
            <Text className="text-lg text-white font-light tracking-widest">
              COACH
            </Text>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-white mb-2">
            Connexion
          </Text>
          <Text className="text-apex-black-400 mb-8">
            Connecte-toi pour accéder à ton programme
          </Text>

          {/* Error message */}
          {error ? (
            <View className="bg-apex-error/10 border border-apex-error/30 rounded-xl p-3 mb-4">
              <Text className="text-apex-error text-sm">{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <Input
            label="Email"
            placeholder="ton@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />

          <Input
            label="Mot de passe"
            placeholder="Ton mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            onSubmitEditing={handleLogin}
          />

          {/* Forgot password link */}
          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            className="self-end mb-6"
          >
            <Text className="text-apex-lime-500 text-sm font-medium">
              Mot de passe oublié ?
            </Text>
          </Pressable>

          {/* Login button */}
          <Button onPress={handleLogin} loading={loading}>
            Se connecter
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeView>
  );
}
