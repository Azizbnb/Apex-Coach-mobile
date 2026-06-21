import { render, screen } from '@testing-library/react-native';
import { PainZonesChart } from '@/components/bilan/PainZonesChart';
import type { PainZoneFrequency } from '@/lib/analytics/aggregate';

const zones: PainZoneFrequency[] = [
  { zone: 'knees', label: 'Genoux', count: 3, ratio: 0.75 },
  { zone: 'lower_back', label: 'Lombaires', count: 1, ratio: 0.25 },
];

describe('PainZonesChart', () => {
  it('affiche les zones avec compte et pourcentage', () => {
    render(<PainZonesChart zones={zones} totalFeedbacks={4} />);
    expect(screen.getByText('Genoux')).toBeTruthy();
    expect(screen.getByText('3× · 75%')).toBeTruthy();
    expect(screen.getByText('Lombaires')).toBeTruthy();
    expect(screen.getByText('1× · 25%')).toBeTruthy();
  });

  it('affiche le sous-titre de fréquence (pluriel)', () => {
    render(<PainZonesChart zones={zones} totalFeedbacks={4} />);
    expect(screen.getByText('Fréquence sur 4 bilans')).toBeTruthy();
  });

  it('affiche un empty state positif sans douleur', () => {
    render(<PainZonesChart zones={[]} totalFeedbacks={4} />);
    expect(screen.getByText('Aucune douleur signalée')).toBeTruthy();
  });
});
