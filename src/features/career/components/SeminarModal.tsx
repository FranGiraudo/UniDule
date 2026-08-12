import { useState } from 'react';
import { saveSeminar } from '../lib/api';
import type { Seminar } from '../../../shared/types';
import { X, Save } from 'lucide-react';

interface Props {
  seminar?: Seminar;
  onClose: () => void;
}

export function SeminarModal({ seminar, onClose }: Props) {
  const [name, setName] = useState(seminar?.name || '');
  const [code, setCode] = useState(seminar?.code || '');
  const [hours, setHours] = useState(seminar?.hours ? seminar.hours.toString() : '');
  const [category, setCategory] = useState(seminar?.category || 'Seminario');
  const [status, setStatus] = useState(seminar?.status || 'pendiente');
  const [date, setDate] = useState(seminar?.date || '');
  const [notes, setNotes] = useState(seminar?.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return alert('Debes ingresar un nombre para el seminario.');
    setLoading(true);
    try {
      const newSeminar: Seminar = {
        id: seminar?.id || crypto.randomUUID(),
        name: name.trim(),
        code: code.trim(),
        hours: parseInt(hours) || 0,
        category: category.trim() || 'Seminario',
        status,
        date: date || null,
        notes: notes.trim() || null,
      };
      await saveSeminar(newSeminar);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Error al guardar el seminario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-bd" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-box modal-sm fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '90%' }}
      >
        <div className="m-header">
          <div>
            <div className="modal-title" style={{ fontSize: '1.15rem' }}>
              {seminar ? 'Editar Seminario' : 'Nuevo Seminario'}
            </div>
            <div className="modal-subtitle" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
              Cursos y seminarios extracurriculares
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="m-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="f-label">Nombre del seminario / curso *</label>
            <input
              type="text"
              className="f-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Curso de React Avanzado"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="f-label">Código (Opcional)</label>
              <input
                type="text"
                className="f-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej: CS-101"
              />
            </div>
            <div>
              <label className="f-label">Horas / Créditos</label>
              <input
                type="number"
                className="f-input"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Ej: 40"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="f-label">Categoría</label>
            <input
              type="text"
              className="f-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ej: Seminario, Certificación..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="f-label">Estado</label>
              <select
                className="f-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="cursando">En Cursado</option>
                <option value="aprobada">Aprobado / Hecho</option>
              </select>
            </div>
            <div>
              <label className="f-label">Fecha de acreditación</label>
              <input
                type="date"
                className="f-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="f-label">Notas u observaciones</label>
            <textarea
              className="f-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Resolución, detalles..."
            />
          </div>
        </div>

        <div className="m-footer">
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              'Guardando...'
            ) : (
              <>
                <Save size={16} /> Guardar Seminario
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
