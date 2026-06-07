import { categorizeFood } from '@/lib/nutrition/food-categories';

describe('lib/nutrition/food-categories', () => {
  it('classe les fruits & légumes (accents normalisés)', () => {
    expect(categorizeFood('Épinards frais')).toBe('Fruits & légumes');
    expect(categorizeFood('Pommes')).toBe('Fruits & légumes');
    expect(categorizeFood('Laitue')).toBe('Fruits & légumes');
  });

  it('classe viandes, poissons & œufs (ligature œ)', () => {
    expect(categorizeFood('Blanc de poulet')).toBe('Viandes, poissons & œufs');
    expect(categorizeFood('Œufs entiers')).toBe('Viandes, poissons & œufs');
    expect(categorizeFood('Saumon fumé')).toBe('Viandes, poissons & œufs');
  });

  it('classe les produits laitiers', () => {
    expect(categorizeFood('Yaourt grec')).toBe('Produits laitiers');
    expect(categorizeFood('Fromage blanc 0%')).toBe('Produits laitiers');
  });

  it('classe les féculents & céréales', () => {
    expect(categorizeFood('Riz basmati')).toBe('Féculents & céréales');
    expect(categorizeFood("Flocons d'avoine")).toBe('Féculents & céréales');
  });

  it('retombe sur Épicerie & autres par défaut', () => {
    expect(categorizeFood("Huile d'olive")).toBe('Épicerie & autres');
    expect(categorizeFood('Ingrédient mystère')).toBe('Épicerie & autres');
  });
});
