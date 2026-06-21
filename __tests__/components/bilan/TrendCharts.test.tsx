import { render, screen } from '@testing-library/react-native';
import { TrendCharts } from '@/components/bilan/TrendCharts';
import { aggregateTrendCharts } from '@/lib/analytics/aggregate';
import type { ProgramFeedback } from '@/types';

function fb(week: number, partial: Partial<ProgramFeedback> = {}): ProgramFeedback {
  return {
    id: `fb-${week}`,
    user_id: 'u1',
    program_id: 'p1',
    week_number: week,
    feedback_date: '2026-01-01',
    exercises_completed: [],
    exercises_skipped: [],
    exercises_modified: [],
    pain_locations: [],
    suggestions_applied: false,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    completion_rate: 70,
    difficulty_rating: 3,
    energy_level: 3,
    stress_level: 2,
    ...partial,
  };
}

describe('TrendCharts', () => {
  const data = aggregateTrendCharts([fb(1), fb(2), fb(3), fb(4)]);

  it('affiche les titres des 4 courbes', () => {
    render(<TrendCharts data={data} />);
    expect(screen.getByText('Complétion')).toBeTruthy();
    expect(screen.getByText('Difficulté')).toBeTruthy();
    expect(screen.getByText('Énergie')).toBeTruthy();
    expect(screen.getByText('Stress')).toBeTruthy();
  });

  it('affiche les moyennes par métrique', () => {
    render(<TrendCharts data={data} />);
    expect(screen.getByText('moy. 70%')).toBeTruthy();
  });

  it('affiche un empty state si aucun bilan', () => {
    render(<TrendCharts data={aggregateTrendCharts([])} />);
    expect(screen.getByText('Pas encore de tendances')).toBeTruthy();
  });

  it('rend le mode loading sans crash', () => {
    const { toJSON } = render(<TrendCharts data={data} loading />);
    expect(toJSON()).toBeTruthy();
  });
});
