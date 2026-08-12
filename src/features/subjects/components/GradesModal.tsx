import { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';
import type { Grade, Subject } from '../../../shared/types';
import { useStore } from '../../../shared/store/useStore';
import { saveActiveSubject, syncGrades } from '../lib/api';
import { updateSubjectProgress } from '../../career/lib/api';
import { saveTask, deleteTask } from '../../tasks/lib/api';
import { GRADE_TYPES, EXAM_TYPES } from '../lib/constants';

interface Props {
  subject: Subject;
  onClose: () => void;
}

export function GradesModal({ subject, onClose }: Props) {
  const tasks = useStore(state => state.tasks);
  const [grades, setGrades] = useState<Grade[]>((subject.grades || []).map(g => ({ ...g })));
  const [status, setStatus] = useState<string>(subject.status || 'cursando');
  const [allowsPromotion, setAllowsPromotion] = useState(!!subject.allowsPromotion);
  const [saving, setSaving] = useState(false);

  const addGrade = () => setGrades([...grades, { id: crypto.randomUUID(), type: 'Parcial 1', score: '', date: '' }]);
  const rmGrade = (i: number) => setGrades(grades.filter((_, idx) => idx !== i));
  const updGrade = (i: number, field: keyof Grade, value: string) =>
    setGrades(grades.map((g, idx) => (idx === i ? { ...g, [field]: field === 'score' ? (value === '' ? '' : parseFloat(value)) : value } : g)));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveActiveSubject({
        id: subject.id,
        name: subject.name,
        color: subject.color || '#6366f1',
        professor: subject.professor,
        room: subject.room,
        email: subject.email,
        maxAbsences: subject.maxAbsences,
        absences: subject.absences,
        status,
        allowsPromotion,
        schedules: subject.schedules,
      });
      await syncGrades(subject.id, grades);
      await updateSubjectProgress(subject.id, 'subject', status, subject.grade ?? null, subject.regDate ?? null, subject.expDate ?? null);

      // Keep a pending task in sync for every ungraded evaluation
      for (const g of grades) {
        if (g.score !== '' && g.score !== null) continue;
        const existing = tasks.find(t => t.gradeId === g.id);
        if (!existing) {
          await saveTask({
            id: crypto.randomUUID(),
            title: `${g.type} — ${subject.name}`,
            type: EXAM_TYPES.has(g.type) ? g.type : 'Tarea',
            subjectId: subject.id,
            gradeId: g.id,
            dueDate: g.date || null,
            notes: '',
            done: false,
          });
        } else if (existing.dueDate !== (g.date || null)) {
          await saveTask({ ...existing, dueDate: g.date || null });
        }
      }
      const keepIds = new Set(grades.map(g => g.id));
      for (const t of tasks) {
        if (t.gradeId && !keepIds.has(t.gradeId)) await deleteTask(t.id);
      }

      onClose();
    } catch (e: any) {
      alert('Error al guardar las notas: ' + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-bd" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-box fade-in" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '480px' }}>
        <div className="m-header">
          <div className="modal-title">Calificaciones — {subject.name}</div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="m-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="f-label">Estado</label>
              <select className="f-input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="cursando">Cursando</option>
                <option value="regular">Regular</option>
                <option value="aprobada">Aprobada</option>
                <option value="promocionado">Promocionada</option>
                <option value="libre">Libre</option>
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '20px' }}>
              <input type="checkbox" checked={allowsPromotion} onChange={e => setAllowsPromotion(e.target.checked)} />
              Habilita promoción
            </label>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="f-label" style={{ margin: 0 }}>Evaluaciones</label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addGrade}><Plus size={14} /> Agregar</button>
            </div>
            {grades.length === 0 && (
              <div style={{ fontSize: '11px', color: 'var(--text2)', padding: '10px 0', textAlign: 'center' }}>
                Sin evaluaciones — hacé clic en "+ Agregar"
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {grades.map((g, i) => {
                const sc = g.score !== '' && g.score !== null ? parseFloat(String(g.score)) : null;
                const scoreColor = sc !== null ? (sc >= 4 ? '#4ade80' : '#f87171') : 'var(--text)';
                return (
                  <div key={g.id} className="grade-row">
                    <select className="f-input" style={{ fontSize: '12px' }} value={g.type} onChange={e => updGrade(i, 'type', e.target.value)}>
                      {GRADE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      {!GRADE_TYPES.includes(g.type) && <option value={g.type}>{g.type}</option>}
                    </select>
                    <input
                      type="number" min={0} max={10} step={0.5} placeholder="—"
                      className="f-input" style={{ fontSize: '14px', fontWeight: 800, textAlign: 'center', color: scoreColor }}
                      value={sc !== null ? sc : ''}
                      onChange={e => updGrade(i, 'score', e.target.value)}
                    />
                    <input type="date" className="f-input" style={{ fontSize: '12px' }} value={g.date || ''} onChange={e => updGrade(i, 'date', e.target.value)} />
                    <div className="slot-rm" onClick={() => rmGrade(i)}>✕</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="m-footer">
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : <><Save size={16} /> Guardar Notas</>}
          </button>
        </div>
      </div>
    </div>
  );
}
