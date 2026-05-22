import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ShoppingList, classifyFood, CATEGORY_ORDER } from '@/components/nutrition/ShoppingList';
import type { Meal } from '@/types';

const mockMeals: Meal[] = [
  {
    id: 'meal-1',
    name: 'Petit-déjeuner',
    time: '08:00',
    foods: [
      { name: "Flocons d'avoine", quantity: '80g', calories: 300, protein: 10, carbs: 55, fats: 5 },
      { name: 'Banane', quantity: '1 unité', calories: 90, protein: 1, carbs: 23, fats: 0 },
    ],
  },
  {
    id: 'meal-2',
    name: 'Déjeuner',
    time: '12:30',
    foods: [
      { name: 'Poulet', quantity: '150g', calories: 248, protein: 46, carbs: 0, fats: 6 },
      { name: "Flocons d'avoine", quantity: '50g', calories: 190, protein: 7, carbs: 34, fats: 3 },
    ],
  },
];

describe('ShoppingList', () => {
  it('masque le contenu si visible est false', () => {
    const { queryByText } = render(
      <ShoppingList meals={mockMeals} visible={false} onClose={jest.fn()} />
    );
    expect(queryByText('Liste de courses')).toBeNull();
  });

  it("agrège les quantités pour un même ingrédient", () => {
    render(<ShoppingList meals={mockMeals} visible={true} onClose={jest.fn()} />);
    expect(screen.getByText('80g + 50g')).toBeTruthy();
  });

  it('affiche le compteur total des ingrédients uniques', () => {
    render(<ShoppingList meals={mockMeals} visible={true} onClose={jest.fn()} />);
    expect(screen.getByText(/3 ingrédients/)).toBeTruthy();
  });

  it('place Légumes avant Féculents dans le rendu (ordre catégories)', () => {
    const meals: Meal[] = [{
      id: 'm1',
      name: 'Repas',
      time: '12:00',
      foods: [
        { name: 'Riz', quantity: '100g', calories: 350, protein: 7, carbs: 77, fats: 1 },
        { name: 'Avocat', quantity: '1/2', calories: 160, protein: 2, carbs: 9, fats: 15 },
      ],
    }];
    render(<ShoppingList meals={meals} visible={true} onClose={jest.fn()} />);
    const items = screen.getAllByText(/^(Avocat|Riz)$/);
    expect(items[0]).toHaveTextContent('Avocat');
    expect(items[1]).toHaveTextContent('Riz');
  });

  it('appelle onClose au tap sur le bouton fermeture', () => {
    const onClose = jest.fn();
    render(<ShoppingList meals={mockMeals} visible={true} onClose={onClose} />);
    fireEvent.press(screen.getByLabelText('Fermer la liste de courses'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('groupe Poulet en Protéines et Flocons en Féculents', () => {
    render(<ShoppingList meals={mockMeals} visible={true} onClose={jest.fn()} />);
    expect(screen.getByText('Protéines')).toBeTruthy();
    expect(screen.getByText('Féculents')).toBeTruthy();
    expect(screen.queryByText('Légumes')).toBeNull();
  });

  it('range les ingrédients non reconnus dans Autres', () => {
    const meals: Meal[] = [{
      id: 'm1',
      name: 'Test',
      time: '12:00',
      foods: [
        { name: 'Poudre magique XYZ', quantity: '10g', calories: 0, protein: 0, carbs: 0, fats: 0 },
      ],
    }];
    render(<ShoppingList meals={meals} visible={true} onClose={jest.fn()} />);
    expect(screen.getByText('Autres')).toBeTruthy();
    expect(screen.getByText('Poudre magique XYZ')).toBeTruthy();
  });

  it('affiche "Aucun ingrédient" quand les repas sont vides', () => {
    render(<ShoppingList meals={[]} visible={true} onClose={jest.fn()} />);
    expect(screen.getByText(/Aucun ingrédient/)).toBeTruthy();
  });
});

describe('classifyFood', () => {
  it('classifie le poulet en Protéines', () => {
    expect(classifyFood('Poulet')).toBe('Protéines');
  });

  it('classifie le riz en Féculents', () => {
    expect(classifyFood('Riz blanc')).toBe('Féculents');
  });

  it('classifie la tomate en Légumes', () => {
    expect(classifyFood('Tomate cerise')).toBe('Légumes');
  });

  it("classifie l'huile d'olive en Épicerie", () => {
    expect(classifyFood("Huile d'olive")).toBe('Épicerie');
  });

  it('classe un aliment inconnu en Autres', () => {
    expect(classifyFood('Ingrédient inconnu XYZ123')).toBe('Autres');
  });

  it('respecte le même ordre que CATEGORY_ORDER', () => {
    expect(CATEGORY_ORDER).toEqual(['Légumes', 'Protéines', 'Féculents', 'Épicerie', 'Autres']);
  });
});
