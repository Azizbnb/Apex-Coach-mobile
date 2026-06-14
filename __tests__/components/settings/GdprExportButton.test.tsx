import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Share } from 'react-native';
import { GdprExportButton } from '@/components/settings/GdprExportButton';
import { accountApi } from '@/lib/api';

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

const mockExport = jest.mocked(accountApi.exportGdprData);

describe('GdprExportButton', () => {
  beforeEach(() => jest.clearAllMocks());

  it('récupère les données (GET) et ouvre le partage natif', async () => {
    const shareSpy = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: 'sharedAction' });
    mockExport.mockResolvedValueOnce({ profile: { id: 'u1' } });

    render(<GdprExportButton />);
    fireEvent.press(screen.getByText('Télécharger mes données'));

    await waitFor(() => expect(mockExport).toHaveBeenCalledTimes(1));
    expect(shareSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('u1') })
    );
  });
});
