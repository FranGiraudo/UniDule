import { useState } from 'react';
import { Plus, Edit, Trash2, Check, CheckCircle2 } from 'lucide-react';
import { useStore } from '../shared/store/useStore';
import { saveTask, deleteTask } from '../features/tasks/lib/api';
import { syncGrades } from '../features/subjects/lib/api';
import { TYPE_BG, TYPE_FG, inferGradeType } from '../features/tasks/lib/constants';
import { EXAM_TYPES } from '../features/subjects/lib/constants';
import { daysUntil, urgColor, formatDate } from '../shared/lib/utils';
import { TaskModal } from '../features/tasks/components/TaskModal';
import { GradePromptModal } from '../features/tasks/components/GradePromptModal';
import type { Task } from '../shared/types';

type Filter = 'all' | 'pending' | 'done' | `type-${string}`;

export function Tasks() {
  const tasks = useStore(state => state.tasks);
  const career = useStore(state => state.career);
  const subjects = career?.subjects || [];

  const [filter, setFilter] = useState<Filter>('all');
  const [editingTask, setEditingTask] = useState<Task | null | undefined>(undefined);
  const [gradeTask, setGradeTask] = useState<Task | null>(null);

  const ensureGradeForTask = async (t: Task) => {
    const subject = useStore.getState().career?.subjects.find(s => s.id === t.subjectId);
    if (!subject || !subject.activeId) return null;
    const grades = subject.grades || [];
    let grade = t.gradeId ? grades.find(g => g.id === t.gradeId) : undefined;
    if (grade) return { subjectId: subject.id, grade };

    const newGrade = { id: crypto.randomUUID(), type: inferGradeType(t), score: '' as const, date: t.dueDate || '' };
    await syncGrades(subject.id, [...grades, newGrade]);
    await saveTask({ ...t, gradeId: newGrade.id });
    return { subjectId: subject.id, grade: newGrade };
  };

  const handleToggle = async (t: Task) => {
    const newDone = !t.done;
    await saveTask({ ...t, done: newDone });
    if (newDone && t.subjectId) {
      const result = await ensureGradeForTask({ ...t, done: newDone });
      if (result && (result.grade.score === '' || result.grade.score === null)) {
        setGradeTask({ ...t, done: newDone, gradeId: result.grade.id });
      }
    }
  };

  const handleGradeBadgeClick = async (t: Task) => {
    const result = await ensureGradeForTask(t);
    if (result) setGradeTask({ ...t, gradeId: result.grade.id });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar tarea?')) return;
    try { await deleteTask(id); } catch (e: any) { alert('Error al eliminar: ' + (e?.message || e)); }
  };

  let filtered = [...tasks];
  if (filter === 'pending') filtered = filtered.filter(t => !t.done);
  else if (filter === 'done') filtered = filtered.filter(t => t.done);
  else if (filter.startsWith('type-')) filtered = filtered.filter(t => t.type === filter.slice(5));

  filtered.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  });

  const types = ['Tarea', 'Trabajo Práctico', 'Parcial', 'Final', 'Proyecto', 'Laboratorio'];

  return (
    <div className="view-content fade-in">
      <header className="view-header">
        <div>
          <h2 className="view-title">Tareas y Notas</h2>
          <p className="view-sub">Agenda de parciales, TP y entregas · {tasks.length} tarea{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditingTask(null)}><Plus size={16} /> Tarea</button>
      </header>

      <div className="filter-bar">
        <div className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Todas</div>
        <div className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pendientes</div>
        <div className={`filter-tab ${filter === 'done' ? 'active' : ''}`} onClick={() => setFilter('done')}>Hechas</div>
        {types.map(t => (
          <div key={t} className={`filter-tab ${filter === `type-${t}` ? 'active' : ''}`} onClick={() => setFilter(`type-${t}` as Filter)}>{t}</div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-st">
          <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', background: 'rgba(74,222,128,.15)', color: '#4ade80', marginBottom: '0.5rem' }}>
            <CheckCircle2 size={24} />
          </div>
          <div style={{ fontWeight: 700 }}>No hay tareas aquí</div>
        </div>
      ) : (
        <div id="tasks-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(t => {
            const sub = subjects.find(s => s.id === t.subjectId);
            const d = daysUntil(t.dueDate);
            const dt = d === null ? '—' : d < 0 ? 'Vencida' : d === 0 ? 'Hoy' : `${d}d`;

            const grade = sub?.grades?.find(g => g.id === t.gradeId);
            const hasScore = grade && grade.score !== '' && grade.score !== null;

            const isExam = EXAM_TYPES.has(t.type) || /parcial|final|examen/.test((t.type || '').toLowerCase());
            const isUrgentExam = !t.done && isExam && d !== null && d >= 0 && d <= 3;

            let cardStyle: React.CSSProperties = {};
            if (isUrgentExam) cardStyle = { background: 'rgba(249,115,22,.08)', border: '1px solid #f97316', boxShadow: '0 0 10px rgba(249,115,22,.2)' };

            return (
              <div key={t.id} className={`task-card ${t.done ? 'done' : ''}`} style={cardStyle}>
                <div className={`t-check ${t.done ? 'done' : ''}`} onClick={() => handleToggle(t)}>{t.done ? <Check size={12} /> : ''}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ padding: '2px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: TYPE_BG[t.type] || 'rgba(255,255,255,.08)', color: TYPE_FG[t.type] || 'var(--text2)' }}>{t.type}</span>
                      {!t.done && d !== null && !isUrgentExam && <span style={{ fontSize: '11px', fontWeight: 700, color: urgColor(d) }}>{dt}</span>}
                      {isUrgentExam && (
                        <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, background: 'rgba(249,115,22,.25)', color: '#ffedd5', border: '1px solid #f97316' }}>
                          ¡RINDES EN {d === 0 ? 'HOY' : d + 'D'}!
                        </span>
                      )}
                      {t.subjectId && sub?.activeId && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '10px', padding: '2px 8px', ...(hasScore ? { background: `${parseFloat(String(grade!.score)) >= 4 ? '#4ade80' : '#f87171'}1a`, color: parseFloat(String(grade!.score)) >= 4 ? '#4ade80' : '#f87171', border: `1px solid ${parseFloat(String(grade!.score)) >= 4 ? '#4ade80' : '#f87171'}30`, fontWeight: 800 } : {}) }}
                          onClick={(e) => { e.stopPropagation(); handleGradeBadgeClick(t); }}
                        >
                          {hasScore ? `Nota: ${grade!.score}` : 'Anotar nota'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '5px' }}>
                    {sub && <span className="badge" style={{ background: `${sub.color}18`, color: sub.color }}>{sub.name}</span>}
                    {t.dueDate && <span style={{ fontSize: '10px', color: 'var(--text2)' }}>{formatDate(t.dueDate)}</span>}
                    {t.notes && <span style={{ fontSize: '10px', color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }} title={t.notes}>{t.notes}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                  <button className="btn-xs" title="Editar" onClick={() => setEditingTask(t)}><Edit size={14} /></button>
                  <button className="btn-xs" title="Eliminar" style={{ color: '#f87171' }} onClick={() => handleDelete(t.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingTask !== undefined && <TaskModal task={editingTask || undefined} onClose={() => setEditingTask(undefined)} />}
      {gradeTask && <GradePromptModal task={gradeTask} onClose={() => setGradeTask(null)} />}
    </div>
  );
}
