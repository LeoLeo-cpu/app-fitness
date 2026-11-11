import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_USER_PROFILE, DEFAULT_WORKOUT_PLAN } from '../data/defaultData';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Utensils, TrendingUp, Layers, Flame, Clock, Award, Droplet, ChevronRight, Play } from 'lucide-react';

export function Home({ streak = 0 }) {
  const navigate = useNavigate();
  const [profile] = useLocalStorage('fitness_user_profile', DEFAULT_USER_PROFILE);
  const [currentDayIndex, setCurrentDayIndex] = useLocalStorage('fitness_workout_current_day', 0);
  const [workoutCycle] = useLocalStorage('fitness_workout_cycle', ['Push', 'Pull', 'Legs', 'Rest']);
  const [workoutPlan] = useLocalStorage('fitness_workout_plan', DEFAULT_WORKOUT_PLAN);
  const [mealsLog] = useLocalStorage('fitness_meals_log', []);
  const [history] = useLocalStorage('fitness_workout_history', []);
  const [waterLog] = useLocalStorage('fitness_water_log', []);

  // Validação de limites seguros do índice de treino
  const safeIndex = currentDayIndex >= workoutCycle.length ? 0 : currentDayIndex;
  if (currentDayIndex >= workoutCycle.length) {
    setCurrentDayIndex(0);
  }

  const currentWorkoutType = workoutCycle[safeIndex];
  const isRestDay = currentWorkoutType.toLowerCase().includes('descanso') || currentWorkoutType === 'Rest';
  const todayExercises = (!isRestDay && workoutPlan[currentWorkoutType]) ? workoutPlan[currentWorkoutType] : [];
  const exerciseCount = todayExercises.length;
  const estimatedTime = isRestDay ? 0 : Math.max(30, exerciseCount * 12);

  // Dados de dieta do dia
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysLogIndex = mealsLog.findIndex(log => log.date === todayStr);
  const todaysFoods = todaysLogIndex >= 0 ? mealsLog[todaysLogIndex].foods : [];

  const totals = todaysFoods.reduce((acc, food) => {
    acc.calories += Number(food.calories) || 0;
    acc.protein += Number(food.protein) || 0;
    acc.carbs += Number(food.carbs) || 0;
    acc.fat += Number(food.fat) || 0;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const targetCalories = Number(profile.calTarget) || 2000;
  const caloriePercentage = Math.min(100, Math.round((totals.calories / targetCalories) * 100));

  // Água do dia
  const todayWater = waterLog.find(w => w.date === todayStr)?.ml || 0;

  // Atividade dos últimos 7 dias (Weekly Activity)
  const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const hasWorkout = history.some(h => h.date && h.date.startsWith(dStr));
    return {
      label: daysOfWeek[d.getDay()],
      dateStr: dStr,
      hasWorkout,
      isToday: i === 6
    };
  });

  const userName = profile.name ? profile.name.trim() : 'Alex';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Principal com Saudação e Streak */}
      <header className="flex justify-between items-center" style={{ padding: '0.25rem 0' }}>
        <div className="flex items-center gap-md">
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #06B6D4, #7C3AED)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3), inset 0 2px 2px rgba(255, 255, 255, 0.3)'
          }}>
            ⚡
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '700', lineHeight: 1.2 }}>
              Olá, {userName} 👋
            </h1>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              Pronto para bater suas metas hoje?
            </p>
          </div>
        </div>

        {/* Widget de Streak Clay */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: streak > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.04)',
          border: `1px solid ${streak > 0 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
          padding: '0.45rem 0.9rem',
          borderRadius: '9999px',
          boxShadow: streak > 0 ? '0 0 12px rgba(245, 158, 11, 0.2)' : 'none'
        }}>
          <Flame size={20} color={streak > 0 ? '#F59E0B' : 'var(--text-secondary)'} fill={streak > 0 ? '#F59E0B' : 'none'} />
          <span style={{ fontWeight: '700', fontSize: '0.9rem', color: streak > 0 ? '#FBBF24' : 'var(--text-secondary)' }}>
            {streak} {streak === 1 ? 'Dia' : 'Dias'}
          </span>
        </div>
      </header>

      {/* Grid Principal: Treino do Dia & Resumo de Dieta */}
      <div className="grid-cols-2">
        {/* Card do Treino do Dia */}
        <div 
          className="clay-card clay-card-interactive" 
          style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(22, 32, 50, 0.85) 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onClick={() => navigate('/workout')}
        >
          {/* Luz decorativa sutil de fundo */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <span className="clay-pill" style={{ color: 'var(--accent-primary)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
              <Dumbbell size={14} /> Treino do Dia
            </span>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              color: isRestDay ? 'var(--status-success)' : 'var(--accent-primary)',
              background: isRestDay ? 'rgba(16, 185, 129, 0.12)' : 'rgba(6, 182, 212, 0.12)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              border: `1px solid ${isRestDay ? 'rgba(16, 185, 129, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`
            }}>
              {isRestDay ? 'Descanso Ativo' : currentWorkoutType}
            </span>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem', color: '#FFFFFF' }}>
            {isRestDay ? 'Recuperação Muscular' : `Sessão: ${currentWorkoutType}`}
          </h2>

          <p className="text-muted" style={{ fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: 1.4 }}>
            {isRestDay
              ? 'Dia focado em recuperar fibras musculares, hidratação e sono reparador.'
              : `${exerciseCount} exercícios programados para sua evolução de força e hipertrofia.`}
          </p>

          <div className="flex items-center gap-md" style={{ marginBottom: '1.5rem' }}>
            {!isRestDay && (
              <>
                <div className="flex items-center gap-xs text-muted" style={{ fontSize: '0.82rem' }}>
                  <Clock size={15} color="var(--accent-primary)" />
                  <span>~{estimatedTime} min</span>
                </div>
                <div className="flex items-center gap-xs text-muted" style={{ fontSize: '0.82rem' }}>
                  <Award size={15} color="var(--status-streak)" />
                  <span>{exerciseCount} Exercícios</span>
                </div>
              </>
            )}
          </div>

          <button 
            className="clay-btn-primary" 
            style={{ width: '100%' }}
            onClick={(e) => {
              e.stopPropagation();
              navigate('/workout');
            }}
          >
            <Play size={18} fill="#FFFFFF" />
            {isRestDay ? 'Ver Detalhes do Ciclo' : 'Iniciar Treino'}
          </button>
        </div>

        {/* Card do Progresso Diário & Dieta */}
        <div 
          className="clay-card clay-card-interactive" 
          style={{ padding: '1.5rem', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(22, 32, 50, 0.85) 100%)' }}
          onClick={() => navigate('/diet')}
        >
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <span className="clay-pill" style={{ color: 'var(--status-success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <Utensils size={14} /> Dieta & Nutrição
            </span>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
              Meta: {targetCalories} kcal
            </span>
          </div>

          <div className="flex items-center gap-lg" style={{ marginBottom: '1.25rem' }}>
            {/* Gráfico circular donut SVG */}
            <div style={{ position: 'relative', width: '84px', height: '84px', flexShrink: 0 }}>
              <svg width="84" height="84" viewBox="0 0 84 84">
                <circle
                  cx="42"
                  cy="42"
                  r="34"
                  fill="transparent"
                  stroke="#24344D"
                  strokeWidth="8"
                />
                <circle
                  cx="42"
                  cy="42"
                  r="34"
                  fill="transparent"
                  stroke="url(#calorieGradient)"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - Math.min(1, totals.calories / targetCalories))}
                  strokeLinecap="round"
                  transform="rotate(-90 42 42)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                <defs>
                  <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#FFFFFF' }}>{caloriePercentage}%</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFFFFF' }}>
                {totals.calories} <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: '500' }}>/ {targetCalories} kcal</span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>
                {totals.calories >= targetCalories 
                  ? 'Meta diária de calorias atingida!' 
                  : `Restam ${Math.max(0, targetCalories - totals.calories)} kcal para a meta.`}
              </p>
            </div>
          </div>

          {/* Divisão dos Macros em pílulas táteis */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ background: '#131B2E', padding: '0.6rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-muted" style={{ fontSize: '0.72rem', display: 'block' }}>Proteína</span>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--accent-secondary)' }}>{totals.protein}g</span>
            </div>
            <div style={{ background: '#131B2E', padding: '0.6rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-muted" style={{ fontSize: '0.72rem', display: 'block' }}>Carboidratos</span>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--status-success)' }}>{totals.carbs}g</span>
            </div>
            <div style={{ background: '#131B2E', padding: '0.6rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-muted" style={{ fontSize: '0.72rem', display: 'block' }}>Gorduras</span>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--status-streak)' }}>{totals.fat}g</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-muted" style={{ fontSize: '0.82rem' }}>
            <span className="flex items-center gap-xs">
              <Droplet size={14} color="var(--accent-primary)" /> Água: {todayWater} ml
            </span>
            <span className="flex items-center gap-xs" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
              Registrar <ChevronRight size={14} />
            </span>
          </div>
        </div>
      </div>

      {/* Ações Rápidas (Quick Actions) */}
      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.85rem', color: '#FFFFFF' }}>
          Ações Rápidas
        </h2>
        <div className="grid-actions">
          {/* Ação 1: Treino */}
          <div 
            className="clay-card clay-card-interactive" 
            style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.6rem' }}
            onClick={() => navigate('/workout')}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)'
            }}>
              <Dumbbell size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#FFFFFF' }}>Treino</div>
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>Iniciar sessão</span>
            </div>
          </div>

          {/* Ação 2: Dieta */}
          <div 
            className="clay-card clay-card-interactive" 
            style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.6rem' }}
            onClick={() => navigate('/diet')}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-success)',
              boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)'
            }}>
              <Utensils size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#FFFFFF' }}>Refeição</div>
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>Registrar macros</span>
            </div>
          </div>

          {/* Ação 3: Histórico & Métricas */}
          <div 
            className="clay-card clay-card-interactive" 
            style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.6rem' }}
            onClick={() => navigate('/history')}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'rgba(124, 58, 237, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-secondary)',
              boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)'
            }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#FFFFFF' }}>Evolução</div>
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>Cargas e badges</span>
            </div>
          </div>

          {/* Ação 4: Gerenciador de Treinos */}
          <div 
            className="clay-card clay-card-interactive" 
            style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.6rem' }}
            onClick={() => navigate('/workout-manager')}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-streak)',
              boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)'
            }}>
              <Layers size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#FFFFFF' }}>Fichas</div>
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>Montar com IA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Atividade Semanal (Weekly Activity) */}
      <section className="clay-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#FFFFFF' }}>Atividade dos Últimos 7 Dias</h3>
            <p className="text-muted" style={{ fontSize: '0.78rem' }}>Consistência constrói resultados</p>
          </div>
          <span className="clay-pill" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
            {history.length} {history.length === 1 ? 'Treino gravado' : 'Treinos gravados'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
          {past7Days.map((day, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: '38px',
                height: '48px',
                borderRadius: '12px',
                background: day.hasWorkout
                  ? 'linear-gradient(180deg, #06B6D4 0%, #0891B2 100%)'
                  : (day.isToday ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)'),
                border: day.isToday ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: day.hasWorkout ? '0 4px 10px rgba(6, 182, 212, 0.35)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: day.hasWorkout ? '#FFFFFF' : 'var(--text-secondary)'
              }}>
                {day.hasWorkout ? '✓' : (day.isToday ? '•' : '')}
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: day.isToday ? '700' : '500',
                color: day.isToday ? 'var(--accent-primary)' : 'var(--text-secondary)'
              }}>
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
