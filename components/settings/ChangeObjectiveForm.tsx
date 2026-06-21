import { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/lib/constants';
import { objectiveApi, ApiError, type ChangeObjectiveResult } from '@/lib/api';
import {
  ObjectiveEnum,
  getObjectiveDisplayName,
  getMuscleGainFocusDisplayName,
  SPORTS_LIST,
  getFilteredGoalsList,
} from '@/lib/validations/step2';
import type { z } from 'zod';

/**
 * Formulaire de changement d'objectif (S4-T07) — mirror web ChangeObjectiveDialog.
 *
 * Multi-étapes : warning (régénération ~2 min, une seule fois) → sélection objectif
 * (radio cards) + champs conditionnels → confirmation → POST /api/user/change-objective.
 *
 * Au succès, appelle `onSubmitted(newProgramId)` : le parent (modal) bascule sur
 * l'écran d'attente AdaptationProgress. Pas d'auto-navigation ici.
 */

type ObjectiveValue = z.infer<typeof ObjectiveEnum>;
type Step = 'warning' | 'select' | 'confirm';
type MuscleFocus = 'upper' | 'lower' | 'balanced';

interface ObjectiveOption {
  value: ObjectiveValue;
  label: string;
  description: string;
  icon: string;
}

// Inlined (lib/objectives.ts n'est pas porté côté mobile) — aligné sur le web.
const OBJECTIVE_OPTIONS: ObjectiveOption[] = [
  { value: 'weight_loss', label: 'Perdre du poids', description: 'Brûler les graisses et affiner ta silhouette', icon: '🔥' },
  { value: 'muscle_gain', label: 'Prendre du muscle', description: 'Développer ta masse musculaire', icon: '💪' },
  { value: 'sport_performance', label: 'Performance sportive', description: 'Améliorer tes performances dans ton sport', icon: '🏆' },
  { value: 'general_fitness', label: 'Remise en forme', description: 'Améliorer ta santé et ton bien-être général', icon: '❤️' },
  { value: 'event_preparation', label: 'Préparation événement', description: 'Te préparer pour une date ou compétition', icon: '🎯' },
];

interface FormState {
  primaryObjective: ObjectiveValue | null;
  targetWeightLoss: string;
  weightLossTimeframe: string;
  muscleGainFocus: MuscleFocus | '';
  sport: string;
  sportGoals: string[];
  eventDate: string;
}

const emptyForm: FormState = {
  primaryObjective: null,
  targetWeightLoss: '',
  weightLossTimeframe: '',
  muscleGainFocus: '',
  sport: '',
  sportGoals: [],
  eventDate: '',
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function buildPayload(form: FormState): Record<string, unknown> | null {
  if (!form.primaryObjective) return null;
  const payload: Record<string, unknown> = { primaryObjective: form.primaryObjective };
  if (form.primaryObjective === 'weight_loss') {
    const target = parseFloat(form.targetWeightLoss);
    const months = parseInt(form.weightLossTimeframe, 10);
    if (Number.isFinite(target)) payload.targetWeightLoss = target;
    if (Number.isFinite(months)) payload.weightLossTimeframe = months;
  }
  if (form.primaryObjective === 'muscle_gain' && form.muscleGainFocus) {
    payload.muscleGainFocus = form.muscleGainFocus;
  }
  if (form.primaryObjective === 'sport_performance') {
    if (form.sport) payload.sport = form.sport;
    if (form.sportGoals.length > 0) payload.sportGoals = form.sportGoals;
  }
  if (form.primaryObjective === 'event_preparation' && form.eventDate) {
    payload.eventDate = form.eventDate;
  }
  return payload;
}

function isFormValid(form: FormState, currentObjective: string): boolean {
  if (!form.primaryObjective) return false;
  if (form.primaryObjective === currentObjective) return false;
  switch (form.primaryObjective) {
    case 'weight_loss': {
      const target = parseFloat(form.targetWeightLoss);
      const months = parseInt(form.weightLossTimeframe, 10);
      return (
        Number.isFinite(target) && target >= 1 && target <= 30 &&
        Number.isFinite(months) && months >= 1 && months <= 12 &&
        target / months <= 5
      );
    }
    case 'muscle_gain':
      return !!form.muscleGainFocus;
    case 'sport_performance':
      return !!form.sport && form.sportGoals.length > 0;
    case 'event_preparation':
      return ISO_DATE_RE.test(form.eventDate) && new Date(form.eventDate).getTime() >= Date.now();
    case 'general_fitness':
      return true;
    default:
      return false;
  }
}

interface ChangeObjectiveFormProps {
  /** Objectif actuel (depuis le questionnaire) — désactive la carte correspondante. */
  currentObjective: string;
  /** Succès → newProgramId pour démarrer le polling d'adaptation. */
  onSubmitted: (result: ChangeObjectiveResult) => void;
  /** Annulation totale (ferme le modal). */
  onCancel: () => void;
}

export function ChangeObjectiveForm({
  currentObjective,
  onSubmitted,
  onCancel,
}: ChangeObjectiveFormProps) {
  const [step, setStep] = useState<Step>('warning');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (submitting) return;
    const payload = buildPayload(form);
    if (!payload) {
      setError('Sélection invalide.');
      setStep('select');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const result = await objectiveApi.change(payload);
      onSubmitted(result);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Erreur réseau, réessaie dans un instant.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --- Étape 1 : warning ---
  if (step === 'warning') {
    return (
      <ScrollView className="flex-1 px-5 py-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="flex-row items-center mb-4">
          <AlertTriangle size={22} color={colors.lime[500]} />
          <Text variant="h3" className="ml-2">
            Changement d’objectif
          </Text>
        </View>
        <Text variant="body" className="text-white font-medium mb-3">
          Les objectifs fitness s’atteignent avec de la constance.
        </Text>
        <Text variant="body" className="mb-3">
          Pas en changeant de cap chaque semaine. C’est pour cette raison que tu
          ne peux changer ton objectif principal qu’
          <Text className="text-apex-lime-500 font-semibold">une seule fois</Text>.
        </Text>
        <Text variant="body" className="mb-6">
          Si tu doutes, garde ton objectif actuel encore quelques semaines et
          observe ta progression — c’est souvent à ce moment que les résultats
          arrivent.
        </Text>
        <Button variant="primary" onPress={() => setStep('select')} className="mb-3">
          Continuer
        </Button>
        <Button variant="ghost" onPress={onCancel}>
          Garder mon objectif actuel
        </Button>
      </ScrollView>
    );
  }

  // --- Étape 3 : confirmation ---
  if (step === 'confirm') {
    return (
      <ScrollView className="flex-1 px-5 py-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text variant="h3" className="mb-4">
          Confirmer le changement
        </Text>
        <View className="bg-apex-black-800 rounded-xl p-4 border border-apex-black-700 mb-4">
          <Text variant="caption">Actuel</Text>
          <Text className="text-white mb-3">
            {getObjectiveDisplayName(currentObjective)}
          </Text>
          <Text variant="caption">Nouveau</Text>
          <Text className="text-apex-lime-500 font-semibold">
            {form.primaryObjective && getObjectiveDisplayName(form.primaryObjective)}
          </Text>
        </View>
        <Text variant="body" className="mb-6">
          Ton programme actuel sera archivé et un nouveau programme adapté sera
          généré (~2 min). Tu{' '}
          <Text className="text-white font-semibold">ne pourras plus changer</Text>{' '}
          d’objectif après cette confirmation.
        </Text>

        {error ? (
          <Text variant="caption" className="text-apex-error mb-3">
            {error}
          </Text>
        ) : null}

        <Button
          variant="primary"
          onPress={handleSubmit}
          loading={submitting}
          className="mb-3"
        >
          Je confirme — changer mon objectif
        </Button>
        {!submitting && (
          <Button variant="ghost" onPress={() => setStep('select')}>
            Modifier
          </Button>
        )}
      </ScrollView>
    );
  }

  // --- Étape 2 : sélection ---
  const filteredGoals = form.sport ? getFilteredGoalsList(form.sport) : [];

  return (
    <ScrollView className="flex-1 px-5 py-4" contentContainerStyle={{ paddingBottom: 32 }}>
      <Text variant="h3" className="mb-1">
        Choisis ton nouvel objectif
      </Text>
      <Text variant="caption" className="mb-4">
        Sélectionne ton objectif principal.
      </Text>

      {OBJECTIVE_OPTIONS.map((opt) => {
        const selected = form.primaryObjective === opt.value;
        const isCurrent = opt.value === currentObjective;
        return (
          <Pressable
            key={opt.value}
            disabled={isCurrent}
            onPress={() =>
              setForm((f) => ({ ...f, primaryObjective: opt.value }))
            }
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: isCurrent }}
            accessibilityLabel={opt.label}
            className={`mb-2 rounded-xl border p-3 ${
              isCurrent
                ? 'border-apex-black-700 bg-apex-black-900 opacity-40'
                : selected
                  ? 'border-apex-lime-500 bg-apex-lime-500/10'
                  : 'border-apex-black-700 bg-apex-black-900'
            }`}
          >
            <View className="flex-row items-center">
              <Text className="text-xl mr-3">{opt.icon}</Text>
              <View className="flex-1">
                <Text
                  className={`font-medium ${selected ? 'text-apex-lime-500' : 'text-white'}`}
                >
                  {opt.label}
                  {isCurrent ? '  (actuel)' : ''}
                </Text>
                <Text variant="caption" className="mt-0.5">
                  {opt.description}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}

      {/* Champs conditionnels */}
      {form.primaryObjective === 'weight_loss' && (
        <View className="mt-3 rounded-xl border border-apex-black-700 bg-apex-black-900 p-3">
          <Input
            label="Combien de kg veux-tu perdre ?"
            value={form.targetWeightLoss}
            onChangeText={(t) => setForm((f) => ({ ...f, targetWeightLoss: t }))}
            placeholder="ex : 8"
            keyboardType="numeric"
          />
          <Input
            label="Sur combien de mois ?"
            value={form.weightLossTimeframe}
            onChangeText={(t) => setForm((f) => ({ ...f, weightLossTimeframe: t }))}
            placeholder="ex : 4"
            keyboardType="numeric"
          />
          <Text variant="caption">Rythme conseillé : 2 à 4 kg/mois.</Text>
        </View>
      )}

      {form.primaryObjective === 'muscle_gain' && (
        <View className="mt-3 rounded-xl border border-apex-black-700 bg-apex-black-900 p-3">
          <Text variant="label" className="mb-2">
            Zone prioritaire
          </Text>
          {(['upper', 'lower', 'balanced'] as MuscleFocus[]).map((focus) => {
            const selected = form.muscleGainFocus === focus;
            return (
              <Pressable
                key={focus}
                onPress={() => setForm((f) => ({ ...f, muscleGainFocus: focus }))}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className={`mb-2 rounded-lg border px-3 py-2 ${
                  selected
                    ? 'border-apex-lime-500 bg-apex-lime-500/10'
                    : 'border-apex-black-700'
                }`}
              >
                <Text className={selected ? 'text-apex-lime-500' : 'text-white'}>
                  {getMuscleGainFocusDisplayName(focus)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {form.primaryObjective === 'sport_performance' && (
        <View className="mt-3 rounded-xl border border-apex-black-700 bg-apex-black-900 p-3">
          <Text variant="label" className="mb-2">
            Sport
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {SPORTS_LIST.map((s) => {
              const selected = form.sport === s.value;
              return (
                <Pressable
                  key={s.value}
                  onPress={() =>
                    setForm((f) => ({ ...f, sport: s.value, sportGoals: [] }))
                  }
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  className={`rounded-full border px-3 py-1.5 ${
                    selected
                      ? 'border-apex-lime-500 bg-apex-lime-500/10'
                      : 'border-apex-black-700'
                  }`}
                >
                  <Text
                    className={`text-sm ${selected ? 'text-apex-lime-500' : 'text-white'}`}
                  >
                    {s.icon} {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {form.sport ? (
            <>
              <Text variant="label" className="mb-2">
                Objectifs sportifs (max 4)
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {filteredGoals.map((g) => {
                  const selected = form.sportGoals.includes(g.value);
                  const disabled = !selected && form.sportGoals.length >= 4;
                  return (
                    <Pressable
                      key={g.value}
                      disabled={disabled}
                      onPress={() =>
                        setForm((f) => ({
                          ...f,
                          sportGoals: selected
                            ? f.sportGoals.filter((v) => v !== g.value)
                            : [...f.sportGoals, g.value],
                        }))
                      }
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected, disabled }}
                      className={`rounded-full border px-3 py-1.5 ${
                        selected
                          ? 'border-apex-lime-500 bg-apex-lime-500/10'
                          : disabled
                            ? 'border-apex-black-700 opacity-40'
                            : 'border-apex-black-700'
                      }`}
                    >
                      <Text
                        className={`text-sm ${selected ? 'text-apex-lime-500' : 'text-white'}`}
                      >
                        {g.icon} {g.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}
        </View>
      )}

      {form.primaryObjective === 'event_preparation' && (
        <View className="mt-3 rounded-xl border border-apex-black-700 bg-apex-black-900 p-3">
          <Input
            label="Date de ton événement (AAAA-MM-JJ)"
            value={form.eventDate}
            onChangeText={(t) => setForm((f) => ({ ...f, eventDate: t }))}
            placeholder="2026-09-15"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      )}

      <View className="flex-row gap-3 mt-6">
        <Button variant="ghost" onPress={() => setStep('warning')} className="flex-1">
          Retour
        </Button>
        <Button
          variant="primary"
          onPress={() => setStep('confirm')}
          disabled={!isFormValid(form, currentObjective)}
          className="flex-1"
        >
          Continuer
        </Button>
      </View>
    </ScrollView>
  );
}
