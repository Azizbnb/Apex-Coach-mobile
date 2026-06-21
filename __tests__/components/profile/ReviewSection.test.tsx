import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { ReviewSection } from '@/components/profile/ReviewSection';
import { reviewsApi } from '@/lib/api';
import type { Review } from '@/types';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useFocusEffect: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  reviewsApi: { getMine: jest.fn() },
}));

const mockGetMine = jest.mocked(reviewsApi.getMine);
const mockPush = jest.mocked(router.push);

const existingReview: Review = {
  id: 'r1',
  user_id: 'u1',
  rating: 4,
  comment: 'Super programme, vraiment efficace !',
  tags: ['Résultats', 'Motivant'],
  status: 'pending',
  created_at: '2026-06-01T10:00:00Z',
  updated_at: '2026-06-01T10:00:00Z',
};

beforeEach(() => jest.clearAllMocks());

describe('ReviewSection', () => {
  it('état vide → carte "Donne ton avis" qui ouvre le modal', async () => {
    mockGetMine.mockResolvedValueOnce(null);
    render(<ReviewSection />);

    await waitFor(() => expect(screen.getByText('Donne ton avis')).toBeTruthy());

    fireEvent.press(screen.getByLabelText('Donne ton avis'));
    expect(mockPush).toHaveBeenCalledWith('/(modals)/leave-review');
  });

  it('avis existant → affichage read-only + bouton Modifier', async () => {
    mockGetMine.mockResolvedValueOnce(existingReview);
    render(<ReviewSection />);

    await waitFor(() =>
      expect(screen.getByText('Super programme, vraiment efficace !')).toBeTruthy()
    );
    expect(screen.getByText('En attente de modération')).toBeTruthy();
    expect(screen.getByText('Résultats')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Modifier mon avis'));
    expect(mockPush).toHaveBeenCalledWith('/(modals)/leave-review');
  });
});
