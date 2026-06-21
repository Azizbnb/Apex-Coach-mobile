import { useState } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PainZonesPicker } from '@/components/bilan/PainZonesPicker';
import { colors } from '@/lib/constants';
import {
  BilanSchema,
  SKIP_REASON_CODES,
  type SkipReasonCode,
  type PainLocation,
  type BilanSubmitBody,
} from '@/lib/validations/bilan';

// ==========================================
// TYPES DE CONTEXTE (chargé par le modal au mount)
// ==========================================

export interface BilanCompletion {
  exercisesCompleted: number;
  exercisesTotal: number;
  rate: number; // 0-100
}

export interface BilanSkipSummary {
  exerciseName: string;
  count: number;
  sessions: number[];
  muscles: string[];
}

export interface BilanFormProps {
  weekNumber: number;
  completion: BilanCompletion;
  skippedExercises: BilanSkipSummary[];
  /** Plan actif — gate les signaux nutrition (coaching_pro). */
  planType?: string | null;
  /** Mode jeûne actif sur le profil → section 5 conditionnelle. */
  isFastingActive?: boolean;
  fastingLevel?: 'strict' | 'moderate' | 'light' | null;
  submitting?: boolean;
  onSubmit: (body: BilanSubmitBody) => void;
}

// ==========================================
// SOUS-COMPOSANTS
// ==========================================

const RATING_EMOJIS = ['😫', '😕', '😐', '🙂', '😄'];

function RatingSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <View className="mb-5">
      <Text variant="label" className="mb-2">
        {label}
      </Text>
      <View className="flex-row" accessibilityRole="radiogroup" accessibilityLabel={label}>
        {[1, 2, 3, 4, 5].map((rating) => {
          const selected = value === rating;
          return (
            <Pressable
              key={rating}
              onPress={() => onChange(rating)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${label} : ${rating} sur 5`}
              hitSlop={4}
              className={`flex-1 mr-2 py-3 rounded-xl border items-center ${
                selected
                  ? 'bg-apex-lime-500/15 border-apex-lime-500'
                  : 'bg-apex-black-800 border-apex-black-600'
              }`}
              style={rating === 5 ? { marginRight: 0 } : undefined}
            >
              <Text className="text-lg">{RATING_EMOJIS[rating - 1]}</Text>
              <Text
                variant="caption"
                style={{ color: selected ? colors.lime[400] : colors.black[400] }}
              >
                {rating}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const SKIP_REASON_LABELS: Record<SkipReasonCode, string> = {
  equipment: 'Pas le matériel',
  difficulty: 'Trop difficile',
  pain: 'Douleur / Inconfort',
  time: 'Manque de temps',
  other: 'Autre raison',
};

// ==========================================
// FORM
// ==========================================

export function BilanForm({
  weekNumber,
  completion,
  skippedExercises,
  planType,
  isFastingActive = false,
  fastingLevel,
  submitting = false,
  onSubmit,
}: BilanFormProps) {
  // Section 1 — ressenti
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [soreness, setSoreness] = useState<number | null>(null);
  const [motivation, setMotivation] = useState<number | null>(null);
  const [sleep, setSleep] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);

  // Section 2 — pain zones
  const [painZones, setPainZones] = useState<PainLocation[]>([]);
  const [painNote, setPainNote] = useState('');

  // Section 3 — poids (semaines paires)
  const isEvenWeek = weekNumber % 2 === 0;
  const [weight, setWeight] = useState('');

  // Section 4 — skip reasons
  const [skipReasons, setSkipReasons] = useState<Record<string, SkipReasonCode>>({});

  // Notes libres
  const [notes, setNotes] = useState('');

  // Signaux nutrition (Coaching Pro)
  const isPro = planType === 'coaching_pro';
  const [hunger, setHunger] = useState<number | null>(null);
  const [digestive, setDigestive] = useState<number | null>(null);
  const [mealSat, setMealSat] = useState<number | null>(null);

  // Section 5 — jeûne
  const [fastingDays, setFastingDays] = useState('');
  const [fastingDifficulty, setFastingDifficulty] = useState<number | null>(null);
  const [continueFasting, setContinueFasting] = useState<boolean | null>(null);

  const [error, setError] = useState<string | null>(null);

  const setSkipReason = (exerciseName: string, reason: SkipReasonCode) => {
    setSkipReasons((prev) => ({ ...prev, [exerciseName]: reason }));
  };

  const handleSubmit = () => {
    setError(null);

    const skip_reasons = Object.entries(skipReasons).map(([exerciseName, reason]) => ({
      exerciseName,
      reason,
    }));

    const weightNum = weight.trim() ? Number(weight.replace(',', '.')) : null;
    const fastingDaysNum = fastingDays.trim() ? Number(fastingDays) : undefined;

    const candidate = {
      week_number: weekNumber,
      completion_rate: completion.rate,
      difficulty_rating: difficulty ?? undefined,
      energy_level: energy ?? undefined,
      muscle_soreness: soreness ?? undefined,
      motivation_level: motivation ?? undefined,
      sleep_quality: sleep ?? undefined,
      stress_level: stress ?? undefined,
      ...(isEvenWeek && weightNum != null ? { weight_kg: weightNum } : {}),
      ...(painZones.length > 0 ? { pain_locations: painZones } : {}),
      ...(painNote.trim() ? { pain_or_discomfort: painNote.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(skip_reasons.length > 0 ? { skip_reasons } : {}),
      ...(isPro && hunger != null ? { hunger_level: hunger } : {}),
      ...(isPro && digestive != null ? { digestive_comfort: digestive } : {}),
      ...(isPro && mealSat != null ? { meal_satisfaction: mealSat } : {}),
    };

    const result = BilanSchema.safeParse(candidate);
    if (!result.success) {
      setError('Merci de renseigner au moins la difficulté et ton niveau d’énergie.');
      return;
    }

    // Champs jeûne ajoutés au body (hors FeedbackSchema, mirror du web).
    const body: BilanSubmitBody = {
      ...result.data,
      ...(isFastingActive && fastingDaysNum != null
        ? { fasting_days_count: fastingDaysNum }
        : {}),
      ...(isFastingActive && fastingDifficulty != null
        ? { fasting_difficulty: fastingDifficulty }
        : {}),
      ...(isFastingActive && continueFasting != null
        ? { continue_fasting: continueFasting }
        : {}),
    };

    onSubmit(body);
  };

  const fastingLevelLabel =
    fastingLevel === 'strict'
      ? 'Strict'
      : fastingLevel === 'moderate'
        ? 'Modéré'
        : fastingLevel === 'light'
          ? 'Léger'
          : null;

  return (
    <View>
      {/* En-tête + complétion */}
      <Card className="mb-4">
        <Text variant="h3" className="mb-1">
          Semaine {weekNumber}
        </Text>
        <Text variant="body" className="mb-3">
          Comment s’est passée ta semaine ?
        </Text>
        <View className="flex-row justify-between items-center mb-2">
          <Text variant="label">Taux de complétion</Text>
          <Text className="text-apex-lime-400 font-bold">{completion.rate}%</Text>
        </View>
        <ProgressBar progress={completion.rate / 100} />
        <Text variant="caption" className="mt-2">
          {completion.exercisesTotal > 0
            ? `${completion.exercisesCompleted} exercices complétés sur ${completion.exercisesTotal}`
            : 'Aucune séance enregistrée cette semaine'}
        </Text>
      </Card>

      {/* Section 1 — ressenti */}
      <Card className="mb-4">
        <Text variant="h3" className="mb-4">
          Ton ressenti
        </Text>
        <RatingSelector label="Difficulté" value={difficulty} onChange={setDifficulty} />
        <RatingSelector label="Énergie" value={energy} onChange={setEnergy} />
        <RatingSelector label="Courbatures" value={soreness} onChange={setSoreness} />
        <RatingSelector label="Motivation" value={motivation} onChange={setMotivation} />
        <RatingSelector label="Sommeil" value={sleep} onChange={setSleep} />
        <RatingSelector label="Stress" value={stress} onChange={setStress} />
      </Card>

      {/* Section 2 — pain zones */}
      <Card className="mb-4">
        <Text variant="h3" className="mb-1">
          Douleurs ou inconforts
        </Text>
        <Text variant="caption" className="mb-3">
          Sélectionne les zones concernées (optionnel)
        </Text>
        <PainZonesPicker value={painZones} onChange={setPainZones} />
        <View className="mt-3">
          <Input
            placeholder="Précise si besoin…"
            value={painNote}
            onChangeText={setPainNote}
            multiline
            maxLength={500}
          />
        </View>
      </Card>

      {/* Section 3 — poids (semaines paires) */}
      {isEvenWeek && (
        <Card className="mb-4">
          <Text variant="h3" className="mb-1">
            Ton poids
          </Text>
          <Text variant="caption" className="mb-3">
            Un point de pesée toutes les 2 semaines suffit.
          </Text>
          <Input
            label="Poids (kg)"
            placeholder="ex. 72,5"
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
          />
        </Card>
      )}

      {/* Section 4 — skip reasons */}
      {skippedExercises.length > 0 && (
        <Card className="mb-4">
          <Text variant="h3" className="mb-1">
            Exercices passés
          </Text>
          <Text variant="caption" className="mb-3">
            Pourquoi as-tu sauté ces exercices ?
          </Text>
          {skippedExercises.map((ex) => (
            <View key={ex.exerciseName} className="mb-4">
              <Text variant="label" className="mb-2 text-white">
                {ex.exerciseName}
              </Text>
              <View className="flex-row flex-wrap">
                {SKIP_REASON_CODES.map((code) => {
                  const selected = skipReasons[ex.exerciseName] === code;
                  return (
                    <Pressable
                      key={code}
                      onPress={() => setSkipReason(ex.exerciseName, code)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      hitSlop={4}
                      className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
                        selected
                          ? 'bg-apex-lime-500/15 border-apex-lime-500'
                          : 'bg-apex-black-800 border-apex-black-600'
                      }`}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: selected ? colors.lime[400] : colors.black[300],
                        }}
                      >
                        {SKIP_REASON_LABELS[code]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Signaux nutrition — Coaching Pro */}
      {isPro && (
        <Card className="mb-4">
          <Text variant="h3" className="mb-4">
            Nutrition
          </Text>
          <RatingSelector label="Niveau de faim" value={hunger} onChange={setHunger} />
          <RatingSelector
            label="Confort digestif"
            value={digestive}
            onChange={setDigestive}
          />
          <RatingSelector
            label="Satisfaction des repas"
            value={mealSat}
            onChange={setMealSat}
          />
        </Card>
      )}

      {/* Section 5 — jeûne (conditionnel) */}
      {isFastingActive && (
        <Card className="mb-4 border-l-4 border-l-apex-lime-500">
          <Text variant="h3" className="mb-1">
            ⏳ Feedback jeûne
            {fastingLevelLabel ? `  ·  ${fastingLevelLabel}` : ''}
          </Text>
          <Text variant="caption" className="mb-3">
            Comment s’est passé ton jeûne cette semaine ?
          </Text>
          <Input
            label="Jours de jeûne (0-7)"
            placeholder="ex. 5"
            keyboardType="number-pad"
            value={fastingDays}
            onChangeText={setFastingDays}
          />
          <RatingSelector
            label="Difficulté du jeûne"
            value={fastingDifficulty}
            onChange={setFastingDifficulty}
          />
          <Text variant="label" className="mb-2">
            Veux-tu continuer le jeûne ?
          </Text>
          <View className="flex-row">
            <Pressable
              onPress={() => setContinueFasting(true)}
              accessibilityRole="radio"
              accessibilityState={{ selected: continueFasting === true }}
              className={`flex-1 mr-2 py-3 rounded-xl border items-center ${
                continueFasting === true
                  ? 'bg-apex-lime-500/15 border-apex-lime-500'
                  : 'bg-apex-black-800 border-apex-black-600'
              }`}
            >
              <Text style={{ color: continueFasting === true ? colors.lime[400] : colors.black[300] }}>
                Continuer
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setContinueFasting(false)}
              accessibilityRole="radio"
              accessibilityState={{ selected: continueFasting === false }}
              className={`flex-1 py-3 rounded-xl border items-center ${
                continueFasting === false
                  ? 'bg-apex-error/15 border-apex-error'
                  : 'bg-apex-black-800 border-apex-black-600'
              }`}
            >
              <Text style={{ color: continueFasting === false ? colors.error : colors.black[300] }}>
                Arrêter
              </Text>
            </Pressable>
          </View>
        </Card>
      )}

      {/* Notes libres */}
      <Card className="mb-4">
        <Text variant="label" className="mb-2">
          Notes (optionnel)
        </Text>
        <TextInput
          placeholder="Un mot sur ta semaine…"
          placeholderTextColor={colors.black[500]}
          value={notes}
          onChangeText={setNotes}
          multiline
          maxLength={500}
          className="bg-apex-black-800 text-white text-base p-4 rounded-xl border border-apex-black-600"
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />
      </Card>

      {error && (
        <Text className="text-apex-error text-sm mb-3" style={{ color: colors.error }}>
          {error}
        </Text>
      )}

      <Button variant="primary" onPress={handleSubmit} loading={submitting}>
        Envoyer mon bilan
      </Button>
    </View>
  );
}
