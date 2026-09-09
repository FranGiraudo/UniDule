import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Calendar, Settings, Edit, CalendarCheck, Timer, BarChart2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useDataSync } from '../../hooks/useDataSync';
import { useStore } from '../../store/useStore';
import { useEffect } from 'react';
import { playNotificationSound } from '../../lib/utils';
import { saveStudySession } from '../../../features/events/lib/api';

export function MainLayout() {
  useDataSync();


  useEffect(() => {
    const timer = window.setInterval(() => {
      const state = useStore.getState();
      
      // Check for upcoming classes to send a notification (15 mins before)
      const d = new Date();
      if (d.getSeconds() === 0) {
        const nowM = d.getHours() * 60 + d.getMinutes();
        const todayStr = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d.getDay()];
        
        state.career?.subjects.forEach(s => {
          s.schedules?.filter(sc => sc.day === todayStr).forEach(sc => {
            const parts = sc.startTime.split(':');
            const stM = parseInt(parts[0]) * 60 + parseInt(parts[1]);
            // If exactly 15 mins before
            if (stM - nowM === 15) {
              if (Notification.permission === 'granted') {
                new Notification('¡Clase en 15 minutos!', {
                  body: `${s.name} (${sc.type}) a las ${sc.startTime} en ${s.room || 'Aula sin asignar'}`,
                  icon: '/icon-192x192.png'
                });
                playNotificationSound();
              }
            }
          });
        });
      }

      // Pomodoro logic
      if (state.pomodoro.isRunning) {
        const currentLeft = state.pomodoro.timeLeft;
        if (currentLeft > 0) {
          state.setPomodoro({ timeLeft: currentLeft - 1 });
        } else {
          state.setPomodoro({ isRunning: false });
          playNotificationSound();
          if (Notification.permission === 'granted') {
            new Notification('¡Tiempo cumplido!', {
              body: 'Tu sesión de estudio ha terminado.',
            });
          }
          
          // Save study session if it was a pomodoro
          const p = state.pomodoro;
          if (p.mode === 'pomodoro' && p.subjectId && state.session) {
            saveStudySession(state.session.user.id, p.subjectId, p.taskId, 25).then(newSession => {
              state.setStudySessions([...state.studySessions, newSession]);
            });
          }
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="app">
      <Sidebar />
      <div id="main">
        {/* <Topbar /> */}
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
        <NavLink to="/tasks" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
          <div className="bnav-icon">
            <Edit size={18} />
          </div>
          <div className="bnav-label">Tareas</div>
        </NavLink>
        <NavLink to="/study" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
          <div className="bnav-icon">
            <Timer size={18} />
          </div>
          <div className="bnav-label">Estudio</div>
        </NavLink>
        <NavLink to="/events" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
          <div className="bnav-icon">
            <CalendarCheck size={18} />
          </div>
          <div className="bnav-label">Act</div>
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
        <NavLink to="/stats" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
          <div className="bnav-icon">
            <BarChart2 size={18} />
          </div>
          <div className="bnav-label">Stats</div>
        </NavLink>
        <NavLink to="/career" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
          <div className="bnav-icon">
            <Map size={18} />
          </div>
          <div className="bnav-label">Carrera</div>
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
