import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * Polling de l'état d'adaptation IA d'un bilan hebdomadaire.
 *
 * ⚠️ Vérifié contre le schéma réel (21/06/2026) : il n'existe AUCUNE colonne
 * `programs.adaptation_status` (le ticket S4-T02 se trompe). L'adaptation
 * hebdo (`POST /api/program/adapt`) est **synchrone** côté serveur et flippe
 * `program_feedback.suggestions_applied = true` (+ `applied_at`) une fois le
 * programme mis à jour. Pour les fins de cycle (semaine % 4 === 0), la route
 * renvoie `{ queued: true }` et un cron traite la génération en arrière-plan.
 *
 * On suit donc le **vrai** signal de complétion : `suggestions_applied` sur la
 * ligne `program_feedback` de la semaine concernée. Poll toutes les 5s, max 180s.
 *
 * Le hook ne déclenche PAS l'appel `/api/program/adapt` lui-même — il observe la
 * complétion. L'appelant lance l'adaptation puis active le polling via `enabled`.
 */

export type AdaptationStatus = 'idle' | 'polling' | 'done' | 'timeout' | 'error';

const POLL_INTERVAL_MS = 5_000;
const MAX_DURATION_MS = 180_000;

interface UsePollAdaptationParams {
  programId: string | null;
  weekNumber: number;
  /** Active le polling (typiquement après le POST /api/program/adapt). */
  enabled: boolean;
}

interface UsePollAdaptationResult {
  status: AdaptationStatus;
  isPolling: boolean;
  isDone: boolean;
  isTimeout: boolean;
  /** Relance le polling depuis zéro (après un timeout par ex.). */
  retry: () => void;
}

export function usePollAdaptation({
  programId,
  weekNumber,
  enabled,
}: UsePollAdaptationParams): UsePollAdaptationResult {
  const [status, setStatus] = useState<AdaptationStatus>('idle');
  // Incrémenté par retry() pour relancer l'effet de polling.
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setStatus('idle');
    setAttempt((a) => a + 1);
  }, []);

  // Garde la dernière valeur d'enabled sans relancer l'effet inutilement.
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (!enabled || !programId) {
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      intervalId = null;
      timeoutId = null;
    };

    const checkOnce = async () => {
      try {
        const { data, error } = await supabase
          .from('program_feedback')
          .select('suggestions_applied')
          .eq('program_id', programId)
          .eq('week_number', weekNumber)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          setStatus('error');
          cleanup();
          return;
        }

        if (data?.suggestions_applied === true) {
          setStatus('done');
          cleanup();
        }
      } catch {
        if (cancelled) return;
        setStatus('error');
        cleanup();
      }
    };

    setStatus('polling');
    // Premier check immédiat puis intervalle régulier.
    void checkOnce();
    intervalId = setInterval(() => void checkOnce(), POLL_INTERVAL_MS);
    timeoutId = setTimeout(() => {
      if (cancelled) return;
      setStatus((prev) => (prev === 'done' || prev === 'error' ? prev : 'timeout'));
      cleanup();
    }, MAX_DURATION_MS);

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [enabled, programId, weekNumber, attempt]);

  return {
    status,
    isPolling: status === 'polling',
    isDone: status === 'done',
    isTimeout: status === 'timeout',
    retry,
  };
}
