import { useStore } from '../shared/store/useStore';
import { useDialogs } from '../shared/store/useDialogs';
import { deleteStudySession } from '../features/events/lib/api';
import { useMemo } from 'react';
import { Activity, BookOpen, Dumbbell, Flame, Trash2, Clock } from 'lucide-react';

export function Stats() {
  const showConfirm = useDialogs(s => s.showConfirm);
  const { eventCompletions, studySessions, userEvents, career } = useStore();
  const subjects = career?.subjects || [];

  // Calculate current week bounds
  const now = new Date();
  const day = now.getDay() || 7; 
  const firstDay = new Date(now);
  firstDay.setDate(now.getDate() - day + 1);
  firstDay.setHours(0,0,0,0);
  
  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);
  lastDay.setHours(23,59,59,999);

  // Memoized stats calculations
  const { gymCompletions, studyHours, studyMins, studyBySubject, currentStreak } = useMemo(() => {
    // Gym logic
    const gEvents = userEvents.filter(e => e.category === 'gimnasio');
    const gComps = eventCompletions.filter(c => {
      const isGym = gEvents.some(ge => ge.id === c.event_id);
      const d = new Date(c.completed_at);
      return isGym && d >= firstDay && d <= lastDay;
    });

    // Study hours
    const twStudy = studySessions.filter(s => {
      const d = new Date(s.completed_at || s.created_at || new Date());
      return d >= firstDay && d <= lastDay;
    });
    const tMins = twStudy.reduce((acc, s) => acc + s.duration_minutes, 0);
    const sHours = Math.floor(tMins / 60);
    const sMins = tMins % 60;

    // Study by subject
    const sBySub = twStudy.reduce((acc, s) => {
      acc[s.subject_id] = (acc[s.subject_id] || 0) + s.duration_minutes;
      return acc;
    }, {} as Record<string, number>);

    // Streak logic
    let streak = 0;
    const d = new Date();
    d.setHours(0,0,0,0);
    
    // Index completions for O(1) lookup
    const compSet = new Set(eventCompletions.map(c => c.date_str));
    const studySet = new Set(studySessions.map(s => {
      const cd = new Date(s.completed_at || s.created_at || new Date());
      return `${cd.getFullYear()}-${String(cd.getMonth() + 1).padStart(2, '0')}-${String(cd.getDate()).padStart(2, '0')}`;
    }));
    
    const hasActivity = (dateObj: Date) => {
      const ds = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      return compSet.has(ds) || studySet.has(ds);
    };

    let checkDate = new Date(d);
    if (!hasActivity(checkDate)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      if (hasActivity(checkDate)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { gymCompletions: gComps, studyHours: sHours, studyMins: sMins, studyBySubject: sBySub, currentStreak: streak };
  }, [userEvents, eventCompletions, studySessions, firstDay, lastDay]);


  const handleDeleteSession = async (id: string) => {
    if (!(await showConfirm('¿Seguro que quieres eliminar esta sesión?'))) return;
    try {
      await deleteStudySession(id);
      // Actualizar el estado global
      useStore.getState().setStudySessions(studySessions.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
      alert('Error eliminando sesión');
    }
  };

  const sortedSessions = [...studySessions].sort((a: any, b: any) => new Date(b.completed_at || b.created_at || new Date()).getTime() - new Date(a.completed_at || a.created_at || new Date()).getTime());

  return (
    <div className="view-content fade-in" style={{ animation: 'fadeUp 0.3s ease' }}>
      <header className="view-header">
        <div>
          <h2 className="view-title">Estadísticas</h2>
          <p className="view-sub">Tu progreso en la semana actual</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text2)' }}>
            <Flame size={20} color="#f97316" />
            <span style={{ fontWeight: 600 }}>Racha de Actividad</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 900, color: '#f97316' }}>
            {currentStreak} <span style={{ fontSize: '18px', color: 'var(--text2)' }}>días</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
            Días seguidos cumpliendo hábitos o estudiando.
          </div>
        </div>

        
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text2)' }}>
            <Dumbbell size={20} color="#10b981" />
            <span style={{ fontWeight: 600 }}>Idas al Gym (Esta semana)</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 900, color: '#10b981' }}>
            {gymCompletions.length}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
            Meta ideal: Mantener la constancia.
          </div>
        </div>

        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text2)' }}>
            <BookOpen size={20} color="var(--primary)" />
            <span style={{ fontWeight: 600 }}>Tiempo de Estudio (Esta semana)</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--primary)' }}>
            {studyHours}h {studyMins}m
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
            Basado en tus sesiones Pomodoro.
          </div>
        </div>

      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} />
            Desglose de Estudio
          </h3>
        </div>
        <div className="card-body" style={{ padding: '16px' }}>
          {Object.keys(studyBySubject).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(studyBySubject).sort((a: any, b: any) => b[1] - a[1]).map(([subId, mins]: [string, any]) => {
                const sub = subjects.find(s => s.id === subId);
                const hrs = Math.floor(mins / 60);
                const ms = mins % 60;
                return (
                  <div key={subId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card2)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 600 }}>{sub?.name || 'Materia desconocida'}</div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{hrs}h {ms}m</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: 'var(--text2)', textAlign: 'center', padding: '12px 0' }}>
              No hay sesiones de estudio registradas esta semana.
            </div>
          )}
        </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} />
            Historial de Sesiones
          </h3>
        </div>
        <div className="card-body" style={{ padding: '16px' }}>
          {sortedSessions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
              {sortedSessions.map((session: any) => {
                const sub = subjects.find(s => s.id === session.subject_id);
                const hrs = Math.floor(session.duration_minutes / 60);
                const ms = session.duration_minutes % 60;
                const d = new Date(session.completed_at || session.created_at || new Date());
                const dateStr = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                
                return (
                  <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card2)', padding: '12px', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{sub?.name || 'Materia desconocida'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px' }}>{dateStr}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {hrs > 0 ? `${hrs}h ` : ''}{ms}m
                      </div>
                      <button className="btn-xs" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDeleteSession(session.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: 'var(--text2)', textAlign: 'center', padding: '12px 0' }}>
              No hay sesiones registradas en tu historial.
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
