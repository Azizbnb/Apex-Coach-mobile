import { render, screen, fireEvent } from '@testing-library/react-native';
import { NutritionGenerationProgress } from '@/components/nutrition/NutritionGenerationProgress';

describe('NutritionGenerationProgress', () => {
  it('affiche l’état de génération en cours', () => {
    render(
      <NutritionGenerationProgress failed={false} retrying={false} onRetry={jest.fn()} />
    );
    expect(screen.getByText(/se prépare/)).toBeTruthy();
  });

  it('affiche l’échec et déclenche la relance au tap', () => {
    const onRetry = jest.fn();
    render(<NutritionGenerationProgress failed retrying={false} onRetry={onRetry} />);
    expect(screen.getByText('La génération a échoué')).toBeTruthy();
    fireEvent.press(screen.getByText('Réessayer'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
