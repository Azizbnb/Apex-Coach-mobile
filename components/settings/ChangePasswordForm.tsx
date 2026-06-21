import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

/**
 * Changement de mot de passe (S4-T09).
 *
 * Flux :
 *  1. Re-authentification avec le mot de passe actuel
 *     (supabase.auth.signInWithPassword) → preuve d'identité.
 *  2. Mise à jour (supabase.auth.updateUser({ password })).
 *  3. Log d'audit RGPD côté serveur (POST /api/auth/log-password-change),
 *     best-effort — un échec de log ne bloque pas le changement.
 *  4. Toast de succès + reset des champs.
 */

const MIN_LENGTH = 8;

type Strength = 'faible' | 'moyen' | 'fort';

/** Indicateur de force simple (longueur + variété de caractères). */
function computeStrength(password: string): { label: Strength; score: number } {
  let score = 0;
  if (password.length >= MIN_LENGTH) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'faible', score };
  if (score <= 3) return { label: 'moyen', score };
  return { label: 'fort', score };
}

const STRENGTH_COLOR: Record<Strength, string> = {
  faible: 'text-apex-error',
  moyen: 'text-apex-warning',
  fort: 'text-apex-success',
};

export function ChangePasswordForm() {
  const userEmail = useAuthStore((s) => s.user?.email ?? null);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = computeStrength(next);

  const reset = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
    setError('');
  };

  const validate = (): string | null => {
    if (!current) return 'Saisis ton mot de passe actuel.';
    if (next.length < MIN_LENGTH) {
      return `Le nouveau mot de passe doit faire au moins ${MIN_LENGTH} caractères.`;
    }
    if (next === current) {
      return 'Le nouveau mot de passe doit être différent de l’actuel.';
    }
    if (next !== confirm) return 'Les mots de passe ne correspondent pas.';
    return null;
  };

  const onSubmit = async () => {
    if (loading) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!userEmail) {
      setError('Session expirée. Reconnecte-toi puis réessaie.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // 1. Re-authentification (vérifie le mot de passe actuel).
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: current,
      });
      if (signInError) {
        setError('Mot de passe actuel incorrect.');
        return;
      }

      // 2. Mise à jour du mot de passe.
      const { error: updateError } = await supabase.auth.updateUser({
        password: next,
      });
      if (updateError) {
        setError(updateError.message || 'La mise à jour a échoué.');
        return;
      }

      // 3. Log d'audit RGPD (best-effort).
      try {
        await apiFetch('/auth/log-password-change', { method: 'POST' });
      } catch {
        // Non-bloquant : le mot de passe est déjà changé.
      }

      // 4. Succès.
      reset();
      Alert.alert('Mot de passe modifié', 'Ton mot de passe a bien été mis à jour.');
    } catch {
      setError('Une erreur est survenue. Réessaie plus tard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-apex-black-800 rounded-2xl p-5 border border-apex-black-700">
      <Text variant="h3" className="mb-1">
        Changer de mot de passe
      </Text>
      <Text variant="caption" className="mb-4">
        Saisis ton mot de passe actuel puis le nouveau.
      </Text>

      <Input
        label="Mot de passe actuel"
        value={current}
        onChangeText={setCurrent}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        placeholder="Mot de passe actuel"
      />

      <Input
        label="Nouveau mot de passe"
        value={next}
        onChangeText={setNext}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        placeholder="Au moins 8 caractères"
      />

      {next.length > 0 && (
        <Text variant="caption" className={`-mt-2 mb-3 ${STRENGTH_COLOR[strength.label]}`}>
          Force : {strength.label}
        </Text>
      )}

      <Input
        label="Confirmer le nouveau mot de passe"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        placeholder="Confirme le mot de passe"
      />

      {error ? (
        <Text variant="caption" className="text-apex-error mb-2">
          {error}
        </Text>
      ) : null}

      <Button
        onPress={onSubmit}
        loading={loading}
        disabled={!current || !next || !confirm}
        className="mt-2"
      >
        Mettre à jour
      </Button>
    </View>
  );
}
