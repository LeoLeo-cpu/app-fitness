const toPositiveNumber = value => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

const flattenSets = exercises => (exercises || []).flatMap(exercise => exercise?.sets || []);

export function getCompletedSetCount(exercises) {
  return flattenSets(exercises).filter(set => set.completed === true).length;
}

export function getSessionVolume(exercises) {
  return flattenSets(exercises).reduce((total, set) => total + (toPositiveNumber(set.load) * toPositiveNumber(set.reps)), 0);
}

export function getMaxLoad(exercises) {
  return Math.max(0, ...flattenSets(exercises).map(set => toPositiveNumber(set.load)));
}

export function getPersonalRecords(history) {
  const records = {};
  (history || []).forEach(session => {
    (session.exercises || []).forEach(exercise => {
      const current = records[exercise.exerciseId] || { maxLoad: 0, maxVolume: 0 };
      records[exercise.exerciseId] = {
        maxLoad: Math.max(current.maxLoad, getMaxLoad([exercise])),
        maxVolume: Math.max(current.maxVolume, getSessionVolume([exercise])),
      };
    });
  });
  return records;
}

function getRepCeiling(repRange) {
  const matches = String(repRange || '').match(/\d+/g) || [];
  return Number(matches[matches.length - 1]) || 0;
}

export function getProgressionSuggestion(previousSets, repRange) {
  const validSets = (previousSets || []).filter(set => toPositiveNumber(set.load) > 0 && toPositiveNumber(set.reps) > 0);
  if (!validSets.length) return null;

  const ceiling = getRepCeiling(repRange);
  const averageReps = validSets.reduce((total, set) => total + toPositiveNumber(set.reps), 0) / validSets.length;
  const load = Math.max(...validSets.map(set => toPositiveNumber(set.load)));

  if (ceiling > 0 && averageReps < ceiling) {
    return { type: 'reps', value: Math.ceil(averageReps) + 1, label: '+1 repetição antes de subir a carga' };
  }

  return { type: 'load', value: load + 2, label: '+2 kg na próxima sessão' };
}
