import { renderHook, waitFor } from '@testing-library/react-native';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { useExerciseVideo } from '@/hooks/useExerciseVideo';

type SignedUrlResult = { data: { signedUrl: string } | null; error: { message: string } | null };

const mockCreateSignedUrl = jest.fn<() => Promise<SignedUrlResult>>();

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    storage: {
      from: () => ({
        createSignedUrl: mockCreateSignedUrl,
      }),
    },
  },
}));

describe('useExerciseVideo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retourne directement l URL fournie sans appel Supabase', () => {
    const { result } = renderHook(() =>
      useExerciseVideo('Squat', 'https://example.com/video.mp4')
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.videoUrl).toBe('https://example.com/video.mp4');
    expect(result.current.error).toBeNull();
    expect(mockCreateSignedUrl).not.toHaveBeenCalled();
  });

  it('retourne null si aucun nom d exercice fourni', () => {
    const { result } = renderHook(() => useExerciseVideo(undefined));
    expect(result.current.loading).toBe(false);
    expect(result.current.videoUrl).toBeNull();
  });

  it('fetche et retourne l URL signee quand disponible', async () => {
    mockCreateSignedUrl.mockImplementation(() =>
      Promise.resolve({ data: { signedUrl: 'https://supabase.co/signed/squat.mp4' }, error: null })
    );

    const { result } = renderHook(() => useExerciseVideo('Squat'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.videoUrl).toBe('https://supabase.co/signed/squat.mp4');
    expect(result.current.error).toBeNull();
    expect(mockCreateSignedUrl).toHaveBeenCalledWith('squat.mp4', 3600);
  });

  it('retourne null si Supabase Storage renvoie une erreur (pas de video)', async () => {
    mockCreateSignedUrl.mockImplementation(() =>
      Promise.resolve({ data: null, error: { message: 'Object not found' } })
    );

    const { result } = renderHook(() => useExerciseVideo('Squat'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.videoUrl).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('normalise le nom en slug ASCII (accents + espaces)', async () => {
    mockCreateSignedUrl.mockImplementation(() =>
      Promise.resolve({ data: null, error: { message: 'Not found' } })
    );

    renderHook(() => useExerciseVideo('Developpe couche'));

    await waitFor(() => expect(mockCreateSignedUrl).toHaveBeenCalled());

    const [path] = (mockCreateSignedUrl.mock.calls[0] as unknown) as [string, number];
    expect(path).toBe('developpe-couche.mp4');
  });
});
