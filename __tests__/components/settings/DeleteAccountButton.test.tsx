import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { DeleteAccountButton } from '@/components/settings/DeleteAccountButton';
import { accountApi } from '@/lib/api';

const mockSignOut = jest.fn(async () => {});

jest.mock('@/stores/auth', () => ({
  useAuthStore: (selector: (s: { signOut: () => Promise<void> }) => unknown) =>
    selector({ signOut: mockSignOut }),
}));

jest.mock('@/lib/api', () => ({
  accountApi: { exportGdprData: jest.fn(), deleteAccount: jest.fn() },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

const mockDelete = jest.mocked(accountApi.deleteAccount);

describe('DeleteAccountButton', () => {
  beforeEach(() => jest.clearAllMocks());

  it('supprime le compte après SUPPRIMER + mot de passe', async () => {
    mockDelete.mockResolvedValueOnce(undefined);
    render(<DeleteAccountButton />);

    fireEvent.press(screen.getByText('Supprimer mon compte'));
    fireEvent.changeText(screen.getByPlaceholderText('SUPPRIMER'), 'SUPPRIMER');
    fireEvent.press(screen.getByText('Continuer'));
    fireEvent.changeText(screen.getByPlaceholderText('Ton mot de passe'), 'hunter2');
    fireEvent.press(screen.getByText('Supprimer définitivement'));

    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith('hunter2'));
    expect(mockSignOut).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/(onboarding)/welcome');
  });

  it('bloque le passage à l\'étape mot de passe si la confirmation est incorrecte', () => {
    render(<DeleteAccountButton />);
    fireEvent.press(screen.getByText('Supprimer mon compte'));
    fireEvent.changeText(screen.getByPlaceholderText('SUPPRIMER'), 'nope');
    fireEvent.press(screen.getByText('Continuer'));

    expect(screen.queryByPlaceholderText('Ton mot de passe')).toBeNull();
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
