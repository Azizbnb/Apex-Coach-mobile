import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { NutritionGenerationProgress } from '@/components/nutrition/NutritionGenerationProgress';

const mockOnRetry = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('NutritionGenerationProgress — état generating', () => {
  it('affiche le spinner et le titre "Génération en cours"', () => {
    render(
      <NutritionGenerationProgress status="generating" onRetry={mockOnRetry} />
    );
    expect(screen.getByTestId('generation-progress')).toBeTruthy();
    expect(screen.getByTestId('generation-spinner')).toBeTruthy();
    expect(screen.getByText('Génération en cours')).toBeTruthy();
  });

  it('affiche le premier message de génération', () => {
    render(
      <NutritionGenerationProgress status="generating" onRetry={mockOnRetry} />
    );
    expect(screen.getByTestId('generation-message')).toBeTruthy();
    expect(
      screen.getByText('Génération de ton plan nutrition en cours…')
    ).toBeTruthy();
  });

  it('fait pivoter le message après 2500ms', () => {
    render(
      <NutritionGenerationProgress status="generating" onRetry={mockOnRetry} />
    );
    act(() => {
      jest.advanceTimersByTime(2500);
    });
    expect(
      screen.getByText('Analyse de tes préférences alimentaires…')
    ).toBeTruthy();
  });

  it('n\'affiche pas le bouton Réessayer en mode generating', () => {
    render(
      <NutritionGenerationProgress status="generating" onRetry={mockOnRetry} />
    );
    expect(screen.queryByText('Réessayer')).toBeNull();
  });

  it('nettoie l\'intervalle au démontage', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const { unmount } = render(
      <NutritionGenerationProgress status="generating" onRetry={mockOnRetry} />
    );
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});

describe('NutritionGenerationProgress — état failed', () => {
  it('affiche le bloc d\'erreur avec le titre et la description', () => {
    render(
      <NutritionGenerationProgress status="failed" onRetry={mockOnRetry} />
    );
    expect(screen.getByTestId('generation-failed')).toBeTruthy();
    expect(screen.getByText('Échec de la génération')).toBeTruthy();
    expect(
      screen.getByText(/Une erreur est survenue lors de la génération/)
    ).toBeTruthy();
  });

  it('affiche le bouton Réessayer et déclenche onRetry', () => {
    render(
      <NutritionGenerationProgress status="failed" onRetry={mockOnRetry} />
    );
    const btn = screen.getByText('Réessayer');
    expect(btn).toBeTruthy();
    fireEvent.press(btn);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('masque le libellé Réessayer et affiche un ActivityIndicator quand retrying=true', () => {
    render(
      <NutritionGenerationProgress
        status="failed"
        onRetry={mockOnRetry}
        retrying={true}
      />
    );
    // Quand loading=true, Button remplace le texte par ActivityIndicator
    expect(screen.queryByText('Réessayer')).toBeNull();
    // Le Pressable est désactivé
    const pressable = screen.getByTestId('generation-failed').findAll
      ? screen.getByTestId('generation-failed')
      : null;
    // L'état disabled est vérifiable via accessibilityState sur la View
    expect(screen.UNSAFE_getAllByType('ActivityIndicator').length).toBeGreaterThan(0);
  });

  it('n\'affiche pas le spinner de génération en mode failed', () => {
    render(
      <NutritionGenerationProgress status="failed" onRetry={mockOnRetry} />
    );
    expect(screen.queryByTestId('generation-spinner')).toBeNull();
  });
});
