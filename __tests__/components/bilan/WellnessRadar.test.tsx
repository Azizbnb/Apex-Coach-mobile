import { render, screen } from '@testing-library/react-native';
import { WellnessRadar } from '@/components/bilan/WellnessRadar';
import type { WellnessRadarAxis } from '@/lib/analytics/aggregate';

const axes: WellnessRadarAxis[] = [
  { key: 'sleep_quality', label: 'Sommeil', value: 4 },
  { key: 'energy_level', label: 'Énergie', value: 3 },
  { key: 'motivation_level', label: 'Motivation', value: 5 },
  { key: 'muscle_soreness', label: 'Courbatures', value: 4 },
  { key: 'stress_level', label: 'Stress', value: 4 },
  { key: 'pain', label: 'Sans douleur', value: 3 },
];

describe('WellnessRadar', () => {
  it('affiche le titre et les labels des axes', () => {
    render(<WellnessRadar axes={axes} />);
    expect(screen.getByText('Bien-être global')).toBeTruthy();
    expect(screen.getByText('Sommeil')).toBeTruthy();
    expect(screen.getByText('Motivation')).toBeTruthy();
    expect(screen.getByText('Sans douleur')).toBeTruthy();
  });

  it('affiche un message si moins de 3 axes', () => {
    render(<WellnessRadar axes={axes.slice(0, 2)} />);
    expect(screen.getByText(/Données insuffisantes/)).toBeTruthy();
  });

  it('rend sans crash avec des valeurs hors bornes', () => {
    const extreme: WellnessRadarAxis[] = axes.map((a) => ({ ...a, value: 99 }));
    const { toJSON } = render(<WellnessRadar axes={extreme} />);
    expect(toJSON()).toBeTruthy();
  });
});
