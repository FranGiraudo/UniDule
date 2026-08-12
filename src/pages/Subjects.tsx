import { useState } from 'react';
import { Plus, Edit, Trash2, BarChart3, BookOpen, Search } from 'lucide-react';
import { useStore } from '../shared/store/useStore';
import { deleteActiveSubject } from '../features/subjects/lib/api';
import { ACTIVE_STATUS } from '../features/subjects/lib/constants';
import { parseMd } from '../features/subjects/lib/utils';
import { SubjectModal } from '../features/subjects/components/SubjectModal';
import { GradesModal } from '../features/subjects/components/GradesModal';
import { NoteModal } from '../features/subjects/components/NoteModal';
import type { Subject, Note } from '../shared/types';

export function Subjects() {
  const career = useStore((state) => state.career);
  const notes = useStore((state) => state.notes);
  const allSubjects = career?.subjects || [];
  const trackedSubjects = allSubjects.filter((s) => s.activeId);

  const [tab, setTab] = useState<'materias' | 'notas'>('materias');
  const [editingSubject, setEditingSubject] = useState<Subject | null | undefined>(undefined);
  const [gradesSubject, setGradesSubject] = useState<Subject | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null | undefined>(undefined);
  const [noteQuery, setNoteQuery] = useState('');

  const handleDelete = async (s: Subject) => {
    if (!s.activeId) return;
    if (!confirm(`¿Eliminar "${s.name}" de tus materias en curso?`)) return;
    try {
      await deleteActiveSubject(s.activeId);
    } catch (e: any) {
      alert('Error al eliminar: ' + (e?.message || e));
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (!noteQuery) return true;
    const q = noteQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q);
  });

  return (
    <div className="view-content fade-in">
      <header className="view-header">
        <div>
          <h2 className="view-title">Materias</h2>
          <p className="view-sub">Gestión de cursadas y calificaciones</p>
        </div>
        {tab === 'materias' ? (
          <button className="btn btn-primary" onClick={() => setEditingSubject(null)}>
            <Plus size={16} /> Materia
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setEditingNote(null)}>
            <Plus size={16} /> Nota
          </button>
        )}
      </header>

      <div className="filter-bar">
        <div
          className={`filter-tab ${tab === 'materias' ? 'active' : ''}`}
          onClick={() => setTab('materias')}
        >
          Mis Materias {trackedSubjects.length > 0 && `(${trackedSubjects.length})`}
        </div>
        <div
          className={`filter-tab ${tab === 'notas' ? 'active' : ''}`}
          onClick={() => setTab('notas')}
        >
          Mis Notas {notes.length > 0 && `(${notes.length})`}
        </div>
      </div>

      {tab === 'materias' ? (
        trackedSubjects.length === 0 ? (
          <div className="empty-st">
            <div
              style={{
                display: 'inline-flex',
                padding: '0.75rem',
                borderRadius: '50%',
                background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                color: 'var(--primary)',
                marginBottom: '0.5rem',
              }}
            >
              <BookOpen size={24} />
            </div>
            <div style={{ fontWeight: 700 }}>No hay materias todavía</div>
          </div>
        ) : (
          <div className="subjects-grid">
            {trackedSubjects.map((s) => {
              const pct = (s.absences || 0) / (s.maxAbsences || 6);
              const bc = pct >= 1 ? '#ef4444' : pct >= 0.75 ? '#f97316' : '#22c55e';
              const st = ACTIVE_STATUS[s.status || 'cursando'] || ACTIVE_STATUS.cursando;
              const gradeItems = (s.grades || []).slice(-4);

              return (
                <div key={s.id} className="sub-card">
                  <div className="sub-card-accent" style={{ background: s.color }}></div>
                  <div className="sub-card-body">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '8px',
                        marginBottom: '10px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '15px',
                            fontWeight: 800,
                            lineHeight: 1.2,
                            marginBottom: '5px',
                          }}
                        >
                          {s.name}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: '5px',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                          }}
                        >
                          {s.code && (
                            <span
                              style={{
                                padding: '2px 7px',
                                borderRadius: '5px',
                                fontSize: '10px',
                                fontWeight: 700,
                                background: `${s.color}18`,
                                color: s.color,
                              }}
                            >
                              Cód. {s.code}
                            </span>
                          )}
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '5px',
                              fontSize: '10px',
                              fontWeight: 700,
                              background: st.bg,
                              color: st.color,
                            }}
                          >
                            {st.label}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          className="btn-xs"
                          title="Calificaciones"
                          onClick={() => setGradesSubject(s)}
                        >
                          <BarChart3 size={14} />
                        </button>
                        <button
                          className="btn-xs"
                          title="Editar"
                          onClick={() => setEditingSubject(s)}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn-xs"
                          title="Eliminar"
                          style={{ color: '#f87171' }}
                          onClick={() => handleDelete(s)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {gradeItems.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px',
                          marginBottom: '10px',
                        }}
                      >
                        {gradeItems.map((g) => {
                          const gsc =
                            g.score !== '' && g.score !== null ? parseFloat(String(g.score)) : null;
                          const gc =
                            gsc !== null ? (gsc >= 4 ? '#4ade80' : '#f87171') : 'var(--text2)';
                          return (
                            <span
                              key={g.id}
                              style={{
                                fontSize: '10px',
                                padding: '2px 8px',
                                borderRadius: '5px',
                                background: `${gc}1a`,
                                color: gc,
                                border: `1px solid ${gc}30`,
                                fontWeight: 700,
                              }}
                            >
                              {g.type}: {gsc !== null ? gsc : '—'}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        marginBottom: '12px',
                      }}
                    >
                      <div>
                        <span style={{ opacity: 0.6 }}>Prof:</span> {s.professor || '—'}
                      </div>
                      <div>
                        <span style={{ opacity: 0.6 }}>Aula:</span> {s.room || '—'}
                      </div>
                      {s.email && (
                        <div>
                          <span style={{ opacity: 0.6 }}>Email:</span>{' '}
                          <a href={`mailto:${s.email}`} style={{ color: 'var(--primary)' }}>
                            {s.email}
                          </a>
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '5px',
                        marginBottom: '12px',
                      }}
                    >
                      {s.schedules && s.schedules.length > 0 ? (
                        s.schedules.map((sc, i) => (
                          <div key={i} className="sched-chip">
                            <span style={{ color: s.color, fontSize: '9px' }}>●</span>{' '}
                            {String(sc.day).slice(0, 3)} {sc.startTime}–{sc.endTime}{' '}
                            <span style={{ opacity: 0.6 }}>{sc.type}</span>
                          </div>
                        ))
                      ) : (
                        <span
                          style={{ fontSize: '11px', color: 'var(--text2)', fontStyle: 'italic' }}
                        >
                          Sin horario asignado
                        </span>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '5px',
                        }}
                      >
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text2)' }}>
                          ASISTENCIA
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: bc }}>
                          {s.absences || 0}/{s.maxAbsences || 6}
                        </span>
                      </div>
                      <div className="abs-bar-bg">
                        <div
                          className="abs-bar-fill"
                          style={{ width: `${Math.min(100, pct * 100)}%`, background: bc }}
                        ></div>
                      </div>
                      {pct >= 0.75 && (
                        <div
                          style={{ marginTop: '5px', fontSize: '10px', fontWeight: 700, color: bc }}
                        >
                          {pct >= 1 ? 'LÍMITE ALCANZADO' : 'Cerca del límite'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <>
          <div style={{ marginBottom: '14px', position: 'relative', maxWidth: '360px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text2)',
              }}
            />
            <input
              className="f-input"
              style={{ paddingLeft: '32px' }}
              placeholder="Buscar notas..."
              value={noteQuery}
              onChange={(e) => setNoteQuery(e.target.value)}
            />
          </div>
          {filteredNotes.length === 0 ? (
            <div className="empty-st">
              <div
                style={{
                  display: 'inline-flex',
                  padding: '0.75rem',
                  borderRadius: '50%',
                  background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                  color: 'var(--primary)',
                  marginBottom: '0.5rem',
                }}
              >
                <BookOpen size={24} />
              </div>
              <div style={{ fontWeight: 700 }}>No hay notas guardadas</div>
            </div>
          ) : (
            <div className="subjects-grid">
              {filteredNotes.map((n) => {
                const sub = allSubjects.find((s) => s.id === n.subject_id);
                return (
                  <div
                    key={n.id}
                    className="sub-card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setEditingNote(n)}
                  >
                    <div
                      className="sub-card-accent"
                      style={{ background: sub?.color || 'var(--primary)' }}
                    ></div>
                    <div
                      className="sub-card-body"
                      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                    >
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: sub?.color || 'var(--primary)',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {sub?.name || 'Materia desconocida'}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '8px',
                        }}
                      >
                        <div style={{ fontSize: '15px', fontWeight: 800, lineHeight: 1.2 }}>
                          {n.title}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--text2)',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            marginLeft: '8px',
                          }}
                        >
                          {n.note_date}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: 'var(--text2)',
                          lineHeight: 1.5,
                          flex: 1,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                        dangerouslySetInnerHTML={{ __html: parseMd(n.content) }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {editingSubject !== undefined && (
        <SubjectModal
          subject={editingSubject || undefined}
          onClose={() => setEditingSubject(undefined)}
        />
      )}
      {gradesSubject && (
        <GradesModal subject={gradesSubject} onClose={() => setGradesSubject(null)} />
      )}
      {editingNote !== undefined && (
        <NoteModal note={editingNote || undefined} onClose={() => setEditingNote(undefined)} />
      )}
    </div>
  );
}
