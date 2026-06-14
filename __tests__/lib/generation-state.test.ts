import { resolveNutritionState } from '@/lib/nutrition/generation-state';

describe('resolveNutritionState', () => {
  it('ready dès qu un plan existe (prioritaire)', () => {
    expect(resolveNutritionState(true, null)).toBe('ready');
    expect(
      resolveNutritionState(true, { status: 'generating', nutritionFailed: true })
    ).toBe('ready');
  });

  it('generating si le programme est en génération', () => {
    expect(
      resolveNutritionState(false, { status: 'generating', nutritionFailed: false })
    ).toBe('generating');
  });

  it('failed si la nutrition a échoué', () => {
    expect(
      resolveNutritionState(false, { status: 'completed', nutritionFailed: true })
    ).toBe('failed');
  });

  it('none sinon', () => {
    expect(resolveNutritionState(false, null)).toBe('none');
    expect(
      resolveNutritionState(false, { status: 'completed', nutritionFailed: false })
    ).toBe('none');
  });
});
