import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MacroRings } from '@/components/nutrition/MacroRings';
import { useSettingsStore } from '@/stores/settings';

// react-native-svg est mocké globalement via __mocks__/react-native-svg.js + jest.setup.ts

const defaultProps = {
  calories: 1800,
  targetCalories: 2000,
  protein: 150,
  carbs: 180,
  fats: 60,
};

beforeEach(() => {
  useSettingsStore.setState({ macroViewMode: 'rings' });
});

describe('MacroRings', () => {
  it('affiche "Macros du jour" dans le header', () => {
    render(<MacroRings {...defaultProps} />);
    expect(screen.getByText('Macros du jour')).toBeTruthy();
  });

  it('affiche les calories au centre en vue anneaux', () => {
    render(<MacroRings {...defaultProps} />);
    expect(screen.getByTestId('calories-value')).toBeTruthy();
    expect(screen.getByText('1800')).toBeTruthy();
  });

  it('affiche l\'objectif calorique en vue anneaux', () => {
    render(<MacroRings {...defaultProps} />);
    expect(screen.getByTestId('target-calories')).toBeTruthy();
  });

  it('affiche la légende avec les 3 macros en vue anneaux', () => {
    render(<MacroRings {...defaultProps} />);
    expect(screen.getByText('Protéines')).toBeTruthy();
    expect(screen.getByText('Glucides')).toBeTruthy();
    expect(screen.getByText('Lipides')).toBeTruthy();
    expect(screen.getByText('150g')).toBeTruthy();
    expect(screen.getByText('180g')).toBeTruthy();
    expect(screen.getByText('60g')).toBeTruthy();
  });

  it('affiche "Barres" quand la vue anneaux est active', () => {
    render(<MacroRings {...defaultProps} />);
    expect(screen.getByText('Barres')).toBeTruthy();
  });

  it('affiche "Anneaux" quand la vue barres est active', () => {
    useSettingsStore.setState({ macroViewMode: 'bars' });
    render(<MacroRings {...defaultProps} />);
    expect(screen.getByText('Anneaux')).toBeTruthy();
  });

  it('bascule vers la vue barres au tap sur le bouton', () => {
    render(<MacroRings {...defaultProps} />);
    fireEvent.press(screen.getByText('Barres'));
    // Vue barres active : le bouton affiche maintenant "Anneaux"
    expect(screen.getByText('Anneaux')).toBeTruthy();
    // La vue barres montre les barres de progrès macro
    expect(screen.getByText('Protéines')).toBeTruthy();
    expect(screen.getByText('Glucides')).toBeTruthy();
    expect(screen.getByText('Lipides')).toBeTruthy();
  });

  it('bascule retour vers la vue anneaux depuis la vue barres', () => {
    useSettingsStore.setState({ macroViewMode: 'bars' });
    render(<MacroRings {...defaultProps} />);
    fireEvent.press(screen.getByText('Anneaux'));
    expect(screen.getByText('Barres')).toBeTruthy();
    // Vue anneaux : le testID calories-value est présent
    expect(screen.getByTestId('calories-value')).toBeTruthy();
  });

  it('rend sans erreur avec des macros à zéro', () => {
    expect(() =>
      render(<MacroRings calories={0} targetCalories={0} protein={0} carbs={0} fats={0} />)
    ).not.toThrow();
  });

  it('le store reflète l\'état final après toggle (animation reached final state)', () => {
    render(<MacroRings {...defaultProps} />);
    expect(useSettingsStore.getState().macroViewMode).toBe('rings');
    fireEvent.press(screen.getByText('Barres'));
    expect(useSettingsStore.getState().macroViewMode).toBe('bars');
    fireEvent.press(screen.getByText('Anneaux'));
    expect(useSettingsStore.getState().macroViewMode).toBe('rings');
  });
});
