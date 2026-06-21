import { useLocalStorage } from '../hooks/useLocalStorage';
import { WORKOUT_CYCLE, DEFAULT_USER_PROFILE } from '../data/defaultData';
import { WorkoutCard } from '../components/WorkoutCard';
import { Check, Edit2, HeartPulse, Timer, X, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeartRate } from '../hooks/useHeartRate';

export function Workout() {
  const navigate = useNavigate();
  const [workoutPlan] = useLocalStorage('fitness_workout_plan', { Push: [], Pull: [], Legs: [] });
  const [currentDayIndex, setCurrentDayIndex] = useLocalStorage('fitness_workout_current_day', 0);
  const [history, setHistory] = useLocalStorage('fitness_workout_history', []);
  const [profile] = useLocalStorage('fitness_user_profile', DEFAULT_USER_PROFILE);
  
  const currentWorkoutType = WORKOUT_CYCLE[currentDayIndex];
  const isRestDay = currentWorkoutType === 'Rest';
  const exercises = isRestDay ? [] : workoutPlan[currentWorkoutType];
  
  const [sessionLogs, setSessionLogs] = useState([]);
  
  const { heartRate, isConnecting, error, connect, disconnect, isConnected } = useHeartRate();

  const [activeTimer, setActiveTimer] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    setActiveTimer(profile.restTimer || 60);
    const interval = setInterval(() => {
      setActiveTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerInterval(interval);
  };

  const adjustTimer = (amount) => {
    setActiveTimer(prev => {
      if (prev === null) return null;
      const next = prev + amount;
      return next > 0 ? next : 1;
    });
  };

  const closeTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    setActiveTimer(null);
  };

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
        <div className="flex items-center gap-sm">
          {!isConnected ? (
            <button onClick={connect} disabled={isConnecting} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HeartPulse size={16} />
              {isConnecting ? '...' : 'Ligar'}
            </button>
          ) : (
            <div onClick={disconnect} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              <HeartPulse size={16} />
              {heartRate ? `${heartRate} bpm` : '--'}
            </div>
          )}
          <span style={{ background: 'var(--accent-blue)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>
            {currentWorkoutType}
          </span>
        </div>
      </div>
      
      {error && <p style={{ color: 'var(--accent-red)', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}

      {isRestDay ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--accent-green)' }}>Dia de Descanso</h2>
          <p className="text-muted" style={{ margin: '1rem 0' }}>Recupere seus músculos e se prepare para o próximo ciclo.</p>
          <button className="btn-primary" onClick={advanceRestDay}>Pular Descanso</button>
        </div>
      ) : (
        <>
          {exercises.map(ex => (
            <WorkoutCard key={ex.id} exercise={ex} onLogSet={handleLogExercise} onSwap={handleSwapExercise} onSetComplete={startTimer} />
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

      {activeTimer !== null && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(20, 20, 20, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--accent-purple)',
          borderRadius: '2rem',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 100,
          animation: 'slideUp 0.3s ease-out'
        }}>
          <Timer size={24} color="var(--accent-purple)" />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
            {Math.floor(activeTimer / 60)}:{(activeTimer % 60).toString().padStart(2, '0')}
          </span>
          <div className="flex items-center gap-sm">
            <button onClick={() => adjustTimer(-15)} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '0.25rem' }}>
              <Minus size={16} />
            </button>
            <button onClick={() => adjustTimer(15)} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '0.25rem' }}>
              <Plus size={16} />
            </button>
          </div>
          <button onClick={closeTimer} style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
