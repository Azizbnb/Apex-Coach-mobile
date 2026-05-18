import { useState, useEffect } from 'react';

export interface TrialCountdown {
  daysLeft: number;
  hoursLeft: number;
  label: string;
  isExpired: boolean;
}

export function computeCountdown(endDateISO: string | null | undefined): TrialCountdown {
  if (!endDateISO) {
    return { daysLeft: 0, hoursLeft: 0, label: 'Essai expiré', isExpired: true };
  }

  const diffMs = new Date(endDateISO).getTime() - Date.now();

  if (diffMs <= 0) {
    return { daysLeft: 0, hoursLeft: 0, label: 'Essai expiré', isExpired: true };
  }

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const daysLeft = Math.floor(totalHours / 24);
  const hoursLeft = totalHours % 24;

  let label: string;
  if (daysLeft === 0) {
    label = hoursLeft <= 1 ? 'Moins d\'1h restante' : `${hoursLeft}h restantes`;
  } else if (daysLeft === 1) {
    label = '1 jour restant';
  } else {
    label = `${daysLeft} jours restants`;
  }

  return { daysLeft, hoursLeft, label, isExpired: false };
}

/**
 * Compte à rebours vers une date de fin d'essai, mis à jour chaque minute.
 */
export function useTrialCountdown(endDateISO: string | null | undefined): TrialCountdown {
  const [countdown, setCountdown] = useState(() => computeCountdown(endDateISO));

  useEffect(() => {
    setCountdown(computeCountdown(endDateISO));

    const interval = setInterval(() => {
      setCountdown(computeCountdown(endDateISO));
    }, 60_000);

    return () => clearInterval(interval);
  }, [endDateISO]);

  return countdown;
}
