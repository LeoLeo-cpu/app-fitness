import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Flame } from 'lucide-react';
import { BottomNav } from './components/BottomNav';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Workout = lazy(() => import('./pages/Workout').then(m => ({ default: m.Workout })));
const Diet = lazy(() => import('./pages/Diet').then(m => ({ default: m.Diet })));
const History = lazy(() => import('./pages/History').then(m => ({ default: m.History })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const WorkoutManager = lazy(() => import('./pages/WorkoutManager').then(m => ({ default: m.WorkoutManager })));

function App() {
  const [history] = useLocalStorage('fitness_workout_history', []);
  
  const calculateStreak = () => {
    if (!history || history.length === 0) return 0;
    const dates = [...new Set(history.map(h => h.date.split('T')[0]))].sort().reverse();
    
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const firstDateStr = dates[0];
    const firstDate = new Date(`${firstDateStr}T00:00:00`); 
    firstDate.setHours(0,0,0,0);
    
    const diffDaysFirst = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24));
    if (diffDaysFirst > 1) return 0;
    
    streak = 1;
    let expectedNext = new Date(firstDate);
    expectedNext.setDate(expectedNext.getDate() - 1);
    
    for (let i = 1; i < dates.length; i++) {
      const d = new Date(`${dates[i]}T00:00:00`);
      d.setHours(0,0,0,0);
      if (d.getTime() === expectedNext.getTime()) {
        streak++;
        expectedNext.setDate(expectedNext.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  return (
    <Router>
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <div style={{ 
          position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 50,
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          background: 'rgba(0,0,0,0.5)', padding: '0.25rem 0.75rem', borderRadius: '1rem',
          backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.05)',
          color: streak > 0 ? '#f97316' : 'var(--text-muted)'
        }}>
          <Flame size={18} fill={streak > 0 ? '#f97316' : 'none'} />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{streak}</span>
        </div>

        <ErrorBoundary>
          <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/workout" element={<Workout />} />
              <Route path="/workout-manager" element={<WorkoutManager />} />
              <Route path="/diet" element={<Diet />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
