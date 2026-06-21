import { render, screen } from '@testing-library/react-native';
import { BilanDueBanner, isBilanDue } from '@/components/bilan/BilanDueBanner';

jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn().mockResolvedValue({ completions: [], feedbacks: [] }),
  programApi: { getStatus: jest.fn().mockResolvedValue(null) },
}));

describe('isBilanDue', () => {
  it('false si un bilan existe déjà', () => {
    expect(isBilanDue({ completed: 10, total: 10 }, true)).toBe(false);
  });

  it('false si aucune séance (total 0)', () => {
    expect(isBilanDue({ completed: 0, total: 0 }, false)).toBe(false);
  });

  it('false si complétion < 80%', () => {
    expect(isBilanDue({ completed: 7, total: 10 }, false)).toBe(false);
  });

  it('true si complétion >= 80% et pas de bilan', () => {
    expect(isBilanDue({ completed: 8, total: 10 }, false)).toBe(true);
    expect(isBilanDue({ completed: 10, total: 10 }, false)).toBe(true);
  });
});

describe('BilanDueBanner — affichage', () => {
  it('ne rend rien quand forceVisible=false', () => {
    render(<BilanDueBanner forceVisible={false} />);
    expect(screen.queryByText('Faire mon bilan')).toBeNull();
  });

  it('rend la bannière quand forceVisible=true', () => {
    render(<BilanDueBanner forceVisible weekNumber={3} />);
    expect(screen.getByText('Faire mon bilan')).toBeTruthy();
    expect(screen.getByText(/semaine 3/i)).toBeTruthy();
  });
});
