import { X, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../../../shared/store/useStore';
import { simulatePlanMigration } from '../lib/utils';

export function PlanSimulationModal({ onClose }: { onClose: () => void }) {
  const career = useStore((state) => state.career);
  const { appliedEquivalences, riskSubjects } = simulatePlanMigration(career?.subjects || []);

  return (
    <div className="modal-bd">
      <div className="modal-box" style={{ maxWidth: '600px' }}>
        <div className="m-header">
          <div className="modal-title">Simulación de Cambio de Plan</div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="m-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text2)',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}
          >
            Este es el resumen de impacto si cambias al Plan 2026. Tu progreso actual se mapeará
            automáticamente a las nuevas materias de forma dinámica, manteniendo tu plan original
            intacto.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <h4
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#ef4444',
                marginBottom: '0.5rem',
              }}
            >
              <AlertTriangle size={18} /> Materias en riesgo
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '1rem' }}>
              Al cambiar de plan perderás la regularidad de estas materias por falta de correlativas
              aprobadas en el nuevo plan:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {riskSubjects.map((r, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fca5a5' }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text2)', marginTop: '0.25rem' }}>
                    ({r.reason})
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--primary)',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle size={18} /> Equivalencias Aplicadas
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {appliedEquivalences.map((eq, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--card2)',
                    border: '1px solid var(--border)',
                    padding: '1rem',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{eq.name}</div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        letterSpacing: '0.05em',
                        background:
                          eq.status === 'APROBADA'
                            ? 'rgba(74, 222, 128, 0.15)'
                            : eq.status === 'REGULAR'
                              ? 'rgba(167, 139, 250, 0.15)'
                              : 'rgba(96, 165, 250, 0.15)',
                        color:
                          eq.status === 'APROBADA'
                            ? '#4ade80'
                            : eq.status === 'REGULAR'
                              ? '#a78bfa'
                              : '#60a5fa',
                      }}
                    >
                      {eq.status}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      color: 'var(--text2)',
                    }}
                  >
                    <ArrowRight size={14} /> Derivado de: {eq.derived}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="m-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
