import { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AreaChart, Area, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DEFAULT_WORKOUT_PLAN } from '../data/defaultData';
import { ChevronLeft, ChevronRight, Dumbbell, Award, Lock, Utensils, TrendingUp } from 'lucide-react';
import { formatElapsedTime } from '../utils/sessionTimer';

export function History({ streak = 0 }) {
  const [history] = useLocalStorage('fitness_workout_history', []);
  const [workoutPlan] = useLocalStorage('fitness_workout_plan', DEFAULT_WORKOUT_PLAN);
  const [weightHistory, setWeightHistory] = useLocalStorage('fitness_weight_history', []);
  const [mealsLog] = useLocalStorage('fitness_meals_log', []);
  const [waterLog] = useLocalStorage('fitness_water_log', []);
  
  // Abas principais: 'metricas' | 'gamificacao' | 'corpo'
  const [activeTab, setActiveTab] = useState('metricas');
  
  // Lista plana de exercícios para o seletor
  const allExercises = useMemo(() => {
    return Object.values(workoutPlan).flat();
  }, [workoutPlan]);
  
  const [selectedExerciseId, setSelectedExerciseId] = useState(allExercises[0]?.id || '');
  const [todayWeight, setTodayWeight] = useState('');

  // Preparação de dados do gráfico de Carga e Volume por exercício
  const exerciseChartData = useMemo(() => {
    return [...history].reverse().map(session => {
      const exLog = session.exercises?.find(e => e.exerciseId === selectedExerciseId);
      if (!exLog || !exLog.sets || exLog.sets.length === 0) return null;
      
      const maxLoad = Math.max(...exLog.sets.map(s => Number(s.load) || 0));
      const totalVolume = exLog.sets.reduce((acc, s) => acc + ((Number(s.load) || 0) * (Number(s.reps) || 0)), 0);
      
      return {
        date: new Date(session.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        carga: maxLoad,
        volume: totalVolume,
        note: exLog.note
      };
    }).filter(Boolean);
  }, [history, selectedExerciseId]);

  // Volume Total Acumulado em todos os treinos
  const totalAccumulatedVolume = useMemo(() => {
    return history.reduce((accSession, session) => {
      const sessionVol = (session.exercises || []).reduce((accEx, ex) => {
        return accEx + (ex.sets || []).reduce((accSet, s) => {
          return accSet + ((Number(s.load) || 0) * (Number(s.reps) || 0));
        }, 0);
      }, 0);
      return accSession + sessionVol;
    }, 0);
  }, [history]);

  // Preparação de dados de Peso vs Calorias
  const bodyChartData = useMemo(() => {
    const datesMap = {};
    mealsLog.forEach(log => {
      const cals = log.foods.reduce((acc, f) => acc + (Number(f.calories) || 0), 0);
      datesMap[log.date] = { date: log.date, cal: cals, weight: null };
    });
    weightHistory.forEach(w => {
      if (!datesMap[w.date]) datesMap[w.date] = { date: w.date, cal: 0, weight: null };
      datesMap[w.date].weight = Number(w.weight);
    });

    return Object.values(datesMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        ...item,
        label: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      }));
  }, [weightHistory, mealsLog]);

  const handleSaveWeight = () => {
    if (!todayWeight) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const newHistory = [...weightHistory];
    const existingIndex = newHistory.findIndex(w => w.date === todayStr);
    
    if (existingIndex >= 0) {
      newHistory[existingIndex].weight = todayWeight;
    } else {
      newHistory.push({ date: todayStr, weight: todayWeight });
    }
    setWeightHistory(newHistory);
    setTodayWeight('');
  };

  // Lógica do Calendário Mensal
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const getColorForType = (type) => {
    if (!type) return 'var(--accent-primary)';
    const colors = ['#06B6D4', '#7C3AED', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];
    let hash = 0;
    for (let i = 0; i < type.length; i++) hash = type.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const sessionMap = useMemo(() => {
    const map = {};
    history.forEach(session => {
      const d = new Date(session.date);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      map[dateStr] = session;
    });
    return map;
  }, [history]);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const renderCalendarDays = () => {
    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const session = sessionMap[dateStr];
      let indicatorColor = null;
      if (session && !session.workoutType.toLowerCase().includes('descanso')) {
        indicatorColor = getColorForType(session.workoutType);
      }
      const isSelected = selectedDate === dateStr;
      
      cells.push(
        <button 
          key={`day-${d}`} 
          className={`calendar-day ${isSelected ? 'selected' : ''}`}
          onClick={() => setSelectedDate(dateStr)}
          style={{ 
            background: isSelected ? 'rgba(6, 182, 212, 0.2)' : '',
            borderColor: isSelected ? 'var(--accent-primary)' : 'transparent'
          }}
          aria-label={`Ver treino do dia ${d}`}
        >
          {d}
          {indicatorColor && (
            <div className="calendar-indicator" style={{ backgroundColor: indicatorColor }} />
          )}
        </button>
      );
    }
    return cells;
  };

  // Conquistas Gamificadas 3D (Badges)
  const badges = [
    {
      id: 'first_workout',
      title: 'Primeiro Treino',
      desc: 'Concluiu seu primeiro treino no aplicativo.',
      icon: '🏆',
      unlocked: history.length >= 1,
      accent: '#10B981'
    },
    {
      id: 'streak_3',
      title: 'Fogo Inicial',
      desc: 'Manteve 3 dias seguidos de consistência.',
      icon: '🔥',
      unlocked: streak >= 3,
      accent: '#F59E0B'
    },
    {
      id: 'streak_5',
      title: 'Semana Imbatível',
      desc: 'Manteve 5 dias seguidos sem furar o ritmo.',
      icon: '⚡',
      unlocked: streak >= 5,
      accent: '#06B6D4'
    },
    {
      id: 'ton_10k',
      title: 'Titã dos Pesos',
      desc: 'Levantou mais de 10.000 kg acumulados.',
      icon: '🏋️',
      unlocked: totalAccumulatedVolume >= 10000,
      progress: `${Math.min(10000, Math.round(totalAccumulatedVolume))} / 10.000 kg`,
      accent: '#7C3AED'
    },
    {
      id: 'diet_master',
      title: 'Nutrição Ativa',
      desc: 'Registrou refeições no controle calórico.',
      icon: '🥗',
      unlocked: mealsLog.length > 0,
      accent: '#10B981'
    },
    {
      id: 'water_master',
      title: 'Mestre da Hidratação',
      desc: 'Atingiu a meta de 2.000 ml de água.',
      icon: '💧',
      unlocked: waterLog.some(w => w.ml >= 2000),
      accent: '#06B6D4'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Acompanhamento</h1>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Evolução de cargas, consistência e conquistas
          </p>
        </div>
      </div>

      {/* Pílulas de Seleção de Aba */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '0.35rem',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <button 
          className={activeTab === 'metricas' ? 'clay-btn-primary' : 'clay-btn-secondary'} 
          style={{ flex: 1, padding: '0.6rem 0.5rem', fontSize: '0.82rem' }} 
          onClick={() => setActiveTab('metricas')}
        >
          <TrendingUp size={15} /> Evolução
        </button>

        <button 
          className={activeTab === 'gamificacao' ? 'clay-btn-primary' : 'clay-btn-secondary'} 
          style={{ flex: 1, padding: '0.6rem 0.5rem', fontSize: '0.82rem' }} 
          onClick={() => setActiveTab('gamificacao')}
        >
          <Award size={15} /> Conquistas
        </button>

        <button 
          className={activeTab === 'corpo' ? 'clay-btn-primary' : 'clay-btn-secondary'} 
          style={{ flex: 1, padding: '0.6rem 0.5rem', fontSize: '0.82rem' }} 
          onClick={() => setActiveTab('corpo')}
        >
          <Utensils size={15} /> Peso & Dieta
        </button>
      </div>

      {/* ABA 1: EVOLUÇÃO & MÉTRICAS */}
      {activeTab === 'metricas' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Card de Evolução de Carga Máxima */}
          <div className="clay-card" style={{ padding: '1.5rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#FFFFFF' }}>Evolução de Carga (kg)</h2>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Acompanhe o ganho de força ao longo do tempo</p>
              </div>
              
              <div style={{ minWidth: '180px' }}>
                <select 
                  className="input-field" 
                  value={selectedExerciseId} 
                  onChange={e => setSelectedExerciseId(e.target.value)}
                  style={{ background: '#131B2E', fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                >
                  {allExercises.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {exerciseChartData.length > 0 ? (
              <div style={{ width: '100%', height: '260px', marginTop: '1rem' }}>
                <ResponsiveContainer>
                  <AreaChart data={exerciseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="loadGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickMargin={8} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#FFFFFF' }}
                      formatter={(val) => [`${val} kg`, 'Carga Máxima']}
                    />
                    <Area type="monotone" dataKey="carga" stroke="#06B6D4" strokeWidth={3} fillOpacity={1} fill="url(#loadGradient)" dot={{ r: 4, fill: '#06B6D4' }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Nenhum treino registrado com esse exercício ainda.</p>
              </div>
            )}
          </div>

          {/* Card Resumo do Volume Total Tonelado */}
          <div className="clay-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div className="flex items-center gap-md">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'rgba(124, 58, 237, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-secondary)'
              }}>
                <Dumbbell size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Volume Total Levantado</div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#FFFFFF' }}>
                  {totalAccumulatedVolume.toLocaleString('pt-BR')} kg
                </div>
              </div>
            </div>
            <span className="clay-pill" style={{ color: 'var(--accent-secondary)', borderColor: 'rgba(124, 58, 237, 0.3)' }}>
              Acumulado
            </span>
          </div>
        </div>
      )}

      {/* ABA 2: GAMIFICAÇÃO & CONSISTÊNCIA */}
      {activeTab === 'gamificacao' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Vitrine de Badges 3D */}
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.85rem', color: '#FFFFFF' }}>
              Suas Conquistas
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {badges.map(badge => (
                <div 
                  key={badge.id}
                  className="clay-card"
                  style={{
                    padding: '1.25rem',
                    background: badge.unlocked 
                      ? 'linear-gradient(145deg, #1E293B 0%, #152033 100%)' 
                      : '#131B2B',
                    border: badge.unlocked 
                      ? `1px solid ${badge.accent}40` 
                      : '1px solid rgba(255,255,255,0.03)',
                    opacity: badge.unlocked ? 1 : 0.65
                  }}
                >
                  <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: badge.unlocked ? `${badge.accent}20` : 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                      boxShadow: badge.unlocked ? `0 0 12px ${badge.accent}30` : 'none'
                    }}>
                      {badge.icon}
                    </div>

                    {badge.unlocked ? (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        color: badge.accent,
                        background: `${badge.accent}15`,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        border: `1px solid ${badge.accent}30`
                      }}>
                        Desbloqueado
                      </span>
                    ) : (
                      <span className="text-muted flex items-center gap-xs" style={{ fontSize: '0.72rem' }}>
                        <Lock size={12} /> Bloqueado
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '0.25rem' }}>
                    {badge.title}
                  </h3>
                  <p className="text-muted" style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>
                    {badge.desc}
                  </p>
                  
                  {badge.progress && !badge.unlocked && (
                    <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Progresso: {badge.progress}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Calendário Mensal Heatmap */}
          <div className="clay-card" style={{ padding: '1.5rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
              <button 
                onClick={prevMonth} 
                className="clay-stepper-btn"
                aria-label="Mês anterior"
              >
                <ChevronLeft size={18} />
              </button>

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#FFFFFF' }}>
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <span className="text-muted" style={{ fontSize: '0.78rem' }}>Histórico no calendário</span>
              </div>

              <button 
                onClick={nextMonth} 
                className="clay-stepper-btn"
                aria-label="Próximo mês"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            
            <div className="calendar-grid">
              {dayNames.map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}
              {renderCalendarDays()}
            </div>

            {selectedDate && (
              <div className="animate-fade-in" style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {sessionMap[selectedDate] ? (
                  <div style={{ background: '#131B2E', padding: '1rem', borderRadius: '16px', borderLeft: `4px solid ${getColorForType(sessionMap[selectedDate].workoutType)}` }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFFFFF' }}>
                        Treino: {sessionMap[selectedDate].workoutType}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {sessionMap[selectedDate].durationSeconds != null && (
                          <span className="clay-pill" style={{ fontSize: '0.72rem', color: 'var(--status-success)' }}>
                            ⏱️ {formatElapsedTime(sessionMap[selectedDate].durationSeconds)} min
                          </span>
                        )}
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {selectedDate.split('-').reverse().join('/')}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {sessionMap[selectedDate].exercises.map((ex, idx) => {
                        const maxLoad = ex.sets?.length > 0 ? Math.max(...ex.sets.map(s => Number(s.load) || 0)) : 0;
                        return (
                          <div key={idx} style={{ background: 'var(--surface-card)', padding: '0.65rem 0.85rem', borderRadius: '10px' }}>
                            <div style={{ fontWeight: '600', fontSize: '0.88rem', color: '#FFFFFF' }}>{ex.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                              {ex.sets?.length} séries • Carga máxima: {maxLoad}kg
                            </div>
                            {ex.note && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', marginTop: '2px' }}>
                                Obs: {ex.note}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Nenhum treino registrado no dia {selectedDate.split('-').reverse().join('/')}.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 3: PESO & DIETA */}
      {activeTab === 'corpo' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Card de Registro de Peso */}
          <div className="clay-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.25rem', color: '#FFFFFF' }}>
              Registrar Peso Corporal
            </h2>
            <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: '1rem' }}>
              Mantenha o registro do seu peso em jejum pela manhã
            </p>

            <div className="flex gap-sm">
              <input 
                type="number" 
                step="0.1"
                className="input-field" 
                placeholder="Ex: 75.5" 
                value={todayWeight} 
                onChange={e => setTodayWeight(e.target.value)} 
                style={{ background: '#131B2E' }}
              />
              <button 
                type="button"
                className="clay-btn-primary" 
                disabled={!todayWeight} 
                onClick={handleSaveWeight}
              >
                Salvar
              </button>
            </div>
          </div>

          {/* Gráfico Duplo: Peso vs Calorias */}
          <div className="clay-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.25rem', color: '#FFFFFF' }}>
              Correlação: Peso vs Calorias
            </h2>
            <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              Visualização de impacto calórico sobre o peso
            </p>

            {bodyChartData.length > 0 ? (
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer>
                  <ComposedChart data={bodyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" stroke="var(--text-secondary)" fontSize={11} tickMargin={8} />
                    <YAxis yAxisId="left" stroke="#EF4444" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#06B6D4" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#FFFFFF' }}
                      formatter={(value, name) => {
                        if (name === 'weight') return [`${value} kg`, 'Peso'];
                        if (name === 'cal') return [`${value} kcal`, 'Calorias'];
                        return [value, name];
                      }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="weight" name="weight" stroke="#EF4444" strokeWidth={3} connectNulls dot={{ r: 4, fill: '#EF4444' }} />
                    <Line yAxisId="right" type="monotone" dataKey="cal" name="cal" stroke="#06B6D4" strokeWidth={3} connectNulls dot={{ r: 4, fill: '#06B6D4' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Nenhum dado correlato registrado ainda.</p>
              </div>
            )}

            <div className="flex justify-center gap-lg" style={{ marginTop: '1rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: '#EF4444', borderRadius: '4px' }}></div>
                <span className="text-muted">Peso (kg)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', background: '#06B6D4', borderRadius: '4px' }}></div>
                <span className="text-muted">Calorias (kcal)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
