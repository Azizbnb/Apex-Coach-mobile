import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ChangeObjectiveForm } from '@/components/settings/ChangeObjectiveForm';
import { objectiveApi } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  objectiveApi: { change: jest.fn() },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

const mockChange = jest.mocked(objectiveApi.change);

beforeEach(() => jest.clearAllMocks());

describe('ChangeObjectiveForm', () => {
  it('parcourt warning → select → confirm → POST change-objective', async () => {
    mockChange.mockResolvedValueOnce({ newProgramId: 'prog-2', estimatedMinutes: 2 });
    const onSubmitted = jest.fn();
    const onCancel = jest.fn();

    render(
      <ChangeObjectiveForm
        currentObjective="weight_loss"
        onSubmitted={onSubmitted}
        onCancel={onCancel}
      />
    );

    // Étape warning
    expect(screen.getByText(/une seule fois/)).toBeTruthy();
    fireEvent.press(screen.getByText('Continuer'));

    // Étape select : choisir "Remise en forme" (general_fitness, sans champ conditionnel)
    fireEvent.press(screen.getByLabelText('Remise en forme'));
    fireEvent.press(screen.getByText('Continuer'));

    // Étape confirm
    await waitFor(() =>
      expect(screen.getByText('Je confirme — changer mon objectif')).toBeTruthy()
    );
    fireEvent.press(screen.getByText('Je confirme — changer mon objectif'));

    await waitFor(() =>
      expect(mockChange).toHaveBeenCalledWith({ primaryObjective: 'general_fitness' })
    );
    expect(onSubmitted).toHaveBeenCalledWith({
      newProgramId: 'prog-2',
      estimatedMinutes: 2,
    });
  });

  it('désactive Continuer tant qu\'aucun nouvel objectif valide n\'est choisi', () => {
    render(
      <ChangeObjectiveForm
        currentObjective="weight_loss"
        onSubmitted={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    fireEvent.press(screen.getByText('Continuer')); // warning → select

    // Sélectionner l'objectif ACTUEL est impossible (carte désactivée) → on reste sur select.
    fireEvent.press(screen.getByText('Continuer'));
    // Toujours sur l'étape select (le titre de confirm n'apparaît pas).
    expect(screen.queryByText('Je confirme — changer mon objectif')).toBeNull();
  });

  it('annule depuis le warning', () => {
    const onCancel = jest.fn();
    render(
      <ChangeObjectiveForm
        currentObjective="muscle_gain"
        onSubmitted={jest.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.press(screen.getByText('Garder mon objectif actuel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
