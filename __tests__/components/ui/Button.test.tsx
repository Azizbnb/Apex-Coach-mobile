import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('affiche le texte enfant', () => {
    render(<Button>Démarrer</Button>);
    expect(screen.getByText('Démarrer')).toBeTruthy();
  });

  it('appelle onPress quand on tape dessus', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Valider</Button>);
    fireEvent.press(screen.getByText('Valider'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("n'affiche pas le texte en mode chargement", () => {
    render(<Button loading>Test</Button>);
    expect(screen.queryByText('Test')).toBeNull();
  });

  it('opacité réduite quand désactivé', () => {
    const onPress = jest.fn();
    render(
      <Button disabled onPress={onPress}>
        Test
      </Button>,
    );
    expect(screen.getByText('Test')).toBeTruthy();
  });
});
