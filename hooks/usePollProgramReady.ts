import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { AdaptationStatus } from '@/hooks/usePollAdaptation';

/**
 * Polling de la disponibilité d'un programme régénéré (changement d'objectif).
 *
 * Après POST /api/user/change-objective, le serveur crée un nouveau programme en
 * statut `generating` ; un cron le passe à `completed`/`active` en ~2 min. On suit
 * ce signal sur `programs.status` pour la ligne `programId`. Poll toutes les 5s,
 * max 180s. Réutilise le type `AdaptationStatus` pour brancher AdaptationProgress.
 */

const POLL_INTERVAL_MS = 5_000;
const MAX_DURATION_MS = 180_000;
const READY_STATUSES = ['completed', 'active', 'ready'];

interface UsePollProgramReadyParams {
  programId: string | null;
  enabled: boolean;
}

interface UsePollProgramReadyResult {
  status: AdaptationStatus;
  retry: () => void;
}

export function usePollProgramReady({
  programId,
  enabled,
}: UsePollProgramReadyParams): UsePollProgramReadyResult {
  const [status, setStatus] = useState<AdaptationStatus>('idle');
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setStatus('idle');
    setAttempt((a) => a + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !programId) return;

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
          .from('programs')
          .select('status')
          .eq('id', programId)
          .maybeSingle();

        if (cancelled) return;
        if (error) {
          setStatus('error');
          cleanup();
          return;
        }
        if (data?.status && READY_STATUSES.includes(data.status)) {
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
  }, [enabled, programId, attempt]);

  return { status, retry };
}
