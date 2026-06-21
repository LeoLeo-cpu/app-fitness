import { useState } from 'react';
import { generateDietPlan } from '../services/geminiService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Loader2, X, Send, Sparkles } from 'lucide-react';

export function DietWizard({ onComplete, onCancel }) {
  const [apiKey] = useLocalStorage('fitness_gemini_api_key', '');
  const [profile] = useLocalStorage('fitness_user_profile', {});
  const [step, setStep] = useState(1);
  const [mealsCount, setMealsCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [currentPlan, setCurrentPlan] = useState(null);
  const [feedback, setFeedback] = useState('');

  if (!apiKey) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.5)' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <h3 style={{ color: 'var(--accent-red)' }}>Chave de API ausente</h3>
          <p className="text-muted" style={{ margin: '1rem 0' }}>Vá até Configurações e insira a sua API Key do Google Gemini para usar a IA.</p>
          <button className="btn-secondary" onClick={onCancel} style={{ width: '100%' }}>Voltar</button>
        </div>
      </div>
    );
  }

  if (!profile.calTarget) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.5)' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <h3 style={{ color: 'var(--accent-red)' }}>Perfil Incompleto</h3>
          <p className="text-muted" style={{ margin: '1rem 0' }}>Vá até Configurações e calcule suas metas calóricas primeiro.</p>
          <button className="btn-secondary" onClick={onCancel} style={{ width: '100%' }}>Voltar</button>
        </div>
      </div>
    );
  }

  const handleGenerate = async (isRefinement = false) => {
    setLoading(true);
    setError('');
    try {
      const planStr = isRefinement && currentPlan ? JSON.stringify(currentPlan) : null;
      const result = await generateDietPlan(apiKey, profile, mealsCount, planStr, isRefinement ? feedback : null);
      setCurrentPlan(result);
      if (isRefinement) setFeedback('');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePlanTotals = (plan) => {
    return plan.reduce((acc, meal) => {
      meal.foods.forEach(f => {
        acc.cal += Number(f.calories);
        acc.pro += Number(f.protein);
        acc.car += Number(f.carbs);
        acc.fat += Number(f.fat);
      });
      return acc;
    }, { cal: 0, pro: 0, car: 0, fat: 0 });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onCancel} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}><X size={24} /></button>
        
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><Sparkles color="var(--accent-purple)" /> Nutricionista IA</h2>
        
        {loading ? (
          <div style={{ padding: '3rem 0', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={48} color="var(--accent-purple)" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '1rem' }}>A IA está calculando porções e elaborando o cardápio perfeito para você...</p>
          </div>
        ) : (
          <div>
            {step === 1 && (
              <div className="animate-fade-in">
                <p className="text-muted" style={{ marginBottom: '1rem' }}>Sua meta é de <strong>{profile.calTarget} kcal</strong> diárias. Para dividirmos bem os nutrientes, em quantas refeições você prefere dividir o seu dia?</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <input type="range" min="2" max="6" value={mealsCount} onChange={e => setMealsCount(Number(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '3rem', textAlign: 'center' }}>{mealsCount}</span>
                </div>
                {error && <p style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>{error}</p>}
                <button className="btn-primary" style={{ width: '100%', background: 'var(--accent-purple)' }} onClick={() => handleGenerate(false)}>
                  Gerar Cardápio
                </button>
              </div>
            )}

            {step === 2 && currentPlan && currentPlan.plan && (
              <div className="animate-fade-in">
                {(() => {
                  const totals = calculatePlanTotals(currentPlan.plan);
                  return (
                    <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderColor: 'var(--accent-purple)' }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Resumo Sugerido pela IA:</div>
                      <div className="flex justify-between" style={{ fontWeight: 'bold' }}>
                        <span>{totals.cal} kcal</span>
                        <div style={{ fontSize: '0.8rem', display: 'flex', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--accent-purple)' }}>P:{totals.pro}g</span>
                          <span style={{ color: 'var(--accent-green)' }}>C:{totals.car}g</span>
                          <span style={{ color: '#f59e0b' }}>G:{totals.fat}g</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>Sua meta: {profile.calTarget} kcal</div>
                    </div>
                  );
                })()}

                <div style={{ maxHeight: '40vh', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1rem' }}>
                  {currentPlan.plan.map((meal, idx) => (
                    <div key={idx} style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>{meal.mealName}</h3>
                      {meal.foods.map((food, fidx) => (
                        <div key={fidx} className="flex justify-between items-center" style={{ padding: '0.5rem 0' }}>
                          <div style={{ fontSize: '0.9rem' }}>{food.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{food.calories} kcal</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {error && <p style={{ color: 'var(--accent-red)', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</p>}

                <div className="glass-panel" style={{ padding: '0.75rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', background: 'var(--bg-color)' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ flex: 1, padding: '0.5rem' }} 
                    placeholder="Ex: Sou vegano, tire o frango..." 
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && feedback && handleGenerate(true)}
                  />
                  <button className="btn-secondary" style={{ padding: '0.5rem' }} disabled={!feedback} onClick={() => handleGenerate(true)}>
                    <Send size={18} />
                  </button>
                </div>

                <div className="flex gap-md">
                  <button className="btn-primary" style={{ flex: 1, background: 'var(--accent-green)', borderColor: 'var(--accent-green)' }} onClick={() => onComplete(currentPlan.plan)}>
                    Salvar Cardápio para Hoje
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
