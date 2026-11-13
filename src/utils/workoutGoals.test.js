import { describe, expect, it } from 'vitest';
import { getGoalProgress } from './workoutGoals';

describe('workout goal rules', () => {
  it('calculates bounded goal progress and remaining value', () => {
    expect(getGoalProgress(750, 1000)).toEqual({ value: 750, target: 1000, percentage: 75, remaining: 250, achieved: false });
    expect(getGoalProgress(1200, 1000)).toEqual({ value: 1200, target: 1000, percentage: 100, remaining: 0, achieved: true });
  });

  it('returns a safe empty goal when the target is missing or zero', () => {
    expect(getGoalProgress(50, 0)).toEqual({ value: 50, target: 0, percentage: 0, remaining: 0, achieved: false });
  });
});
