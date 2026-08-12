import { X, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export function PlanSimulationModal({ onClose }: { onClose: () => void }) {
  // Hardcoded for the prompt's provided text. In a real scenario, this would be computed by comparing user progress with plan_id 2026 subjects' equivalent_ids.

  const riskSubjects = [
    {
      name: 'Electiva V - IUA: Sistemas Embebidos',
      reason: 'falta final de Sistemas de Comunicaciones',
    },
    {
      name: 'Electiva V - IUA: Sistemas Embebidos',
      reason: 'falta final de Arquitectura de Computadoras',
    },
    {
      name: 'Economía para Ingeniería',
      reason:
        'falta final de Identificación, Formulación, Evaluación y Gestión de Proyectos de Ingeniería',
    },
    { name: 'Arquitectura de Computadoras', reason: 'falta final de Tecnología de Computadoras' },
  ];

  const appliedEquivalences = [
    {
      name: 'Análisis Matemático I',
      status: 'REGULAR',
      derived: 'Análisis Matemático 1A + Análisis Matemático 1B',
    },
    {
      name: 'Álgebra y Geometría Analítica',
      status: 'REGULAR',
      derived: 'Álgebra y Geometría + Álgebra Lineal',
    },
    { name: 'Física I', status: 'REGULAR', derived: 'Física 1' },
    {
      name: 'Paradigmas de Programación I',
      status: 'APROBADA',
      derived: 'Informática 1 + Informática 2',
    },
    {
      name: 'Tecnología de Computadoras',
      status: 'REGULAR',
      derived: 'Tecnología de Computadoras',
    },
    {
      name: 'Organización Empresarial e Industrial',
      status: 'REGULAR',
      derived: 'Gestión de Empresas 1',
    },
    { name: 'Técnicas de Desarrollo', status: 'APROBADA', derived: 'Informática 1' },
    {
      name: 'Sistemas de Información',
      status: 'REGULAR',
      derived: 'Informática 1 + Tecnología de Computadoras',
    },
    { name: 'Estructuras de Datos y Algoritmos', status: 'REGULAR', derived: 'Informática 3' },
    { name: 'Física II', status: 'CURSANDO', derived: 'Física 2' },
    { name: 'Paradigmas de Programación II', status: 'APROBADA', derived: 'Ingeniería Web 1' },
    { name: 'Arquitectura de Computadoras', status: 'REGULAR', derived: 'Arquitectura de Comp. 1' },
    { name: 'Bases de Datos I', status: 'CURSANDO', derived: 'Base de Datos 1' },
    {
      name: 'Probabilidad y Estadística',
      status: 'CURSANDO',
      derived: 'Probabilidad y Estadística',
    },
    {
      name: 'Ingeniería de Requerimientos',
      status: 'APROBADA',
      derived: 'Ingeniería de Software 1',
    },
    { name: 'Taller de Integración I', status: 'APROBADA', derived: 'Ingeniería de Software 1' },
    { name: 'Sistemas de Comunicaciones', status: 'CURSANDO', derived: 'Redes 1' },
    {
      name: 'Paradigmas de Programación III',
      status: 'CURSANDO',
      derived: 'Prog. Funcional y Scripting',
    },
    { name: 'Análisis y Cálculo Numérico', status: 'CURSANDO', derived: 'Métodos Numéricos' },
    { name: 'Desarrollo Web Seguro', status: 'APROBADA', derived: 'Ingeniería Web 2' },
    { name: 'Ingeniería Web', status: 'CURSANDO', derived: 'Ingeniería Web 3' },
    {
      name: 'Desarrollo de Aplicaciones Móviles',
      status: 'APROBADA',
      derived: 'Tecnologías Móviles',
    },
    {
      name: 'Legislación para Ingeniería',
      status: 'APROBADA',
      derived: 'Derecho y Ética Profesional',
    },
    {
      name: 'Electiva V - IUA: Sistemas Embebidos',
      status: 'REGULAR',
      derived: 'Arquitectura de Comp. 2 (Parcial)',
    },
    { name: 'Economía para Ingeniería', status: 'REGULAR', derived: 'Economía' },
    { name: 'Auditoría e Informática Forense', status: 'CURSANDO', derived: 'Auditoría' },
    { name: 'Inglés para Ingeniería', status: 'APROBADA', derived: 'Nivel Idioma Inglés' },
  ];

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
