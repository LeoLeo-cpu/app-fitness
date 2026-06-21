import { useLocalStorage } from '../hooks/useLocalStorage';
import { WORKOUT_CYCLE } from '../data/defaultData';
import { WorkoutCard } from '../components/WorkoutCard';
import { Check, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Workout() {
  const navigate = useNavigate();
  const [workoutPlan] = useLocalStorage('fitness_workout_plan', { Push: [], Pull: [], Legs: [] });
  const [currentDayIndex, setCurrentDayIndex] = useLocalStorage('fitness_workout_current_day', 0);
  const [history, setHistory] = useLocalStorage('fitness_workout_history', []);
  
  const currentWorkoutType = WORKOUT_CYCLE[currentDayIndex];
  const isRestDay = currentWorkoutType === 'Rest';
  const exercises = isRestDay ? [] : workoutPlan[currentWorkoutType];
  
  const [sessionLogs, setSessionLogs] = useState([]);

  const handleLogExercise = (logData) => {
    setSessionLogs(prev => {
      const existing = prev.findIndex(l => l.exerciseId === logData.exerciseId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = logData;
        return updated;
      }
      return [...prev, logData];
    });
  };

  const handleSwapExercise = (exerciseId, newName) => {
    const updatedPlan = { ...workoutPlan };
    const currentList = updatedPlan[currentWorkoutType];
    const index = currentList.findIndex(e => e.id === exerciseId);
    if (index >= 0) {
      currentList[index].name = newName;
      setWorkoutPlan(updatedPlan);
    }
  };

  const completeWorkout = () => {
    const session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      workoutType: currentWorkoutType,
      exercises: sessionLogs,
    };
    
    setHistory([session, ...history]);
    // Advance to next day
    setCurrentDayIndex((currentDayIndex + 1) % WORKOUT_CYCLE.length);
    setSessionLogs([]);
  };

  const advanceRestDay = () => {
    setCurrentDayIndex((currentDayIndex + 1) % WORKOUT_CYCLE.length);
  };

  return (
    <div className="p-md animate-fade-in" style={{ paddingBottom: '100px' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <div className="flex items-center gap-sm">
          <h1>Treino de Hoje</h1>
          <button style={{ color: 'var(--text-muted)' }} onClick={() => navigate('/workout-manager')}>
            <Edit2 size={20} />
          </button>
        </div>
        <span style={{ background: 'var(--accent-blue)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>
          {currentWorkoutType}
        </span>
      </div>

      {isRestDay ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--accent-green)' }}>Dia de Descanso</h2>
          <p className="text-muted" style={{ margin: '1rem 0' }}>Recupere seus músculos e se prepare para o próximo ciclo.</p>
          <button className="btn-primary" onClick={advanceRestDay}>Pular Descanso</button>
        </div>
      ) : (
        <>
          {exercises.map(ex => (
            <WorkoutCard key={ex.id} exercise={ex} onLogSet={handleLogExercise} onSwap={handleSwapExercise} />
          ))}

          <button 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1rem', opacity: sessionLogs.length === exercises.length ? 1 : 0.5 }}
            onClick={completeWorkout}
            disabled={sessionLogs.length === 0}
          >
            <Check size={20} />
            Concluir Sessão de Treino
          </button>
        </>
      )}
    </div>
  );
}
