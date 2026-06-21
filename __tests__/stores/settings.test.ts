import { useSettingsStore } from '@/stores/settings';
import { LargeSecureStore } from '@/lib/secure-store';
import { profileApi } from '@/lib/api';

jest.mock('@/lib/secure-store', () => ({
  LargeSecureStore: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/lib/api', () => ({
  profileApi: { get: jest.fn().mockResolvedValue(null) },
}));

const mockGetItem = jest.mocked(LargeSecureStore.getItem);
const mockSetItem = jest.mocked(LargeSecureStore.setItem);
const mockProfileGet = jest.mocked(profileApi.get);

const DEFAULTS = {
  fastingEnabled: false,
  fasting: { level: null, startDate: null, endDate: null, notes: null },
  notificationPrefs: {
    workoutReminder: true,
    bilanDue: true,
    trialExpiry: true,
    promoExpiry: true,
  },
  language: 'fr' as const,
  tutorialSeen: false,
  hydrated: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetItem.mockResolvedValue(null);
  mockProfileGet.mockResolvedValue(null);
  useSettingsStore.setState({ ...DEFAULTS });
});

describe('useSettingsStore — état initial', () => {
  it('a les valeurs par défaut', () => {
    const s = useSettingsStore.getState();
    expect(s.fastingEnabled).toBe(false);
    expect(s.fasting.level).toBeNull();
    expect(s.notificationPrefs.workoutReminder).toBe(true);
    expect(s.language).toBe('fr');
    expect(s.tutorialSeen).toBe(false);
    expect(s.hydrated).toBe(false);
  });
});

describe('useSettingsStore — jeûne', () => {
  it('toggleFasting met à jour le flag', () => {
    useSettingsStore.getState().toggleFasting(true);
    expect(useSettingsStore.getState().fastingEnabled).toBe(true);
  });

  it('setFastingConfig fusionne la config', () => {
    useSettingsStore.getState().setFastingConfig({ level: 'strict' });
    useSettingsStore.getState().setFastingConfig({ startDate: '2026-03-01' });
    const { fasting } = useSettingsStore.getState();
    expect(fasting.level).toBe('strict');
    expect(fasting.startDate).toBe('2026-03-01');
  });

  it('applyFastingFromServer mappe la forme serveur', () => {
    useSettingsStore.getState().applyFastingFromServer({
      is_fasting_mode: true,
      fasting_level: 'moderate',
      fasting_start_date: '2026-03-01',
      fasting_end_date: '2026-03-30',
      fasting_notes: 'note',
    });
    const s = useSettingsStore.getState();
    expect(s.fastingEnabled).toBe(true);
    expect(s.fasting).toEqual({
      level: 'moderate',
      startDate: '2026-03-01',
      endDate: '2026-03-30',
      notes: 'note',
    });
  });
});

describe('useSettingsStore — notifications', () => {
  it('toggleNotification inverse une clé et persiste', () => {
    useSettingsStore.getState().toggleNotification('workoutReminder');
    expect(useSettingsStore.getState().notificationPrefs.workoutReminder).toBe(false);
    expect(mockSetItem).toHaveBeenCalledTimes(1);
  });
});

describe('useSettingsStore — tutoriel', () => {
  it('setTutorialSeen passe à true par défaut et persiste', () => {
    useSettingsStore.getState().setTutorialSeen();
    expect(useSettingsStore.getState().tutorialSeen).toBe(true);
    expect(mockSetItem).toHaveBeenCalledTimes(1);
  });
});

describe('useSettingsStore — hydrate', () => {
  it('charge les préférences locales depuis SecureStore', async () => {
    mockGetItem.mockResolvedValueOnce(
      JSON.stringify({
        notificationPrefs: { workoutReminder: false },
        language: 'fr',
        tutorialSeen: true,
      })
    );
    await useSettingsStore.getState().hydrate();
    const s = useSettingsStore.getState();
    expect(s.notificationPrefs.workoutReminder).toBe(false);
    // Les autres clés gardent leur défaut
    expect(s.notificationPrefs.bilanDue).toBe(true);
    expect(s.tutorialSeen).toBe(true);
    expect(s.hydrated).toBe(true);
  });

  it('hydrate le jeûne depuis le profil serveur', async () => {
    mockProfileGet.mockResolvedValueOnce({
      is_fasting_mode: true,
      fasting_level: 'light',
      fasting_start_date: '2026-04-01',
      fasting_end_date: '2026-04-10',
      fasting_notes: null,
    } as Awaited<ReturnType<typeof profileApi.get>>);
    await useSettingsStore.getState().hydrate();
    const s = useSettingsStore.getState();
    expect(s.fastingEnabled).toBe(true);
    expect(s.fasting.level).toBe('light');
    expect(s.hydrated).toBe(true);
  });

  it('reste robuste si SecureStore et le profil échouent', async () => {
    mockGetItem.mockRejectedValueOnce(new Error('boom'));
    mockProfileGet.mockRejectedValueOnce(new Error('offline'));
    await useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().hydrated).toBe(true);
  });
});

describe('useSettingsStore — reset', () => {
  it('réinitialise tout et purge le stockage', () => {
    useSettingsStore.getState().toggleFasting(true);
    useSettingsStore.getState().setTutorialSeen(true);
    useSettingsStore.getState().reset();
    const s = useSettingsStore.getState();
    expect(s.fastingEnabled).toBe(false);
    expect(s.tutorialSeen).toBe(false);
    expect(s.hydrated).toBe(false);
  });
});
