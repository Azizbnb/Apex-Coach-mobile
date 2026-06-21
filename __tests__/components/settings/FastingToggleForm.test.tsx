import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { FastingToggleForm } from '@/components/settings/FastingToggleForm';
import { apiFetch } from '@/lib/api';
import { useSettingsStore, type SettingsState } from '@/stores/settings';

jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

// Le store importe profileApi/secure-store ; on les neutralise.
jest.mock('@/lib/secure-store', () => ({
  LargeSecureStore: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockApiFetch = jest.mocked(apiFetch);

function setStore(partial: Partial<SettingsState>) {
  useSettingsStore.setState((s) => ({ ...s, ...partial }));
}

beforeEach(() => {
  jest.clearAllMocks();
  setStore({
    fastingEnabled: false,
    fasting: { level: null, startDate: null, endDate: null, notes: null },
  });
});

describe('FastingToggleForm', () => {
  it('affiche le titre et le bouton enregistrer', () => {
    render(<FastingToggleForm />);
    expect(screen.getByText('Mode jeûne')).toBeTruthy();
    expect(screen.getByText('Enregistrer')).toBeTruthy();
  });

  it('PATCH le profil avec le body attendu quand le jeûne est valide', async () => {
    mockApiFetch.mockResolvedValueOnce({
      success: true,
      data: {
        is_fasting_mode: true,
        fasting_level: 'strict',
        fasting_start_date: '2026-03-01',
        fasting_end_date: '2026-03-30',
        fasting_notes: null,
      },
    });
    setStore({
      fastingEnabled: true,
      fasting: {
        level: 'strict',
        startDate: '2026-03-01',
        endDate: '2026-03-30',
        notes: null,
      },
    });

    render(<FastingToggleForm />);
    fireEvent.press(screen.getByText('Enregistrer'));

    await waitFor(() => expect(mockApiFetch).toHaveBeenCalledTimes(1));
    expect(mockApiFetch).toHaveBeenCalledWith('/profile/fasting', {
      method: 'PATCH',
      body: JSON.stringify({
        is_fasting_mode: true,
        fasting_level: 'strict',
        fasting_start_date: '2026-03-01',
        fasting_end_date: '2026-03-30',
        fasting_notes: null,
      }),
    });
    expect(screen.getByText('Préférences de jeûne enregistrées.')).toBeTruthy();
  });

  it('bloque la sauvegarde si une date est manquante', async () => {
    setStore({
      fastingEnabled: true,
      fasting: { level: 'strict', startDate: null, endDate: null, notes: null },
    });
    render(<FastingToggleForm />);
    fireEvent.press(screen.getByText('Enregistrer'));

    await waitFor(() =>
      expect(screen.getByText(/Date de début invalide/)).toBeTruthy()
    );
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('rejette une période de plus de 50 jours', async () => {
    setStore({
      fastingEnabled: true,
      fasting: {
        level: 'strict',
        startDate: '2026-01-01',
        endDate: '2026-04-01',
        notes: null,
      },
    });
    render(<FastingToggleForm />);
    fireEvent.press(screen.getByText('Enregistrer'));

    await waitFor(() =>
      expect(screen.getByText(/ne peut pas dépasser 50 jours/)).toBeTruthy()
    );
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('envoie is_fasting_mode=false quand le jeûne est désactivé', async () => {
    mockApiFetch.mockResolvedValueOnce({ success: true });
    setStore({ fastingEnabled: false });
    render(<FastingToggleForm />);
    fireEvent.press(screen.getByText('Enregistrer'));

    await waitFor(() => expect(mockApiFetch).toHaveBeenCalledTimes(1));
    const [, opts] = mockApiFetch.mock.calls[0];
    expect(JSON.parse(opts!.body as string)).toEqual({
      is_fasting_mode: false,
      fasting_level: null,
      fasting_start_date: null,
      fasting_end_date: null,
      fasting_notes: null,
    });
  });
});
