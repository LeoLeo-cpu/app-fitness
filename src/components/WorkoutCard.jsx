import { useState } from 'react';
import React from 'react';
import { AlertCircle, CheckCircle, PlaySquare, RefreshCw, Timer } from 'lucide-react';
import { VideoModal } from './VideoModal';

export const WorkoutCard = React.memo(function WorkoutCard({ exercise, onLogSet, onSwap, onSetComplete, existingLog }) {
  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState(existingLog ? existingLog.sets : Array(exercise.sets).fill({ reps: '', load: exercise.suggestedLoad || '' }));
  const [note, setNote] = useState(existingLog ? existingLog.note : '');
  const [completed, setCompleted] = useState(!!existingLog);
  const [showVideo, setShowVideo] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const handleLogChange = (index, field, value) => {
    const newLogs = [...logs];
    newLogs[index] = { ...newLogs[index], [field]: value };
    setLogs(newLogs);
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
  };

  return (
    <div className={`glass-panel ${completed ? 'completed' : ''}`} style={{ padding: '1rem', marginBottom: '1rem', borderLeft: completed ? '4px solid var(--accent-green)' : 'none' }}>
      <div className="flex justify-between items-center" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
        <div className="flex items-center gap-sm">
          <h3 style={{ fontSize: '1.1rem', color: completed ? 'var(--text-muted)' : 'var(--text-main)' }}>{exercise.name}</h3>
          {exercise.attentionShoulder && !completed && (
            <AlertCircle size={18} color="var(--accent-red)" title="Cuidado com o ombro - reduza carga ou substitua" />
          )}
        </div>
        <div>
          {completed ? <CheckCircle size={24} color="var(--accent-green)" /> : <span className="text-muted">{exercise.sets}x {exercise.repRange}</span>}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '1rem' }} className="animate-fade-in">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-sm items-center" style={{ marginBottom: '0.5rem' }}>
              <span className="text-muted" style={{ width: '60px' }}>Série {i + 1}</span>
              <input 
                type="number" 
                placeholder="Carga (kg)" 
                className="input-field" 
                style={{ padding: '0.5rem' }}
                value={log.load} 
                onChange={e => handleLogChange(i, 'load', e.target.value)}
              />
              <input 
                type="number" 
                placeholder="Reps" 
                className="input-field" 
                style={{ padding: '0.5rem' }}
                value={log.reps} 
                onChange={e => handleLogChange(i, 'reps', e.target.value)}
              />
            </div>
          ))}
          
          <input 
            type="text" 
            placeholder="Observações (ex: dor no ombro?)" 
            className="input-field" 
            style={{ marginTop: '0.5rem', marginBottom: '1rem' }}
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          <button className="btn-secondary" style={{ width: '100%', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }} onClick={handleComplete}>
            {completed ? 'Atualizar Exercício' : 'Gravar Exercício'}
          </button>
          
          <div className="flex gap-sm" style={{ marginTop: '0.75rem' }}>
            <button className="btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }} onClick={(e) => { e.stopPropagation(); setShowVideo(true); }}>
              <PlaySquare size={18} /> Ver Vídeo
            </button>
            {exercise.alternatives && exercise.alternatives.length > 0 && onSwap && (
              <button className="btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }} onClick={(e) => { e.stopPropagation(); setShowAlternatives(!showAlternatives); }}>
                <RefreshCw size={18} /> Trocar
              </button>
            )}
          </div>

          {showAlternatives && exercise.alternatives && (
            <div className="animate-fade-in" style={{ marginTop: '1rem', background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px' }}>
              <p className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>Escolha uma alternativa da IA:</p>
              <div className="flex flex-col gap-sm">
                {exercise.alternatives.map((alt, idx) => (
                  <button key={idx} className="btn-secondary" style={{ textAlign: 'left', padding: '0.5rem' }} onClick={() => { setShowAlternatives(false); onSwap(exercise.id, alt); }}>
                    {alt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showVideo && <VideoModal searchQuery={exercise.searchQuery || `como fazer ${exercise.name} corretamente`} onClose={() => setShowVideo(false)} />}
    </div>
  );
});
