import { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { X, CheckCircle2 } from 'lucide-react-native';
import { SafeView } from '@/components/ui/SafeView';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { colors } from '@/lib/constants';
import { reviewsApi, ApiError } from '@/lib/api';
import { CreateReviewSchema } from '@/lib/validations/review';
import type { ReviewTag } from '@/types';

/**
 * Modal "Laisser un avis" (S4-T13).
 *
 * StarRating (1-5) + commentaire (10-1000, garde-fou 300 visuel demandé mais le
 * schéma web autorise 1000 — on borne l'input à 1000 et on affiche un compteur) +
 * tags (1-3 parmi /api/reviews/tags) → POST /api/reviews/create.
 *
 * Validation locale via CreateReviewSchema (copié du web) avant l'appel.
 */

const COMMENT_MAX = 1000;
const COMMENT_MIN = 10;

export default function LeaveReviewModal() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<ReviewTag[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await reviewsApi.getTags();
        if (!cancelled) setAvailableTags(list);
      } catch {
        if (!cancelled) setAvailableTags([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/profile');
  };

  const toggleTag = (tagName: string) => {
    setError('');
    setTags((current) =>
      current.includes(tagName)
        ? current.filter((t) => t !== tagName)
        : current.length >= 3
          ? current
          : [...current, tagName]
    );
  };

  const submit = async () => {
    if (submitting) return;
    const parsed = CreateReviewSchema.safeParse({ rating, comment, tags });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Avis invalide.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await reviewsApi.create({
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        tags: parsed.data.tags,
        source: 'organic',
      });
      setDone(true);
      setTimeout(close, 1500);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "L'envoi a échoué. Réessaie plus tard."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <SafeView>
        <View className="flex-1 items-center justify-center px-8">
          <CheckCircle2 size={64} color={colors.success} />
          <Text variant="h2" className="text-center mt-5 mb-2">
            Merci !
          </Text>
          <Text variant="body" className="text-center">
            Ton avis a bien été envoyé. Il sera publié après modération.
          </Text>
        </View>
      </SafeView>
    );
  }

  return (
    <SafeView>
      <Pressable
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel="Fermer"
        className="self-end p-4"
      >
        <X size={24} color={colors.black[400]} />
      </Pressable>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="h2" className="mb-1">
          Ton avis
        </Text>
        <Text variant="caption" className="mb-5">
          Partage honnêtement ton expérience — ça aide les autres à se lancer.
        </Text>

        <Text variant="label" className="mb-2">
          Ta note
        </Text>
        <StarRating
          rating={rating}
          size={36}
          onRate={(r) => {
            setError('');
            setRating(r);
          }}
          className="mb-5"
        />

        <Text variant="label" className="mb-2">
          Ton commentaire
        </Text>
        <TextInput
          value={comment}
          onChangeText={(t) => {
            setError('');
            setComment(t);
          }}
          placeholder="Qu'as-tu pensé de ton programme, des résultats, du coaching ?"
          placeholderTextColor={colors.black[400]}
          multiline
          maxLength={COMMENT_MAX}
          textAlignVertical="top"
          className="bg-apex-black-800 border border-apex-black-700 rounded-xl p-3 text-white min-h-[120px]"
          accessibilityLabel="Ton commentaire"
        />
        <Text variant="caption" className="mt-1 text-right">
          {comment.trim().length}/{COMMENT_MAX}
          {comment.trim().length < COMMENT_MIN ? ` (min ${COMMENT_MIN})` : ''}
        </Text>

        {availableTags.length > 0 && (
          <View className="mt-4">
            <Text variant="label" className="mb-2">
              Tags (1 à 3)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {availableTags.map((tag) => {
                const selected = tags.includes(tag.tag_name);
                const disabled = !selected && tags.length >= 3;
                return (
                  <Pressable
                    key={tag.id}
                    onPress={() => toggleTag(tag.tag_name)}
                    disabled={disabled}
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
                      {tag.icon} {tag.tag_name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {error ? (
          <Text variant="caption" className="text-apex-error mt-4">
            {error}
          </Text>
        ) : null}

        <Button
          variant="primary"
          onPress={submit}
          loading={submitting}
          className="mt-6"
        >
          Envoyer mon avis
        </Button>
      </ScrollView>
    </SafeView>
  );
}
