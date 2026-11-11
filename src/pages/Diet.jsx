import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ProgressBar } from '../components/ProgressBar';
import { DEFAULT_USER_PROFILE } from '../data/defaultData';
import { PlusCircle, Search, Sparkles, Droplet, Trash2, Utensils } from 'lucide-react';
import { DietWizard } from '../components/DietWizard';

export function Diet() {
  const [profile] = useLocalStorage('fitness_user_profile', DEFAULT_USER_PROFILE);
  const [mealsLog, setMealsLog] = useLocalStorage('fitness_meals_log', []);
  const [plannedDiet, setPlannedDiet] = useLocalStorage('fitness_planned_diet', []);
  const [foodLibrary, setFoodLibrary] = useLocalStorage('fitness_food_library', []);
  const [waterLog, setWaterLog] = useLocalStorage('fitness_water_log', []);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [newFood, setNewFood] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', meal: 'Geral' });
  const [search, setSearch] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysLogIndex = mealsLog.findIndex(log => log.date === todayStr);
  const todaysFoods = todaysLogIndex >= 0 ? mealsLog[todaysLogIndex].foods : [];

  const todayWaterIndex = waterLog.findIndex(w => w.date === todayStr);
  const todaysWater = todayWaterIndex >= 0 ? waterLog[todayWaterIndex].ml : 0;

  const totals = todaysFoods.reduce((acc, food) => {
    acc.calories += Number(food.calories) || 0;
    acc.protein += Number(food.protein) || 0;
    acc.carbs += Number(food.carbs) || 0;
    acc.fat += Number(food.fat) || 0;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const targetCalories = Number(profile.calTarget) || 2000;

  const handleAddFood = (foodData) => {
    const updatedLog = [...mealsLog];
    if (todaysLogIndex >= 0) {
      updatedLog[todaysLogIndex] = { ...updatedLog[todaysLogIndex], foods: [...updatedLog[todaysLogIndex].foods, foodData] };
    } else {
      updatedLog.push({ date: todayStr, foods: [foodData] });
    }
    setMealsLog(updatedLog);
    
    // Salva na biblioteca para buscas futuras caso não exista
    if (!foodLibrary.some(f => f.name.toLowerCase() === foodData.name.toLowerCase())) {
      setFoodLibrary([...foodLibrary, { ...foodData, id: `${foodData.name.toLowerCase().replace(/\s+/g, '_')}_${foodLibrary.length + 1}` }]);
    }
    
    setShowAddForm(false);
    setNewFood({ name: '', calories: '', protein: '', carbs: '', fat: '', meal: 'Geral' });
  };

  const handleRemoveFood = (foodIndex) => {
    if (todaysLogIndex < 0) return;
    const updatedLog = [...mealsLog];
    const currentFoods = [...updatedLog[todaysLogIndex].foods];
    currentFoods.splice(foodIndex, 1);
    updatedLog[todaysLogIndex] = { ...updatedLog[todaysLogIndex], foods: currentFoods };
    setMealsLog(updatedLog);
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

  const handleResetWater = () => {
    const updated = [...waterLog];
    if (todayWaterIndex >= 0) {
      updated[todayWaterIndex].ml = 0;
      setWaterLog(updated);
    }
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
    <div className="animate-fade-in" style={{ paddingBottom: '100px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Dieta & Nutrição</h1>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            Acompanhe seu balanço calórico e macronutrientes
          </p>
        </div>

        <button 
          className="clay-btn-secondary" 
          onClick={() => setShowWizard(true)} 
          style={{ borderColor: 'rgba(124, 58, 237, 0.4)', color: '#FFFFFF', gap: '0.4rem', padding: '0.6rem 0.9rem', fontSize: '0.82rem' }}
        >
          <Sparkles size={16} color="var(--accent-secondary)" /> IA Nutricionista
        </button>
      </div>
      
      {showWizard && <DietWizard onComplete={handleApplyDietPlan} onCancel={() => setShowWizard(false)} />}

      {/* Card do Progresso Diário */}
      <div className="clay-card" style={{ padding: '1.5rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#FFFFFF' }}>Balanço do Dia</h2>
          <span className="clay-pill" style={{ color: 'var(--status-success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            Meta: {targetCalories} kcal
          </span>
        </div>

        {/* Barras de Progresso de Calorias e Macros */}
        <ProgressBar label="Calorias (kcal)" current={totals.calories} max={targetCalories} color="var(--accent-primary)" />
        <ProgressBar label="Proteínas (g)" current={totals.protein} max={profile.macros?.protein || 140} color="var(--accent-secondary)" />
        <ProgressBar label="Carboidratos (g)" current={totals.carbs} max={profile.macros?.carbs || 200} color="var(--status-success)" />
        <ProgressBar label="Gorduras (g)" current={totals.fat} max={profile.macros?.fat || 60} color="var(--status-streak)" />

        {/* Seção de Hidratação / Água */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '0.6rem' }}>
            <span style={{ fontWeight: '700', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem' }}>
              <Droplet size={16} /> Água Ingerida
            </span>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              <strong style={{ color: '#FFFFFF' }}>{todaysWater}</strong> / 2500 ml
            </span>
          </div>

          <div style={{ 
            width: '100%', 
            height: '10px', 
            background: '#0D1424', 
            borderRadius: '9999px', 
            overflow: 'hidden',
            marginBottom: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.04)'
          }}>
            <div 
              style={{ 
                width: `${Math.min(100, (todaysWater / 2500) * 100)}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #06B6D4, #3B82F6)',
                borderRadius: '9999px',
                transition: 'width 0.4s ease'
              }} 
            />
          </div>

          <div className="flex gap-sm">
            <button 
              type="button"
              className="clay-btn-secondary" 
              style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }} 
              onClick={() => handleAddWater(250)}
            >
              + 250 ml (Copo)
            </button>
            <button 
              type="button"
              className="clay-btn-secondary" 
              style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }} 
              onClick={() => handleAddWater(500)}
            >
              + 500 ml (Garrafa)
            </button>
            {todaysWater > 0 && (
              <button 
                type="button"
                className="clay-btn-secondary" 
                style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }} 
                onClick={handleResetWater}
                title="Zerar Água"
              >
                Zerar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cardápio Sugerido pela IA (se houver) */}
      {todaysPlan && (
        <div className="clay-card" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', color: 'var(--accent-secondary)', fontWeight: '700' }}>
              Cardápio Sugerido pela IA
            </h2>
            <button 
              className="clay-pill" 
              onClick={() => setShowWizard(true)} 
              style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', cursor: 'pointer' }}
            >
              Reajustar
            </button>
          </div>

          {todaysPlan.map((meal, mIdx) => (
            <div key={mIdx} style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem', color: '#FFFFFF' }}>
                {meal.mealName}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {meal.foods?.map((f, fIdx) => {
                  const isConsumed = todaysFoods.some(tf => tf.name === f.name && tf.meal === meal.mealName);
                  
                  return (
                    <div 
                      key={fIdx} 
                      style={{ 
                        background: '#131B2E',
                        padding: '0.75rem 1rem', 
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        opacity: isConsumed ? 0.6 : 1,
                        border: '1px solid rgba(255, 255, 255, 0.04)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem', textDecoration: isConsumed ? 'line-through' : 'none' }}>
                          {f.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {f.calories} kcal • P: {f.protein}g • C: {f.carbs}g • G: {f.fat}g
                        </div>
                      </div>

                      {!isConsumed ? (
                        <button 
                          className="clay-pill" 
                          style={{ color: 'var(--status-success)', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.1)' }}
                          onClick={() => handleAddFood({ ...f, meal: meal.mealName })}
                        >
                          Consumir
                        </button>
                      ) : (
                        <span style={{ color: 'var(--status-success)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seção: Refeições Registradas */}
      <div>
        <div className="flex justify-between items-center" style={{ marginBottom: '0.85rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#FFFFFF' }}>Refeições Registradas</h2>
          <button 
            className="clay-btn-primary" 
            onClick={() => setShowAddForm(!showAddForm)} 
            style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}
          >
            <PlusCircle size={16} /> Adicionar Alimento
          </button>
        </div>

        {/* Modal / Card de Inserção de Alimento */}
        {showAddForm && (
          <div className="clay-card animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.25rem', border: '1px solid var(--accent-primary)' }}>
            <h3 style={{ marginBottom: '1rem', color: '#FFFFFF' }}>Registrar Novo Alimento</h3>
            
            <div className="flex items-center gap-sm" style={{ marginBottom: '1rem' }}>
              <Search size={18} className="text-muted" />
              <input 
                type="text" 
                placeholder="Buscar na biblioteca salva..." 
                className="input-field" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ background: '#131B2E' }}
              />
            </div>

            {search && filteredLibrary.length > 0 && (
              <div style={{ marginBottom: '1rem', maxHeight: '160px', overflowY: 'auto', background: '#0D1424', borderRadius: '12px', padding: '0.5rem' }}>
                {filteredLibrary.map(f => (
                  <div 
                    key={f.id} 
                    className="flex justify-between items-center" 
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s' }} 
                    onClick={() => handleAddFood(f)}
                  >
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{f.name}</span>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>{f.calories} kcal</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
              <input 
                className="input-field" 
                style={{ gridColumn: 'span 2', background: '#131B2E' }} 
                placeholder="Nome do Alimento (ex: Frango Grelhado)" 
                value={newFood.name} 
                onChange={e => setNewFood({...newFood, name: e.target.value})} 
              />
              <input 
                className="input-field" 
                type="number" 
                placeholder="Calorias (kcal)" 
                value={newFood.calories} 
                onChange={e => setNewFood({...newFood, calories: e.target.value})} 
                style={{ background: '#131B2E' }}
              />
              <input 
                className="input-field" 
                type="number" 
                placeholder="Proteína (g)" 
                value={newFood.protein} 
                onChange={e => setNewFood({...newFood, protein: e.target.value})} 
                style={{ background: '#131B2E' }}
              />
              <input 
                className="input-field" 
                type="number" 
                placeholder="Carboidrato (g)" 
                value={newFood.carbs} 
                onChange={e => setNewFood({...newFood, carbs: e.target.value})} 
                style={{ background: '#131B2E' }}
              />
              <input 
                className="input-field" 
                type="number" 
                placeholder="Gordura (g)" 
                value={newFood.fat} 
                onChange={e => setNewFood({...newFood, fat: e.target.value})} 
                style={{ background: '#131B2E' }}
              />
            </div>
            
            <div className="flex gap-sm" style={{ marginTop: '1rem' }}>
              <button 
                type="button"
                className="clay-btn-secondary" 
                style={{ flex: 1 }} 
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </button>
              <button 
                type="button"
                className="clay-btn-primary" 
                style={{ flex: 2 }}
                disabled={!newFood.name || !newFood.calories}
                onClick={() => handleAddFood(newFood)}
              >
                Salvar Registro
              </button>
            </div>
          </div>
        )}

        {/* Lista de Alimentos do Dia */}
        {todaysFoods.length === 0 ? (
          <div className="clay-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <Utensils size={36} color="var(--text-secondary)" style={{ margin: '0 auto 0.75rem auto' }} />
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Nenhum alimento registrado para o dia de hoje.</p>
            <button 
              type="button"
              className="clay-btn-secondary" 
              style={{ marginTop: '1rem', fontSize: '0.85rem' }} 
              onClick={() => setShowAddForm(true)}
            >
              Registrar Primeira Refeição
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {todaysFoods.map((f, i) => (
              <div 
                key={i} 
                className="clay-card" 
                style={{ 
                  padding: '1rem 1.25rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#FFFFFF' }}>{f.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', display: 'flex', gap: '10px', marginTop: '2px' }}>
                    <span style={{ color: 'var(--accent-secondary)' }}>P: {f.protein || 0}g</span>
                    <span style={{ color: 'var(--status-success)' }}>C: {f.carbs || 0}g</span>
                    <span style={{ color: 'var(--status-streak)' }}>G: {f.fat || 0}g</span>
                  </div>
                </div>

                <div className="flex items-center gap-md">
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: '#FFFFFF' }}>
                    {f.calories} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>kcal</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleRemoveFood(i)}
                    aria-label={`Remover ${f.name}`}
                    style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
