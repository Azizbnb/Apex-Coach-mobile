import { render, screen } from '@testing-library/react-native';
import { MacroRings } from '@/components/nutrition/MacroRings';

describe('MacroRings', () => {
  // protein 150*4=600, carbs 200*4=800, fats 60*9=540 → total 1940
  const props = { calories: 1940, protein: 150, carbs: 200, fats: 60 };

  it('affiche le total calorique au centre', () => {
    render(<MacroRings {...props} />);
    expect(screen.getByText('1940')).toBeTruthy();
    expect(screen.getByText('kcal')).toBeTruthy();
  });

  it('affiche la légende grammes + pourcentage par macro', () => {
    render(<MacroRings {...props} />);
    expect(screen.getByText('Protéines')).toBeTruthy();
    expect(screen.getByText('150g · 31%')).toBeTruthy(); // 600/1940
    expect(screen.getByText('200g · 41%')).toBeTruthy(); // 800/1940
    expect(screen.getByText('60g · 28%')).toBeTruthy(); // 540/1940
  });

  it('gère un total nul sans crash', () => {
    render(<MacroRings calories={0} protein={0} carbs={0} fats={0} />);
    // Les 3 macros affichent toutes 0g · 0%
    expect(screen.getAllByText('0g · 0%')).toHaveLength(3);
  });
});
