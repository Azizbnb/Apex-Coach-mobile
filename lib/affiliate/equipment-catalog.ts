/**
 * Catalogue d'équipements fitness avec liens affiliés par partenaire.
 * Les URLs sont les URLs brutes des produits (sans paramètre affilié).
 * Le paramètre affilié est ajouté dynamiquement par l'API track-click.
 */

export interface EquipmentItem {
  name: string
  description: string
  links: Partial<Record<'amazon' | 'decathlon', string>>
}

export const EQUIPMENT_CATALOG: Record<string, EquipmentItem> = {
  tapis_yoga: {
    name: 'Tapis de yoga / fitness',
    description: 'Tapis antidérapant pour exercices au sol',
    links: {
      amazon: 'https://www.amazon.fr/s?k=tapis+yoga+fitness',
      decathlon: 'https://www.decathlon.fr/browse/c0-tous-les-sports/c1-yoga/c3-tapis-de-yoga/_/N-1pczulp',
    },
  },
  halteres_reglables: {
    name: 'Haltères réglables',
    description: 'Haltères ajustables pour musculation à domicile',
    links: {
      amazon: 'https://www.amazon.fr/s?k=halteres+reglables',
      decathlon: 'https://www.decathlon.fr/browse/c0-tous-les-sports/c1-musculation-cross-training/c3-halteres-de-musculation/_/N-vfq7jz',
    },
  },
  bande_resistance: {
    name: 'Bandes de résistance',
    description: 'Élastiques de musculation multi-niveaux',
    links: {
      amazon: 'https://www.amazon.fr/s?k=bandes+de+resistance+musculation',
      decathlon: 'https://www.decathlon.fr/browse/c0-tous-les-sports/c1-musculation-cross-training/c3-bandes-elastiques-de-musculation/_/N-1ja2k39',
    },
  },
  corde_sauter: {
    name: 'Corde à sauter',
    description: 'Corde à sauter pour cardio et échauffement',
    links: {
      amazon: 'https://www.amazon.fr/s?k=corde+a+sauter+fitness',
      decathlon: 'https://www.decathlon.fr/browse/c0-tous-les-sports/c1-fitness-cardio-training/c3-cordes-a-sauter/_/N-oycoyj',
    },
  },
  kettlebell: {
    name: 'Kettlebell',
    description: 'Kettlebell en fonte pour entraînement fonctionnel',
    links: {
      amazon: 'https://www.amazon.fr/s?k=kettlebell+fonte',
      decathlon: 'https://www.decathlon.fr/browse/c0-tous-les-sports/c1-musculation-cross-training/c3-kettlebells/_/N-1cvcxf3',
    },
  },
  barre_traction: {
    name: 'Barre de traction',
    description: 'Barre de traction pour porte, sans vis',
    links: {
      amazon: 'https://www.amazon.fr/s?k=barre+de+traction+porte',
      decathlon: 'https://www.decathlon.fr/browse/c0-tous-les-sports/c1-musculation-cross-training/c3-barres-de-traction/_/N-8fts5l',
    },
  },
  foam_roller: {
    name: 'Rouleau de massage (foam roller)',
    description: 'Pour la récupération et les auto-massages',
    links: {
      amazon: 'https://www.amazon.fr/s?k=foam+roller+massage',
      decathlon: 'https://www.decathlon.fr/browse/c0-tous-les-sports/c1-recuperation-sante/c3-rouleaux-de-massage/_/N-1v1qrj7',
    },
  },
  banc_musculation: {
    name: 'Banc de musculation',
    description: 'Banc inclinable pour exercices variés',
    links: {
      amazon: 'https://www.amazon.fr/s?k=banc+musculation+pliable',
      decathlon: 'https://www.decathlon.fr/browse/c0-tous-les-sports/c1-musculation-cross-training/c3-bancs-de-musculation/_/N-gqkjdp',
    },
  },
}

/**
 * Recherche un équipement dans le catalogue par mots-clés.
 * Retourne les correspondances trouvées.
 */
export function findEquipmentByKeywords(keywords: string[]): Array<{ key: string } & EquipmentItem> {
  const normalizedKeywords = keywords.map(k => k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))

  return Object.entries(EQUIPMENT_CATALOG)
    .filter(([key, item]) => {
      const searchTarget = `${key} ${item.name} ${item.description}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      return normalizedKeywords.some(kw => searchTarget.includes(kw))
    })
    .map(([key, item]) => ({ key, ...item }))
}
