import { useState } from 'react';
import { X } from 'lucide-react';
import type { Task } from '../../../shared/types';
import { useStore } from '../../../shared/store/useStore';
import { syncGrades } from '../../subjects/lib/api';

interface Props {
  task: Task;
  onClose: () => void;
}

export function GradePromptModal({ task, onClose }: Props) {
  const career = useStore((state) => state.career);
  const subject = career?.subjects.find((s) => s.id === task.subjectId);
  const grade = subject?.grades?.find((g) => g.id === task.gradeId);

  const [score, setScore] = useState(
    grade && grade.score !== '' && grade.score !== null ? String(grade.score) : '',
  );
  const [saving, setSaving] = useState(false);

  const v = parseFloat(score);
  const color = score === '' || isNaN(v) ? 'var(--text)' : v >= 4 ? '#4ade80' : '#f87171';

  const handleSave = async () => {
    if (!subject || !grade) {
      onClose();
      return;
    }
    const raw = score.trim();
    if (raw !== '') {
      const num = parseFloat(raw);
      if (isNaN(num) || num < 0 || num > 10) {
        alert('Nota inválida. Ingresá un número entre 0 y 10.');
        return;
      }
    }
    setSaving(true);
    try {
      const newScore: number | '' = raw === '' ? '' : parseFloat(raw);
      const newGrades = subject.grades!.map((g) =>
        g.id === grade.id ? { ...g, score: newScore } : g,
      );
      await syncGrades(subject.id, newGrades);
      onClose();
    } catch (e: any) {
      alert('Error al guardar la nota: ' + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  if (!subject || !grade) return null;

  return (
    <div className="modal-bd" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-box fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '90%', maxWidth: '360px' }}
      >
        <div className="m-header">
          <div className="modal-title">Anotar nota</div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="m-body">
          <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '10px' }}>
            {task.title}
          </div>
          <input
            autoFocus
            type="number"
            min={0}
            max={10}
            step={0.5}
            className="f-input"
            style={{ fontSize: '20px', fontWeight: 800, textAlign: 'center', color }}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
        <div className="m-footer">
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
