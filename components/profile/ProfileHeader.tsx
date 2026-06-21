import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Pencil, Check, X } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/lib/constants';
import { profileApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { PlanType } from '@/types';

/**
 * En-tête du profil (S4-T06).
 *
 * - Avatar = initiales dérivées du nom (ou de l'email en repli).
 * - Nom éditable en inline → PATCH /api/profile/name (profileApi.updateName).
 *   Validation locale alignée sur NameUpdateSchema (2-100 caractères).
 * - Badge plan : Coaching Pro / Coaching / Essai / Gratuit.
 */

interface ProfileHeaderProps {
  name: string;
  email: string;
  planId: PlanType | null;
  isTrial: boolean;
}

/** Libellé + variante du badge selon le plan / statut. */
function planBadge(
  planId: PlanType | null,
  isTrial: boolean
): { label: string; variant: 'premium' | 'default' | 'success' } {
  if (isTrial) return { label: 'Essai gratuit', variant: 'success' };
  if (planId === 'coaching_pro') return { label: 'Coaching Pro', variant: 'premium' };
  if (planId === 'coaching') return { label: 'Coaching', variant: 'default' };
  return { label: 'Gratuit', variant: 'default' };
}

/** Initiales à partir du nom (max 2 lettres), repli sur l'email. */
function getInitials(name: string, email: string): string {
  const source = name.trim() || email.trim();
  if (!source) return '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

const NAME_RE = /^[a-zA-ZÀ-ÿ\s\-']+$/;

export function ProfileHeader({ name, email, planId, isTrial }: ProfileHeaderProps) {
  const setProfileName = useAuthStore((s) => s.setProfileName);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const displayName = name || email || 'Utilisateur';
  const initials = getInitials(name, email);
  const badge = planBadge(planId, isTrial);

  const startEdit = () => {
    setDraft(name);
    setError('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError('');
  };

  const validate = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length < 2) return 'Le nom doit contenir au moins 2 caractères.';
    if (trimmed.length > 100) return 'Le nom ne peut pas dépasser 100 caractères.';
    if (!NAME_RE.test(trimmed)) {
      return 'Lettres, espaces, tirets et apostrophes uniquement.';
    }
    return null;
  };

  const save = async () => {
    if (saving) return;
    const validationError = validate(draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSaving(true);
    try {
      const saved = await profileApi.updateName(draft);
      setProfileName(saved);
      setEditing(false);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'La mise à jour a échoué. Réessaie.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="bg-apex-black-800 rounded-2xl p-5 border border-apex-black-700">
      <View className="flex-row items-center">
        <View className="w-16 h-16 rounded-full bg-apex-lime-500/15 items-center justify-center">
          <Text className="text-apex-lime-500 text-xl font-bold">{initials}</Text>
        </View>

        <View className="flex-1 ml-4">
          {editing ? (
            <View>
              <Input
                value={draft}
                onChangeText={setDraft}
                placeholder="Ton nom"
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={100}
                accessibilityLabel="Modifier ton nom"
              />
              <View className="flex-row gap-2 mt-1">
                <Pressable
                  onPress={save}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityLabel="Enregistrer le nom"
                  className="flex-row items-center px-3 py-2 rounded-lg bg-apex-lime-500/15"
                >
                  <Check size={16} color={colors.lime[500]} />
                  <Text className="text-apex-lime-500 ml-1.5 text-sm font-medium">
                    Enregistrer
                  </Text>
                </Pressable>
                <Pressable
                  onPress={cancelEdit}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityLabel="Annuler"
                  className="flex-row items-center px-3 py-2 rounded-lg bg-apex-black-900"
                >
                  <X size={16} color={colors.black[400]} />
                  <Text className="text-apex-black-400 ml-1.5 text-sm">Annuler</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={startEdit}
              accessibilityRole="button"
              accessibilityLabel="Modifier ton nom"
              className="flex-row items-center"
            >
              <Text className="text-white font-semibold text-lg" numberOfLines={1}>
                {displayName}
              </Text>
              <View className="ml-2">
                <Pencil size={16} color={colors.black[400]} />
              </View>
            </Pressable>
          )}

          {!editing && (
            <Text className="text-apex-black-400 mt-0.5" numberOfLines={1}>
              {email}
            </Text>
          )}
        </View>
      </View>

      {error ? (
        <Text variant="caption" className="text-apex-error mt-2">
          {error}
        </Text>
      ) : null}

      <View className="mt-4">
        <Badge label={badge.label} variant={badge.variant} />
      </View>
    </View>
  );
}
