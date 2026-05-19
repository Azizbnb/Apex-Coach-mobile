import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { FastingBanner } from '@/components/programme/FastingBanner';
import { NextUnlockBanner } from '@/components/programme/NextUnlockBanner';
import { EquipmentRecs } from '@/components/affiliate/EquipmentRecs';

// --- Mocks ---

jest.mock('@/lib/affiliate/equipment-catalog', () => ({
  EQUIPMENT_CATALOG: {
    halteres: {
      name: 'Haltères',
      description: 'Paire d\'haltères réglables',
      links: { amazon: 'https://amazon.fr/test', decathlon: 'https://decathlon.fr/test' },
    },
  },
}));

jest.mock('@/components/affiliate/AffiliateLink', () => {
  const { Text } = jest.requireActual('react-native') as typeof import('react-native');
  return {
    AffiliateLink: ({ label }: { label: string }) => <Text>{label}</Text>,
  };
});

// --- Tests FastingBanner ---

describe('FastingBanner', () => {
  it('affiche le niveau de jeûne et le label correspondant', () => {
    render(<FastingBanner fastingLevel="strict" />);
    expect(screen.getByText(/Mode jeûne · Strict/i)).toBeTruthy();
    expect(screen.getByText(/Programme adapté pour jeûne strict/i)).toBeTruthy();
  });

  it('affiche les jours restants quand fastingEndDate est dans le futur', () => {
    const futur = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    render(<FastingBanner fastingLevel="moderate" fastingEndDate={futur} />);
    expect(screen.getByText(/jours restants|jour restant/i)).toBeTruthy();
  });

  it('n\'affiche pas les jours restants quand fastingEndDate est passé', () => {
    const passe = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    render(<FastingBanner fastingLevel="light" fastingEndDate={passe} />);
    expect(screen.queryByText(/jour/i)).toBeNull();
  });
});

// --- Tests NextUnlockBanner ---

describe('NextUnlockBanner', () => {
  it('affiche le numéro de semaine et la date formatée en français', () => {
    const unlockDate = new Date('2026-05-25T00:00:00Z');
    render(<NextUnlockBanner weekNumber={3} unlockDate={unlockDate} />);
    expect(screen.getByText(/Semaine 3/i)).toBeTruthy();
    // La date doit être formatée (au moins le mois ou le jour doit apparaître)
    expect(screen.getByText(/Disponible le/i)).toBeTruthy();
  });

  it('affiche "Dans X jours" pour un déverrouillage futur', () => {
    const dansTroisJours = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    render(<NextUnlockBanner weekNumber={2} unlockDate={dansTroisJours} />);
    expect(screen.getByText(/Dans \d+ jours?/i)).toBeTruthy();
  });

  it('affiche "Bientôt disponible" quand la date est déjà passée', () => {
    const datePassee = new Date(Date.now() - 1000);
    render(<NextUnlockBanner weekNumber={4} unlockDate={datePassee} />);
    expect(screen.getByText(/Bientôt disponible/i)).toBeTruthy();
  });
});

// --- Tests EquipmentRecs (rendu conditionnel) ---

describe('EquipmentRecs', () => {
  it('affiche le titre et les éléments du catalogue', () => {
    render(<EquipmentRecs sourcePage="programme" />);
    expect(screen.getByText(/Équipement recommandé/i)).toBeTruthy();
    expect(screen.getByText('Haltères')).toBeTruthy();
  });
});
