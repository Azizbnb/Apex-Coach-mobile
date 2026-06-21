/**
 * Helpers purs de réordonnancement pour la liste d'exercices (drag-and-drop).
 *
 * Séparés du composant pour être testables sans monter de gesture/animation.
 * `moveItem` est le déplacement de référence ; le worklet du composant
 * `DraggableExerciseList` applique la même logique sur la map `id -> index`.
 */

/** Borne `value` dans l'intervalle [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

/**
 * Déplace l'élément à l'index `from` vers l'index `to` en décalant les
 * éléments intermédiaires (sémantique « splice », pas un simple swap).
 * Retourne un nouveau tableau ; l'entrée n'est pas mutée.
 */
export function moveItem<T>(array: readonly T[], from: number, to: number): T[] {
  const result = array.slice();
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= result.length ||
    to >= result.length
  ) {
    return result;
  }
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  return result;
}

/**
 * Construit la map `id -> index` à partir d'une liste ordonnée.
 * Utilisée comme état partagé (shared value) du drag.
 */
export function listToPositions(ids: readonly string[]): Record<string, number> {
  const positions: Record<string, number> = {};
  ids.forEach((id, index) => {
    positions[id] = index;
  });
  return positions;
}

/**
 * Applique un déplacement `from -> to` sur une map `id -> index`
 * (mêmes règles de décalage que `moveItem`). Marqué `worklet` pour
 * pouvoir être appelé depuis le thread UI de reanimated.
 */
export function positionsMove(
  positions: Record<string, number>,
  from: number,
  to: number
): Record<string, number> {
  'worklet';
  const next: Record<string, number> = {};
  for (const id in positions) {
    const pos = positions[id];
    if (pos === from) {
      next[id] = to;
    } else if (from < to && pos > from && pos <= to) {
      next[id] = pos - 1;
    } else if (from > to && pos >= to && pos < from) {
      next[id] = pos + 1;
    } else {
      next[id] = pos;
    }
  }
  return next;
}
