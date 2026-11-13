export function getGoalProgress(value, target) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const safeTarget = Number.isFinite(Number(target)) && Number(target) > 0 ? Number(target) : 0;

  if (!safeTarget) {
    return { value: safeValue, target: 0, percentage: 0, remaining: 0, achieved: false };
  }

  return {
    value: safeValue,
    target: safeTarget,
    percentage: Math.min(100, Math.round((safeValue / safeTarget) * 100)),
    remaining: Math.max(0, safeTarget - safeValue),
    achieved: safeValue >= safeTarget,
  };
}
