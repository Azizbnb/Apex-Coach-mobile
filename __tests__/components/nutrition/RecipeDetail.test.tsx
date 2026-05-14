import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { RecipeDetail } from '@/components/nutrition/RecipeDetail';
import type { Food } from '@/types';

const mockFood: Food = {
  name: 'Poulet grillé',
  quantity: '150g',
  calories: 248,
  protein: 46,
  carbs: 12,
  fats: 6,
};

describe('RecipeDetail', () => {
  it('ne rend rien si food est null', () => {
    const { queryByText } = render(
      <RecipeDetail food={null} visible={true} onClose={jest.fn()} />
    );
    expect(queryByText('Valeurs nutritionnelles')).toBeNull();
  });

  it('affiche les calories', () => {
    render(<RecipeDetail food={mockFood} visible={true} onClose={jest.fn()} />);
    expect(screen.getByText('248 kcal')).toBeTruthy();
  });

  it('affiche les macros (protéines, glucides, lipides)', () => {
    render(<RecipeDetail food={mockFood} visible={true} onClose={jest.fn()} />);
    expect(screen.getByText('46g')).toBeTruthy();
    expect(screen.getByText('12g')).toBeTruthy();
    expect(screen.getByText('6g')).toBeTruthy();
  });

  it('appelle onClose au tap sur le bouton fermeture', () => {
    const onClose = jest.fn();
    render(<RecipeDetail food={mockFood} visible={true} onClose={onClose} />);
    fireEvent.press(screen.getByLabelText('Fermer le détail de la recette'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
