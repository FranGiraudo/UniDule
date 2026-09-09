import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { saveUserEvent, saveUserEvents } from '../lib/api';
import type { UserEvent, EventCategory } from '../../../shared/types';

interface Props {
  event?: UserEvent;
  onClose: () => void;
}

const CATEGORIES: { value: EventCategory; label: string; defaultColor: string }[] = [
  { value: 'estudio', label: 'Estudio', defaultColor: '#3b82f6' },
  { value: 'trabajo', label: 'Trabajo', defaultColor: '#eab308' },
  { value: 'gimnasio', label: 'Gimnasio', defaultColor: '#ef4444' },
  { value: 'otro', label: 'Otro', defaultColor: '#a855f7' },
];

const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

const BULK_OPTIONS = [
  { value: 100, label: 'Lunes a Viernes' },
  { value: 200, label: 'Fines de semana (Sáb y Dom)' },
  { value: 300, label: 'Todos los días' },
];

export function EventModal({ event, onClose }: Props) {
  const [title, setTitle] = useState(event?.title || '');
  const [category, setCategory] = useState<EventCategory>(event?.category || 'estudio');
  const [startTime, setStartTime] = useState(event?.startTime || '12:00');
  const [endTime, setEndTime] = useState(event?.endTime || '13:00');
  const [isRecurring, setIsRecurring] = useState(event?.isRecurring ?? true);
  const [date, setDate] = useState(event?.date || '');
  const [dayOfWeek, setDayOfWeek] = useState(event?.dayOfWeek || 1);
  const [color, setColor] = useState(event?.color || CATEGORIES[0].defaultColor);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!event) {
      const cat = CATEGORIES.find((c) => c.value === category);
      if (cat) setColor(cat.defaultColor);
    }
  }, [category, event]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert('Ingresá un título');
    
    setSaving(true);
    try {
      if (isRecurring && dayOfWeek >= 100 && !event) {
        let daysToCreate: number[] = [];
        if (dayOfWeek === 100) daysToCreate = [1, 2, 3, 4, 5];
        else if (dayOfWeek === 200) daysToCreate = [6, 7];
        else if (dayOfWeek === 300) daysToCreate = [1, 2, 3, 4, 5, 6, 7];

        const eventsToCreate: UserEvent[] = daysToCreate.map((d) => ({
          id: crypto.randomUUID(),
          title,
          category,
          startTime,
          endTime,
          isRecurring: true,
          dayOfWeek: d,
          color,
        }));
        await saveUserEvents(eventsToCreate);
      } else {
        await saveUserEvent({
          id: event?.id || crypto.randomUUID(),
          title,
          category,
          startTime,
          endTime,
          isRecurring,
          date: isRecurring ? null : date,
          dayOfWeek: isRecurring ? dayOfWeek : null,
          color,
        });
      }
      onClose();
    } catch (err: any) {
      alert('Error al guardar: ' + err.message);
      setSaving(false);
    }
  };

  return (
    <div className="modal-bd" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-box fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '90%', maxWidth: '460px' }}
      >
        <div className="m-header">
          <div className="modal-title">{event ? 'Editar Actividad' : 'Nueva Actividad'}</div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="m-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label className="f-label">Título *</label>
              <input
                type="text"
                className="f-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Clase de Inglés"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="f-label">Categoría</label>
                <select
                  className="f-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="f-label">Color Personalizado</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '38px' }}>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: 'transparent'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: 'var(--text2)' }}>Click para cambiar</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="f-label">Hora Inicio *</label>
                <input
                  type="time"
                  className="f-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="f-label">Hora Fin *</label>
                <input
                  type="time"
                  className="f-input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="toggle-row" onClick={() => setIsRecurring(!isRecurring)} style={{ margin: '8px 0' }}>
              <div className="toggle-label">Actividad Semanal Recurrente</div>
              <div className={`toggle-switch ${isRecurring ? 'on' : ''}`}></div>
            </div>

            {isRecurring ? (
              <div>
                <label className="f-label">Día de la Semana</label>
                <select
                  className="f-input"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                >
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                  {!event && (
                    <optgroup label="Opciones Múltiples">
                      {BULK_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            ) : (
              <div>
                <label className="f-label">Fecha *</label>
                <input
                  type="date"
                  className="f-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required={!isRecurring}
                />
              </div>
            )}
          </div>

          <div className="m-footer">
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
