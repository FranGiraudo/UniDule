import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Task } from '../../../shared/types';
import { useStore } from '../../../shared/store/useStore';
import { saveTask } from '../lib/api';
import { TASK_TYPES } from '../lib/constants';

interface Props {
  task?: Task;
  onClose: () => void;
}

export function TaskModal({ task, onClose }: Props) {
  const subjects = useStore((state) => state.career?.subjects || []).filter((s) => s.activeId);

  const [title, setTitle] = useState(task?.title || '');
  const [type, setType] = useState(task?.type || 'Tarea');
  const [subjectId, setSubjectId] = useState(task?.subjectId || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [startTime, setStartTime] = useState(task?.startTime || '');
  const [endTime, setEndTime] = useState(task?.endTime || '');
  const [notes, setNotes] = useState(task?.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Debes ingresar un título para la tarea.');
      return;
    }
    setSaving(true);
    try {
      let finalGradeId = task?.gradeId ?? null;
      
      if (subjectId && (type === 'Parcial' || type === 'Final')) {
        const sub = useStore.getState().career?.subjects.find((s) => s.id === subjectId);
        if (sub && sub.activeId) {
          const grades = sub.grades || [];
          let grade = finalGradeId ? grades.find(g => g.id === finalGradeId) : null;
          
          if (!grade) {
            grade = {
              id: crypto.randomUUID(),
              type: title.trim(),
              score: '',
              date: dueDate || null,
            };
            const { syncGrades } = await import('../../subjects/lib/api');
            await syncGrades(sub.id, [...grades, grade]);
            finalGradeId = grade.id;
          } else {
            // Update existing grade's title/date
            const updatedGrades = grades.map(g => g.id === grade!.id ? { ...g, type: title.trim(), date: dueDate || null } : g);
            const { syncGrades } = await import('../../subjects/lib/api');
            await syncGrades(sub.id, updatedGrades);
          }
        }
      }

      await saveTask({
        id: task?.id || crypto.randomUUID(),
        title: title.trim(),
        subjectId: subjectId || null,
        type,
        dueDate: dueDate || null,
        startTime: startTime || null,
        endTime: endTime || null,
        notes: notes.trim(),
        gradeId: finalGradeId,
        done: task?.done || false,
      });
      onClose();
    } catch (e: any) {
      alert('Error al guardar la tarea en la nube: ' + (e?.message || e));
    } finally {
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
          <div className="modal-title">{task ? 'Editar Tarea' : 'Nueva Tarea'}</div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="m-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="f-label">Título *</label>
            <input
              className="f-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Entrega TP2"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="f-label">Tipo</label>
              <select className="f-input" value={type} onChange={(e) => setType(e.target.value)}>
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="f-label">Fecha límite</label>
              <input
                type="date"
                className="f-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="f-label">Hora inicio (opcional)</label>
              <input
                type="time"
                className="f-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Hora fin (opcional)</label>
              <input
                type="time"
                className="f-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="f-label">Materia (opcional)</label>
            <select
              className="f-input"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">— Ninguna —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="f-label">Notas</label>
            <textarea
              className="f-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="m-footer">
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              'Guardando...'
            ) : (
              <>
                <Save size={16} /> Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
