import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { WeekCard } from '@/components/programme/WeekCard';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const baseProps = {
  weekNumber: 1,
  sessionCount: 3,
  progressPercent: 60,
  isUnlocked: true,
};

beforeEach(() => {
  mockPush.mockClear();
});

describe('WeekCard', () => {
  it('affiche le numéro de semaine', () => {
    render(<WeekCard {...baseProps} />);
    expect(screen.getByText('Semaine 1')).toBeTruthy();
  });

  it('affiche le nombre de séances au pluriel', () => {
    render(<WeekCard {...baseProps} sessionCount={3} />);
    expect(screen.getByText('3 séances')).toBeTruthy();
  });

  it('affiche le singulier pour 1 séance', () => {
    render(<WeekCard {...baseProps} sessionCount={1} />);
    expect(screen.getByText('1 séance')).toBeTruthy();
  });

  it('affiche le pourcentage de progression quand déverrouillée', () => {
    render(<WeekCard {...baseProps} progressPercent={75} />);
    expect(screen.getByText('75%')).toBeTruthy();
  });

  it('navigue vers [weekNumber] au press si déverrouillée', () => {
    render(<WeekCard {...baseProps} weekNumber={2} />);
    fireEvent.press(screen.getByRole('button'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/programme/2');
  });

  it("n'appelle pas le router si verrouillée", () => {
    render(
      <WeekCard
        {...baseProps}
        isUnlocked={false}
        unlockDate={new Date('2026-05-10')}
        daysUntilUnlock={4}
      />,
    );
    fireEvent.press(screen.getByRole('button'));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('affiche le message de verrouillage quand locked', () => {
    render(
      <WeekCard
        {...baseProps}
        isUnlocked={false}
        unlockDate={new Date('2026-05-10')}
        daysUntilUnlock={4}
      />,
    );
    expect(screen.getByText(/Disponible dès le/)).toBeTruthy();
  });

  it('affiche "Débloquée demain" quand daysUntilUnlock = 1', () => {
    render(
      <WeekCard
        {...baseProps}
        isUnlocked={false}
        unlockDate={new Date('2026-05-07')}
        daysUntilUnlock={1}
      />,
    );
    expect(screen.getByText('Débloquée demain')).toBeTruthy();
  });

  it('affiche "Bientôt disponible" sans unlockDate', () => {
    render(<WeekCard {...baseProps} isUnlocked={false} />);
    expect(screen.getByText('Bientôt disponible')).toBeTruthy();
  });
});
