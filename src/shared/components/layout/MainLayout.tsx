import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Calendar, Settings, Edit, CalendarCheck, Timer, BarChart2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useDataSync } from '../../hooks/useDataSync';
import { useStore } from '../../store/useStore';
import { useDialogs } from '../../store/useDialogs';
import { useEffect } from 'react';
import { playNotificationSound } from '../../lib/utils';
import { saveStudySession } from '../../../features/events/lib/api';

export function MainLayout() {
  useDataSync();


  useEffect(() => {
    const checkPomodoroTick = () => {
      const state = useStore.getState();
      const p = state.pomodoro;

      if (!p.isRunning) {
        if (document.title.startsWith('(')) {
          document.title = 'UniDule';
        }
        return;
      }

      const now = Date.now();
      const endTime = p.endTime ?? now + p.timeLeft * 1000;
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

      if (remaining > 0) {
        if (remaining !== p.timeLeft || !p.endTime) {
          state.setPomodoro({ timeLeft: remaining, endTime });
        }
        const m = Math.floor(remaining / 60)
          .toString()
          .padStart(2, '0');
        const s = (remaining % 60).toString().padStart(2, '0');
        document.title = `(${m}:${s}) UniDule`;
      } else {
        state.setPomodoro({ isRunning: false, timeLeft: 0, endTime: null });
        document.title = 'UniDule';
        playNotificationSound();
        useDialogs.getState().showToast('¡Tiempo cumplido! Tu sesión de estudio ha terminado.', 'info');
        if (Notification.permission === 'granted') {
          new Notification('¡Tiempo cumplido!', {
            body: 'Tu sesión de estudio ha terminado.',
            icon: '/favicon.svg',
          });
        }

        // Save study session if it was a pomodoro
        if (p.mode === 'pomodoro' && p.subjectId && state.session) {
          const duration = state.settings.pomodoroTime || 25;
          const taskIdToSave = p.taskId && !p.taskId.startsWith('grade:') ? p.taskId : undefined;
          saveStudySession(state.session.user.id, p.subjectId, taskIdToSave, duration)
            .then((newSession) => {
              const current = useStore.getState().studySessions;
              state.setStudySessions([...current, newSession]);
            })
            .catch((err) => console.warn('Could not save study session', err));
        }
      }
    };

    const checkUpcomingClasses = () => {
      const state = useStore.getState();
      const d = new Date();
      if (d.getSeconds() === 0) {
        const nowM = d.getHours() * 60 + d.getMinutes();
        const todayStr = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d.getDay()];

        state.career?.subjects.forEach((s) => {
          s.schedules
            ?.filter((sc) => sc.day === todayStr)
            .forEach((sc) => {
              const parts = sc.startTime.split(':');
              const stM = parseInt(parts[0]) * 60 + parseInt(parts[1]);
              if (stM - nowM === 15) {
                useDialogs
                  .getState()
                  .showToast(`¡Clase en 15 minutos! ${s.name} (${sc.type}) en ${s.room || 'Aula sin asignar'}`, 'info');
                if (Notification.permission === 'granted') {
                  new Notification('¡Clase en 15 minutos!', {
                    body: `${s.name} (${sc.type}) a las ${sc.startTime} en ${s.room || 'Aula sin asignar'}`,
                    icon: '/favicon.svg',
                  });
                }
                playNotificationSound();
              }
            });
        });
      }
    };

    const onHeartbeat = () => {
      checkPomodoroTick();
      checkUpcomingClasses();
    };

    // Web Worker for background ticking (prevents browser tab throttling when user leaves the tab)
    let worker: Worker | null = null;
    let workerUrl: string | null = null;
    try {
      if (typeof Worker !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
        const workerCode = `
          let timer = null;
          timer = setInterval(function() {
            self.postMessage('tick');
          }, 1000);
          self.onmessage = function(e) {
            if (e.data === 'stop' && timer) {
              clearInterval(timer);
              timer = null;
            }
          };
        `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        workerUrl = URL.createObjectURL(blob);
        worker = new Worker(workerUrl);
        worker.onmessage = () => {
          onHeartbeat();
        };
      }
    } catch {
      // Fallback to standard window interval if worker cannot be initialized
    }

    const intervalTimer = window.setInterval(onHeartbeat, 1000);

    // Reconcile immediately when user switches back to this tab or window
    const onVisibilityOrFocus = () => {
      onHeartbeat();
    };
    document.addEventListener('visibilitychange', onVisibilityOrFocus);
    window.addEventListener('focus', onVisibilityOrFocus);

    return () => {
      clearInterval(intervalTimer);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
      window.removeEventListener('focus', onVisibilityOrFocus);
      if (worker) {
        try {
          worker.postMessage('stop');
          worker.terminate();
        } catch {
          // ignore
        }
      }
      if (workerUrl) {
        URL.revokeObjectURL(workerUrl);
      }
      if (document.title.startsWith('(')) {
        document.title = 'UniDule';
      }
    };
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
