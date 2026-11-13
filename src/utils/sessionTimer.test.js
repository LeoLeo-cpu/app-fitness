import { describe, expect, it } from 'vitest';
import { formatElapsedTime, getElapsedSeconds } from './sessionTimer';

describe('session timer utilities', () => {
  it('formats elapsed seconds as minutes and seconds', () => {
    expect(formatElapsedTime(1935)).toBe('32:15');
  });

  it('returns elapsed whole seconds without allowing negative durations', () => {
    expect(getElapsedSeconds(1000, 4250)).toBe(3);
    expect(getElapsedSeconds(5000, 4000)).toBe(0);
  });
});
