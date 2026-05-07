import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { ProgressRing } from '@/components/programme/ProgressRing';

describe('ProgressRing', () => {
  it('affiche 50% pour progress=0.5', () => {
    render(<ProgressRing progress={0.5} />);
    expect(screen.getByText('50%')).toBeTruthy();
  });

  it('affiche 0% pour progress=0', () => {
    render(<ProgressRing progress={0} />);
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('affiche 100% pour progress=1', () => {
    render(<ProgressRing progress={1} />);
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('clamp une valeur supérieure à 1 → 100%', () => {
    render(<ProgressRing progress={1.5} />);
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('clamp une valeur négative → 0%', () => {
    render(<ProgressRing progress={-0.2} />);
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('affiche le label optionnel', () => {
    render(<ProgressRing progress={0.75} label="Terminé" />);
    expect(screen.getByText('Terminé')).toBeTruthy();
  });

  it("n'affiche pas de label quand non fourni", () => {
    render(<ProgressRing progress={0.75} />);
    expect(screen.queryByText('Terminé')).toBeNull();
  });

  it('possède le label accessibilité avec le pourcentage', () => {
    render(<ProgressRing progress={0.6} />);
    expect(screen.getByLabelText('Progression : 60%')).toBeTruthy();
  });

  it('arrondit correctement (0.333 → 33%)', () => {
    render(<ProgressRing progress={0.333} />);
    expect(screen.getByText('33%')).toBeTruthy();
  });
});
