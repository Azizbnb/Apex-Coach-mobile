import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
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

  it("déclenche l'export et confirme par une alerte", async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockExport.mockResolvedValueOnce(undefined);

    render(<GdprExportButton />);
    fireEvent.press(screen.getByText('Exporter mes données'));

    await waitFor(() => expect(mockExport).toHaveBeenCalledTimes(1));
    expect(alertSpy).toHaveBeenCalledWith(
      'Demande envoyée',
      expect.stringContaining('email')
    );
  });
});
