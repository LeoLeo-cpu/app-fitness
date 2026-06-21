import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ProgressBar } from '../components/ProgressBar';
import { DEFAULT_USER_PROFILE } from '../data/defaultData';
import { PlusCircle, Search, Sparkles } from 'lucide-react';
import { DietWizard } from '../components/DietWizard';

export function Diet() {
  const [profile] = useLocalStorage('fitness_user_profile', DEFAULT_USER_PROFILE);
  const [mealsLog, setMealsLog] = useLocalStorage('fitness_meals_log', []);
  const [plannedDiet, setPlannedDiet] = useLocalStorage('fitness_planned_diet', []);
  const [foodLibrary, setFoodLibrary] = useLocalStorage('fitness_food_library', []);
  const [waterLog, setWaterLog] = useLocalStorage('fitness_water_log', []);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [newFood, setNewFood] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const [search, setSearch] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysLogIndex = mealsLog.findIndex(log => log.date === todayStr);
  const todaysFoods = todaysLogIndex >= 0 ? mealsLog[todaysLogIndex].foods : [];

  const todayWaterIndex = waterLog.findIndex(w => w.date === todayStr);
  const todaysWater = todayWaterIndex >= 0 ? waterLog[todayWaterIndex].ml : 0;

  const totals = todaysFoods.reduce((acc, food) => {
    acc.calories += Number(food.calories);
    acc.protein += Number(food.protein);
    acc.carbs += Number(food.carbs);
    acc.fat += Number(food.fat);
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const handleAddFood = (foodData) => {
    const updatedLog = [...mealsLog];
    if (todaysLogIndex >= 0) {
      updatedLog[todaysLogIndex] = { ...updatedLog[todaysLogIndex], foods: [...updatedLog[todaysLogIndex].foods, foodData] };
    } else {
      updatedLog.push({ date: todayStr, foods: [foodData] });
    }
    setMealsLog(updatedLog);
    
    // Auto-save to library if not exists
    if (!foodLibrary.some(f => f.name.toLowerCase() === foodData.name.toLowerCase())) {
      setFoodLibrary([...foodLibrary, { ...foodData, id: Date.now().toString() }]);
    }
    
    setShowAddForm(false);
    setNewFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  };

  const handleAddWater = (ml) => {
    const updated = [...waterLog];
    if (todayWaterIndex >= 0) {
      updated[todayWaterIndex].ml += ml;
    } else {
      updated.push({ date: todayStr, ml });
    }
    setWaterLog(updated);
  };

  const handleApplyDietPlan = (plan) => {
    const updatedPlanLog = [...plannedDiet];
    const index = updatedPlanLog.findIndex(p => p.date === todayStr);
    if (index >= 0) {
      updatedPlanLog[index].plan = plan;
    } else {
      updatedPlanLog.push({ date: todayStr, plan });
    }
    setPlannedDiet(updatedPlanLog);
    setShowWizard(false);
  };

  const todaysPlanEntry = plannedDiet.find(p => p.date === todayStr);
  const todaysPlan = todaysPlanEntry ? todaysPlanEntry.plan : null;

  const filteredLibrary = foodLibrary.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-md animate-fade-in" style={{ paddingBottom: '100px' }}>
      <div className="flex justify-between items-center">
        <h1>Dieta de Hoje</h1>
        <button className="btn-primary" onClick={() => setShowWizard(true)} style={{ background: 'var(--accent-purple)', borderColor: 'var(--accent-purple)', padding: '0.5rem 1rem' }}>
          <Sparkles size={18} /> Nutricionista IA
        </button>
      </div>
      
      {showWizard && <DietWizard onComplete={handleApplyDietPlan} onCancel={() => setShowWizard(false)} />}

      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Progresso Diário</h2>
        <ProgressBar label="Calorias (kcal)" current={totals.calories} max={profile.calTarget} color="var(--accent-blue)" />
        <ProgressBar label="Proteínas (g)" current={totals.protein} max={profile.macros.protein} color="var(--accent-purple)" />
        <ProgressBar label="Carboidratos (g)" current={totals.carbs} max={profile.macros.carbs} color="var(--accent-green)" />
        <ProgressBar label="Gorduras (g)" current={totals.fat} max={profile.macros.fat} color="#f59e0b" />

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>💧 Água</span>
            <span style={{ fontSize: '0.875rem' }}>{todaysWater} / 2500 ml</span>
          </div>
          <div className="progress-container" style={{ marginBottom: '1rem', height: '12px' }}>
            <div className="progress-fill" style={{ width: `${Math.min(100, (todaysWater / 2500) * 100)}%`, background: 'var(--accent-blue)' }}></div>
          </div>
          <div className="flex gap-sm">
            <button className="btn-secondary" style={{ flex: 1, padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderColor: 'var(--accent-blue)' }} onClick={() => handleAddWater(250)}>+ 250ml</button>
            <button className="btn-secondary" style={{ flex: 1, padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderColor: 'var(--accent-blue)' }} onClick={() => handleAddWater(500)}>+ 500ml</button>
          </div>
        </div>
      </div>

      {todaysPlan && (
        <div style={{ marginBottom: '2rem' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--accent-purple)' }}>
              Cardápio Sugerido (Metas)
            </h2>
            <button className="btn-secondary" onClick={() => setShowWizard(true)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
              Alterar
            </button>
          </div>
          {todaysPlan.map((meal, mIdx) => (
            <div key={mIdx} style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                {meal.mealName}
              </h3>
              {meal.foods.map((f, fIdx) => {
                const isConsumed = todaysFoods.some(tf => tf.name === f.name && tf.meal === meal.mealName);
                
                return (
                  <div key={fIdx} className="glass-panel flex justify-between items-center" style={{ padding: '0.75rem', marginBottom: '0.5rem', opacity: isConsumed ? 0.6 : 1 }}>
                    <div>
                      <div style={{ fontWeight: '500', textDecoration: isConsumed ? 'line-through' : 'none' }}>{f.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{f.calories} kcal</div>
                    </div>
                    {!isConsumed && (
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--accent-purple)', color: 'var(--accent-purple)' }}
                        onClick={() => handleAddFood({ ...f, meal: meal.mealName })}
                      >
                        Consumi
                      </button>
                    )}
                    {isConsumed && <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem', fontWeight: 'bold' }}>✓</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem' }}>Refeições Registradas</h2>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)} style={{ padding: '0.5rem 1rem' }}>
          <PlusCircle size={18} /> Add
        </button>
      </div>

      {showAddForm && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Registrar Alimento</h3>
          
          <div className="flex items-center gap-sm" style={{ marginBottom: '1rem' }}>
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Buscar na biblioteca..." 
              className="input-field" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {search && filteredLibrary.length > 0 && (
            <div style={{ marginBottom: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
              {filteredLibrary.map(f => (
                <div key={f.id} className="flex justify-between items-center" style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => handleAddFood(f)}>
                  <span>{f.name}</span>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>{f.calories} kcal</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <input className="input-field" style={{ gridColumn: 'span 2' }} placeholder="Nome do Alimento" value={newFood.name} onChange={e => setNewFood({...newFood, name: e.target.value})} />
            <input className="input-field" type="number" placeholder="Calorias" value={newFood.calories} onChange={e => setNewFood({...newFood, calories: e.target.value})} />
            <input className="input-field" type="number" placeholder="Proteína (g)" value={newFood.protein} onChange={e => setNewFood({...newFood, protein: e.target.value})} />
            <input className="input-field" type="number" placeholder="Carboidrato (g)" value={newFood.carbs} onChange={e => setNewFood({...newFood, carbs: e.target.value})} />
            <input className="input-field" type="number" placeholder="Gordura (g)" value={newFood.fat} onChange={e => setNewFood({...newFood, fat: e.target.value})} />
          </div>
          
          <button 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={!newFood.name || !newFood.calories}
            onClick={() => handleAddFood(newFood)}
          >
            Salvar Registro
          </button>
        </div>
      )}

      {todaysFoods.length === 0 ? (
        <p className="text-muted text-center" style={{ marginTop: '2rem' }}>Nenhum alimento registrado hoje.</p>
      ) : (
        Object.entries(todaysFoods.reduce((acc, f) => {
          let m = f.meal || 'Geral';
          let n = f.name;
          // Suporte ao formato antigo (Café - Ovo)
          if (!f.meal && f.name.includes(' - ')) {
            const parts = f.name.split(' - ');
            m = parts[0];
            n = parts.slice(1).join(' - ');
          }
          if (!acc[m]) acc[m] = [];
          acc[m].push({ ...f, display_name: n });
          return acc;
        }, {})).map(([mealName, foods]) => (
          <div key={mealName} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-purple)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>{mealName}</h3>
            {foods.map((f, i) => (
              <div key={i} className="glass-panel flex justify-between items-center" style={{ padding: '1rem', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{f.display_name}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--accent-purple)' }}>P: {f.protein}g</span>
                    <span style={{ color: 'var(--accent-green)' }}>C: {f.carbs}g</span>
                    <span style={{ color: '#f59e0b' }}>G: {f.fat}g</span>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold' }}>{f.calories} kcal</div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
