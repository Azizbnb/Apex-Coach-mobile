/**
 * Catalogue de compléments alimentaires avec liens affiliés par partenaire.
 * Les URLs sont les URLs brutes des produits (sans paramètre affilié).
 * Le paramètre affilié est ajouté dynamiquement par l'API track-click.
 */

export interface SupplementItem {
  name: string
  description: string
  links: Partial<Record<'myprotein' | 'iherb', string>>
}

export const SUPPLEMENT_CATALOG: Record<string, SupplementItem> = {
  proteine_whey: {
    name: 'Whey Protéine',
    description: 'Protéine de lactosérum pour la récupération musculaire',
    links: {
      myprotein: 'https://www.myprotein.com/fr/nutrition/proteines/impact-whey-protein.html',
      iherb: 'https://www.iherb.com/c/whey-protein',
    },
  },
  creatine: {
    name: 'Créatine Monohydrate',
    description: 'Pour améliorer la force et les performances',
    links: {
      myprotein: 'https://www.myprotein.com/fr/nutrition/creatine/creatine-monohydrate.html',
      iherb: 'https://www.iherb.com/c/creatine',
    },
  },
  omega3: {
    name: 'Oméga-3',
    description: 'Pour la santé cardiaque et la récupération',
    links: {
      myprotein: 'https://www.myprotein.com/fr/nutrition/vitamines/omega-3.html',
      iherb: 'https://www.iherb.com/c/omega-3',
    },
  },
  vitamine_d: {
    name: 'Vitamine D3',
    description: 'Essentielle pour les sportifs',
    links: {
      myprotein: 'https://www.myprotein.com/fr/nutrition/vitamines/vitamin-d3.html',
      iherb: 'https://www.iherb.com/c/vitamin-d',
    },
  },
  magnesium: {
    name: 'Magnésium',
    description: 'Pour réduire la fatigue musculaire',
    links: {
      myprotein: 'https://www.myprotein.com/fr/nutrition/vitamines/magnesium.html',
      iherb: 'https://www.iherb.com/c/magnesium',
    },
  },
  bcaa: {
    name: 'BCAA',
    description: 'Acides aminés essentiels pour la récupération',
    links: {
      myprotein: 'https://www.myprotein.com/fr/nutrition/acides-amines/bcaa.html',
    },
  },
  collagene: {
    name: 'Collagène',
    description: 'Pour les articulations et la récupération',
    links: {
      myprotein: 'https://www.myprotein.com/fr/nutrition/proteines/collagene.html',
      iherb: 'https://www.iherb.com/c/collagen',
    },
  },
  multivitamines: {
    name: 'Multivitamines',
    description: 'Complément quotidien essentiel',
    links: {
      myprotein: 'https://www.myprotein.com/fr/nutrition/vitamines/alpha-men-multivitamin.html',
      iherb: 'https://www.iherb.com/c/multivitamins',
    },
  },
}

/**
 * Recherche un supplément dans le catalogue par mots-clés.
 */
export function findSupplementByKeywords(keywords: string[]): Array<{ key: string } & SupplementItem> {
  const normalizedKeywords = keywords.map(k => k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))

  return Object.entries(SUPPLEMENT_CATALOG)
    .filter(([key, item]) => {
      const searchTarget = `${key} ${item.name} ${item.description}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      return normalizedKeywords.some(kw => searchTarget.includes(kw))
    })
    .map(([key, item]) => ({ key, ...item }))
}
