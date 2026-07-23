import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_USER_PROFILE } from '../data/defaultData';
import { ProgressBar } from '../components/ProgressBar';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Utensils } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const [profile] = useLocalStorage('fitness_user_profile', DEFAULT_USER_PROFILE);
  const [currentDayIndex, setCurrentDayIndex] = useLocalStorage('fitness_workout_current_day', 0);
  const [workoutCycle] = useLocalStorage('fitness_workout_cycle', ['Push', 'Pull', 'Legs', 'Rest']);
  const [mealsLog] = useLocalStorage('fitness_meals_log', []);
  
  // Safe bounds check
  const safeIndex = currentDayIndex >= workoutCycle.length ? 0 : currentDayIndex;
  if (currentDayIndex >= workoutCycle.length) {
    setCurrentDayIndex(0);
  }

  const currentWorkoutType = workoutCycle[safeIndex];
  const isRestDay = currentWorkoutType.toLowerCase().includes('descanso') || currentWorkoutType === 'Rest';

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysLogIndex = mealsLog.findIndex(log => log.date === todayStr);
  const todaysFoods = todaysLogIndex >= 0 ? mealsLog[todaysLogIndex].foods : [];

  const calories = todaysFoods.reduce((acc, food) => acc + Number(food.calories), 0);

  return (
    <div className="p-md animate-fade-in" style={{ paddingBottom: '100px' }}>
      <h1>Resumo de Hoje</h1>
      
      {/* Workout Summary */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/workout')}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Dumbbell size={20} color="var(--accent-blue)" /> Treino
          </h2>
          <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold', background: 'rgba(14, 165, 233, 0.1)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
            {isRestDay ? 'Descanso' : currentWorkoutType}
          </span>
        </div>
        <p className="text-muted">
          {isRestDay ? 'Hoje é dia de recuperação muscular.' : 'Toque para iniciar sua sessão de treino.'}
        </p>
      </div>

      {/* Diet Summary */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem', cursor: 'pointer' }} onClick={() => navigate('/diet')}>
        <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Utensils size={20} color="var(--accent-green)" /> Dieta
          </h2>
        </div>
        <ProgressBar label="Calorias Consumidas" current={calories} max={profile.calTarget} color="var(--accent-green)" />
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
          {profile.calTarget > 0 ? `Restam ${Math.max(0, profile.calTarget - calories)} kcal` : 'Configure suas metas na aba Config.'}
        </p>
      </div>
    </div>
  );
}
