/**
 * Formate une durée en secondes pour un affichage de chronomètre.
 *
 * - `< 1h`  → `MM:SS`     (ex. 90 → "01:30")
 * - `>= 1h` → `HH:MM:SS`  (ex. 3661 → "01:01:01")
 *
 * Les valeurs négatives, non finies ou décimales sont sécurisées
 * (ramenées à 0 ou tronquées à la seconde inférieure).
 */
export function formatStopwatch(totalSeconds: number): string {
  const safe =
    Number.isFinite(totalSeconds) && totalSeconds > 0
      ? Math.floor(totalSeconds)
      : 0;

  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Formate un temps de repos en libellé court et lisible.
 *
 * - `< 60s`        → `45s`
 * - `>= 60s` rond  → `2 min`
 * - `>= 60s` mixte → `1m30s`
 */
export function formatRest(seconds: number): string {
  const safe =
    Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  if (safe >= 60) {
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return s === 0 ? `${m} min` : `${m}m${s}s`;
  }
  return `${safe}s`;
}
