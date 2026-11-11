import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLocalStorage } from './hooks/useLocalStorage';
import { BottomNav } from './components/BottomNav';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import bgImage from './assets/bg-workout.jpg';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Workout = lazy(() => import('./pages/Workout').then(m => ({ default: m.Workout })));
const Diet = lazy(() => import('./pages/Diet').then(m => ({ default: m.Diet })));
const History = lazy(() => import('./pages/History').then(m => ({ default: m.History })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const WorkoutManager = lazy(() => import('./pages/WorkoutManager').then(m => ({ default: m.WorkoutManager })));

export function App() {
  const [history] = useLocalStorage('fitness_workout_history', []);
  
  // Cálculo de dias seguidos (streak) de treino
  const calculateStreak = () => {
    if (!history || history.length === 0) return 0;
    const dates = [...new Set(history.map(h => h.date.split('T')[0]))].sort().reverse();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const firstDateStr = dates[0];
    const firstDate = new Date(`${firstDateStr}T00:00:00`); 
    firstDate.setHours(0, 0, 0, 0);
    
    const diffDaysFirst = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24));
    if (diffDaysFirst > 1) return 0;
    
    let currentStreak = 1;
    let expectedNext = new Date(firstDate);
    expectedNext.setDate(expectedNext.getDate() - 1);
    
    for (let i = 1; i < dates.length; i++) {
      const d = new Date(`${dates[i]}T00:00:00`);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === expectedNext.getTime()) {
        currentStreak++;
        expectedNext.setDate(expectedNext.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  };

  const streak = calculateStreak();

  return (
    <Router>
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <div 
          className="app-background" 
          style={{ 
            backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.40) 0%, rgba(15, 23, 42, 0.60) 45%, rgba(15, 23, 42, 0.85) 100%), url(${bgImage})` 
          }} 
          aria-hidden="true" 
        />
        <main className="app-container" style={{ position: 'relative', zIndex: 1 }}>
          <ErrorBoundary>
            <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando aplicativo...</div>}>
              <Routes>
                <Route path="/" element={<Home streak={streak} />} />
                <Route path="/workout" element={<Workout />} />
                <Route path="/workout-manager" element={<WorkoutManager />} />
                <Route path="/diet" element={<Diet />} />
                <Route path="/history" element={<History streak={streak} />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
