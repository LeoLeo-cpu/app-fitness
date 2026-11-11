import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_WORKOUT_PLAN, PRESET_ROUTINES } from '../data/defaultData';
import { WorkoutWizard } from '../components/WorkoutWizard';
import { Sparkles, Trash2, PlaySquare, RefreshCw, ChevronUp, ChevronDown, Plus, ArrowLeft, AlertCircle, Edit3, Save, Compass, CheckCircle2, Search, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VideoModal } from '../components/VideoModal';

export function WorkoutManager() {
  const navigate = useNavigate();
  const [workoutPlan, setWorkoutPlan] = useLocalStorage('fitness_workout_plan', DEFAULT_WORKOUT_PLAN);
  const [, setWorkoutCycle] = useLocalStorage('fitness_workout_cycle', ['Push', 'Pull', 'Legs', 'Rest']);
  const [managerMode, setManagerMode] = useState('plan'); // 'plan' | 'explorer'
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState(Object.keys(workoutPlan)[0] || 'Push');
  const [videoQuery, setVideoQuery] = useState(null);
  const [swappingId, setSwappingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  
  // Filtros do Explorador de Rotinas
  const [presetCategory, setPresetCategory] = useState('Todos');
  const [presetSearch, setPresetSearch] = useState('');

  const handleWizardComplete = (data) => {
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

  const handleApplyPreset = (routine) => {
    if (window.confirm(`Deseja aplicar a rotina "${routine.title}" como seu plano atual?`)) {
      setWorkoutPlan(routine.plan);
      setWorkoutCycle(routine.cycle);
      setActiveTab(Object.keys(routine.plan)[0]);
      setManagerMode('plan');
      alert(`Rotina "${routine.title}" aplicada com sucesso!`);
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

  const filteredPresets = (PRESET_ROUTINES || []).filter(r => {
    const matchesCategory = presetCategory === 'Todos' || r.category === presetCategory;
    const matchesSearch = r.title.toLowerCase().includes(presetSearch.toLowerCase()) || 
                          r.desc.toLowerCase().includes(presetSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Gerenciar Treinos</h1>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Ajuste séries e cargas ou escolha rotinas consagradas
          </p>
        </div>
        <button 
          className="clay-btn-secondary" 
          style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }} 
          onClick={() => navigate('/workout')}
        >
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      {/* Seletor de Modo: Meu Plano Atual vs Explorador de Rotinas */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '0.35rem',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <button 
          className={managerMode === 'plan' ? 'clay-btn-primary' : 'clay-btn-secondary'} 
          style={{ flex: 1, padding: '0.6rem 0.5rem', fontSize: '0.82rem' }} 
          onClick={() => setManagerMode('plan')}
        >
          Meu Plano Atual
        </button>

        <button 
          className={managerMode === 'explorer' ? 'clay-btn-primary' : 'clay-btn-secondary'} 
          style={{ flex: 1, padding: '0.6rem 0.5rem', fontSize: '0.82rem' }} 
          onClick={() => setManagerMode('explorer')}
        >
          <Compass size={15} /> Explorar Rotinas
        </button>
      </div>

      {/* MODO 1: MEU PLANO ATUAL */}
      {managerMode === 'plan' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Botão de Destaque: Gerar Novo Treino com IA */}
          <button 
            className="clay-btn-primary" 
            style={{ width: '100%', background: 'linear-gradient(135deg, #7C3AED, #06B6D4)' }} 
            onClick={() => setShowWizard(true)}
          >
            <Sparkles size={18} />
            Gerar Nova Ficha de Treino com IA
          </button>

          {showWizard && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90, backdropFilter: 'blur(4px)' }} 
                onClick={() => setShowWizard(false)} 
              />
              <WorkoutWizard onComplete={handleWizardComplete} onCancel={() => setShowWizard(false)} />
            </>
          )}

          {/* Abas dos Dias do Treino (Push, Pull, Legs...) */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            padding: '0.35rem 0',
            scrollbarWidth: 'none'
          }}>
            {Object.keys(workoutPlan).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? 'clay-btn-primary' : 'clay-btn-secondary'}
                style={{ 
                  padding: '0.55rem 1.1rem', 
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab} ({workoutPlan[tab]?.length || 0})
              </button>
            ))}
          </div>

          {/* Lista de Exercícios do Dia Ativo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {workoutPlan[activeTab]?.map((ex, index) => (
              <div 
                key={ex.id} 
                className="clay-card" 
                style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
              >
                {editingId === ex.id ? (
                  <div style={{ flex: 1 }}>
                    <input 
                      className="input-field" 
                      style={{ marginBottom: '0.65rem', background: '#131B2E' }} 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})} 
                      placeholder="Nome do exercício" 
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div>
                        <label className="text-muted" style={{ fontSize: '0.72rem' }}>Séries</label>
                        <input 
                          className="input-field" 
                          type="number" 
                          style={{ background: '#131B2E', padding: '0.45rem' }} 
                          value={editForm.sets} 
                          onChange={e => setEditForm({...editForm, sets: Number(e.target.value)})} 
                        />
                      </div>
                      <div>
                        <label className="text-muted" style={{ fontSize: '0.72rem' }}>Reps</label>
                        <input 
                          className="input-field" 
                          style={{ background: '#131B2E', padding: '0.45rem' }} 
                          value={editForm.repRange} 
                          onChange={e => setEditForm({...editForm, repRange: e.target.value})} 
                        />
                      </div>
                      <div>
                        <label className="text-muted" style={{ fontSize: '0.72rem' }}>Carga Sugerida (kg)</label>
                        <input 
                          className="input-field" 
                          type="number" 
                          style={{ background: '#131B2E', padding: '0.45rem' }} 
                          value={editForm.suggestedLoad} 
                          onChange={e => setEditForm({...editForm, suggestedLoad: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="flex gap-sm">
                      <button 
                        className="clay-btn-primary" 
                        style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }} 
                        onClick={() => saveEditing(activeTab, index)}
                      >
                        <Save size={15} /> Salvar Alterações
                      </button>
                      <button 
                        className="clay-btn-secondary" 
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }} 
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', color: '#FFFFFF' }}>
                      {ex.name}
                      {ex.attentionShoulder && (
                        <span 
                          className="clay-pill" 
                          style={{ 
                            color: 'var(--status-danger)', 
                            borderColor: 'rgba(239, 68, 68, 0.3)', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            fontSize: '0.72rem',
                            padding: '0.1rem 0.45rem'
                          }}
                        >
                          <AlertCircle size={12} /> Cuidado Ombro
                        </span>
                      )}
                    </div>

                    <div className="text-muted" style={{ fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                      {ex.sets} séries × {ex.repRange} reps • Carga inicial: {ex.suggestedLoad || 0} kg
                    </div>

                    <div className="flex gap-xs flex-wrap">
                      <button 
                        className="clay-btn-secondary" 
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} 
                        onClick={() => setVideoQuery(ex.searchQuery || `como fazer ${ex.name} corretamente`)}
                      >
                        <PlaySquare size={13} /> Vídeo
                      </button>

                      {ex.alternatives && ex.alternatives.length > 0 && (
                        <button 
                          className="clay-btn-secondary" 
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} 
                          onClick={() => setSwappingId(swappingId === ex.id ? null : ex.id)}
                        >
                          <RefreshCw size={13} /> Alternativas
                        </button>
                      )}

                      <button 
                        className="clay-btn-secondary" 
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} 
                        onClick={() => startEditing(ex)}
                      >
                        <Edit3 size={13} /> Editar
                      </button>
                    </div>
                    
                    {swappingId === ex.id && ex.alternatives && (
                      <div className="animate-fade-in flex flex-col gap-xs" style={{ marginTop: '0.75rem', background: '#0D1424', padding: '0.75rem', borderRadius: '12px' }}>
                        <span className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Substituir por:</span>
                        {ex.alternatives.map((alt, idx) => (
                          <button 
                            key={idx} 
                            className="clay-btn-secondary" 
                            style={{ textAlign: 'left', padding: '0.45rem 0.75rem', fontSize: '0.8rem' }} 
                            onClick={() => handleSwap(activeTab, index, alt)}
                          >
                            • {alt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Controles de ordenação e exclusão */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center' }}>
                  {index > 0 && (
                    <button 
                      className="clay-stepper-btn" 
                      style={{ width: '28px', height: '28px' }}
                      onClick={() => moveExercise(activeTab, index, 'up')}
                      aria-label="Mover para cima"
                    >
                      <ChevronUp size={16} />
                    </button>
                  )}
                  {index < (workoutPlan[activeTab]?.length || 0) - 1 && (
                    <button 
                      className="clay-stepper-btn" 
                      style={{ width: '28px', height: '28px' }}
                      onClick={() => moveExercise(activeTab, index, 'down')}
                      aria-label="Mover para baixo"
                    >
                      <ChevronDown size={16} />
                    </button>
                  )}
                  <button 
                    className="clay-stepper-btn" 
                    style={{ width: '28px', height: '28px', color: 'var(--status-danger)', marginTop: '0.25rem' }}
                    onClick={() => removeExercise(activeTab, index)}
                    aria-label={`Remover ${ex.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            {(!workoutPlan[activeTab] || workoutPlan[activeTab].length === 0) && (
              <div className="clay-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Nenhum exercício configurado para este dia.</p>
              </div>
            )}

            <button 
              className="clay-btn-secondary" 
              style={{ width: '100%', marginTop: '0.5rem', borderStyle: 'dashed', padding: '0.85rem' }} 
              onClick={() => handleAddManual(activeTab)}
            >
              <Plus size={16} /> Adicionar Exercício Manualmente
            </button>
          </div>
        </div>
      )}

      {/* MODO 2: EXPLORADOR DE ROTINAS CONSAGRADAS (Baseado na Tela 3 da Referência) */}
      {managerMode === 'explorer' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Barra de Busca de Rotinas */}
          <div className="flex items-center gap-sm" style={{ position: 'relative' }}>
            <Search size={18} className="text-muted" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Buscar divisão (ex: PPL, Full Body, Superior)..." 
              className="input-field" 
              value={presetSearch} 
              onChange={e => setPresetSearch(e.target.value)} 
              style={{ paddingLeft: '42px', background: '#131B2E' }}
            />
          </div>

          {/* Filtros em Pílulas (Pills) */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {['Todos', 'PPL', 'Upper/Lower', 'Full Body', 'Arnold'].map(cat => (
              <button 
                key={cat} 
                className={presetCategory === cat ? 'clay-btn-primary' : 'clay-btn-secondary'}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                onClick={() => setPresetCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards das Rotinas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredPresets.map(preset => (
              <div 
                key={preset.id}
                className="clay-card"
                style={{ padding: '1.5rem', background: 'linear-gradient(145deg, #1E293B 0%, #162032 100%)' }}
              >
                <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div className="flex items-center gap-xs">
                    <span className="clay-pill" style={{ color: 'var(--accent-primary)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                      <Zap size={13} /> {preset.category}
                    </span>
                    <span className="clay-pill" style={{ fontSize: '0.75rem' }}>
                      <Clock size={13} /> {preset.duration}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: 'var(--status-streak)',
                    background: 'rgba(245, 158, 11, 0.1)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}>
                    {preset.intensity}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.4rem', color: '#FFFFFF' }}>
                  {preset.title}
                </h2>

                <p className="text-muted" style={{ fontSize: '0.86rem', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                  {preset.desc}
                </p>

                {/* Divisão dos Dias */}
                <div style={{ background: '#131B2E', padding: '0.85rem', borderRadius: '14px', marginBottom: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>
                    Ciclo Semanal ({preset.frequency}):
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {preset.cycle.map((day, dIdx) => (
                      <span 
                        key={dIdx} 
                        style={{ 
                          fontSize: '0.78rem', 
                          fontWeight: '600',
                          padding: '0.2rem 0.55rem', 
                          borderRadius: '8px',
                          background: day.toLowerCase().includes('descanso') ? 'rgba(255, 255, 255, 0.05)' : 'rgba(6, 182, 212, 0.15)',
                          color: day.toLowerCase().includes('descanso') ? 'var(--text-secondary)' : 'var(--accent-primary)',
                          border: day.toLowerCase().includes('descanso') ? '1px solid transparent' : '1px solid rgba(6, 182, 212, 0.3)'
                        }}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  className="clay-btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => handleApplyPreset(preset)}
                >
                  <CheckCircle2 size={18} />
                  Aplicar Esta Rotina ao Meu Treino
                </button>
              </div>
            ))}

            {filteredPresets.length === 0 && (
              <div className="clay-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Nenhuma rotina encontrada com esse termo.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {videoQuery && <VideoModal searchQuery={videoQuery} onClose={() => setVideoQuery(null)} />}
    </div>
  );
}
