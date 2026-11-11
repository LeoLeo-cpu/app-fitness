import { useState } from 'react';
import React from 'react';
import { AlertCircle, CheckCircle, PlaySquare, RefreshCw, Timer, Plus, Minus, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { VideoModal } from './VideoModal';

export const WorkoutCard = React.memo(function WorkoutCard({ 
  exercise, 
  onLogSet, 
  onSwap, 
  onSetComplete, 
  existingLog,
  previousMaxLoad = 0 
}) {
  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState(
    existingLog ? existingLog.sets : Array(exercise.sets).fill({ reps: '', load: exercise.suggestedLoad || '' })
  );
  const [note, setNote] = useState(existingLog ? existingLog.note : '');
  const [completed, setCompleted] = useState(!!existingLog);
  const [showVideo, setShowVideo] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const handleLogChange = (index, field, value) => {
    const newLogs = [...logs];
    newLogs[index] = { ...newLogs[index], [field]: value };
    setLogs(newLogs);
  };

  const handleStep = (index, field, delta) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch (e) {
        console.warn('Vibration not permitted', e);
      }
    }
    const currentVal = Number(logs[index][field]) || 0;
    const nextVal = Math.max(0, currentVal + delta);
    handleLogChange(index, field, nextVal.toString());
  };

  const handleComplete = () => {
    onLogSet({
      exerciseId: exercise.id,
      name: exercise.name,
      sets: logs,
      note
    });
    setCompleted(true);
    setExpanded(false);
    if (onSetComplete) {
      onSetComplete();
    }
  };

  // Cálculo de Carga Máxima atual vs Recorde Pessoal
  const currentMaxLoad = Math.max(0, ...logs.map(s => Number(s.load) || 0));
  const isNewPR = previousMaxLoad > 0 && currentMaxLoad > previousMaxLoad;

  return (
    <div 
      className={`clay-card ${completed ? 'completed' : ''} ${expanded ? 'clay-card-active' : ''}`} 
      style={{ 
        padding: '1.25rem', 
        marginBottom: '1rem',
        borderLeft: completed ? '4px solid var(--status-success)' : (expanded ? '4px solid var(--accent-primary)' : '1px solid var(--border-subtle)'),
        transition: 'all 0.2s ease'
      }}
    >
      {/* Header do Card */}
      <div 
        className="flex justify-between items-center" 
        onClick={() => setExpanded(!expanded)} 
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ flex: 1, paddingRight: '0.5rem' }}>
          <div className="flex items-center gap-xs" style={{ flexWrap: 'wrap', marginBottom: '0.2rem' }}>
            <h3 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '700',
              color: completed ? 'var(--text-secondary)' : '#FFFFFF' 
            }}>
              {exercise.name}
            </h3>

            {exercise.attentionShoulder && !completed && (
              <span 
                className="clay-pill" 
                style={{ 
                  color: 'var(--status-danger)', 
                  borderColor: 'rgba(239, 68, 68, 0.3)', 
                  background: 'rgba(239, 68, 68, 0.1)',
                  fontSize: '0.72rem',
                  padding: '0.15rem 0.5rem'
                }}
                title="Cuidado com articulações - reduza a carga se sentir desconforto"
              >
                <AlertCircle size={13} /> Ombro
              </span>
            )}

            {isNewPR && (
              <span className="clay-badge-pr animate-fade-in">
                <Trophy size={13} /> Novo PR! ({currentMaxLoad}kg)
              </span>
            )}
          </div>

          <div className="flex items-center gap-sm text-muted" style={{ fontSize: '0.8rem' }}>
            <span>{exercise.sets} séries × {exercise.repRange} reps</span>
            {previousMaxLoad > 0 && (
              <span>• Recorde: {previousMaxLoad} kg</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-sm">
          {completed ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--status-success)',
              fontWeight: '700',
              fontSize: '0.85rem',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}>
              <CheckCircle size={18} /> Concluído
            </div>
          ) : (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: expanded ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: expanded ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}>
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo Expandido do Exercício com Controles Táteis */}
      {expanded && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }} className="animate-fade-in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {logs.map((log, i) => (
              <div 
                key={i} 
                style={{ 
                  background: '#131B2E', 
                  padding: '0.75rem 0.85rem', 
                  borderRadius: '14px', 
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ minWidth: '60px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                    Série {i + 1}
                  </span>
                </div>

                {/* Controle de Carga com Stepper Tátil */}
                <div className="flex items-center gap-xs">
                  <button 
                    type="button"
                    aria-label={`Diminuir 2kg na série ${i + 1}`}
                    className="clay-stepper-btn" 
                    onClick={() => handleStep(i, 'load', -2)}
                  >
                    <Minus size={14} />
                  </button>
                  <div style={{ position: 'relative', width: '75px' }}>
                    <input 
                      type="number" 
                      placeholder="kg" 
                      className="input-field" 
                      style={{ padding: '0.45rem 0.4rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: '700' }}
                      value={log.load} 
                      onChange={e => handleLogChange(i, 'load', e.target.value)}
                    />
                  </div>
                  <button 
                    type="button"
                    aria-label={`Aumentar 2kg na série ${i + 1}`}
                    className="clay-stepper-btn" 
                    onClick={() => handleStep(i, 'load', 2)}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Controle de Repetições com Stepper Tátil */}
                <div className="flex items-center gap-xs">
                  <button 
                    type="button"
                    aria-label={`Diminuir repetição na série ${i + 1}`}
                    className="clay-stepper-btn" 
                    onClick={() => handleStep(i, 'reps', -1)}
                  >
                    <Minus size={14} />
                  </button>
                  <div style={{ position: 'relative', width: '65px' }}>
                    <input 
                      type="number" 
                      placeholder="Reps" 
                      className="input-field" 
                      style={{ padding: '0.45rem 0.4rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: '700' }}
                      value={log.reps} 
                      onChange={e => handleLogChange(i, 'reps', e.target.value)}
                    />
                  </div>
                  <button 
                    type="button"
                    aria-label={`Aumentar repetição na série ${i + 1}`}
                    className="clay-stepper-btn" 
                    onClick={() => handleStep(i, 'reps', 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <input 
            type="text" 
            placeholder="Observações do exercício (ex: senti leve desconforto, cadência 3s)" 
            className="input-field" 
            style={{ marginTop: '0.85rem', marginBottom: '1rem' }}
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              type="button"
              className="clay-btn-primary" 
              style={{ width: '100%', background: 'linear-gradient(135deg, #10B981, #059669)' }} 
              onClick={handleComplete}
            >
              <CheckCircle size={18} />
              {completed ? 'Atualizar Exercício' : 'Gravar Exercício'}
            </button>
            
            <div className="flex gap-sm">
              <button 
                type="button"
                className="clay-btn-secondary" 
                style={{ flex: 1 }} 
                onClick={(e) => { e.stopPropagation(); setShowVideo(true); }}
              >
                <PlaySquare size={16} /> Ver Execução
              </button>

              <button 
                type="button"
                className="clay-btn-secondary" 
                style={{ flex: 1 }} 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (onSetComplete) onSetComplete(); 
                }}
              >
                <Timer size={16} color="var(--accent-primary)" /> Timer Descanso
              </button>

              {exercise.alternatives && exercise.alternatives.length > 0 && onSwap && (
                <button 
                  type="button"
                  className="clay-btn-secondary" 
                  style={{ flex: 1 }} 
                  onClick={(e) => { e.stopPropagation(); setShowAlternatives(!showAlternatives); }}
                >
                  <RefreshCw size={16} /> Trocar
                </button>
              )}
            </div>
          </div>

          {showAlternatives && exercise.alternatives && (
            <div className="animate-fade-in" style={{ marginTop: '1rem', background: '#0D1424', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <p className="text-muted" style={{ marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: '600' }}>
                Alternativas sugeridas pela IA:
              </p>
              <div className="flex flex-col gap-sm">
                {exercise.alternatives.map((alt, idx) => (
                  <button 
                    key={idx} 
                    type="button"
                    className="clay-btn-secondary" 
                    style={{ textAlign: 'left', padding: '0.6rem 0.85rem', fontSize: '0.85rem' }} 
                    onClick={() => { setShowAlternatives(false); onSwap(exercise.id, alt); }}
                  >
                    • {alt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showVideo && (
        <VideoModal 
          searchQuery={exercise.searchQuery || `como fazer ${exercise.name} corretamente`} 
          onClose={() => setShowVideo(false)} 
        />
      )}
    </div>
  );
});
