import { useCallback, useEffect, useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Star, MessageSquarePlus } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/lib/constants';
import { reviewsApi } from '@/lib/api';
import type { Review, ReviewStatus } from '@/types';

/**
 * Section avis du profil (S4-T13).
 *
 * - Aucun avis → carte "Donne ton avis" qui ouvre le modal leave-review.
 * - Avis existant → affichage read-only (étoiles + texte + date + statut modération)
 *   avec un bouton "Modifier" (recrée un avis via le modal — pas de PATCH côté web).
 *
 * Re-fetch au focus pour refléter un avis tout juste soumis.
 */

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: 'En attente de modération',
  approved: 'Publié',
  rejected: 'Non retenu',
};

const STATUS_VARIANT: Record<ReviewStatus, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function ReviewSection() {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const mine = await reviewsApi.getMine();
      setReview(mine);
    } catch {
      // Erreur non bloquante : on retombe sur l'état "aucun avis".
      setReview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Rafraîchit quand on revient du modal leave-review.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const openLeaveReview = () => {
    router.push('/(modals)/leave-review');
  };

  return (
    <View>
      <Text className="text-apex-black-400 text-sm font-medium mb-3">
        Mon avis
      </Text>

      {loading ? (
        <View className="bg-apex-black-800 rounded-2xl p-5 border border-apex-black-700 items-center">
          <ActivityIndicator color={colors.lime[500]} />
        </View>
      ) : review ? (
        <View className="bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700">
          <View className="flex-row items-center justify-between mb-2">
            <StarRating rating={review.rating} size={20} />
            <Badge
              label={STATUS_LABEL[review.status]}
              variant={STATUS_VARIANT[review.status]}
            />
          </View>
          <Text className="text-white" variant="body">
            {review.comment}
          </Text>
          {review.tags?.length ? (
            <View className="flex-row flex-wrap gap-2 mt-3">
              {review.tags.map((tag) => (
                <View
                  key={tag}
                  className="rounded-full bg-apex-black-900 px-3 py-1 border border-apex-black-700"
                >
                  <Text className="text-apex-black-400 text-xs">{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <Text variant="caption" className="mt-3">
            {formatDate(review.created_at)}
          </Text>
          <Pressable
            onPress={openLeaveReview}
            accessibilityRole="button"
            accessibilityLabel="Modifier mon avis"
            className="mt-3 self-start"
          >
            <Text className="text-apex-lime-500 font-medium">Modifier</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={openLeaveReview}
          accessibilityRole="button"
          accessibilityLabel="Donne ton avis"
          className="bg-apex-black-800 rounded-2xl p-4 border border-apex-black-700 flex-row items-center"
        >
          <View className="w-10 h-10 rounded-full bg-apex-lime-500/15 items-center justify-center">
            <MessageSquarePlus size={20} color={colors.lime[500]} />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-white font-medium">Donne ton avis</Text>
            <Text variant="caption" className="mt-0.5">
              Partage ton expérience avec Apex Coach.
            </Text>
          </View>
          <Star size={18} color={colors.lime[500]} />
        </Pressable>
      )}
    </View>
  );
}
