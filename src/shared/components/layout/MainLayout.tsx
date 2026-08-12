import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Calendar, Settings, CheckSquare } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useDataSync } from '../../hooks/useDataSync';

export function MainLayout() {
  useDataSync();

  return (
    <div id="app">
      <Sidebar />
      <div id="main">
        <main id="page-content">
          <Outlet />
        </main>
      </div>
      {/* Mobile Bottom Nav */}
      <nav id="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
          <div className="bnav-icon">
            <LayoutDashboard size={18} />
          </div>
          <div className="bnav-label">Panel</div>
        </NavLink>
        <NavLink
          to="/schedule"
          className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}
        >
          <div className="bnav-icon">
            <Calendar size={18} />
          </div>
          <div className="bnav-label">Horarios</div>
        </NavLink>
        <NavLink to="/career" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
          <div className="bnav-icon">
            <Map size={18} />
          </div>
          <div className="bnav-label">Carrera</div>
        </NavLink>
        <NavLink
          to="/subjects"
          className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}
        >
          <div className="bnav-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <div className="bnav-label">Materias</div>
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
          <div className="bnav-icon">
            <CheckSquare size={18} />
          </div>
          <div className="bnav-label">Tareas</div>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}
        >
          <div className="bnav-icon">
            <Settings size={18} />
          </div>
          <div className="bnav-label">Ajustes</div>
        </NavLink>
      </nav>
    </div>
  );
}
