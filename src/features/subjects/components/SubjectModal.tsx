import { useState } from 'react';
import { X, Save, Plus } from 'lucide-react';
import type { Subject, ScheduleEvent } from '../../../shared/types';
import { useStore } from '../../../shared/store/useStore';
import { getComputedStatus } from '../../career/lib/utils';
import { saveActiveSubject } from '../lib/api';
import { COLORS, SLOT_TYPES, DAYS } from '../lib/constants';

interface Props {
  subject?: Subject; // present when editing an already-tracked subject
  onClose: () => void;
}

type Slot = { id: string; day: string; startTime: string; endTime: string; type: string };

const toSlots = (schedules?: ScheduleEvent[]): Slot[] =>
  (schedules || []).map((s) => ({
    id: s.id || crypto.randomUUID(),
    day: String(s.day),
    startTime: s.startTime,
    endTime: s.endTime,
    type: s.type,
  }));

export function SubjectModal({ subject, onClose }: Props) {
  const career = useStore((state) => state.career);
  const isEdit = !!subject;
  const allSubjects = career?.subjects || [];

  const availableSubjects = allSubjects
    .filter((s) =>
      isEdit ? s.id === subject!.id : getComputedStatus(s, allSubjects) === 'disponible',
    )
    .sort(
      (a, b) =>
        a.year - b.year || (a.period || 0) - (b.period || 0) || a.name.localeCompare(b.name),
    );

  const [selectedId, setSelectedId] = useState(subject?.id || availableSubjects[0]?.id || '');
  const selected = allSubjects.find((s) => s.id === selectedId);

  const [color, setColor] = useState(
    subject?.color && subject.color !== '#D8D2BE' ? subject.color : '#6366f1',
  );
  const [professor, setProfessor] = useState(subject?.professor || '');
  const [room, setRoom] = useState(subject?.room || '');
  const [email, setEmail] = useState(subject?.email || '');
  const [maxAbsences, setMaxAbsences] = useState(subject?.maxAbsences ?? 6);
  const [status, setStatus] = useState<string>(subject?.status || 'cursando');
  const [slots, setSlots] = useState<Slot[]>(toSlots(subject?.schedules));
  const [saving, setSaving] = useState(false);

  const addSlot = () =>
    setSlots([
      ...slots,
      {
        id: crypto.randomUUID(),
        day: 'Lunes',
        startTime: '08:00',
        endTime: '10:00',
        type: 'Teórico',
      },
    ]);
  const rmSlot = (i: number) => setSlots(slots.filter((_, idx) => idx !== i));
  const updSlot = (i: number, field: keyof Slot, value: string) =>
    setSlots(slots.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const handleSave = async () => {
    if (!selected) {
      alert('Debes seleccionar una materia disponible del plan.');
      return;
    }
    setSaving(true);
    try {
      await saveActiveSubject({
        id: selected.id,
        name: selected.name,
        color,
        professor: professor.trim(),
        room: room.trim(),
        email: email.trim(),
        maxAbsences,
        status,
        allowsPromotion: subject?.allowsPromotion,
        schedules: slots.map((s) => ({
          id: s.id,
          subject_id: selected.id,
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          type: s.type,
        })),
      });
      onClose();
    } catch (e: any) {
      alert('Error al guardar en la nube: ' + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-bd" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-box fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '90%', maxWidth: '520px' }}
      >
        <div className="m-header">
          <div className="modal-title">{isEdit ? 'Editar Materia' : 'Nueva Materia'}</div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div
          className="m-body"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxHeight: '70vh',
            overflowY: 'auto',
          }}
        >
          <div>
            <label className="f-label">Materia del plan *</label>
            <select
              className="f-input"
              value={selectedId}
              disabled={isEdit}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {availableSubjects.length === 0 && (
                <option value="">— Sin materias disponibles —</option>
              )}
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.year}° Año {s.period}° Sem — {s.name} ({s.code || s.id})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="f-label">Profesor/a</label>
              <input
                className="f-input"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Aula</label>
              <input className="f-input" value={room} onChange={(e) => setRoom(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="f-label">Email de contacto</label>
            <input
              className="f-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="f-label">Máx. inasistencias</label>
              <input
                className="f-input"
                type="number"
                min={0}
                value={maxAbsences}
                onChange={(e) => setMaxAbsences(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="f-label">Estado</label>
              <select
                className="f-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="cursando">Cursando</option>
                <option value="regular">Regular</option>
                <option value="aprobada">Aprobada</option>
                <option value="promocionado">Promocionada</option>
                <option value="libre">Libre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="f-label">Color</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
              {COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-dot ${c === color ? 'sel' : ''}`}
                  style={{ background: c }}
                  title={c}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
            <input
              className="color-custom-input"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
              }}
            >
              <label className="f-label" style={{ margin: 0 }}>
                Horarios
              </label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addSlot}>
                <Plus size={14} /> Horario
              </button>
            </div>
            {slots.length === 0 && (
              <div style={{ fontSize: '11px', color: 'var(--text2)', padding: '6px 0' }}>
                Sin horarios — hacé clic en "+ Horario"
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {slots.map((sl, i) => (
                <div key={sl.id} className="slot-row">
                  <select
                    className="f-input"
                    style={{ fontSize: '12px' }}
                    value={sl.day}
                    onChange={(e) => updSlot(i, 'day', e.target.value)}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    className="f-input"
                    style={{ fontSize: '12px' }}
                    value={sl.startTime}
                    onChange={(e) => updSlot(i, 'startTime', e.target.value)}
                  />
                  <input
                    type="time"
                    className="f-input"
                    style={{ fontSize: '12px' }}
                    value={sl.endTime}
                    onChange={(e) => updSlot(i, 'endTime', e.target.value)}
                  />
                  <select
                    className="f-input"
                    style={{ fontSize: '12px' }}
                    value={sl.type}
                    onChange={(e) => updSlot(i, 'type', e.target.value)}
                  >
                    {SLOT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <div className="slot-rm" onClick={() => rmSlot(i)}>
                    ✕
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="m-footer">
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleSave}
            disabled={saving || !selected}
          >
            {saving ? (
              'Guardando...'
            ) : (
              <>
                <Save size={16} /> Guardar Materia
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
