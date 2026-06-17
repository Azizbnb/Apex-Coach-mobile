import { describe, it, expect } from '@jest/globals';
import { formatStopwatch } from '@/lib/workout/format-duration';

describe('formatStopwatch', () => {
  it('formate 0 en 00:00', () => {
    expect(formatStopwatch(0)).toBe('00:00');
  });

  it('formate les secondes seules avec padding', () => {
    expect(formatStopwatch(5)).toBe('00:05');
    expect(formatStopwatch(59)).toBe('00:59');
  });

  it('formate les minutes et secondes (MM:SS)', () => {
    expect(formatStopwatch(60)).toBe('01:00');
    expect(formatStopwatch(90)).toBe('01:30');
    expect(formatStopwatch(125)).toBe('02:05');
  });

  it('passe en HH:MM:SS au-delà d\'une heure', () => {
    expect(formatStopwatch(3600)).toBe('01:00:00');
    expect(formatStopwatch(3661)).toBe('01:01:01');
    expect(formatStopwatch(7325)).toBe('02:02:05');
  });

  it('tronque les décimales à la seconde inférieure', () => {
    expect(formatStopwatch(90.9)).toBe('01:30');
  });

  it('sécurise les valeurs négatives ou non finies à 00:00', () => {
    expect(formatStopwatch(-10)).toBe('00:00');
    expect(formatStopwatch(NaN)).toBe('00:00');
    expect(formatStopwatch(Infinity)).toBe('00:00');
  });
});
