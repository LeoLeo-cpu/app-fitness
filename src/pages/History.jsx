import { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ComposedChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DEFAULT_WORKOUT_PLAN } from '../data/defaultData';

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
    const maxLoad = Math.max(...exLog.sets.map(s => Number(s.load) || 0));
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
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Últimos Treinos</h2>
            {history.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '1rem 0' }}>Nenhum treino concluído ainda.</p>
            ) : (
              history.slice(0, 5).map(session => (
                <div key={session.id} className="glass-panel" style={{ padding: '1rem', marginBottom: '0.5rem' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-purple)' }}>{session.workoutType}</span>
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>{new Date(session.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    {session.exercises.length} exercícios concluídos
                  </p>
                </div>
              ))
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
