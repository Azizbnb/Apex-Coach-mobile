/**
 * Compte à rebours d'abonnement (trial / promo).
 *
 * Fonction pure et testable (`now` injectable) — aucune dépendance au store.
 */

const MS_PER_DAY = 86_400_000;

/**
 * Nombre de jours restants (arrondi au supérieur) jusqu'à une date ISO.
 *
 * @returns null si la date est absente/invalide, 0 si déjà passée, sinon le nombre de jours.
 */
export function daysUntil(
  dateIso: string | null | undefined,
  now: Date = new Date()
): number | null {
  if (!dateIso) return null;
  const target = new Date(dateIso);
  if (Number.isNaN(target.getTime())) return null;
  const diffMs = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / MS_PER_DAY));
}
