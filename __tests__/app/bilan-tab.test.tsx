import { render, screen, waitFor } from '@testing-library/react-native';

import BilanScreen from '@/app/(tabs)/bilan/index';
import { feedbackApi } from '@/lib/api';
import type { ProgramFeedback } from '@/types';

// --- Mocks ---

const mockFetchProgram = jest.fn(async () => {});

interface MockProgramState {
  program: { id: string; start_date: string | null; created_at: string } | null;
  fetch: () => Promise<void>;
}

let mockProgramState: MockProgramState = {
  program: { id: 'prog-1', start_date: '2026-06-01', created_at: '2026-06-01' },
  fetch: mockFetchProgram,
};

jest.mock('@/stores/program', () => ({
  useProgramStore: (selector: (s: MockProgramState) => unknown) =>
    selector(mockProgramState),
}));

let mockSubscription = { planId: 'coaching', hasNutrition: false };

jest.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => mockSubscription,
}));

jest.mock('@/lib/api', () => ({
  feedbackApi: { getForProgram: jest.fn() },
}));

// web-browser construit une URL paywall — on stub pour éviter la dépendance env.
jest.mock('@/lib/web-browser', () => ({
  buildWebUrl: () => 'https://www.apexcoach.app/',
}));

const mockGetForProgram = jest.mocked(feedbackApi.getForProgram);

// --- Helpers ---

function makeFeedback(
  week: number,
  overrides: Partial<ProgramFeedback> = {},
): ProgramFeedback {
  return {
    id: `fb-${week}`,
    user_id: 'u1',
    program_id: 'prog-1',
    week_number: week,
    feedback_date: `2026-06-${String(week).padStart(2, '0')}`,
    completion_rate: 80,
    difficulty_rating: 3,
    energy_level: 4,
    muscle_soreness: 2,
    motivation_level: 4,
    sleep_quality: 4,
    stress_level: 2,
    pain_locations: [],
    exercises_completed: [],
    exercises_skipped: [],
    exercises_modified: [],
    suggestions_applied: false,
    created_at: '2026-06-01',
    updated_at: '2026-06-01',
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockProgramState = {
    program: { id: 'prog-1', start_date: '2026-06-01', created_at: '2026-06-01' },
    fetch: mockFetchProgram,
  };
  mockSubscription = { planId: 'coaching', hasNutrition: false };
});

describe('Tab Bilan — Overview', () => {
  it('affiche le CTA « Faire mon bilan » quand aucun bilan pour la semaine courante', async () => {
    // start_date très récent → semaine 1 ; aucun feedback semaine 1.
    mockProgramState.program = {
      id: 'prog-1',
      start_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    mockGetForProgram.mockResolvedValueOnce([]);

    render(<BilanScreen />);

    await waitFor(() => {
      expect(screen.getByText('Faire mon bilan')).toBeTruthy();
    });
    expect(screen.queryByText('Bilan complété')).toBeNull();
  });

  it('affiche « Bilan complété » quand le bilan de la semaine courante existe', async () => {
    mockProgramState.program = {
      id: 'prog-1',
      start_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    // Semaine courante = 1 → un feedback semaine 1 = bilan fait.
    mockGetForProgram.mockResolvedValueOnce([makeFeedback(1)]);

    render(<BilanScreen />);

    await waitFor(() => {
      expect(screen.getByText('Bilan complété')).toBeTruthy();
    });
    expect(screen.queryByText('Faire mon bilan')).toBeNull();
  });
});

describe('Tab Bilan — Historique', () => {
  it('liste les bilans précédents (≥1 bilan)', async () => {
    mockGetForProgram.mockResolvedValueOnce([
      makeFeedback(1),
      makeFeedback(2),
    ]);

    render(<BilanScreen />);

    await waitFor(() => {
      expect(screen.getByText('Historique des bilans')).toBeTruthy();
    });
    expect(screen.getByText('Semaine 1')).toBeTruthy();
    expect(screen.getByText('Semaine 2')).toBeTruthy();
  });
});

describe('Tab Bilan — Analytics gated', () => {
  it('non-Pro → bloc info paywall, pas de charts', async () => {
    mockSubscription = { planId: 'coaching', hasNutrition: false };
    mockGetForProgram.mockResolvedValueOnce([
      makeFeedback(1),
      makeFeedback(2),
      makeFeedback(3),
      makeFeedback(4),
    ]);

    render(<BilanScreen />);

    await waitFor(() => {
      expect(screen.getByText('Statistiques avancées')).toBeTruthy();
    });
    expect(screen.queryByText('Tes statistiques')).toBeNull();
  });

  it('Pro mais <4 bilans → empty state', async () => {
    mockSubscription = { planId: 'coaching_pro', hasNutrition: true };
    mockGetForProgram.mockResolvedValueOnce([makeFeedback(1), makeFeedback(2)]);

    render(<BilanScreen />);

    await waitFor(() => {
      expect(screen.getByText('Bientôt tes statistiques')).toBeTruthy();
    });
    expect(screen.queryByText('Tes statistiques')).toBeNull();
  });

  it('Pro avec ≥4 bilans → charts affichés', async () => {
    mockSubscription = { planId: 'coaching_pro', hasNutrition: true };
    mockGetForProgram.mockResolvedValueOnce([
      makeFeedback(1),
      makeFeedback(2),
      makeFeedback(3),
      makeFeedback(4),
    ]);

    render(<BilanScreen />);

    await waitFor(() => {
      expect(screen.getByText('Tes statistiques')).toBeTruthy();
    });
    // Les composants charts sont montés (titres de section présents).
    expect(screen.getByText('Complétion')).toBeTruthy();
  });
});
