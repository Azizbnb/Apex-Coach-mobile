import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { profileApi } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  profileApi: { updateName: jest.fn() },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

const mockSetProfileName = jest.fn();
jest.mock('@/stores/auth', () => ({
  useAuthStore: (selector: (s: { setProfileName: jest.Mock }) => unknown) =>
    selector({ setProfileName: mockSetProfileName }),
}));

const mockUpdateName = jest.mocked(profileApi.updateName);

beforeEach(() => jest.clearAllMocks());

describe('ProfileHeader', () => {
  it('affiche le nom, l\'email, les initiales et le badge plan', () => {
    render(
      <ProfileHeader
        name="Aziz Tabouni"
        email="aziz@example.com"
        planId="coaching_pro"
        isTrial={false}
      />
    );
    expect(screen.getByText('Aziz Tabouni')).toBeTruthy();
    expect(screen.getByText('aziz@example.com')).toBeTruthy();
    expect(screen.getByText('AT')).toBeTruthy(); // initiales
    expect(screen.getByText('Coaching Pro')).toBeTruthy();
  });

  it('affiche le badge "Essai gratuit" en trial', () => {
    render(
      <ProfileHeader name="Sam" email="s@x.fr" planId="coaching" isTrial={true} />
    );
    expect(screen.getByText('Essai gratuit')).toBeTruthy();
  });

  it('édite le nom et appelle PATCH /api/profile/name', async () => {
    mockUpdateName.mockResolvedValueOnce('Nouveau Nom');
    render(
      <ProfileHeader
        name="Ancien Nom"
        email="a@x.fr"
        planId="coaching"
        isTrial={false}
      />
    );

    fireEvent.press(screen.getByLabelText('Modifier ton nom'));
    fireEvent.changeText(screen.getByLabelText('Modifier ton nom'), 'Nouveau Nom');
    fireEvent.press(screen.getByLabelText('Enregistrer le nom'));

    await waitFor(() => expect(mockUpdateName).toHaveBeenCalledWith('Nouveau Nom'));
    expect(mockSetProfileName).toHaveBeenCalledWith('Nouveau Nom');
  });

  it('refuse un nom trop court sans appeler l\'API', async () => {
    render(
      <ProfileHeader name="Valide" email="a@x.fr" planId="coaching" isTrial={false} />
    );
    fireEvent.press(screen.getByLabelText('Modifier ton nom'));
    fireEvent.changeText(screen.getByLabelText('Modifier ton nom'), 'A');
    fireEvent.press(screen.getByLabelText('Enregistrer le nom'));

    await waitFor(() =>
      expect(screen.getByText(/au moins 2 caractères/)).toBeTruthy()
    );
    expect(mockUpdateName).not.toHaveBeenCalled();
  });
});
