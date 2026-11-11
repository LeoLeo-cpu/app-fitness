import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_USER_PROFILE } from '../data/defaultData';
import { Save, Key, Download, Upload, Eye, EyeOff, Sparkles, User } from 'lucide-react';
import { useState } from 'react';

export function Settings() {
  const [profile, setProfile] = useLocalStorage('fitness_user_profile', DEFAULT_USER_PROFILE);
  const [apiKey, setApiKey] = useLocalStorage('fitness_gemini_api_key', '');
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [apiStatus, setApiStatus] = useState(apiKey ? 'configured' : 'missing'); // 'configured' | 'valid' | 'invalid' | 'missing'
  const [apiFeedback, setApiFeedback] = useState('');

  const testApiKey = async () => {
    if (!apiKey) {
      setApiStatus('missing');
      setApiFeedback('Por favor, informe uma chave antes de testar.');
      return;
    }
    setTestingKey(true);
    setApiFeedback('');
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models`, {
        headers: { 'x-goog-api-key': apiKey.trim() }
      });
      const data = await response.json();
      if (data.error) {
        setApiStatus('invalid');
        setApiFeedback(`Erro retornado pela API: ${data.error.message}`);
      } else {
        setApiStatus('valid');
        setApiFeedback(`Conexão confirmada com sucesso! ${data.models?.length || 0} modelos disponíveis.`);
      }
    } catch (err) {
      console.error('Network failure while testing Gemini API Key:', err);
      setApiStatus('invalid');
      setApiFeedback(`Falha de conexão com os servidores do Google: ${err.message}`);
    } finally {
      setTestingKey(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: name === 'gender' || name === 'name' ? value : Number(value)
    }));
    setSaved(false);
  };

  const calculateMacros = () => {
    const { weight, height, age, gender, activityLevel } = profile;
    if (!weight || !height || !age) {
      alert('Preencha peso, altura e idade para calcular suas metas.');
      return;
    }

    // Fórmula Mifflin-St Jeor
    let tmb = (10 * Number(weight)) + (6.25 * Number(height)) - (5 * Number(age));
    tmb += (gender === 'M' ? 5 : -161);

    const tdee = tmb * (Number(activityLevel) || 1.2);
    const calTarget = Math.round(tdee - 500); // Déficit moderado de 500 kcal

    const protein = Math.round(Number(weight) * 2.0); // 2g por kg
    const fat = Math.round(Number(weight) * 1.0); // 1g por kg
    const proteinCals = protein * 4;
    const fatCals = fat * 9;
    const carbCals = calTarget - proteinCals - fatCals;
    const carbs = Math.max(0, Math.round(carbCals / 4));

    setProfile(prev => ({
      ...prev,
      tmb: Math.round(tmb),
      calTarget,
      macros: { protein, carbs, fat }
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportData = () => {
    try {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fitness_')) {
          data[key] = localStorage.getItem(key);
        }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-fitness-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data backup:', err);
      alert('Erro ao exportar os dados do aplicativo.');
    }
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') throw new Error('Conteúdo inválido');
        const data = JSON.parse(content);
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          throw new Error('Formato de backup inválido');
        }
        
        let hasFitnessData = false;
        for (const key in data) {
          if (key.startsWith('fitness_')) {
            hasFitnessData = true;
            localStorage.setItem(key, data[key]);
          }
        }
        
        if (!hasFitnessData) {
          throw new Error('Nenhum dado do aplicativo encontrado no arquivo.');
        }
        alert('Dados restaurados com sucesso! O aplicativo será recarregado.');
        window.location.reload();
      } catch (err) {
        console.error('Failed to parse backup JSON file:', err);
        alert(`Erro ao restaurar arquivo: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Configurações</h1>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          Personalize seu perfil, metas nutricionais e inteligência artificial
        </p>
      </div>

      {/* CARD 1: Perfil do Atleta */}
      <section className="clay-card" style={{ padding: '1.5rem' }}>
        <div className="flex items-center gap-sm" style={{ marginBottom: '1.25rem' }}>
          <User size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#FFFFFF' }}>Perfil do Atleta</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="text-muted" style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '600' }}>
              Seu Nome / Apelido
            </label>
            <input 
              type="text" 
              name="name" 
              className="input-field" 
              value={profile.name || ''} 
              onChange={handleChange} 
              placeholder="Ex: Alex" 
            />
          </div>

          <div className="grid-cols-2">
            <div>
              <label className="text-muted" style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '600' }}>
                Idade (anos)
              </label>
              <input 
                type="number" 
                name="age" 
                className="input-field" 
                value={profile.age || ''} 
                onChange={handleChange} 
                placeholder="Ex: 28" 
              />
            </div>
            <div>
              <label className="text-muted" style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '600' }}>
                Sexo Biológico
              </label>
              <select name="gender" className="input-field" value={profile.gender || 'M'} onChange={handleChange}>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
          </div>

          <div className="grid-cols-2">
            <div>
              <label className="text-muted" style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '600' }}>
                Peso Atual (kg)
              </label>
              <input 
                type="number" 
                step="0.1"
                name="weight" 
                className="input-field" 
                value={profile.weight || ''} 
                onChange={handleChange} 
                placeholder="Ex: 78.5" 
              />
            </div>
            <div>
              <label className="text-muted" style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '600' }}>
                Altura (cm)
              </label>
              <input 
                type="number" 
                name="height" 
                className="input-field" 
                value={profile.height || ''} 
                onChange={handleChange} 
                placeholder="Ex: 178" 
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div>
              <label className="text-muted" style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '600' }}>
                Nível de Atividade Física
              </label>
              <select name="activityLevel" className="input-field" value={profile.activityLevel || 1.2} onChange={handleChange}>
                <option value="1.2">Sedentário (pouco ou nenhum exercício)</option>
                <option value="1.375">Leve (exercício 1-3 dias/semana)</option>
                <option value="1.55">Moderado (exercício 3-5 dias/semana)</option>
                <option value="1.725">Intenso (exercício 6-7 dias/semana)</option>
              </select>
            </div>
            <div>
              <label className="text-muted" style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '600' }}>
                Descanso Padrão entre Séries
              </label>
              <select name="restTimer" className="input-field" value={profile.restTimer || 60} onChange={handleChange}>
                <option value="30">30 segundos</option>
                <option value="45">45 segundos</option>
                <option value="60">60 segundos (1 minuto)</option>
                <option value="90">90 segundos (1m 30s)</option>
                <option value="120">120 segundos (2 minutos)</option>
                <option value="180">180 segundos (3 minutos)</option>
              </select>
            </div>
          </div>

          <button 
            type="button"
            className="clay-btn-primary" 
            onClick={calculateMacros} 
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <Save size={18} />
            {saved ? 'Perfil e Metas Salvos!' : 'Calcular e Salvar Metas Nutricionais'}
          </button>
        </div>
      </section>

      {/* CARD 2: Metas Calculadas */}
      {profile.calTarget > 0 && (
        <section className="clay-card animate-fade-in" style={{ padding: '1.5rem', background: 'linear-gradient(145deg, #1E293B, #162236)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#FFFFFF' }}>Suas Metas Diárias</h2>
            <span className="clay-pill" style={{ color: 'var(--status-success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              Déficit 500 kcal
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#131B2E', padding: '0.85rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-muted" style={{ fontSize: '0.78rem', display: 'block' }}>Taxa Metabólica Basal (TMB)</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#FFFFFF' }}>{profile.tmb} kcal</span>
            </div>
            <div style={{ background: '#131B2E', padding: '0.85rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-muted" style={{ fontSize: '0.78rem', display: 'block' }}>Meta de Consumo Diário</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{profile.calTarget} kcal</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
            <div style={{ background: '#131B2E', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
              <span className="text-muted" style={{ fontSize: '0.72rem', display: 'block' }}>Proteínas</span>
              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--accent-secondary)' }}>{profile.macros?.protein || 0}g</span>
            </div>
            <div style={{ background: '#131B2E', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
              <span className="text-muted" style={{ fontSize: '0.72rem', display: 'block' }}>Carboidratos</span>
              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--status-success)' }}>{profile.macros?.carbs || 0}g</span>
            </div>
            <div style={{ background: '#131B2E', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
              <span className="text-muted" style={{ fontSize: '0.72rem', display: 'block' }}>Gorduras</span>
              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--status-streak)' }}>{profile.macros?.fat || 0}g</span>
            </div>
          </div>
        </section>
      )}

      {/* CARD 3: Inteligência Artificial (Google Gemini) */}
      <section className="clay-card" style={{ padding: '1.5rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '0.85rem' }}>
          <div className="flex items-center gap-sm">
            <Sparkles size={20} color="var(--accent-secondary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#FFFFFF' }}>Chave da API Gemini</h2>
          </div>

          {/* Status visual da conexão */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            background: apiStatus === 'valid' ? 'rgba(16, 185, 129, 0.15)' : (apiStatus === 'configured' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(245, 158, 11, 0.15)'),
            color: apiStatus === 'valid' ? '#10B981' : (apiStatus === 'configured' ? '#06B6D4' : '#F59E0B'),
            border: `1px solid ${apiStatus === 'valid' ? 'rgba(16, 185, 129, 0.3)' : (apiStatus === 'configured' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(245, 158, 11, 0.3)')}`
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
            {apiStatus === 'valid' ? 'Conectado' : (apiStatus === 'configured' ? 'Configurada' : 'Não configurada')}
          </div>
        </div>

        <p className="text-muted" style={{ fontSize: '0.84rem', marginBottom: '1rem', lineHeight: 1.4 }}>
          Sua chave é armazenada com segurança no seu navegador e utilizada para gerar planos de treino e nutrição com os modelos mais avançados da IA do Google.
        </p>

        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
          <input 
            type={showKey ? 'text' : 'password'} 
            className="input-field" 
            value={apiKey} 
            onChange={(e) => {
              setApiKey(e.target.value.trim());
              setApiStatus(e.target.value.trim() ? 'configured' : 'missing');
              setSaved(false);
            }} 
            placeholder="Cole aqui sua API Key: AIzaSy..." 
            style={{ paddingRight: '45px' }}
          />
          <button 
            type="button"
            aria-label={showKey ? 'Ocultar chave' : 'Mostrar chave'}
            onClick={() => setShowKey(!showKey)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
          >
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex gap-sm items-center">
          <button 
            type="button"
            className="clay-btn-secondary" 
            disabled={!apiKey || testingKey}
            onClick={testApiKey}
            style={{ flex: 1 }}
          >
            <Key size={16} />
            {testingKey ? 'Testando Conexão...' : 'Testar Conexão com a IA'}
          </button>
        </div>

        {apiFeedback && (
          <p style={{ 
            marginTop: '0.75rem', 
            fontSize: '0.82rem', 
            color: apiStatus === 'valid' ? 'var(--status-success)' : 'var(--status-danger)' 
          }}>
            {apiFeedback}
          </p>
        )}
      </section>

      {/* CARD 4: Backup de Dados */}
      <section className="clay-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.35rem', color: '#FFFFFF' }}>
          Backup & Exportação
        </h2>
        <p className="text-muted" style={{ fontSize: '0.84rem', marginBottom: '1.25rem', lineHeight: 1.4 }}>
          Todos os seus registros são guardados localmente. Exporte uma cópia de segurança para trocar de dispositivo ou restaurar a qualquer momento.
        </p>

        <div className="flex gap-md">
          <button 
            type="button"
            className="clay-btn-secondary" 
            style={{ flex: 1 }} 
            onClick={handleExportData}
          >
            <Download size={16} /> Exportar JSON
          </button>

          <label 
            className="clay-btn-secondary" 
            style={{ flex: 1, cursor: 'pointer' }}
          >
            <Upload size={16} /> Importar JSON
            <input 
              type="file" 
              accept=".json" 
              style={{ display: 'none' }} 
              onChange={handleImportData} 
            />
          </label>
        </div>
      </section>
    </div>
  );
}
