import { render, screen, fireEvent, within } from '@testing-library/react-native';
import { BilanForm, type BilanFormProps } from '@/components/bilan/BilanForm';

const baseCompletion = { exercisesCompleted: 8, exercisesTotal: 10, rate: 80 };

function setup(overrides: Partial<BilanFormProps> = {}) {
  const onSubmit = jest.fn();
  render(
    <BilanForm
      weekNumber={1}
      completion={baseCompletion}
      skippedExercises={[]}
      planType="coaching"
      isFastingActive={false}
      onSubmit={onSubmit}
      {...overrides}
    />
  );
  return { onSubmit };
}

describe('BilanForm — sections conditionnelles', () => {
  it('cache la section poids en semaine impaire', () => {
    setup({ weekNumber: 1 });
    expect(screen.queryByText('Ton poids')).toBeNull();
  });

  it('affiche la section poids en semaine paire', () => {
    setup({ weekNumber: 2 });
    expect(screen.getByText('Ton poids')).toBeTruthy();
  });

  it('affiche les signaux nutrition uniquement en Coaching Pro', () => {
    setup({ planType: 'coaching' });
    expect(screen.queryByText('Niveau de faim')).toBeNull();

    screen.unmount();
    setup({ planType: 'coaching_pro' });
    expect(screen.getByText('Niveau de faim')).toBeTruthy();
  });

  it('affiche la section jeûne si le mode est actif', () => {
    setup({ isFastingActive: true, fastingLevel: 'moderate' });
    expect(screen.getByText(/Feedback jeûne/)).toBeTruthy();
    expect(screen.getByText('Continuer')).toBeTruthy();
    expect(screen.getByText('Arrêter')).toBeTruthy();
  });

  it('affiche les exercices sautés quand présents', () => {
    setup({
      skippedExercises: [
        { exerciseName: 'Deadlift', count: 2, sessions: [1], muscles: [] },
      ],
    });
    expect(screen.getByText('Deadlift')).toBeTruthy();
    expect(screen.getByText('Douleur / Inconfort')).toBeTruthy();
  });
});

describe('BilanForm — submit', () => {
  it('bloque le submit tant que difficulté/énergie manquent', () => {
    const { onSubmit } = setup();
    fireEvent.press(screen.getByText('Envoyer mon bilan'));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText(/au moins la difficulté et ton niveau d/)
    ).toBeTruthy();
  });

  it('envoie un body valide avec completion_rate du contexte', () => {
    const { onSubmit } = setup({ weekNumber: 1 });

    const difficulty = screen.getByLabelText('Difficulté');
    fireEvent.press(within(difficulty).getByLabelText('Difficulté : 3 sur 5'));
    const energy = screen.getByLabelText('Énergie');
    fireEvent.press(within(energy).getByLabelText('Énergie : 4 sur 5'));

    fireEvent.press(screen.getByText('Envoyer mon bilan'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        week_number: 1,
        completion_rate: 80,
        difficulty_rating: 3,
        energy_level: 4,
      })
    );
  });
});
