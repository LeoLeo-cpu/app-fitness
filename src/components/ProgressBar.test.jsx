import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar Component', () => {
  it('should render the label and current/max values', () => {
    render(<ProgressBar label="Calorias" current={1500} max={2000} color="blue" />);
    
    expect(screen.getByText('Calorias')).toBeInTheDocument();
    expect(screen.getByText('1500 / 2000')).toBeInTheDocument();
  });

  it('should handle zero max safely without throwing or rendering NaN', () => {
    render(<ProgressBar label="Proteína" current={0} max={0} color="red" />);
    
    expect(screen.getByText('Proteína')).toBeInTheDocument();
    expect(screen.getByText('0 / 0')).toBeInTheDocument();
    // It should not render "Excedeu" if max is 0
    expect(screen.queryByText('(Excedeu)')).not.toBeInTheDocument();
  });

  it('should display "(Excedeu)" when current is greater than max', () => {
    render(<ProgressBar label="Gordura" current={100} max={80} color="yellow" />);
    
    expect(screen.getByText(/100 \/ 80/)).toBeInTheDocument();
    expect(screen.getByText('(Excedeu)')).toBeInTheDocument();
  });
});
