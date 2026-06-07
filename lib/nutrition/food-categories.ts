/**
 * Catégorisation des aliments par rayon (liste de courses).
 *
 * Le type `Food` (partagé web) ne porte pas de catégorie : on la dérive côté
 * mobile par heuristique de mots-clés sur le nom, avec normalisation des accents.
 * Fonctions pures et testables.
 */

export type FoodCategory =
  | 'Fruits & légumes'
  | 'Viandes, poissons & œufs'
  | 'Produits laitiers'
  | 'Féculents & céréales'
  | 'Épicerie & autres';

/** Ordre d'affichage (parcours type d'un supermarché). */
export const FOOD_CATEGORY_ORDER: FoodCategory[] = [
  'Fruits & légumes',
  'Viandes, poissons & œufs',
  'Produits laitiers',
  'Féculents & céréales',
  'Épicerie & autres',
];

/** Catégorie par défaut quand aucun mot-clé ne correspond. */
const FALLBACK: FoodCategory = 'Épicerie & autres';

interface KeywordRule {
  category: FoodCategory;
  keywords: string[];
}

// Règles ordonnées (première correspondance gagne). L'ordre suit FOOD_CATEGORY_ORDER.
const KEYWORD_RULES: KeywordRule[] = [
  {
    category: 'Fruits & légumes',
    keywords: [
      'pomme', 'banane', 'orange', 'fraise', 'framboise', 'myrtille', 'raisin',
      'citron', 'avocat', 'mangue', 'ananas', 'kiwi', 'peche', 'poire',
      'tomate', 'salade', 'laitue', 'carotte', 'courgette', 'brocoli', 'chou',
      'epinard', 'poivron', 'oignon', 'concombre', 'haricot vert',
      'champignon', 'aubergine', 'patate douce', 'betterave', 'legume', 'fruit',
    ],
  },
  {
    category: 'Viandes, poissons & œufs',
    keywords: [
      'poulet', 'dinde', 'boeuf', 'veau', 'porc', 'agneau', 'jambon', 'steak',
      'escalope', 'saucisse', 'lardon', 'saumon', 'thon', 'cabillaud', 'colin',
      'merlu', 'crevette', 'poisson', 'oeuf', 'sardine', 'maquereau', 'viande',
    ],
  },
  {
    category: 'Produits laitiers',
    keywords: [
      'lait', 'yaourt', 'yogourt', 'skyr', 'fromage', 'mozzarella', 'feta',
      'beurre', 'creme', 'fromage blanc', 'cottage', 'ricotta', 'parmesan',
    ],
  },
  {
    category: 'Féculents & céréales',
    keywords: [
      'riz', 'pate', 'pates', 'pain', 'quinoa', 'avoine', 'flocon', 'semoule',
      'boulgour', 'patate', 'pomme de terre', 'lentille', 'pois chiche',
      'haricot rouge', 'haricot blanc', 'cereale', 'muesli', 'farine', 'tortilla',
    ],
  },
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Déduit la catégorie d'un aliment depuis son nom. */
export function categorizeFood(name: string): FoodCategory {
  const n = normalize(name);
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => n.includes(normalize(kw)))) {
      return rule.category;
    }
  }
  return FALLBACK;
}
