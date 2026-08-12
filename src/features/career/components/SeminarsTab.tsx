import { useState } from 'react';
import { useStore } from '../../../shared/store/useStore';
import { SeminarModal } from './SeminarModal';
import type { Seminar } from '../../../shared/types';
import { Plus, GraduationCap } from 'lucide-react';

export function SeminarsTab() {
  const { career } = useStore();
  const seminars = career?.seminars || [];

  const [selectedSeminar, setSelectedSeminar] = useState<Seminar | null | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openNewModal = () => {
    setSelectedSeminar(null);
    setIsModalOpen(true);
  };

  const openEditModal = (s: Seminar) => {
    setSelectedSeminar(s);
    setIsModalOpen(true);
  };

  const totalHours = seminars
    .filter((s) => s.status === 'aprobada')
    .reduce((sum, s) => sum + (s.hours || 0), 0);

  return (
    <div className="fade-in">
      <div
        style={{
          marginBottom: '1rem',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>
            Seminarios y Cursos
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: '0.15rem' }}>
            Registro de actividades extracurriculares
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text)' }}>
            <span style={{ color: 'var(--primary)' }}>{totalHours}</span> hrs acreditadas
          </div>
          <button className="btn btn-primary btn-sm" onClick={openNewModal}>
            <Plus size={16} /> Añadir
          </button>
        </div>
      </div>

      {!seminars.length ? (
        <div
          className="empty-st"
          style={{
            background: 'var(--card)',
            borderRadius: '0.75rem',
            border: '1px solid var(--border)',
            padding: '3rem 1rem',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: '1rem',
              borderRadius: '50%',
              background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
              color: 'var(--primary)',
              marginBottom: '1rem',
            }}
          >
            <GraduationCap size={32} />
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text)',
              marginBottom: '0.5rem',
            }}
          >
            Sin seminarios registrados
          </div>
          <div
            style={{ fontSize: '0.9375rem', maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}
          >
            Añadí tus cursos, certificaciones y seminarios extracurriculares para llevar un registro
            de tus horas de acreditación.
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {seminars.map((s) => {
            const isApproved = s.status === 'aprobada';
            return (
              <div
                key={s.id}
                onClick={() => openEditModal(s)}
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: 'var(--text)',
                      lineHeight: 1.2,
                    }}
                  >
                    {s.name}
                  </div>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.25rem',
                      background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                      color: 'var(--primary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.hours} hs
                  </span>
                </div>

                <div style={{ fontSize: '0.6875rem', color: 'var(--text2)' }}>
                  {s.code && <span>Código: {s.code} · </span>}
                  <span>{s.category}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    marginTop: '0.25rem',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.375rem',
                      background: isApproved ? 'rgba(74,222,128,.15)' : 'rgba(251,191,36,.15)',
                      color: isApproved ? '#4ade80' : '#fbbf24',
                    }}
                  >
                    {isApproved ? 'Aprobado' : s.status === 'cursando' ? 'En Cursado' : 'Pendiente'}
                  </span>
                  {s.date && (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text2)', fontWeight: 600 }}>
                      {new Date(s.date.replace(/-/g, '/')).toLocaleDateString('es-AR')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <SeminarModal
          seminar={selectedSeminar || undefined}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
