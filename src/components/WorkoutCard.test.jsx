import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkoutCard } from './WorkoutCard';

const exercise = {
  id: 'supino-reto',
  name: 'Supino reto',
  sets: 2,
  repRange: '8–12',
};

const previousSession = {
  date: '04/11',
  sets: [
    { load: '20', reps: '10' },
    { load: '22', reps: '8' },
  ],
};

describe('WorkoutCard ghost sets', () => {
  it('copies each previous set into the workout inputs', () => {
    render(
      <WorkoutCard
        exercise={exercise}
        lastSessionData={previousSession}
        onLogSet={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Supino reto'));
    fireEvent.click(screen.getByRole('button', { name: /copiar cargas do último treino/i }));

    expect(screen.getByDisplayValue('20')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('22')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
  });

  it('shows the load progression after a value exceeds the previous set', () => {
    render(
      <WorkoutCard
        exercise={exercise}
        lastSessionData={previousSession}
        onLogSet={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Supino reto'));
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '22' } });

    expect(screen.getByText('+2 kg de sobrecarga progressiva')).toBeInTheDocument();
  });

  it('shows the repetition progression when the load is unchanged', () => {
    render(
      <WorkoutCard
        exercise={exercise}
        lastSessionData={previousSession}
        onLogSet={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Supino reto'));
    fireEvent.change(screen.getAllByRole('spinbutton')[1], { target: { value: '11' } });

    expect(screen.getByText('+1 rep de sobrecarga progressiva')).toBeInTheDocument();
  });

  it('allows each set to be marked complete independently', () => {
    render(
      <WorkoutCard
        exercise={exercise}
        onLogSet={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Supino reto'));
    expect(screen.getByText('Séries concluídas: 0/2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /concluir série 1/i }));
    expect(screen.getByText('Séries concluídas: 1/2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /desmarcar série 1/i }));
    expect(screen.getByText('Séries concluídas: 0/2')).toBeInTheDocument();
  });

  it('shows the progression suggestion for the next session', () => {
    render(
      <WorkoutCard
        exercise={exercise}
        lastSessionData={previousSession}
        progressionSuggestion={{ type: 'reps', value: 11, label: '+1 repetição antes de subir a carga' }}
        onLogSet={vi.fn()}
      />,
    );

    expect(screen.getByText(/próxima sessão: \+1 repetição antes de subir a carga/i)).toBeInTheDocument();
  });
});
