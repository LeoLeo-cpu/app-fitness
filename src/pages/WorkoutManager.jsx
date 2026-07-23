import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_WORKOUT_PLAN } from '../data/defaultData';
import { WorkoutWizard } from '../components/WorkoutWizard';
import { Sparkles, Trash2, PlaySquare, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VideoModal } from '../components/VideoModal';

export function WorkoutManager() {
  const navigate = useNavigate();
  const [workoutPlan, setWorkoutPlan] = useLocalStorage('fitness_workout_plan', DEFAULT_WORKOUT_PLAN);
  const [workoutCycle, setWorkoutCycle] = useLocalStorage('fitness_workout_cycle', ['Push', 'Pull', 'Legs', 'Rest']);
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState(Object.keys(workoutPlan)[0] || 'Push');
  const [videoQuery, setVideoQuery] = useState(null);
  const [swappingId, setSwappingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const handleWizardComplete = (data) => {
    // data comes back as { cycle: [...], plan: {...} }
    if (data && data.plan && data.cycle) {
      setWorkoutPlan(data.plan);
      setWorkoutCycle(data.cycle);
      setActiveTab(Object.keys(data.plan)[0] || 'Treino');
      setShowWizard(false);
      alert('Plano atualizado com sucesso pela IA do Gemini!');
    } else {
      alert('Formato de resposta inesperado da IA. Tente novamente.');
    }
  };

  const removeExercise = (day, index) => {
    const newPlan = { ...workoutPlan };
    newPlan[day].splice(index, 1);
    setWorkoutPlan(newPlan);
  };

  const moveExercise = (day, index, direction) => {
    const newPlan = { ...workoutPlan };
    const list = newPlan[day];
    if (direction === 'up' && index > 0) {
      const temp = list[index - 1];
      list[index - 1] = list[index];
      list[index] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index + 1];
      list[index + 1] = list[index];
      list[index] = temp;
    }
    setWorkoutPlan(newPlan);
  };

  const handleSwap = (day, index, newName) => {
    const newPlan = { ...workoutPlan };
    newPlan[day][index].name = newName;
    setWorkoutPlan(newPlan);
    setSwappingId(null);
  };

  const startEditing = (ex) => {
    setEditingId(ex.id);
    setEditForm({ ...ex });
  };

  const saveEditing = (day, index) => {
    const newPlan = { ...workoutPlan };
    newPlan[day][index] = { ...editForm };
    setWorkoutPlan(newPlan);
    setEditingId(null);
  };

  const handleAddManual = (day) => {
    const newPlan = { ...workoutPlan };
    const newEx = {
      id: `manual_${Date.now()}`,
      name: 'Novo Exercício',
      sets: 3,
      repRange: '8-12',
      suggestedLoad: '0',
      attentionShoulder: false,
      alternatives: []
    };
    if (!newPlan[day]) newPlan[day] = [];
    newPlan[day].push(newEx);
    setWorkoutPlan(newPlan);
    startEditing(newEx);
  };

  return (
    <div className="p-md animate-fade-in" style={{ paddingBottom: '100px' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <h1>Meu Plano</h1>
        <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate('/workout')}>Voltar</button>
      </div>

      <button className="btn-primary" style={{ width: '100%', marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }} onClick={() => setShowWizard(true)}>
        <Sparkles size={20} />
        Gerar Novo Treino com IA
      </button>

      {showWizard && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90, backdropFilter: 'blur(2px)' }} onClick={() => setShowWizard(false)} />
          <WorkoutWizard onComplete={handleWizardComplete} onCancel={() => setShowWizard(false)} />
        </>
      )}

      <div className="flex gap-sm" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {Object.keys(workoutPlan).map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '0.5rem 1rem', 
              color: activeTab === tab ? 'var(--accent-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--accent-blue)' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {workoutPlan[activeTab]?.map((ex, index) => (
          <div key={ex.id} className="glass-panel flex justify-between items-center animate-fade-in" style={{ padding: '1rem', marginBottom: '0.5rem' }}>
            {editingId === ex.id ? (
              <div style={{ flex: 1, marginRight: '1rem' }}>
                <input className="input-field" style={{ marginBottom: '0.5rem', padding: '0.5rem' }} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Nome do exercício" />
                <div className="flex gap-sm">
                  <input className="input-field" type="number" style={{ padding: '0.5rem' }} value={editForm.sets} onChange={e => setEditForm({...editForm, sets: Number(e.target.value)})} placeholder="Séries" />
                  <input className="input-field" style={{ padding: '0.5rem' }} value={editForm.repRange} onChange={e => setEditForm({...editForm, repRange: e.target.value})} placeholder="Reps (ex: 8-12)" />
                  <input className="input-field" type="number" style={{ padding: '0.5rem' }} value={editForm.suggestedLoad} onChange={e => setEditForm({...editForm, suggestedLoad: e.target.value})} placeholder="Carga (kg)" />
                </div>
                <button className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => saveEditing(activeTab, index)}>Salvar</button>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {ex.name}
                  {ex.attentionShoulder && <span style={{ color: 'var(--accent-red)', fontSize: '0.75rem', padding: '0.1rem 0.4rem', background: 'rgba(239,68,68,0.1)', borderRadius: '4px', whiteSpace: 'nowrap' }}>Cuidado Ombro</span>}
                </div>
                <div className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  {ex.sets}x {ex.repRange} | Carga: {ex.suggestedLoad}kg
                </div>
                <div className="flex gap-sm flex-wrap">
                  <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }} onClick={() => setVideoQuery(ex.searchQuery || `como fazer ${ex.name} corretamente`)}>
                    <PlaySquare size={14} /> Vídeo
                  </button>
                  {ex.alternatives && ex.alternatives.length > 0 && (
                    <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }} onClick={() => setSwappingId(swappingId === ex.id ? null : ex.id)}>
                      <RefreshCw size={14} /> Alternativas
                    </button>
                  )}
                  <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }} onClick={() => startEditing(ex)}>
                    Editar
                  </button>
                </div>
                
                {swappingId === ex.id && ex.alternatives && (
                  <div className="animate-fade-in flex flex-col gap-sm" style={{ marginTop: '0.75rem', background: 'var(--bg-color)', padding: '0.5rem', borderRadius: '4px' }}>
                    {ex.alternatives.map((alt, idx) => (
                      <button key={idx} className="btn-secondary" style={{ textAlign: 'left', padding: '0.4rem', fontSize: '0.85rem' }} onClick={() => handleSwap(activeTab, index, alt)}>
                        Substituir por: {alt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
              {index > 0 && (
                <button style={{ color: 'var(--text-muted)', padding: '0.25rem' }} onClick={() => moveExercise(activeTab, index, 'up')}>
                  <ChevronUp size={20} />
                </button>
              )}
              {index < workoutPlan[activeTab].length - 1 && (
                <button style={{ color: 'var(--text-muted)', padding: '0.25rem' }} onClick={() => moveExercise(activeTab, index, 'down')}>
                  <ChevronDown size={20} />
                </button>
              )}
              <button style={{ color: 'var(--accent-red)', padding: '0.25rem', marginTop: '0.5rem' }} onClick={() => removeExercise(activeTab, index)}>
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {workoutPlan[activeTab]?.length === 0 && (
          <p className="text-muted text-center" style={{ marginTop: '2rem' }}>Nenhum exercício neste dia.</p>
        )}

        <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem', borderStyle: 'dashed' }} onClick={() => handleAddManual(activeTab)}>
          + Adicionar Exercício Manualmente
        </button>
      </div>

      {videoQuery && <VideoModal searchQuery={videoQuery} onClose={() => setVideoQuery(null)} />}
    </div>
  );
}
