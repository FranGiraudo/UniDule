import { useState } from 'react';
import { useStore } from '../../../shared/store/useStore';
import { getDaysToExpiration } from '../lib/utils';
import { Book, Search, CheckCircle2, Lock, FileEdit } from 'lucide-react';

export function FinalsTab({ onSelectSubject }: { onSelectSubject: (id: string) => void }) {
  const { career } = useStore();
  const subjects = career?.subjects || [];
  
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('exp-asc');

  const regularSubs = subjects.filter(s => s.status === 'regular');

  if (!regularSubs.length) {
    return (
      <div className="fade-in">
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text2)', background: 'var(--card)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            <Book size={24} />
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)' }}>No hay materias regulares registradas</div>
          <div style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>Cuando tengas materias regularizadas aparecerán aquí con sus fechas de vencimiento.</div>
        </div>
      </div>
    );
  }

  let filteredSubs = regularSubs.filter(s => {
    if (search) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchCode = (s.id || '').toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    const missingToPass = (s.correlatives || []).map(id => subjects.find(x => x.id === id)).filter(dep => !dep || dep.status !== 'aprobada');
    const canRendir = missingToPass.length === 0;
    
    if (filter === 'ready' && !canRendir) return false;
    if (filter === 'pending' && canRendir) return false;
    return true;
  });

  filteredSubs.sort((a, b) => {
    // We don't have expDate in V2 yet, so we assume 9999
    if (sort === 'exp-asc') return 0;
    if (sort === 'exp-desc') return 0;
    if (sort === 'name-asc') return a.name.localeCompare(b.name);
    if (sort === 'year-asc') return (a.year - b.year) || ((a.period || 0) - (b.period || 0));
    return 0;
  });

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '180px' }}>
          <input 
            type="text" 
            className="f-input" 
            placeholder="Buscar final o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select className="f-input" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}>
            <option value="all">Todos los finales ({regularSubs.length})</option>
            <option value="ready">Habilitados para rendir</option>
            <option value="pending">Pendiente correlativas</option>
          </select>
          <select className="f-input" value={sort} onChange={(e) => setSort(e.target.value)} style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}>
            <option value="exp-asc">Vencimiento más próximo</option>
            <option value="exp-desc">Vencimiento más lejano</option>
            <option value="name-asc">Nombre (A - Z)</option>
            <option value="year-asc">Año (1° a 5°)</option>
          </select>
        </div>
      </div>

      {!filteredSubs.length ? (
        <div className="empty-st" style={{ background: 'var(--card)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            <Search size={24} />
          </div>
          <div>No se encontraron finales que coincidan con la búsqueda o filtro seleccionado.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
          {filteredSubs.map(s => {
            const missingToPass = (s.correlatives || []).map(id => subjects.find(x => x.id === id)).filter(dep => !dep || dep.status !== 'aprobada');
            const canRendir = missingToPass.length === 0;

            // Assumed fields for V2 until added to types
            const expDate = (s as any).expDate;
            const regDate = (s as any).regDate;
            
            const daysLeft = getDaysToExpiration(expDate);
            let badgeBg = 'rgba(74,222,128,.15)', badgeColor = '#4ade80', badgeText = 'Regularidad activa';
            
            if (daysLeft !== null) {
              if (daysLeft < 0) { badgeBg = 'rgba(248,113,113,.2)'; badgeColor = '#f87171'; badgeText = '¡Vencida!'; }
              else if (daysLeft <= 90) { badgeBg = 'rgba(248,113,113,.15)'; badgeColor = '#f87171'; badgeText = `Vence en ${daysLeft} días`; }
              else if (daysLeft <= 180) { badgeBg = 'rgba(251,191,36,.15)'; badgeColor = '#fbbf24'; badgeText = `Vence en ${daysLeft} días`; }
              else { badgeBg = 'rgba(74,222,128,.15)'; badgeColor = '#4ade80'; badgeText = `Vence en ${daysLeft} días`; }
            }

            const regFormatted = regDate ? new Date(regDate.replace(/-/g,'/')).toLocaleDateString('es-AR') : '—';
            const expFormatted = expDate ? new Date(expDate.replace(/-/g,'/')).toLocaleDateString('es-AR') : '—';

            return (
              <div key={s.id} onClick={() => onSelectSubject(s.id)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem', cursor: 'pointer' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{s.name}</div>
                    <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: '0.25rem', background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)', whiteSpace: 'nowrap' }}>{s.year}° Año</span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text2)', marginBottom: '0.5rem' }}>Código: {s.id}</div>
                  
                  <div style={{ marginBottom: '0.375rem' }}>
                    {canRendir ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '0.375rem', background: 'rgba(74,222,128,.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,.3)' }}>
                        <CheckCircle2 size={12} /> Habilitado para rendir
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '0.375rem', background: 'rgba(248,113,113,.15)', color: '#f87171', border: '1px solid rgba(248,113,113,.3)' }}>
                        <Lock size={12} /> Pendiente correlativas
                      </span>
                    )}
                  </div>
                  {!canRendir && <div style={{ fontSize: '0.6875rem', color: '#f87171', marginTop: '0.25rem' }}>Falta aprobar: {missingToPass.map(m => m ? m.name : '?').join(', ')}</div>}
                </div>

                <div style={{ background: 'var(--card2)', padding: '0.625rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.6875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text2)' }}>Regularizada:</span>
                    <span style={{ fontWeight: 600 }}>{regFormatted}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text2)' }}>Vencimiento:</span>
                    <span style={{ fontWeight: 700, color: badgeColor }}>{expFormatted}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'nowrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '0.375rem', background: badgeBg, color: badgeColor, whiteSpace: 'nowrap' }}>{badgeText}</span>
                  <button className="btn-action" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }} onClick={(e) => { e.stopPropagation(); onSelectSubject(s.id); }}>
                    <FileEdit size={12} /> Rendir Final
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
