import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Calendar, LogOut, Settings, CheckSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <aside id="sidebar" className={isOpen ? 'open' : ''}>
      <div className="s-logo" style={{ cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
        <div
          className="s-logo-icon"
          style={{
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(270deg, var(--primary), var(--text2), var(--primary))',
            backgroundSize: '200% 200%',
            animation: 'gradFlow 3s ease infinite',
            color: 'var(--bg)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            borderRadius: '12px',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
        </div>
        <div className="s-logo-text">
          <h1>UniDule</h1>
          <p>IUA · 2do Sem 2026</p>
        </div>
      </div>

      <div className="nav-list">
        <div className="nav-section">VISTAS</div>

        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-icon">
            <LayoutDashboard size={18} />
          </div>
          <div className="nav-label">Panel General</div>
        </NavLink>

        <NavLink to="/career" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-icon">
            <Map size={18} />
          </div>
          <div className="nav-label">Plan de Carrera</div>
        </NavLink>

        <NavLink
          to="/subjects"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-icon">
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
          <div className="nav-label">Materias</div>
        </NavLink>

        <NavLink to="/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-icon">
            <CheckSquare size={18} />
          </div>
          <div className="nav-label">Tareas</div>
        </NavLink>

        <NavLink
          to="/schedule"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <Calendar size={18} />
          </div>
          <div className="nav-label">Horarios</div>
        </NavLink>
      </div>

      <div className="s-footer">
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          style={{ marginBottom: '8px' }}
        >
          <div className="nav-icon">
            <Settings size={18} />
          </div>
          <div className="nav-label">Ajustes</div>
        </NavLink>
        <div className="nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
          <div className="nav-icon">
            <LogOut size={18} />
          </div>
          <div className="nav-label">Cerrar Sesión</div>
        </div>
      </div>
    </aside>
  );
}
