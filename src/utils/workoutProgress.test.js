import { describe, expect, it } from 'vitest';
import {
  getCompletedSetCount,
  getMaxLoad,
  getPersonalRecords,
  getProgressionSuggestion,
  getSessionVolume,
} from './workoutProgress';

describe('workout progress rules', () => {
  it('counts only completed sets and calculates volume safely', () => {
    const exercises = [{
      exerciseId: 'p1',
      sets: [
        { load: '20', reps: '10', completed: true },
        { load: 'invalid', reps: '10', completed: false },
      ],
    }];

    expect(getCompletedSetCount(exercises)).toBe(1);
    expect(getSessionVolume(exercises)).toBe(200);
    expect(getMaxLoad(exercises)).toBe(20);
  });

  it('returns personal records by exercise across sessions', () => {
    expect(getPersonalRecords([
      { exercises: [{ exerciseId: 'p1', sets: [{ load: '20', reps: '10' }] }] },
      { exercises: [{ exerciseId: 'p1', sets: [{ load: '22', reps: '8' }] }] },
    ])).toEqual({ p1: { maxLoad: 22, maxVolume: 200 } });
  });

  it('suggests reps before load when the previous session is below the rep range', () => {
    expect(getProgressionSuggestion([{ load: '20', reps: '10' }], '8-12')).toEqual({
      type: 'reps',
      value: 11,
      label: '+1 repetição antes de subir a carga',
    });
  });

  it('suggests a small load increase after reaching the rep range ceiling', () => {
    expect(getProgressionSuggestion([{ load: '20', reps: '12' }], '8-12')).toEqual({
      type: 'load',
      value: 22,
      label: '+2 kg na próxima sessão',
    });
  });
});
