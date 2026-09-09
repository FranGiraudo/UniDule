import { useState } from 'react';
import { Plus, Edit, Trash2, CalendarCheck } from 'lucide-react';
import { useStore } from '../shared/store/useStore';
import { deleteUserEvent } from '../features/events/lib/api';
import { EventModal } from '../features/events/components/EventModal';
import { ConfirmModal } from '../shared/components/ui/ConfirmModal';
import { formatDate } from '../shared/lib/utils';
import type { UserEvent } from '../shared/types';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function Events() {
  const events = useStore((state) => state.userEvents);
  const [filter, setFilter] = useState<string>('all');
  const [editingEvent, setEditingEvent] = useState<UserEvent | null | undefined>(undefined);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteUserEvent(id);
      setDeletingEventId(null);
    } catch (e: any) {
      alert('Error al eliminar: ' + (e?.message || e));
    }
  };

  let filtered = [...events];
  if (filter === 'recurring') filtered = filtered.filter((e) => e.isRecurring);
  else if (filter === 'onetime') filtered = filtered.filter((e) => !e.isRecurring);
  else if (filter !== 'all') filtered = filtered.filter((e) => e.category === filter);

  filtered.sort((a, b) => {
    if (a.isRecurring !== b.isRecurring) return a.isRecurring ? -1 : 1;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="view-content fade-in">
      <header className="view-header">
        <div>
          <h2 className="view-title">Actividades</h2>
          <p className="view-sub">
            Agenda externa (Trabajo, Gimnasio, etc.) · {events.length} actividad{events.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditingEvent(null)}>
          <Plus size={16} /> Actividad
        </button>
      </header>

      <div className="filter-bar">
        <div
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas
        </div>
        <div
          className={`filter-tab ${filter === 'recurring' ? 'active' : ''}`}
          onClick={() => setFilter('recurring')}
        >
          Semanales
        </div>
        <div
          className={`filter-tab ${filter === 'onetime' ? 'active' : ''}`}
          onClick={() => setFilter('onetime')}
        >
          Puntuales
        </div>
        <div
          className={`filter-tab ${filter === 'estudio' ? 'active' : ''}`}
          onClick={() => setFilter('estudio')}
        >
          Estudio
        </div>
        <div
          className={`filter-tab ${filter === 'trabajo' ? 'active' : ''}`}
          onClick={() => setFilter('trabajo')}
        >
          Trabajo
        </div>
        <div
          className={`filter-tab ${filter === 'gimnasio' ? 'active' : ''}`}
          onClick={() => setFilter('gimnasio')}
        >
          Gimnasio
        </div>
        <div
          className={`filter-tab ${filter === 'otro' ? 'active' : ''}`}
          onClick={() => setFilter('otro')}
        >
          Otro
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-st">
          <div
            style={{
              display: 'inline-flex',
              padding: '0.75rem',
              borderRadius: '50%',
              background: 'rgba(99,102,241,.15)',
              color: 'var(--primary)',
              marginBottom: '0.5rem',
            }}
          >
            <CalendarCheck size={24} />
          </div>
          <div style={{ fontWeight: 700 }}>No hay actividades registradas</div>
          <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '4px' }}>
            {events.length === 0 ? 'Agregá actividades fuera de la facu para verlas en tus horarios' : 'No hay actividades con estos filtros'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((e) => {
            const color = e.color || 'var(--primary)';
            return (
              <div
                key={e.id}
                className="task-card"
                style={{
                  background: `color-mix(in srgb, ${color} 5%, var(--card))`,
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{e.title}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 700,
                        background: `color-mix(in srgb, ${color} 15%, transparent)`,
                        color: color,
                        textTransform: 'capitalize'
                      }}
                    >
                      {e.category}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text2)' }}>
                      {e.startTime} - {e.endTime}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 600 }}>
                      {e.isRecurring 
                        ? `Todos los ${DAYS[e.dayOfWeek === 7 ? 0 : (e.dayOfWeek || 1)]}`
                        : (e.date ? formatDate(e.date) : '')}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                  <button className="btn-xs" title="Editar" onClick={() => setEditingEvent(e)}>
                    <Edit size={14} />
                  </button>
                  <button
                    className="btn-xs"
                    title="Eliminar"
                    style={{ color: '#f87171' }}
                    onClick={() => setDeletingEventId(e.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingEvent !== undefined && (
        <EventModal event={editingEvent || undefined} onClose={() => setEditingEvent(undefined)} />
      )}

      {deletingEventId && (
        <ConfirmModal 
          title="Eliminar Actividad"
          message="¿Estás seguro de que deseas eliminar esta actividad? Desaparecerá también de la agenda semanal."
          onConfirm={() => handleDelete(deletingEventId)}
          onCancel={() => setDeletingEventId(null)}
        />
      )}
    </div>
  );
}
