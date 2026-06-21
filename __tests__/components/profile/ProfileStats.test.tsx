import { render, screen } from '@testing-library/react-native';
import { ProfileStats } from '@/components/profile/ProfileStats';
import type { UserProfile } from '@/types';

function makeProfile(overrides: Partial<UserProfile>): UserProfile {
  return {
    id: 'p1',
    user_id: 'u1',
    goal: 'muscle_gain',
    level: 'intermediate',
    weight: 80,
    height: 180,
    age: 30,
    gender: 'male',
    activity_level: 'moderate',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...overrides,
  };
}

describe('ProfileStats', () => {
  it('affiche taille, poids, IMC, âge et sexe', () => {
    render(<ProfileStats profile={makeProfile({})} />);
    expect(screen.getByText('180 cm')).toBeTruthy();
    expect(screen.getByText('80 kg')).toBeTruthy();
    // IMC = 80 / 1.8^2 = 24.7
    expect(screen.getByText('24.7')).toBeTruthy();
    expect(screen.getByText('30 ans')).toBeTruthy();
    expect(screen.getByText('Homme')).toBeTruthy();
  });

  it('ne rend rien si profil null', () => {
    const { toJSON } = render(<ProfileStats profile={null} />);
    expect(toJSON()).toBeNull();
  });

  it('masque l\'IMC si poids ou taille manquant', () => {
    render(
      <ProfileStats
        profile={makeProfile({ weight: 0, height: 0, age: 25, gender: 'female' })}
      />
    );
    expect(screen.getByText('25 ans')).toBeTruthy();
    expect(screen.getByText('Femme')).toBeTruthy();
    expect(screen.queryByText('IMC')).toBeNull();
  });
});
