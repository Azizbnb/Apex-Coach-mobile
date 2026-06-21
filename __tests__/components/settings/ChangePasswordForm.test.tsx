import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';
import { supabase } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/api';

jest.mock('@/lib/api', () => ({ apiFetch: jest.fn().mockResolvedValue(undefined) }));

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

jest.mock('@/stores/auth', () => ({
  useAuthStore: (selector: (s: { user: { email: string } }) => unknown) =>
    selector({ user: { email: 'aziz@example.com' } }),
}));

const mockSignIn = jest.mocked(supabase.auth.signInWithPassword);
const mockUpdate = jest.mocked(supabase.auth.updateUser);
const mockApiFetch = jest.mocked(apiFetch);

function fill(current: string, next: string, confirm: string) {
  fireEvent.changeText(screen.getByPlaceholderText('Mot de passe actuel'), current);
  fireEvent.changeText(screen.getByPlaceholderText('Au moins 8 caractères'), next);
  fireEvent.changeText(screen.getByPlaceholderText('Confirme le mot de passe'), confirm);
}

beforeEach(() => jest.clearAllMocks());

describe('ChangePasswordForm', () => {
  it('change le mot de passe après re-auth puis log l\'audit', async () => {
    // @ts-expect-error — shape partielle suffisante pour le test
    mockSignIn.mockResolvedValueOnce({ data: {}, error: null });
    // @ts-expect-error — shape partielle suffisante pour le test
    mockUpdate.mockResolvedValueOnce({ data: {}, error: null });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    render(<ChangePasswordForm />);
    fill('OldPass123', 'NewPass456!', 'NewPass456!');
    fireEvent.press(screen.getByText('Mettre à jour'));

    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'aziz@example.com',
        password: 'OldPass123',
      })
    );
    expect(mockUpdate).toHaveBeenCalledWith({ password: 'NewPass456!' });
    expect(mockApiFetch).toHaveBeenCalledWith('/auth/log-password-change', {
      method: 'POST',
    });
    expect(alertSpy).toHaveBeenCalled();
  });

  it('affiche une erreur si le mot de passe actuel est incorrect', async () => {
    // @ts-expect-error — shape partielle
    mockSignIn.mockResolvedValueOnce({ data: {}, error: { message: 'invalid' } });

    render(<ChangePasswordForm />);
    fill('Wrong123', 'NewPass456!', 'NewPass456!');
    fireEvent.press(screen.getByText('Mettre à jour'));

    await waitFor(() =>
      expect(screen.getByText('Mot de passe actuel incorrect.')).toBeTruthy()
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('refuse si la confirmation ne correspond pas', async () => {
    render(<ChangePasswordForm />);
    fill('OldPass123', 'NewPass456!', 'Different!');
    fireEvent.press(screen.getByText('Mettre à jour'));

    await waitFor(() =>
      expect(screen.getByText('Les mots de passe ne correspondent pas.')).toBeTruthy()
    );
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('refuse un nouveau mot de passe trop court', async () => {
    render(<ChangePasswordForm />);
    fill('OldPass123', 'short', 'short');
    fireEvent.press(screen.getByText('Mettre à jour'));

    await waitFor(() =>
      expect(screen.getByText(/au moins 8 caractères/)).toBeTruthy()
    );
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
