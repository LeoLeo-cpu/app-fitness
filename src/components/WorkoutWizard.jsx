import { useState } from 'react';
import { generateWorkoutPlan } from '../services/geminiService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Loader2 } from 'lucide-react';

export function WorkoutWizard({ onComplete, onCancel }) {
  const [apiKey] = useLocalStorage('fitness_gemini_api_key', '');
  const [profile] = useLocalStorage('fitness_user_profile', {});
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    goal: '',
    location: '',
    restrictions: '',
    frequency: '',
    split: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!apiKey) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', position: 'fixed', top: '20%', left: '5%', right: '5%', zIndex: 100 }}>
        <h3 style={{ color: 'var(--accent-red)' }}>Chave de API ausente</h3>
        <p className="text-muted" style={{ margin: '1rem 0' }}>Vá até Configurações e insira a sua API Key do Google Gemini para usar a IA.</p>
        <button className="btn-secondary" onClick={onCancel} style={{ width: '100%' }}>Voltar</button>
      </div>
    );
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const plan = await generateWorkoutPlan(apiKey, profile, answers);
      onComplete(plan);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', position: 'fixed', top: '10%', left: '5%', right: '5%', zIndex: 100 }}>
      <h2>Assistente de Treino</h2>
      
      {loading ? (
        <div style={{ padding: '3rem 0', textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={48} color="var(--accent-blue)" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: '1rem' }}>A IA do Gemini está montando o seu treino perfeito...</p>
        </div>
      ) : (
        <div style={{ marginTop: '1.5rem' }}>
          {step === 1 && (
            <div className="animate-fade-in">
              <p className="text-muted">Qual é o seu principal objetivo?</p>
              <select className="input-field" style={{ margin: '1rem 0' }} value={answers.goal} onChange={e => setAnswers({...answers, goal: e.target.value})}>
                <option value="">Selecione...</option>
                <option value="Hipertrofia">Hipertrofia</option>
                <option value="Emagrecimento">Emagrecimento / Definição</option>
                <option value="Força">Força</option>
              </select>
              <button className="btn-primary" disabled={!answers.goal} onClick={() => setStep(2)} style={{ width: '100%' }}>Avançar</button>
            </div>
          )}
          {step === 2 && (
            <div className="animate-fade-in">
              <p className="text-muted">Onde você vai treinar?</p>
              <select className="input-field" style={{ margin: '1rem 0' }} value={answers.location} onChange={e => setAnswers({...answers, location: e.target.value})}>
                <option value="">Selecione...</option>
                <option value="Academia Completa">Academia Completa</option>
                <option value="Casa com Halteres">Casa (Apenas Halteres)</option>
                <option value="Casa sem equipamento (Calistenia)">Casa (Sem Equipamento)</option>
              </select>
              <div className="flex gap-md">
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>Voltar</button>
                <button className="btn-primary" style={{ flex: 1 }} disabled={!answers.location} onClick={() => setStep(3)}>Avançar</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="animate-fade-in">
              <p className="text-muted">Possui alguma restrição ou dor crônica?</p>
              <select className="input-field" style={{ margin: '1rem 0' }} value={answers.restrictions} onChange={e => setAnswers({...answers, restrictions: e.target.value})}>
                <option value="">Selecione...</option>
                <option value="Nenhuma">Nenhuma</option>
                <option value="Dor no Ombro">Dor no Ombro</option>
                <option value="Dor no Joelho">Dor no Joelho</option>
                <option value="Dor na Lombar">Dor na Lombar</option>
              </select>
              <div className="flex gap-md">
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>Voltar</button>
                <button className="btn-primary" style={{ flex: 1 }} disabled={!answers.restrictions} onClick={() => setStep(4)}>Avançar</button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="animate-fade-in">
              <p className="text-muted">Quantos dias por semana pretende treinar?</p>
              <select className="input-field" style={{ margin: '1rem 0' }} value={answers.frequency} onChange={e => setAnswers({...answers, frequency: e.target.value})}>
                <option value="">Selecione...</option>
                <option value="3 dias">3 dias por semana</option>
                <option value="4 dias">4 dias por semana</option>
                <option value="5 dias">5 dias por semana</option>
                <option value="6 dias">6 dias por semana</option>
              </select>
              <div className="flex gap-md">
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(3)}>Voltar</button>
                <button className="btn-primary" style={{ flex: 1 }} disabled={!answers.frequency} onClick={() => setStep(5)}>Avançar</button>
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="animate-fade-in">
              <p className="text-muted">Qual divisão de treino prefere?</p>
              <select className="input-field" style={{ margin: '1rem 0' }} value={answers.split} onChange={e => setAnswers({...answers, split: e.target.value})}>
                <option value="">Selecione...</option>
                <option value="Deixar a IA decidir">Deixar a IA decidir (Recomendado)</option>
                <option value="Full Body (Corpo Inteiro)">Full Body (Corpo Inteiro)</option>
                <option value="Upper / Lower (Superior / Inferior)">Upper / Lower (Superior / Inferior)</option>
                <option value="PPL (Empurrar / Puxar / Pernas)">PPL (Empurrar / Puxar / Pernas)</option>
                <option value="PPL + Upper/Lower (Híbrido)">PPL + Upper/Lower (Híbrido)</option>
                <option value="Bro Split (ABCDE)">Bro Split (1 Grupo Muscular por dia)</option>
                <option value="Arnold Split (Antagonistas)">Arnold Split (Antagonistas)</option>
                <option value="PHUL (Força e Hipertrofia)">PHUL (Força e Hipertrofia)</option>
              </select>
              <div className="flex gap-md">
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(4)}>Voltar</button>
                <button className="btn-primary" style={{ flex: 1 }} disabled={!answers.split} onClick={() => setStep(6)}>Avançar</button>
              </div>
            </div>
          )}
          {step === 6 && (
            <div className="animate-fade-in">
              <p className="text-muted">Qual seu nível de experiência?</p>
              <select className="input-field" style={{ margin: '1rem 0' }} value={answers.experience} onChange={e => setAnswers({...answers, experience: e.target.value})}>
                <option value="">Selecione...</option>
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
              {error && <p style={{ color: 'var(--accent-red)', margin: '1rem 0', fontSize: '0.875rem' }}>{error}</p>}
              <div className="flex gap-md">
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(5)}>Voltar</button>
                <button className="btn-primary" style={{ flex: 1 }} disabled={!answers.experience} onClick={handleGenerate}>Gerar Treino</button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {!loading && <button onClick={onCancel} style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '1.5rem', color: 'var(--text-muted)' }}>&times;</button>}
    </div>
  );
}
