import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { MacroSummary } from '@/components/nutrition/MacroSummary';

const defaultProps = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fats: 70,
};

describe('MacroSummary', () => {
  it('affiche le total de calories', () => {
    render(<MacroSummary {...defaultProps} />);
    expect(screen.getByText('2000 kcal')).toBeTruthy();
  });

  it('affiche le titre "Macros du jour"', () => {
    render(<MacroSummary {...defaultProps} />);
    expect(screen.getByText('Macros du jour')).toBeTruthy();
  });

  it('affiche la valeur des protéines en grammes', () => {
    render(<MacroSummary {...defaultProps} />);
    expect(screen.getByText(/150g/)).toBeTruthy();
  });

  it('affiche la valeur des glucides en grammes', () => {
    render(<MacroSummary {...defaultProps} />);
    expect(screen.getByText(/200g/)).toBeTruthy();
  });

  it('affiche la valeur des lipides en grammes', () => {
    render(<MacroSummary {...defaultProps} />);
    expect(screen.getByText(/70g/)).toBeTruthy();
  });

  it('affiche 0 kcal quand les macros sont nuls', () => {
    render(<MacroSummary calories={0} protein={0} carbs={0} fats={0} />);
    expect(screen.getByText('0 kcal')).toBeTruthy();
  });

  it('affiche les labels Protéines, Glucides, Lipides', () => {
    render(<MacroSummary {...defaultProps} />);
    expect(screen.getByText('Protéines')).toBeTruthy();
    expect(screen.getByText('Glucides')).toBeTruthy();
    expect(screen.getByText('Lipides')).toBeTruthy();
  });
});
