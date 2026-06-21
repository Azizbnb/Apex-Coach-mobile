import { render, screen, fireEvent } from '@testing-library/react-native';
import { PainZonesPicker } from '@/components/bilan/PainZonesPicker';

describe('PainZonesPicker', () => {
  it('rend toutes les zones', () => {
    render(<PainZonesPicker value={[]} onChange={jest.fn()} />);
    expect(screen.getByText('Lombaires')).toBeTruthy();
    expect(screen.getByText('Genoux')).toBeTruthy();
    expect(screen.getByText('Épaules')).toBeTruthy();
  });

  it('ajoute une zone au tap', () => {
    const onChange = jest.fn();
    render(<PainZonesPicker value={[]} onChange={onChange} />);
    fireEvent.press(screen.getByText('Genoux'));
    expect(onChange).toHaveBeenCalledWith(['knees']);
  });

  it('retire une zone déjà sélectionnée', () => {
    const onChange = jest.fn();
    render(<PainZonesPicker value={['knees']} onChange={onChange} />);
    fireEvent.press(screen.getByText('Genoux'));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
