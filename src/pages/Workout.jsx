import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_USER_PROFILE, DEFAULT_WORKOUT_PLAN } from '../data/defaultData';
import { WorkoutCard } from '../components/WorkoutCard';
import { Check, Edit2, HeartPulse, Timer, X, ArrowRight, SkipForward, Pause, Play } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeartRate } from '../hooks/useHeartRate';
import { formatElapsedTime, getElapsedSeconds } from '../utils/sessionTimer';

let globalAudioCtx = null;
const initAudio = () => {
  if (!globalAudioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) globalAudioCtx = new Ctx();
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
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
  const [workoutPlan, setWorkoutPlan] = useLocalStorage('fitness_workout_plan', DEFAULT_WORKOUT_PLAN);
  const [currentDayIndex, setCurrentDayIndex] = useLocalStorage('fitness_workout_current_day', 0);
  const [workoutCycle] = useLocalStorage('fitness_workout_cycle', ['Push', 'Pull', 'Legs', 'Rest']);
  const [history, setHistory] = useLocalStorage('fitness_workout_history', []);
  const [profile] = useLocalStorage('fitness_user_profile', DEFAULT_USER_PROFILE);
  
  // Verificação de limites
  const safeIndex = currentDayIndex >= workoutCycle.length ? 0 : currentDayIndex;
  if (currentDayIndex >= workoutCycle.length) {
    setCurrentDayIndex(0);
  }

  const currentWorkoutType = workoutCycle[safeIndex];
  const isRestDay = currentWorkoutType.toLowerCase().includes('descanso') || currentWorkoutType === 'Rest';
  const exercises = isRestDay ? [] : (workoutPlan[currentWorkoutType] || []);
  
  const [sessionLogs, setSessionLogs] = useLocalStorage('fitness_active_session_logs', []);
  const [sessionStartedAt, setSessionStartedAt] = useLocalStorage('fitness_active_session_started_at', null);
  const [isPaused, setIsPaused] = useLocalStorage('fitness_active_session_paused', false);
  
  const { heartRate, isConnecting, error, connect, disconnect, isConnected } = useHeartRate();

  const [timerEndTime, setTimerEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(() => getElapsedSeconds(sessionStartedAt));

  // Mapeamento dos recordes pessoais (PRs) de cada exercício no histórico
  const prMap = useMemo(() => {
    const map = {};
    history.forEach(session => {
      session.exercises?.forEach(ex => {
        const currentStored = map[ex.exerciseId] || 0;
        const maxInSession = Math.max(0, ...(ex.sets?.map(s => Number(s.load) || 0) || [0]));
        if (maxInSession > currentStored) {
          map[ex.exerciseId] = maxInSession;
        }
      });
    });
    return map;
  }, [history]);

  // Mapeamento da última sessão de cada exercício (para Ghost Sets)
  const lastSessionMap = useMemo(() => {
    const map = {};
    // Ordena do mais recente para o mais antigo
    [...history]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach(session => {
        session.exercises?.forEach(ex => {
          // Registra apenas a sessão mais recente de cada exercício
          if (!map[ex.exerciseId]) {
            map[ex.exerciseId] = {
              sets: ex.sets || [],
              date: new Date(session.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
              maxLoad: Math.max(0, ...(ex.sets?.map(s => Number(s.load) || 0) || [0]))
            };
          }
        });
      });
    return map;
  }, [history]);

  useEffect(() => {
    if (!timerEndTime || isPaused) return undefined;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.ceil((timerEndTime - now) / 1000);
      
      if (remaining <= 0) {
        clearInterval(interval);
        setTimerEndTime(null);
        setTimeLeft(null);
        
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
        playBeep();
        
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            navigator.serviceWorker.ready.then(registration => {
              registration.showNotification("Tempo de Descanso Concluído!", {
                body: "Hora de iniciar a próxima série com força total!",
                icon: "/icon.svg",
                vibrate: [200, 100, 200, 100, 500]
              });
            }).catch(swErr => {
              console.warn('Fallback to standard notification:', swErr);
              new Notification("Tempo de Descanso Concluído!", {
                body: "Hora de iniciar a próxima série!",
                icon: "/icon.svg"
              });
            });
          } catch (notifErr) {
            console.warn('Failed to show notification:', notifErr);
            new Notification("Tempo de Descanso Concluído!", {
              body: "Hora de iniciar a próxima série!",
              icon: "/icon.svg"
            });
          }
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 200);
    
    return () => clearInterval(interval);
  }, [timerEndTime, isPaused]);

  useEffect(() => {
    if (isRestDay || isPaused) return undefined;

    if (!sessionStartedAt) {
      setSessionStartedAt(Date.now());
      return undefined;
    }

    const updateElapsedTime = () => setElapsedSeconds(getElapsedSeconds(sessionStartedAt));
    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);
    return () => clearInterval(interval);
  }, [isRestDay, isPaused, sessionStartedAt, setSessionStartedAt]);

  const pauseWorkout = () => {
    if (!isPaused && sessionStartedAt) {
      setSessionStartedAt(Date.now() - (elapsedSeconds * 1000));
    }
    setIsPaused(true);
  };

  const resumeWorkout = () => {
    setIsPaused(false);
  };

  const startTimer = (customDuration) => {
    initAudio();
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().catch(permErr => console.warn('Notification permission error:', permErr));
    }
    const duration = customDuration || profile.restTimer || 60;
    const now = new Date().getTime();
    setTimerEndTime(now + duration * 1000);
    setTimeLeft(duration);
  };

  const adjustTimer = (amount) => {
    if (!timerEndTime) return;
    const newEndTime = timerEndTime + (amount * 1000);
    if (newEndTime <= Date.now()) {
      setTimerEndTime(null);
      setTimeLeft(null);
    } else {
      setTimerEndTime(newEndTime);
      setTimeLeft(Math.ceil((newEndTime - Date.now()) / 1000));
    }
  };

  const closeTimer = () => {
    setTimerEndTime(null);
    setTimeLeft(null);
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
      durationSeconds: getElapsedSeconds(sessionStartedAt),
    };
    
    setHistory([session, ...history]);
    // Avança para o próximo dia no ciclo
    setCurrentDayIndex((safeIndex + 1) % workoutCycle.length);
    setSessionLogs([]);
    setSessionStartedAt(null);
    setIsPaused(false);
    setElapsedSeconds(0);
    navigate('/');
  };

  const advanceRestDay = () => {
    setCurrentDayIndex((safeIndex + 1) % workoutCycle.length);
  };

  const handleSkipWorkout = () => {
    setSessionLogs([]);
    setSessionStartedAt(null);
    setIsPaused(false);
    setElapsedSeconds(0);
    setTimerEndTime(null);
    setTimeLeft(null);
    setCurrentDayIndex((safeIndex + 1) % workoutCycle.length);
  };

  const completedCount = sessionLogs.length;
  const totalCount = exercises.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '110px' }}>
      {/* Header da Tela de Treino */}
      <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
        <div>
          <div className="flex items-center gap-sm">
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Treino de Hoje</h1>
            <button
              aria-label="Gerenciar fichas de treino"
              style={{ color: 'var(--text-secondary)', padding: '0.3rem' }} 
              onClick={() => navigate('/workout-manager')}
            >
              <Edit2 size={18} />
            </button>
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            {isRestDay ? 'Descanso programado' : `${completedCount} de ${totalCount} exercícios concluídos`}
          </p>
        </div>

        <div className="flex items-center gap-sm">
          {!isRestDay && (
            <span className="clay-pill" aria-label={`Duração da sessão: ${formatElapsedTime(elapsedSeconds)}`} style={{ color: 'var(--status-success)', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.08)' }}>
              <Timer size={15} /> {formatElapsedTime(elapsedSeconds)} min
            </span>
          )}
          {!isRestDay && (
            <button type="button" className="clay-pill" aria-label={isPaused ? 'Retomar treino' : 'Pausar treino'} onClick={isPaused ? resumeWorkout : pauseWorkout} style={{ color: isPaused ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
              {isPaused ? <Play size={15} /> : <Pause size={15} />}
              {isPaused ? 'Retomar' : 'Pausar'}
            </button>
          )}
          {/* Botão de Monitor Cardíaco Bluetooth */}
          {!isConnected ? (
            <button
              onClick={connect} 
              disabled={isConnecting} 
              className="clay-pill"
              style={{ 
                color: 'var(--status-danger)', 
                borderColor: 'rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.08)'
              }}
            >
              <HeartPulse size={15} />
              <span>{isConnecting ? '...' : 'Monitor'}</span>
            </button>
          ) : (
            <button 
              aria-label="Desconectar Monitor Cardíaco" 
              onClick={disconnect} 
              className="clay-pill"
              style={{ 
                color: 'var(--status-danger)', 
                borderColor: 'rgba(239, 68, 68, 0.5)',
                background: 'rgba(239, 68, 68, 0.18)',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)'
              }}
            >
              <HeartPulse size={15} />
              <span>{heartRate ? `${heartRate} bpm` : '--'}</span>
            </button>
          )}

          {/* Badge do Ciclo de Treino Atual */}
          <span 
            className="clay-pill" 
            style={{ 
              color: 'var(--accent-primary)', 
              borderColor: 'rgba(6, 182, 212, 0.4)',
              background: 'rgba(6, 182, 212, 0.12)',
              fontWeight: '700'
            }}
          >
            {currentWorkoutType}
          </span>
        </div>
      </div>
      
      {error && (
        <p style={{ color: 'var(--status-danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      {/* Barra de Progresso do Treino Ativo */}
      {!isRestDay && totalCount > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{
            width: '100%',
            height: '6px',
            background: 'var(--surface-card)',
            borderRadius: '9999px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.04)'
          }}>
            <div 
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #06B6D4, #10B981)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      )}

      {isRestDay ? (
        <div className="clay-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            color: 'var(--status-success)'
          }}>
            💤
          </div>
          <h2 style={{ color: 'var(--status-success)', fontSize: '1.4rem', fontWeight: '700' }}>
            Dia de Recuperação
          </h2>
          <p className="text-muted" style={{ margin: '0.75rem auto 1.75rem auto', maxWidth: '420px', fontSize: '0.9rem' }}>
            O descanso é essencial para a hipertrofia e reconstrução muscular. Mantenha boa hidratação e sono regular.
          </p>
          <button className="clay-btn-primary" onClick={advanceRestDay}>
            Pular Descanso e Ir para o Próximo Treino <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <>
          {exercises.map(ex => {
            const existingLog = sessionLogs.find(l => l.exerciseId === ex.id);
            const prevMax = prMap[ex.id] || 0;
            const lastSession = lastSessionMap[ex.id] || null;
            return (
              <WorkoutCard 
                key={ex.id} 
                exercise={ex} 
                existingLog={existingLog}
                previousMaxLoad={prevMax}
                lastSessionData={lastSession}
                onLogSet={handleLogExercise} 
                onSwap={handleSwapExercise} 
                onSetComplete={() => startTimer(profile.restTimer || 60)} 
              />
            );
          })}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="clay-btn-primary"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.05rem',
                opacity: sessionLogs.length > 0 ? 1 : 0.6
              }}
              onClick={completeWorkout}
              disabled={sessionLogs.length === 0}
            >
              <Check size={20} />
              Concluir Sessão de Treino ({sessionLogs.length}/{exercises.length})
            </button>

            <button
              type="button"
              className="clay-btn-secondary"
              style={{ width: '100%', color: 'var(--text-secondary)' }}
              onClick={handleSkipWorkout}
            >
              <SkipForward size={18} />
              Pular Treino
            </button>
          </div>
        </>
      )}

      {/* Barra Flutuante de Timer de Descanso (Estilo Pílula Tátil Clay) */}
      {timeLeft !== null && (
        <div style={{
          position: 'fixed',
          bottom: '86px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '9999px',
          padding: '0.6rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(6, 182, 212, 0.25)',
          zIndex: 100,
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--accent-primary)'
          }}>
            <Timer size={22} />
            <span style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'monospace' }}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-xs">
            <button 
              type="button"
              aria-label="Diminuir 15 segundos"
              onClick={() => adjustTimer(-15)} 
              className="clay-stepper-btn"
              style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}
            >
              -15s
            </button>
            <button 
              type="button"
              aria-label="Aumentar 30 segundos"
              onClick={() => adjustTimer(30)} 
              className="clay-stepper-btn"
              style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}
            >
              +30s
            </button>
          </div>

          <button 
            type="button"
            onClick={closeTimer} 
            style={{ 
              color: 'var(--text-secondary)', 
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Pular Descanso"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Botão Flutuante Rápido para Iniciar Descanso quando inativo */}
      {timeLeft === null && !isRestDay && (
        <button
          type="button"
          onClick={() => startTimer(profile.restTimer || 60)}
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            background: 'linear-gradient(135deg, #06B6D4, #0891B2)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(6, 182, 212, 0.45)',
            zIndex: 40,
            cursor: 'pointer'
          }}
          aria-label="Iniciar Descanso"
          title="Iniciar Timer de Descanso"
        >
          <Timer size={26} />
        </button>
      )}
    </div>
  );
}
