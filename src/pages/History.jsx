import { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ComposedChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DEFAULT_WORKOUT_PLAN } from '../data/defaultData';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function History() {
  const [history] = useLocalStorage('fitness_workout_history', []);
  const [workoutPlan] = useLocalStorage('fitness_workout_plan', DEFAULT_WORKOUT_PLAN);
  
  // Combine all exercises into a flat list for selection
  const allExercises = [
    ...workoutPlan.Push,
    ...workoutPlan.Pull,
    ...workoutPlan.Legs
  ];
  
  const [selectedExerciseId, setSelectedExerciseId] = useState(allExercises[0]?.id || '');

  const [activeTab, setActiveTab] = useState('treino'); // 'treino' | 'corpo'
  const [weightHistory, setWeightHistory] = useLocalStorage('fitness_weight_history', []);
  const [mealsLog] = useLocalStorage('fitness_meals_log', []);
  const [todayWeight, setTodayWeight] = useState('');

  // Prepare workout chart data
  const chartData = [...history].reverse().map(session => {
    const exLog = session.exercises.find(e => e.exerciseId === selectedExerciseId);
    if (!exLog) return null;
    const maxLoad = exLog.sets.length > 0 ? Math.max(...exLog.sets.map(s => Number(s.load) || 0)) : 0;
    return {
      date: new Date(session.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      carga: maxLoad,
      note: exLog.note
    };
  }).filter(Boolean);

  // Prepare body tracker data
  const bodyChartData = useMemo(() => {
    const datesMap = {};
    mealsLog.forEach(log => {
      const cals = log.foods.reduce((acc, f) => acc + Number(f.calories), 0);
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

  // Calendar Logic
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const sessionMap = useMemo(() => {
    const map = {};
    history.forEach(session => {
      const d = new Date(session.date);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
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
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const session = sessionMap[dateStr];
      let indicatorColor = null;
      if (session) {
        if (session.workoutType === 'Push') indicatorColor = 'var(--accent-blue)';
        if (session.workoutType === 'Pull') indicatorColor = 'var(--accent-purple)';
        if (session.workoutType === 'Legs') indicatorColor = 'var(--accent-green)';
      }
      const isSelected = selectedDate === dateStr;
      
      cells.push(
        <button 
          key={`day-${d}`} 
          className={`calendar-day ${isSelected ? 'selected' : ''}`}
          onClick={() => setSelectedDate(dateStr)}
          style={{ background: isSelected ? 'rgba(255,255,255,0.1)' : '', border: 'none', cursor: 'pointer' }}
          aria-label={`Ver treino do dia ${d}`}
        >
          {d}
          {indicatorColor && <div className="calendar-indicator" style={{ backgroundColor: indicatorColor }}></div>}
        </button>
      );
    }
    return cells;
  };

  return (
    <div className="p-md animate-fade-in" style={{ paddingBottom: '100px' }}>
      <h1>Acompanhamento</h1>

      <div className="flex gap-sm" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <button className={activeTab === 'treino' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1 }} onClick={() => setActiveTab('treino')}>
          Treinos
        </button>
        <button className={activeTab === 'corpo' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1 }} onClick={() => setActiveTab('corpo')}>
          Corpo & Dieta
        </button>
      </div>

      {activeTab === 'treino' && (
        <div className="animate-fade-in">
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Evolução de Carga (kg)</h2>
            <select 
              className="input-field" 
              value={selectedExerciseId} 
              onChange={e => setSelectedExerciseId(e.target.value)}
              style={{ marginBottom: '1.5rem', background: 'var(--surface-color)' }}
            >
              {allExercises.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>

            {chartData.length > 0 ? (
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--surface-color)', border: 'none', borderRadius: '8px', color: 'var(--text-main)' }}
                      itemStyle={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="carga" stroke="var(--accent-blue)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent-blue)' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted text-center" style={{ padding: '2rem 0' }}>Nenhum dado registrado para este exercício.</p>
            )}
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <button onClick={prevMonth} style={{ padding: '0.5rem', color: 'var(--text-muted)' }}><ChevronLeft size={20} /></button>
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
                <button onClick={nextMonth} style={{ padding: '0.5rem', color: 'var(--text-muted)' }}><ChevronRight size={20} /></button>
              </div>
              
              <div className="calendar-grid">
                {dayNames.map(day => <div key={day} className="calendar-day-header">{day}</div>)}
                {renderCalendarDays()}
              </div>
            </div>
            
            {selectedDate && (
              <div className="animate-fade-in" style={{ marginTop: '1rem' }}>
                {sessionMap[selectedDate] ? (
                  <div className="glass-panel" style={{ padding: '1rem', borderLeft: `4px solid ${sessionMap[selectedDate].workoutType === 'Push' ? 'var(--accent-blue)' : sessionMap[selectedDate].workoutType === 'Pull' ? 'var(--accent-purple)' : 'var(--accent-green)'}` }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.1rem' }}>Treino {sessionMap[selectedDate].workoutType}</h3>
                      <span className="text-muted" style={{ fontSize: '0.875rem' }}>{selectedDate.split('-').reverse().join('/')}</span>
                    </div>
                    <div className="flex flex-col gap-sm">
                      {sessionMap[selectedDate].exercises.map((ex, idx) => {
                        const maxLoad = ex.sets.length > 0 ? Math.max(...ex.sets.map(s => Number(s.load) || 0)) : 0;
                        return (
                          <div key={idx} style={{ background: 'var(--surface-color)', padding: '0.75rem', borderRadius: '8px' }}>
                            <div style={{ fontWeight: '500', marginBottom: '4px' }}>{ex.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                              {ex.sets.length} séries • Carga máxima: {maxLoad}kg
                            </div>
                            {ex.note && <div style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', marginTop: '4px' }}>Obs: {ex.note}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <p className="text-muted">Dia de descanso. Nenhuma atividade registrada em {selectedDate.split('-').reverse().join('/')}.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'corpo' && (
        <div className="animate-fade-in">
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Registrar Peso de Hoje</h3>
            <div className="flex gap-sm">
              <input 
                type="number" 
                step="0.1"
                className="input-field" 
                placeholder="Ex: 75.5" 
                value={todayWeight} 
                onChange={e => setTodayWeight(e.target.value)} 
              />
              <button className="btn-primary" disabled={!todayWeight} onClick={handleSaveWeight}>Salvar</button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Peso vs Calorias Consumidas</h2>
            {bodyChartData.length > 0 ? (
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                  <ComposedChart data={bodyChartData} margin={{ top: 5, right: -15, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} tickMargin={10} />
                    <YAxis yAxisId="left" stroke="var(--accent-red)" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--accent-blue)" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--surface-color)', border: 'none', borderRadius: '8px', color: 'var(--text-main)' }}
                      formatter={(value, name) => {
                        if (name === 'weight') return [`${value} kg`, 'Peso'];
                        if (name === 'cal') return [`${value} kcal`, 'Calorias'];
                        return [value, name];
                      }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="weight" name="weight" stroke="var(--accent-red)" strokeWidth={3} connectNulls dot={{ r: 4, fill: 'var(--accent-red)' }} />
                    <Line yAxisId="right" type="monotone" dataKey="cal" name="cal" stroke="var(--accent-blue)" strokeWidth={3} connectNulls dot={{ r: 4, fill: 'var(--accent-blue)' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted text-center" style={{ padding: '2rem 0' }}>Nenhum dado registrado para exibir correlação.</p>
            )}
            <div className="flex justify-center gap-md" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--accent-red)', borderRadius: '2px' }}></div>
                Peso (kg)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--accent-blue)', borderRadius: '2px' }}></div>
                Calorias (kcal)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
