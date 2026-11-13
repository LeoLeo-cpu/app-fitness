import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Workout } from './Workout';

describe('Workout', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('fitness_workout_cycle', JSON.stringify(['Push', 'Pull']));
    window.localStorage.setItem('fitness_workout_current_day', JSON.stringify(0));
    window.localStorage.setItem('fitness_workout_history', JSON.stringify([]));
    window.localStorage.setItem('fitness_active_session_logs', JSON.stringify([
      { exerciseId: 'p1', name: 'Supino reto', sets: [{ load: '20', reps: '10' }] },
    ]));
  });

  it('skips the active workout without adding it to history', async () => {
    render(<Workout />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByRole('button', { name: /pular treino/i }));

    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem('fitness_workout_current_day'))).toBe(1);
      expect(JSON.parse(window.localStorage.getItem('fitness_active_session_logs'))).toEqual([]);
      expect(JSON.parse(window.localStorage.getItem('fitness_workout_history'))).toEqual([]);
    });
  });

  it('pauses and resumes the active workout without changing its progress', async () => {
    render(<Workout />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByRole('button', { name: /pausar treino/i }));
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem('fitness_active_session_paused'))).toBe(true);
      expect(JSON.parse(window.localStorage.getItem('fitness_workout_current_day'))).toBe(0);
      expect(JSON.parse(window.localStorage.getItem('fitness_active_session_logs'))).toHaveLength(1);
    });

    fireEvent.click(screen.getByRole('button', { name: /retomar treino/i }));
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem('fitness_active_session_paused'))).toBe(false);
    });
  });
});
