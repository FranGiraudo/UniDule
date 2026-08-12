import { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import type { Note } from '../../../shared/types';
import { useStore } from '../../../shared/store/useStore';
import { saveNote, deleteNote } from '../lib/api';

interface Props {
  note?: Note;
  onClose: () => void;
}

const todayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export function NoteModal({ note, onClose }: Props) {
  const subjects = useStore(state => state.career?.subjects || []);
  const trackedSubjects = subjects.filter(s => s.activeId);

  const [subjectId, setSubjectId] = useState(note?.subject_id || trackedSubjects[0]?.id || '');
  const [title, setTitle] = useState(note?.title || '');
  const [date, setDate] = useState(note?.note_date || todayStr());
  const [content, setContent] = useState(note?.content || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !subjectId || !date) { alert('Faltan campos obligatorios'); return; }
    setSaving(true);
    try {
      await saveNote({
        id: note?.id || crypto.randomUUID(),
        subject_id: subjectId,
        title: title.trim(),
        note_date: date,
        content: content.trim(),
      });
      onClose();
    } catch (e: any) {
      alert('Error al guardar la nota: ' + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !confirm('¿Eliminar nota?')) return;
    setSaving(true);
    try {
      await deleteNote(note.id);
      onClose();
    } catch (e: any) {
      alert('Error al eliminar la nota: ' + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-bd" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-box fade-in" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '480px' }}>
        <div className="m-header">
          <div className="modal-title">{note ? 'Editar Nota' : 'Nueva Nota'}</div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="m-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="f-label">Materia</label>
            <select className="f-input" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
              {trackedSubjects.length === 0 && <option value="">— Sin materias —</option>}
              {trackedSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label className="f-label">Título *</label>
              <input className="f-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Resumen Unidad 3" />
            </div>
            <div>
              <label className="f-label">Fecha</label>
              <input type="date" className="f-input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="f-label">Contenido (admite **negrita**, *cursiva*, `código`, listas con -)</label>
            <textarea className="f-input" rows={8} value={content} onChange={e => setContent(e.target.value)} placeholder="Escribí tu nota acá..." />
          </div>
        </div>

        <div className="m-footer" style={{ display: 'flex', gap: '8px' }}>
          {note && (
            <button className="btn btn-ghost" style={{ color: '#f87171', borderColor: 'rgba(239,68,68,.2)' }} onClick={handleDelete} disabled={saving}>
              <Trash2 size={16} /> Eliminar
            </button>
          )}
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : <><Save size={16} /> Guardar Nota</>}
          </button>
        </div>
      </div>
    </div>
  );
}
