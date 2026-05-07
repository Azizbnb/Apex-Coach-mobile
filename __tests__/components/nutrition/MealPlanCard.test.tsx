import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MealPlanCard } from '@/components/nutrition/MealPlanCard';
import type { Meal } from '@/types';

const mockMeal: Meal = {
  id: 'meal-1',
  name: 'Petit-déjeuner',
  time: '08:00',
  foods: [
    { name: 'Flocons d\'avoine', quantity: '80g', calories: 300, protein: 10, carbs: 55, fats: 5 },
    { name: 'Banane', quantity: '1 unité', calories: 90, protein: 1, carbs: 23, fats: 0 },
    { name: 'Lait écrémé', quantity: '200ml', calories: 70, protein: 7, carbs: 10, fats: 0 },
  ],
};

describe('MealPlanCard', () => {
  it('affiche le nom du repas', () => {
    render(<MealPlanCard meal={mockMeal} />);
    expect(screen.getByText('Petit-déjeuner')).toBeTruthy();
  });

  it('affiche l\'heure du repas', () => {
    render(<MealPlanCard meal={mockMeal} />);
    expect(screen.getByText('08:00')).toBeTruthy();
  });

  it('affiche les aliments du repas', () => {
    render(<MealPlanCard meal={mockMeal} />);
    expect(screen.getByText('Flocons d\'avoine')).toBeTruthy();
    expect(screen.getByText('Banane')).toBeTruthy();
  });

  it('affiche les calories totales du repas', () => {
    render(<MealPlanCard meal={mockMeal} />);
    expect(screen.getByText(/460 kcal/)).toBeTruthy();
  });

  it('appelle onPress au tap', () => {
    const onPress = jest.fn();
    render(<MealPlanCard meal={mockMeal} onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('affiche "+X aliments" si plus de 4 aliments', () => {
    const bigMeal: Meal = {
      ...mockMeal,
      foods: [
        ...mockMeal.foods,
        { name: 'Œuf', quantity: '1', calories: 80, protein: 6, carbs: 1, fats: 5 },
        { name: 'Fromage blanc', quantity: '100g', calories: 60, protein: 8, carbs: 4, fats: 1 },
      ],
    };
    render(<MealPlanCard meal={bigMeal} />);
    expect(screen.getByText(/\+1 aliment/)).toBeTruthy();
  });

  it('affiche le rôle accessibilité "button"', () => {
    render(<MealPlanCard meal={mockMeal} onPress={jest.fn()} />);
    expect(screen.getByRole('button')).toBeTruthy();
  });
});
