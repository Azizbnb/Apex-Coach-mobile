import { describe, it, expect } from '@jest/globals';
import {
  clamp,
  moveItem,
  listToPositions,
  positionsMove,
} from '@/lib/workout/reorder';

describe('clamp', () => {
  it('borne dans l\'intervalle', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });
});

describe('moveItem', () => {
  const base = ['a', 'b', 'c', 'd'];

  it('déplace vers le bas en décalant les intermédiaires', () => {
    expect(moveItem(base, 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('déplace vers le haut en décalant les intermédiaires', () => {
    expect(moveItem(base, 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('ne mute pas le tableau source', () => {
    moveItem(base, 0, 3);
    expect(base).toEqual(['a', 'b', 'c', 'd']);
  });

  it('retourne une copie inchangée si from === to ou indices invalides', () => {
    expect(moveItem(base, 1, 1)).toEqual(base);
    expect(moveItem(base, -1, 2)).toEqual(base);
    expect(moveItem(base, 0, 9)).toEqual(base);
  });
});

describe('listToPositions', () => {
  it('construit la map id -> index', () => {
    expect(listToPositions(['x', 'y', 'z'])).toEqual({ x: 0, y: 1, z: 2 });
  });
});

describe('positionsMove', () => {
  // positionsMove doit rester cohérent avec moveItem sur l'ordre résultant.
  function orderFromPositions(map: Record<string, number>): string[] {
    return Object.keys(map).sort((a, b) => map[a] - map[b]);
  }

  it('réordonne comme moveItem (descente)', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const moved = positionsMove(listToPositions(ids), 0, 2);
    expect(orderFromPositions(moved)).toEqual(moveItem(ids, 0, 2));
  });

  it('réordonne comme moveItem (montée)', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const moved = positionsMove(listToPositions(ids), 3, 1);
    expect(orderFromPositions(moved)).toEqual(moveItem(ids, 3, 1));
  });

  it('laisse la map inchangée si from === to', () => {
    const map = listToPositions(['a', 'b', 'c']);
    expect(positionsMove(map, 1, 1)).toEqual(map);
  });
});
