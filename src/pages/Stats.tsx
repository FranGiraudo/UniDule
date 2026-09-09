import { useStore } from '../shared/store/useStore';
import { Activity, BookOpen, Dumbbell } from 'lucide-react';

export function Stats() {
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

  // Gym logic (or extra activities)
  const gymEvents = userEvents.filter(e => e.category === 'gimnasio');
  const gymCompletions = eventCompletions.filter(c => {
    const isGym = gymEvents.some(ge => ge.id === c.event_id);
    const d = new Date(c.completed_at);
    return isGym && d >= firstDay && d <= lastDay;
  });

  // Study hours
  const thisWeekStudy = studySessions.filter(s => {
    const d = new Date(s.completed_at);
    return d >= firstDay && d <= lastDay;
  });
  const totalStudyMinutes = thisWeekStudy.reduce((acc, s) => acc + s.duration_minutes, 0);
  const studyHours = Math.floor(totalStudyMinutes / 60);
  const studyMins = totalStudyMinutes % 60;

  // Study by subject (this week)
  const studyBySubject = thisWeekStudy.reduce((acc, s) => {
    acc[s.subject_id] = (acc[s.subject_id] || 0) + s.duration_minutes;
    return acc;
  }, {} as Record<string, number>);

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
      </div>
    </div>
  );
}
