import { useStore } from '../../store/useStore';
import { CAREER_STATUS_CFG } from '../../lib/utils.career';

export function ElectivesTab({ onSelectSubject }: { onSelectSubject: (id: string) => void }) {
  const { career } = useStore();
  const electives = career?.electives || [];

  const approved = electives.filter(s => s.status === 'aprobada').length;
  const cursando = electives.filter(s => s.status === 'cursando').length;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>Optativas de {career?.name || 'Ingeniería'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: '0.15rem' }}>Selección y acreditación de materias optativas de especialización</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text)' }}>{approved} Aprobadas · {cursando} Cursando</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
        {electives.map(s => {
          const cfg = CAREER_STATUS_CFG[(s.status || 'pendiente') as keyof typeof CAREER_STATUS_CFG] || CAREER_STATUS_CFG.pendiente;
          return (
            <div key={s.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)' }}>{s.name}</div>
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: '0.25rem', background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)', whiteSpace: 'nowrap' }}>{s.credits} créditos</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text2)', marginBottom: '0.5rem' }}>Código: {s.code || '—'} · Área: {s.category}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="career-status-badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{cfg.label}</span>
                  {s.status === 'aprobada' && s.grade !== null && s.grade !== undefined && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: s.grade >= 4 ? '#4ade80' : '#f87171' }}>Nota: {s.grade}</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => onSelectSubject(s.id)}>Gestionar Optativa</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
