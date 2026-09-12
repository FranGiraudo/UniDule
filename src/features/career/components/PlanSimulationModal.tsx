import { X, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../../shared/lib/supabase';
import { useStore } from '../../../shared/store/useStore';
export function PlanSimulationModal({ onClose }: { onClose: () => void }) {
  const { career } = useStore();
  const subjects = career?.subjects || [];
  
  const [loading, setLoading] = useState(true);
  const [appliedEquivalences, setAppliedEquivalences] = useState<any[]>([]);
  const [riskSubjects, setRiskSubjects] = useState<any[]>([]);

  useEffect(() => {
    async function runSim() {
      const { data: newSubs } = await supabase.from('global_subjects').select('*').eq('plan_id', '2026');
      if (!newSubs) {
        setLoading(false);
        return;
      }

      const applied: any[] = [];

      for (const ns of newSubs) {
        const eqIds = ns.equivalent_ids || [];
        
        // If it explicitly defines equivalences
        if (eqIds.length > 0) {
          let allAprobada = true;
          let allAtLeastRegular = true;
          let anyFound = false;
          let minStatus = 'aprobada';
          const derivedNames: string[] = [];

          for (const eqId of eqIds) {
            const userSub = subjects.find(s => s.code === eqId || s.id === eqId);
            if (userSub) {
              derivedNames.push(userSub.name);
              if (userSub.status !== 'aprobada') allAprobada = false;
              if (userSub.status !== 'aprobada' && userSub.status !== 'regular') allAtLeastRegular = false;
              if (userSub.status === 'aprobada' || userSub.status === 'regular' || userSub.status === 'cursando') {
                anyFound = true;
              }
              if (userSub.status === 'cursando') minStatus = 'cursando';
              else if (userSub.status === 'regular' && minStatus === 'aprobada') minStatus = 'regular';
            } else {
              allAprobada = false;
              allAtLeastRegular = false;
            }
          }

          if (anyFound && (allAtLeastRegular || minStatus === 'cursando')) {
            applied.push({
              name: ns.name,
              status: allAprobada ? 'APROBADA' : minStatus.toUpperCase(),
              derived: derivedNames.join(' + ')
            });
          }
        } else {
          // If no explicit equivalence, check by exact code or name matching
          const userSub = subjects.find(s => s.code === ns.code || s.name.toLowerCase() === ns.name.toLowerCase());
          if (userSub && (userSub.status === 'aprobada' || userSub.status === 'regular' || userSub.status === 'cursando')) {
            applied.push({
              name: ns.name,
              status: userSub.status.toUpperCase(),
              derived: userSub.name
            });
          }
        }
      }

      setAppliedEquivalences(applied);
      // As of now, risk computing requires resolving correlatives graph which is complex for a mock. 
      // We will leave it empty unless there's explicit data.
      setRiskSubjects([]);
      setLoading(false);
    }
    runSim();
  }, [subjects]);

  return (
    <div className="modal-bd">
      <div className="modal-box" style={{ maxWidth: '600px' }}>
        <div className="m-header">
          <div className="modal-title">Simulación de Cambio a Plan 2026</div>
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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text2)' }}>
              Analizando equivalencias desde la base de datos...
            </div>
          ) : (
            <>
              {riskSubjects.length > 0 && (
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
                    Al cambiar de plan podrías perder la regularidad de estas materias por falta de correlativas
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
              )}

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
                  <CheckCircle size={18} /> Equivalencias Reconocidas
                </h4>
                {appliedEquivalences.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>
                    No se encontraron equivalencias directas para tu progreso actual.
                  </p>
                ) : (
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
                )}
              </div>
            </>
          )}
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
