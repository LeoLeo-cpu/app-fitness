import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_USER_PROFILE } from '../data/defaultData';
import { Save } from 'lucide-react';
import { useState } from 'react';

export function Settings() {
  const [profile, setProfile] = useLocalStorage('fitness_user_profile', DEFAULT_USER_PROFILE);
  const [apiKey, setApiKey] = useLocalStorage('fitness_gemini_api_key', '');
  const [saved, setSaved] = useState(false);

  const testApiKey = async () => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
      const data = await response.json();
      if (data.error) {
        alert(`Erro na chave: ${data.error.message}`);
      } else {
        const modelIds = data.models.map(m => m.name).join('\\n');
        alert(`Sucesso! Modelos disponíveis na sua chave:\\n\\n${modelIds}`);
      }
    } catch (err) {
      alert(`Falha de rede ao testar: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: name === 'gender' ? value : Number(value)
    }));
    setSaved(false);
  };

  const calculateMacros = () => {
    const { weight, height, age, gender, activityLevel } = profile;
    if (!weight || !height || !age) return;

    // Mifflin-St Jeor Equation
    let tmb = (10 * weight) + (6.25 * height) - (5 * age);
    tmb += (gender === 'M' ? 5 : -161);

    const tdee = tmb * activityLevel;
    const calTarget = Math.round(tdee - 500); // 500 kcal deficit

    const protein = Math.round(weight * 2.0); // 2g per kg
    const fat = Math.round(weight * 1.0); // 1g per kg
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
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('fitness_')) {
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
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        for (const key in data) {
          if (key.startsWith('fitness_')) {
            localStorage.setItem(key, data[key]);
          }
        }
        alert('Dados restaurados com sucesso! O aplicativo será recarregado.');
        window.location.reload();
      } catch (err) {
        alert('Erro ao restaurar arquivo. Certifique-se de que é um backup válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-md animate-fade-in" style={{ paddingBottom: '100px' }}>
      <h1 style={{ marginBottom: '1rem' }}>Configurações do Perfil</h1>
      
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Idade (anos)</label>
          <input type="number" name="age" className="input-field" value={profile.age} onChange={handleChange} placeholder="Ex: 30" />
        </div>
        
        <div className="flex gap-md">
          <div style={{ flex: 1 }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Peso (kg)</label>
            <input type="number" name="weight" className="input-field" value={profile.weight} onChange={handleChange} placeholder="Ex: 75" />
          </div>
          <div style={{ flex: 1 }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Altura (cm)</label>
            <input type="number" name="height" className="input-field" value={profile.height} onChange={handleChange} placeholder="Ex: 175" />
          </div>
        </div>

        <div className="flex gap-md">
          <div style={{ flex: 1 }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Sexo</label>
            <select name="gender" className="input-field" value={profile.gender} onChange={handleChange}>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Nível de Atividade</label>
            <select name="activityLevel" className="input-field" value={profile.activityLevel} onChange={handleChange}>
              <option value="1.2">Sedentário</option>
              <option value="1.375">Leve</option>
              <option value="1.55">Moderado</option>
              <option value="1.725">Intenso</option>
            </select>
          </div>
        </div>

        <div className="flex gap-md">
          <div style={{ flex: 1 }}>
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Descanso entre Séries (Global)</label>
            <select name="restTimer" className="input-field" value={profile.restTimer || 60} onChange={handleChange}>
              <option value="30">30 segundos</option>
              <option value="45">45 segundos</option>
              <option value="60">60 segundos</option>
              <option value="90">90 segundos</option>
              <option value="120">2 minutos</option>
              <option value="180">3 minutos</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-purple)' }}>Inteligência Artificial (Gemini)</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
            Insira sua chave de API do Google Gemini para usar o Gerador de Treinos Inteligente.
          </p>
          <input 
            type="password" 
            className="input-field" 
            value={apiKey} 
            onChange={(e) => {
              setApiKey(e.target.value.trim());
              setSaved(false);
            }} 
            placeholder="AIzaSy..." 
          />
          {apiKey && (
            <button className="btn-secondary" onClick={testApiKey} style={{ marginTop: '0.5rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
              Testar Conexão / Ver Modelos Permitidos
            </button>
          )}
        </div>

        <button className="btn-primary" onClick={calculateMacros} style={{ marginTop: '1rem' }}>
          <Save size={20} />
          {saved ? 'Salvo!' : 'Salvar Configurações'}
        </button>

        {profile.calTarget > 0 && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>Suas Metas (Déficit de 500 kcal)</h3>
            <p><strong>TMB:</strong> {profile.tmb} kcal</p>
            <p><strong>Meta Diária:</strong> {profile.calTarget} kcal</p>
            <div className="flex justify-between" style={{ marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--accent-red)' }}>Prot: {profile.macros.protein}g</span>
              <span style={{ color: 'var(--accent-green)' }}>Carb: {profile.macros.carbs}g</span>
              <span style={{ color: 'var(--accent-purple)' }}>Gord: {profile.macros.fat}g</span>
            </div>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-green)' }}>Backup de Dados</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
            Seus dados são salvos apenas no seu navegador. Exporte regularmente.
          </p>
          <div className="flex gap-md">
            <button className="btn-secondary" style={{ flex: 1, padding: '0.5rem' }} onClick={handleExportData}>Exportar (JSON)</button>
            <label className="btn-secondary" style={{ flex: 1, padding: '0.5rem', textAlign: 'center', cursor: 'pointer' }}>
              Importar (JSON)
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportData} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
