import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Utensils, History, Settings } from 'lucide-react';
import './BottomNav.css';

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={24} />
        <span>Hoje</span>
      </NavLink>
      <NavLink to="/workout" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Dumbbell size={24} />
        <span>Treino</span>
      </NavLink>
      <NavLink to="/diet" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Utensils size={24} />
        <span>Dieta</span>
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <History size={24} />
        <span>Histórico</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Settings size={24} />
        <span>Config</span>
      </NavLink>
    </nav>
  );
}
