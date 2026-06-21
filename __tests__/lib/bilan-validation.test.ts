import {
  BilanSchema,
  SKIP_REASON_CODES,
  PAIN_LOCATIONS,
} from '@/lib/validations/bilan';

describe('BilanSchema (mirror FeedbackSchema web)', () => {
  const valid = {
    week_number: 2,
    completion_rate: 80,
    difficulty_rating: 3,
    energy_level: 4,
  };

  it('accepte un bilan minimal valide', () => {
    expect(BilanSchema.safeParse(valid).success).toBe(true);
  });

  it('rejette sans difficulté ni énergie (champs requis)', () => {
    expect(
      BilanSchema.safeParse({ week_number: 1, completion_rate: 50 }).success
    ).toBe(false);
  });

  it('borne week_number entre 1 et 52', () => {
    expect(BilanSchema.safeParse({ ...valid, week_number: 0 }).success).toBe(false);
    expect(BilanSchema.safeParse({ ...valid, week_number: 53 }).success).toBe(false);
  });

  it('borne les ratings entre 1 et 5', () => {
    expect(BilanSchema.safeParse({ ...valid, difficulty_rating: 6 }).success).toBe(
      false
    );
    expect(BilanSchema.safeParse({ ...valid, energy_level: 0 }).success).toBe(false);
  });

  it('borne weight_kg entre 30 et 300 et accepte null', () => {
    expect(BilanSchema.safeParse({ ...valid, weight_kg: 72.5 }).success).toBe(true);
    expect(BilanSchema.safeParse({ ...valid, weight_kg: null }).success).toBe(true);
    expect(BilanSchema.safeParse({ ...valid, weight_kg: 10 }).success).toBe(false);
  });

  it('valide pain_locations contre l’enum web', () => {
    expect(
      BilanSchema.safeParse({ ...valid, pain_locations: ['lower_back', 'knees'] })
        .success
    ).toBe(true);
    expect(
      BilanSchema.safeParse({ ...valid, pain_locations: ['foot'] }).success
    ).toBe(false);
  });

  it('valide skip_reasons (exerciseName + reason enum)', () => {
    expect(
      BilanSchema.safeParse({
        ...valid,
        skip_reasons: [{ exerciseName: 'Squat', reason: 'pain' }],
      }).success
    ).toBe(true);
    expect(
      BilanSchema.safeParse({
        ...valid,
        skip_reasons: [{ exerciseName: 'Squat', reason: 'lazy' }],
      }).success
    ).toBe(false);
  });

  it('expose les enums alignés web', () => {
    expect(SKIP_REASON_CODES).toEqual([
      'equipment',
      'difficulty',
      'pain',
      'time',
      'other',
    ]);
    expect(PAIN_LOCATIONS).toContain('lower_back');
    expect(PAIN_LOCATIONS).toContain('shoulders');
  });
});
