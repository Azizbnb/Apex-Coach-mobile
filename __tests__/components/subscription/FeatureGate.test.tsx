import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Lock } from 'lucide-react-native';
import { FeatureGate } from '@/components/subscription/FeatureGate';

const mockOpenBrowserAsync = jest.fn().mockResolvedValue({ type: 'cancel' });

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: (...args: unknown[]) => mockOpenBrowserAsync(...args),
}));

const defaultProps = {
  icon: Lock,
  title: 'Fonctionnalité Premium',
  description: 'Cette fonctionnalité est réservée aux abonnés Coaching Pro.',
  ctaUrl: 'https://www.apexcoach.app/pricing?utm_source=ios_app',
  ctaLabel: 'Voir mes options sur apexcoach.app',
};

describe('FeatureGate', () => {
  beforeEach(() => {
    mockOpenBrowserAsync.mockClear();
  });

  it('affiche le titre', () => {
    render(<FeatureGate {...defaultProps} />);
    expect(screen.getByText('Fonctionnalité Premium')).toBeTruthy();
  });

  it('affiche la description', () => {
    render(<FeatureGate {...defaultProps} />);
    expect(screen.getByText('Cette fonctionnalité est réservée aux abonnés Coaching Pro.')).toBeTruthy();
  });

  it('affiche le label du CTA primaire', () => {
    render(<FeatureGate {...defaultProps} />);
    expect(screen.getByText('Voir mes options sur apexcoach.app')).toBeTruthy();
  });

  it('ouvre ctaUrl dans le navigateur au tap sur le lien secondaire', () => {
    render(<FeatureGate {...defaultProps} />);
    fireEvent.press(screen.getByRole('link'));
    expect(mockOpenBrowserAsync).toHaveBeenCalledWith(defaultProps.ctaUrl);
  });
});
