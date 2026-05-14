import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MealDetail } from '@/components/nutrition/MealDetail';
import type { Meal } from '@/types';

const mockMeal: Meal = {
  id: 'meal-1',
  name: 'Déjeuner',
  time: '12:30',
  foods: [
    { name: 'Poulet grillé', quantity: '150g', calories: 250, protein: 30, carbs: 0, fats: 8 },
    { name: 'Riz basmati', quantity: '100g', calories: 130, protein: 3, carbs: 28, fats: 1 },
  ],
};

describe('MealDetail', () => {
  it('ne rend rien si meal est null', () => {
    render(
      <MealDetail meal={null} visible={false} onClose={jest.fn()} onFoodPress={jest.fn()} />
    );
    expect(screen.queryByText('Déjeuner')).toBeNull();
  });

  it('affiche le nom et l\'heure du repas', () => {
    render(
      <MealDetail meal={mockMeal} visible onClose={jest.fn()} onFoodPress={jest.fn()} />
    );
    expect(screen.getByText('Déjeuner')).toBeTruthy();
    expect(screen.getByText('12:30')).toBeTruthy();
  });

  it('affiche tous les aliments avec leurs quantités', () => {
    render(
      <MealDetail meal={mockMeal} visible onClose={jest.fn()} onFoodPress={jest.fn()} />
    );
    expect(screen.getByText('Poulet grillé')).toBeTruthy();
    expect(screen.getByText('Riz basmati')).toBeTruthy();
    expect(screen.getByText('150g')).toBeTruthy();
    expect(screen.getByText('100g')).toBeTruthy();
  });

  it('appelle onFoodPress avec le bon aliment au tap', () => {
    const onFoodPress = jest.fn();
    render(
      <MealDetail meal={mockMeal} visible onClose={jest.fn()} onFoodPress={onFoodPress} />
    );
    fireEvent.press(screen.getByLabelText('Voir le détail de Poulet grillé'));
    expect(onFoodPress).toHaveBeenCalledWith(mockMeal.foods[0]);
  });

  it('appelle onClose au tap sur le bouton fermer', () => {
    const onClose = jest.fn();
    render(
      <MealDetail meal={mockMeal} visible onClose={onClose} onFoodPress={jest.fn()} />
    );
    fireEvent.press(screen.getByLabelText('Fermer le détail du repas'));
    expect(onClose).toHaveBeenCalled();
  });
});
