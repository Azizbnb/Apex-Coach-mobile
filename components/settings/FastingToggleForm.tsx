import { useState } from 'react';
import { View, Pressable, Switch } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/lib/constants';
import { apiFetch, ApiError } from '@/lib/api';
import { useSettingsStore } from '@/stores/settings';
import {
  FASTING_LEVEL_LABELS,
  FASTING_LEVEL_DESCRIPTIONS,
  formatFastingPeriod,
  type FastingLevel,
} from '@/lib/fasting/date-calculation';

/**
 * Formulaire mode jeûne (S4-T08) — mirror web.
 *
 * Toggle ON/OFF ; si ON → niveau (strict/modéré/souple) + dates de début/fin.
 * Persiste via PATCH /api/profile/fasting avec le body exact attendu par
 * `FastingModeSchema` côté web :
 *   { is_fasting_mode, fasting_level, fasting_start_date,
 *     fasting_end_date, fasting_notes }
 *
 * Le serveur renvoie { success: true, data: <profil mis à jour> } : on
 * applique ce retour au store pour rester synchronisé.
 */

const LEVELS: FastingLevel[] = ['strict', 'moderate', 'light'];
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DURATION_DAYS = 50;

interface FastingPatchResponse {
  success: boolean;
  data?: {
    is_fasting_mode?: boolean;
    fasting_level?: FastingLevel | null;
    fasting_start_date?: string | null;
    fasting_end_date?: string | null;
    fasting_notes?: string | null;
  };
}

export function FastingToggleForm() {
  const fastingEnabled = useSettingsStore((s) => s.fastingEnabled);
  const fasting = useSettingsStore((s) => s.fasting);
  const toggleFasting = useSettingsStore((s) => s.toggleFasting);
  const setFastingConfig = useSettingsStore((s) => s.setFastingConfig);
  const applyFastingFromServer = useSettingsStore((s) => s.applyFastingFromServer);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = (): string | null => {
    if (!fastingEnabled) return null;
    if (!fasting.level) return 'Choisis un niveau de jeûne.';
    if (!fasting.startDate || !ISO_DATE_RE.test(fasting.startDate)) {
      return 'Date de début invalide (format AAAA-MM-JJ).';
    }
    if (!fasting.endDate || !ISO_DATE_RE.test(fasting.endDate)) {
      return 'Date de fin invalide (format AAAA-MM-JJ).';
    }
    const start = new Date(fasting.startDate);
    const end = new Date(fasting.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 'Dates invalides.';
    }
    if (end <= start) return 'La date de fin doit être après la date de début.';
    const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (days > MAX_DURATION_DAYS) {
      return 'La période de jeûne ne peut pas dépasser 50 jours.';
    }
    if (fasting.notes && fasting.notes.length > 500) {
      return 'Les notes ne peuvent pas dépasser 500 caractères.';
    }
    return null;
  };

  const onSave = async () => {
    if (saving) return;
    setSuccess(false);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSaving(true);
    try {
      const body = {
        is_fasting_mode: fastingEnabled,
        fasting_level: fastingEnabled ? fasting.level : null,
        fasting_start_date: fastingEnabled ? fasting.startDate : null,
        fasting_end_date: fastingEnabled ? fasting.endDate : null,
        fasting_notes: fasting.notes ?? null,
      };
      const res = await apiFetch<FastingPatchResponse>('/profile/fasting', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      if (res?.data) {
        applyFastingFromServer(res.data);
      }
      setSuccess(true);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : 'La mise à jour a échoué. Réessaie plus tard.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="bg-apex-black-800 rounded-2xl p-5 border border-apex-black-700">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text variant="h3">Mode jeûne</Text>
          <Text variant="caption" className="mt-1">
            Adapte ton programme pendant une période de jeûne (Ramadan, Carême,
            jeûne intermittent…).
          </Text>
        </View>
        <Switch
          value={fastingEnabled}
          onValueChange={(v) => {
            setSuccess(false);
            setError('');
            toggleFasting(v);
          }}
          trackColor={{ false: colors.black[700], true: colors.lime[500] }}
          thumbColor="#FFFFFF"
          accessibilityLabel="Activer le mode jeûne"
        />
      </View>

      {fastingEnabled && (
        <View className="mt-5">
          <Text variant="label" className="mb-2">
            Niveau de jeûne
          </Text>
          {LEVELS.map((level) => {
            const selected = fasting.level === level;
            return (
              <Pressable
                key={level}
                onPress={() => {
                  setSuccess(false);
                  setFastingConfig({ level });
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={FASTING_LEVEL_LABELS[level]}
                className={`mb-2 rounded-xl border p-3 ${
                  selected
                    ? 'border-apex-lime-500 bg-apex-lime-500/10'
                    : 'border-apex-black-700 bg-apex-black-900'
                }`}
              >
                <Text
                  variant="body"
                  className={selected ? 'text-apex-lime-500 font-semibold' : ''}
                >
                  {FASTING_LEVEL_LABELS[level]}
                </Text>
                <Text variant="caption" className="mt-0.5">
                  {FASTING_LEVEL_DESCRIPTIONS[level]}
                </Text>
              </Pressable>
            );
          })}

          <View className="mt-3">
            <Input
              label="Date de début (AAAA-MM-JJ)"
              value={fasting.startDate ?? ''}
              onChangeText={(t) => {
                setSuccess(false);
                setFastingConfig({ startDate: t });
              }}
              placeholder="2026-03-01"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numbers-and-punctuation"
            />
            <Input
              label="Date de fin (AAAA-MM-JJ)"
              value={fasting.endDate ?? ''}
              onChangeText={(t) => {
                setSuccess(false);
                setFastingConfig({ endDate: t });
              }}
              placeholder="2026-03-30"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numbers-and-punctuation"
            />
            <Input
              label="Notes (optionnel)"
              value={fasting.notes ?? ''}
              onChangeText={(t) => {
                setSuccess(false);
                setFastingConfig({ notes: t });
              }}
              placeholder="Ex : pas d'eau avant le coucher du soleil"
              maxLength={500}
            />
          </View>

          {fasting.startDate &&
            fasting.endDate &&
            ISO_DATE_RE.test(fasting.startDate) &&
            ISO_DATE_RE.test(fasting.endDate) && (
              <Text variant="caption" className="mb-2">
                Période : {formatFastingPeriod(fasting.startDate, fasting.endDate)}
              </Text>
            )}
        </View>
      )}

      {error ? (
        <Text variant="caption" className="text-apex-error mt-2">
          {error}
        </Text>
      ) : null}
      {success ? (
        <Text variant="caption" className="text-apex-success mt-2">
          Préférences de jeûne enregistrées.
        </Text>
      ) : null}

      <Button onPress={onSave} loading={saving} className="mt-4">
        Enregistrer
      </Button>
    </View>
  );
}
