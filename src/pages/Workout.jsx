import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_USER_PROFILE } from '../data/defaultData';
import { WorkoutCard } from '../components/WorkoutCard';
import { Check, Edit2, HeartPulse, Timer, X, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeartRate } from '../hooks/useHeartRate';

let globalAudioCtx = null;
let silentAudioEl = null;

const initAudio = () => {
  if (!globalAudioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) globalAudioCtx = new Ctx();
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
};

const startSilentAudio = () => {
  if (!silentAudioEl) {
    // 1-sample silent WAV
    silentAudioEl = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
    silentAudioEl.loop = true;
    silentAudioEl.volume = 0.01;
  }
  silentAudioEl.play().catch(e => console.warn("Audio play blocked", e));
};

const stopSilentAudio = () => {
  if (silentAudioEl) {
    silentAudioEl.pause();
    silentAudioEl.currentTime = 0;
  }
};

const playBeep = () => {
  if (!globalAudioCtx) return;
  try {
    const osc = globalAudioCtx.createOscillator();
    const gainNode = globalAudioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(globalAudioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, globalAudioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, globalAudioCtx.currentTime);
    osc.start();
    osc.stop(globalAudioCtx.currentTime + 0.8);
  } catch (e) {
    console.warn("Audio beep failed", e);
  }
};

export function Workout() {
  const navigate = useNavigate();
  const [workoutPlan, setWorkoutPlan] = useLocalStorage('fitness_workout_plan', { Push: [], Pull: [], Legs: [] });
  const [currentDayIndex, setCurrentDayIndex] = useLocalStorage('fitness_workout_current_day', 0);
  const [workoutCycle] = useLocalStorage('fitness_workout_cycle', ['Push', 'Pull', 'Legs', 'Rest']);
  const [history, setHistory] = useLocalStorage('fitness_workout_history', []);
  const [profile] = useLocalStorage('fitness_user_profile', DEFAULT_USER_PROFILE);
  
  // Safe bounds check
  const safeIndex = currentDayIndex >= workoutCycle.length ? 0 : currentDayIndex;
  if (currentDayIndex >= workoutCycle.length) {
    setCurrentDayIndex(0);
  }

  const currentWorkoutType = workoutCycle[safeIndex];
  const isRestDay = currentWorkoutType.toLowerCase().includes('descanso') || currentWorkoutType === 'Rest';
  const exercises = isRestDay ? [] : (workoutPlan[currentWorkoutType] || []);
  
  const [sessionLogs, setSessionLogs] = useLocalStorage('fitness_active_session_logs', []);
  
  const { heartRate, isConnecting, error, connect, disconnect, isConnected } = useHeartRate();

  const [timerEndTime, setTimerEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!timerEndTime) {
      setTimeLeft(null);
      return;
    }
    
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.ceil((timerEndTime - now) / 1000);
      
      if (remaining <= 0) {
        clearInterval(interval);
        setTimerEndTime(null);
        setTimeLeft(null);
        stopSilentAudio();
        
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
        playBeep();
        
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            // Service Worker approach for PWAs if available, fallback to Notification API
            navigator.serviceWorker.ready.then(registration => {
              registration.showNotification("Tempo esgotado!", {
                body: "Pronto para a próxima série?",
                icon: "/icon.svg",
                vibrate: [200, 100, 200, 100, 500]
              });
            }).catch(() => {
              new Notification("Tempo esgotado!", {
                body: "Pronto para a próxima série?",
                icon: "/icon.svg"
              });
            });
          } catch (e) {
            new Notification("Tempo esgotado!", {
              body: "Pronto para a próxima série?",
              icon: "/icon.svg"
            });
          }
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 200);
    
    return () => clearInterval(interval);
  }, [timerEndTime]);

  const startTimer = () => {
    initAudio(); // Apple iOS requires AudioContext to be resumed strictly during a user click
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    const duration = profile.restTimer || 60;
    setTimerEndTime(Date.now() + duration * 1000);
    setTimeLeft(duration);
    startSilentAudio(); // Keeps the app running in the background for the notification
  };

  const adjustTimer = (amount) => {
    if (!timerEndTime) return;
    const newEndTime = timerEndTime + (amount * 1000);
    if (newEndTime <= Date.now()) {
      setTimerEndTime(null);
      setTimeLeft(null);
      stopSilentAudio();
    } else {
      setTimerEndTime(newEndTime);
      setTimeLeft(Math.ceil((newEndTime - Date.now()) / 1000));
    }
  };

  const closeTimer = () => {
    setTimerEndTime(null);
    setTimeLeft(null);
    stopSilentAudio();
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
    setCurrentDayIndex((safeIndex + 1) % workoutCycle.length);
    setSessionLogs([]);
  };

  const advanceRestDay = () => {
    setCurrentDayIndex((safeIndex + 1) % workoutCycle.length);
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
            <button aria-label="Desconectar Monitor Cardíaco" onClick={disconnect} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>
              <HeartPulse size={16} />
              {heartRate ? `${heartRate} bpm` : '--'}
            </button>
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
          {exercises.map(ex => {
            const existingLog = sessionLogs.find(l => l.exerciseId === ex.id);
            return (
              <WorkoutCard 
                key={ex.id} 
                exercise={ex} 
                existingLog={existingLog}
                onLogSet={handleLogExercise} 
                onSwap={handleSwapExercise} 
                onSetComplete={startTimer} 
              />
            );
          })}

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

      {timeLeft !== null && (
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
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
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

      {timeLeft === null && !isRestDay && (
        <button
          onClick={startTimer}
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            background: 'var(--accent-blue)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
            zIndex: 90,
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          aria-label="Iniciar Descanso Global"
        >
          <Timer size={28} />
        </button>
      )}
    </div>
  );
}
