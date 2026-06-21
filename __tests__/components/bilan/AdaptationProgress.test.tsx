import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AdaptationProgress } from '@/components/bilan/AdaptationProgress';

describe('AdaptationProgress', () => {
  it('affiche le loader et un message d’attente en polling', () => {
    render(
      <AdaptationProgress
        status="polling"
        onComplete={jest.fn()}
        onRetry={jest.fn()}
      />
    );
    expect(screen.getByText(/Analyse de ton bilan/)).toBeTruthy();
  });

  it('affiche le succès et appelle onComplete après un délai', async () => {
    const onComplete = jest.fn();
    render(
      <AdaptationProgress status="done" onComplete={onComplete} onRetry={jest.fn()} />
    );
    expect(screen.getByText('Prêt !')).toBeTruthy();
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1), {
      timeout: 2000,
    });
  });

  it('affiche le timeout avec bouton réessayer', () => {
    const onRetry = jest.fn();
    render(
      <AdaptationProgress status="timeout" onComplete={jest.fn()} onRetry={onRetry} />
    );
    expect(screen.getByText(/prend du temps/)).toBeTruthy();
    fireEvent.press(screen.getByText('Réessayer'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('affiche le message d’erreur sur status error', () => {
    render(
      <AdaptationProgress status="error" onComplete={jest.fn()} onRetry={jest.fn()} />
    );
    expect(screen.getByText('Une erreur est survenue')).toBeTruthy();
  });
});
