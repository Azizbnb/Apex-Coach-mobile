import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import type { UserProfile } from '@/types';

/**
 * Section statistiques (S4-T06) — lecture seule.
 *
 * Affiche taille, poids, IMC (calculé), âge et sexe issus du profil / questionnaire.
 * Si AUCUNE donnée n'est disponible, le composant ne rend rien (masquage propre).
 */

interface ProfileStatsProps {
  profile: UserProfile | null;
}

const GENDER_LABELS: Record<NonNullable<UserProfile['gender']>, string> = {
  male: 'Homme',
  female: 'Femme',
  other: 'Autre',
};

/** IMC = poids(kg) / taille(m)². Renvoie null si données invalides. */
function computeBmi(weightKg?: number, heightCm?: number): number | null {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (!Number.isFinite(bmi)) return null;
  return Math.round(bmi * 10) / 10;
}

interface StatItem {
  label: string;
  value: string;
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  if (!profile) return null;

  const bmi = computeBmi(profile.weight, profile.height);

  const items: StatItem[] = [];
  if (profile.height) items.push({ label: 'Taille', value: `${profile.height} cm` });
  if (profile.weight) items.push({ label: 'Poids', value: `${profile.weight} kg` });
  if (bmi !== null) items.push({ label: 'IMC', value: `${bmi}` });
  if (profile.age) items.push({ label: 'Âge', value: `${profile.age} ans` });
  if (profile.gender && GENDER_LABELS[profile.gender]) {
    items.push({ label: 'Sexe', value: GENDER_LABELS[profile.gender] });
  }

  if (items.length === 0) return null;

  return (
    <View>
      <Text className="text-apex-black-400 text-sm font-medium mb-3">
        Mes mesures
      </Text>
      <View className="bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700 flex-row flex-wrap">
        {items.map((item) => (
          <View key={item.label} className="w-1/3 py-2">
            <Text className="text-apex-black-400 text-xs">{item.label}</Text>
            <Text className="text-white text-base font-semibold mt-0.5">
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
