import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface UseExerciseVideoResult {
  videoUrl: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Récupère l'URL signée Supabase Storage pour la démo vidéo d'un exercice.
 * Chemin bucket : `exercise-demos/{slug}.mp4` (slug = nom normalisé en minuscules).
 * Retourne null si aucune vidéo n'est disponible pour cet exercice.
 */
export function useExerciseVideo(
  exerciseName: string | undefined,
  directUrl?: string
): UseExerciseVideoResult {
  const [videoUrl, setVideoUrl] = useState<string | null>(directUrl ?? null);
  const [loading, setLoading] = useState(!directUrl && !!exerciseName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // URL directe déjà fournie — pas besoin de fetcher
    if (directUrl) {
      setVideoUrl(directUrl);
      setLoading(false);
      return;
    }

    if (!exerciseName) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchSignedUrl() {
      setLoading(true);
      setError(null);

      try {
        const slug = exerciseName!
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        const { data, error: storageError } = await supabase.storage
          .from('exercise-demos')
          .createSignedUrl(`${slug}.mp4`, 3600);

        if (!cancelled) {
          if (storageError || !data?.signedUrl) {
            // Pas de vidéo dispo — pas une erreur critique
            setVideoUrl(null);
          } else {
            setVideoUrl(data.signedUrl);
          }
        }
      } catch {
        if (!cancelled) {
          setError('Impossible de charger la vidéo');
          setVideoUrl(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSignedUrl();
    return () => { cancelled = true; };
  }, [exerciseName, directUrl]);

  return { videoUrl, loading, error };
}
