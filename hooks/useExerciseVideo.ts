import { useEffect, useState } from 'react';

import { exercisesApi } from '@/lib/api';
import type { ExerciseVideoData } from '@/types';

// Cache de session (vidé au reload de l'app) — mirror du web `use-exercise-video`.
const sessionCache = new Map<string, ExerciseVideoData | null>();

/**
 * Récupère paresseusement la démo vidéo d'un exercice (MuscleWiki).
 * Passer `null` comme nom pour ne rien charger (ex: modal fermé).
 *
 * Mirror de `lib/hooks/use-exercise-video.ts` (web), adapté à `exercisesApi`
 * + annulation via flag local (pas d'AbortController sur apiFetch).
 */
export function useExerciseVideo(exerciseName: string | null) {
  const [video, setVideo] = useState<ExerciseVideoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!exerciseName) {
      setVideo(null);
      setIsLoading(false);
      setError(false);
      return;
    }

    const key = exerciseName.toLowerCase();

    if (sessionCache.has(key)) {
      setVideo(sessionCache.get(key) ?? null);
      setIsLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(false);

    exercisesApi
      .getVideo(exerciseName)
      .then((data) => {
        sessionCache.set(key, data);
        if (cancelled) return;
        setVideo(data);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setVideo(null);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [exerciseName]);

  return { video, isLoading, error };
}
