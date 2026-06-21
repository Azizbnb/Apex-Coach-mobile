import { renderHook, waitFor, act } from '@testing-library/react-native';
import { usePollAdaptation } from '@/hooks/usePollAdaptation';
import { supabase } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client', () => ({
  supabase: { from: jest.fn() },
}));

const mockFrom = jest.mocked(supabase.from);

function mockFeedback(suggestionsApplied: boolean | null) {
  const maybeSingle = jest
    .fn()
    .mockResolvedValue({ data: { suggestions_applied: suggestionsApplied }, error: null });
  mockFrom.mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle,
  } as never);
}

describe('usePollAdaptation', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('reste idle tant que disabled', () => {
    mockFeedback(null);
    const { result } = renderHook(() =>
      usePollAdaptation({ programId: 'p1', weekNumber: 1, enabled: false })
    );
    expect(result.current.status).toBe('idle');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('passe à done quand suggestions_applied est true', async () => {
    mockFeedback(true);
    const { result } = renderHook(() =>
      usePollAdaptation({ programId: 'p1', weekNumber: 1, enabled: true })
    );
    await waitFor(() => expect(result.current.isDone).toBe(true));
    expect(result.current.status).toBe('done');
  });

  it('passe à timeout après 180s sans confirmation', async () => {
    jest.useFakeTimers();
    mockFeedback(false);

    const { result } = renderHook(() =>
      usePollAdaptation({ programId: 'p1', weekNumber: 1, enabled: true })
    );

    // Laisser le premier check (promesse) se résoudre.
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      jest.advanceTimersByTime(180_000);
    });

    expect(result.current.isTimeout).toBe(true);
    expect(result.current.status).toBe('timeout');
  });
});
