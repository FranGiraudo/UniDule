import { useState } from 'react';
import { Calendar, Clock, CheckCircle2, Flag, Play } from 'lucide-react';
import { useStore } from '../shared/store/useStore';
import { saveNote } from '../features/subjects/lib/api';
import { daysUntil, formatDate } from '../shared/lib/utils';
import { useNavigate } from 'react-router-dom';
import { TaskModal } from '../features/tasks/components/TaskModal';

export function Finals() {
  const { career, tasks, notes, setPomodoro } = useStore();
  const navigate = useNavigate();
  const subjects = career?.subjects || [];
  
  // Get all regular subjects
  const regularSubjects = subjects.filter(s => s.status === 'regular');

  const [editingTask, setEditingTask] = useState<any>(undefined);

  // Helper to get finals state from notes
  const getFinalsState = (subjectId: string) => {
    const note = notes.find(n => n.subject_id === subjectId && n.title === '__FINALS_STATE__');
    if (note) {
      try { return JSON.parse(note.content); } catch (e) { return { attemptsLeft: 3 }; }
    }
    return { attemptsLeft: 3 }; // Default
  };

  const setAttempts = async (subjectId: string, attempts: number) => {
    const existing = notes.find(n => n.subject_id === subjectId && n.title === '__FINALS_STATE__');
    await saveNote({
      id: existing ? existing.id : crypto.randomUUID(),
      subject_id: subjectId,
      title: '__FINALS_STATE__',
      content: JSON.stringify({ attemptsLeft: attempts }),
      note_date: new Date().toISOString()
    });
  };

  const handleStudy = (subjectId: string) => {
    setPomodoro({ subjectId, taskId: undefined, examId: undefined, isRunning: false, timeLeft: 25 * 60, mode: 'pomodoro' });
    navigate('/study');
  };

  const handleScheduleMesa = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    setEditingTask({
      id: crypto.randomUUID(),
      title: `Mesa de Final — ${subject?.name}`,
      type: 'Final',
      subjectId,
      dueDate: '',
      done: false
    });
  };

  return (
    <div className="view-content fade-in" style={{ animation: 'fadeUp 0.3s ease' }}>
      <header className="view-header">
        <div>
          <h2 className="view-title">Gestión de Finales</h2>
          <p className="view-sub">
            Organiza tus mesas de exámenes para materias regulares
          </p>
        </div>
      </header>

      {regularSubjects.length === 0 ? (
        <div className="empty-st" style={{ marginTop: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'var(--card2)', color: 'var(--primary)', marginBottom: '1rem' }}>
            <CheckCircle2 size={32} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>Sin finales pendientes</div>
          <p style={{ color: 'var(--text2)', fontSize: '13px', marginTop: '4px' }}>No tienes materias en estado "Regular".</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {regularSubjects.map(sub => {
            const state = getFinalsState(sub.id);
            const finals = tasks.filter(t => t.subjectId === sub.id && t.type === 'Final' && !t.done)
                                .sort((a, b) => (a.dueDate || '') < (b.dueDate || '') ? -1 : 1);
            const nextFinal = finals[0];
            const dUntil = nextFinal?.dueDate ? daysUntil(nextFinal.dueDate) : null;
            const expD = sub.expDate ? daysUntil(sub.expDate) : null;

            return (
              <div key={sub.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: sub.color || 'var(--primary)' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, lineHeight: 1.2 }}>{sub.name}</h3>
                    <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Flag size={12} /> Regular</span>
                       {sub.expDate && (
                         <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: expD !== null && expD < 30 ? '#ef4444' : 'var(--text2)' }}>
                           <Clock size={12} /> Vence: {formatDate(sub.expDate)}
                         </span>
                       )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, background: 'var(--bg)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: state.attemptsLeft <= 1 ? '#ef4444' : 'var(--primary)' }}>
                      {state.attemptsLeft}
                    </div>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text2)', marginTop: '2px', textAlign: 'center' }}>
                      Intentos Restantes
                    </div>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '6px' }}>
                      <button className="btn-xs" onClick={() => setAttempts(sub.id, Math.max(0, state.attemptsLeft - 1))}>-</button>
                      <button className="btn-xs" onClick={() => setAttempts(sub.id, state.attemptsLeft + 1)}>+</button>
                    </div>
                  </div>

                  <div style={{ flex: 1.5, background: 'var(--bg)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid var(--border)' }}>
                    {nextFinal ? (
                      <>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>Próxima Mesa</div>
                        <div style={{ fontSize: '14px', fontWeight: 800 }}>{formatDate(nextFinal.dueDate || '')}</div>
                        <div style={{ fontSize: '11px', color: dUntil !== null && dUntil <= 7 ? '#ef4444' : 'var(--text2)', fontWeight: 600, marginTop: '2px' }}>
                          {dUntil === null ? 'Sin fecha exacta' : dUntil === 0 ? '¡Rindes HOY!' : `En ${dUntil} días`}
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text2)' }}>
                        <Calendar size={20} style={{ margin: '0 auto', opacity: 0.5, marginBottom: '4px' }} />
                        <div style={{ fontSize: '11px', fontWeight: 600 }}>Sin mesa programada</div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '8px' }} onClick={() => handleStudy(sub.id)}>
                    <Play size={14} /> Estudiar
                  </button>
                  <button className="btn" style={{ flex: 1, padding: '8px' }} onClick={() => handleScheduleMesa(sub.id)}>
                    <Calendar size={14} /> Agendar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingTask !== undefined && (
        <TaskModal task={editingTask || undefined} onClose={() => setEditingTask(undefined)} />
      )}
    </div>
  );
}
