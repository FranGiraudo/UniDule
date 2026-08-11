import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { getComputedStatus, CAREER_STATUS_CFG } from '../../lib/utils.career';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

export function GridTab({ onSelectSubject }: { onSelectSubject: (id: string) => void }) {
  const { career } = useStore();
  const subjects = career?.subjects || [];
  
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [collapsedYears, setCollapsedYears] = useState<Record<number, boolean>>({});

  const toggleYear = (year: number) => {
    setCollapsedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const years = [1, 2, 3, 4, 5];

  const hasAnySubjects = years.some(year => {
    let yearSubs = subjects.filter(s => s.year === year);
    if (search) {
      const q = search.toLowerCase();
      yearSubs = yearSubs.filter(s => s.name.toLowerCase().includes(q) || (s.id && s.id.toLowerCase().includes(q)));
    }
    if (filter !== 'all') {
      yearSubs = yearSubs.filter(s => {
        const cs = getComputedStatus(s, subjects);
        if (filter === 'bloqueada') return cs === 'pendiente' || cs === 'bloqueada';
        return cs === filter;
      });
    }
    return yearSubs.length > 0;
  });

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
          <input 
            type="text" 
            className="f-input" 
            placeholder="Buscar materia o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select 
            className="f-input" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
          >
            <option value="all">Todos los estados</option>
            <option value="aprobada">Aprobadas</option>
            <option value="regular">Regulares</option>
            <option value="cursando">Cursando</option>
            <option value="disponible">Disponibles</option>
            <option value="bloqueada">Pendientes/Bloqueadas</option>
          </select>
        </div>
      </div>

      {!hasAnySubjects ? (
        <div className="empty-st">
          <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            <Search size={24} />
          </div>
          <div>No se encontraron materias con el filtro aplicado.</div>
        </div>
      ) : (
        years.map(year => {
          let yearSubs = subjects.filter(s => s.year === year);
          if (search) {
            const q = search.toLowerCase();
            yearSubs = yearSubs.filter(s => s.name.toLowerCase().includes(q) || (s.id && s.id.toLowerCase().includes(q)));
          }
          if (filter !== 'all') {
            yearSubs = yearSubs.filter(s => {
              const cs = getComputedStatus(s, subjects);
              if (filter === 'bloqueada') return cs === 'pendiente' || cs === 'bloqueada';
              return cs === filter;
            });
          }

          if (!yearSubs.length) return null;

          const approved = subjects.filter(s => s.year === year && s.status === 'aprobada').length;
          const totalYear = subjects.filter(s => s.year === year).length;
          const pct = totalYear ? Math.round(approved / totalYear * 100) : 0;
          const barColor = pct >= 100 ? '#4ade80' : pct >= 50 ? '#60a5fa' : 'var(--primary)';

          return (
            <div key={year} className={`career-year-block ${collapsedYears[year] ? 'collapsed' : ''}`}>
              <div className="career-year-header" onClick={() => toggleYear(year)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <span className="career-year-num">{year}° Año</span>
                  <span style={{ fontSize: '11px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{approved}/{totalYear}</span>
                  <div className="career-year-bar-wrap">
                    <div className="career-year-bar-fill" style={{ width: `${pct}%`, background: barColor }}></div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text2)', minWidth: '2.5rem' }}>{pct}%</span>
                </div>
                <span className="career-chevron">
                  {collapsedYears[year] ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </span>
              </div>
              <div className="career-year-body">
                {[0, 1, 2].map(sem => {
                  const semSubs = yearSubs.filter(s => s.period === sem);
                  if (!semSubs.length) return null;
                  const lbl = sem === 0 ? 'Anual' : `${sem}° Semestre`;
                  return (
                    <div key={sem} className="career-sem-section">
                      <div className="career-sem-label">{lbl}</div>
                      {semSubs.map(s => {
                        const cs = getComputedStatus(s, subjects);
                        const cfg = CAREER_STATUS_CFG[cs] || CAREER_STATUS_CFG.pendiente;
                        const canFinal = s.status === 'regular' && 
                          (s.correlatives || []).every(id => {
                            const dep = subjects.find(x => x.id === id);
                            return dep && dep.status === 'aprobada';
                          });

                        return (
                          <div key={s.id} className="career-sub-row" style={{ borderLeftColor: cfg.color }} onClick={() => onSelectSubject(s.id)}>
                            <div className="career-sub-info">
                              <div className="career-sub-name">{s.name}</div>
                              <div className="career-sub-meta">
                                <span>{s.id}</span> {/* Using ID as code for now */}
                                {s.status === 'aprobada' && s.grade !== null && s.grade !== undefined && (
                                  <span style={{ color: s.grade >= 4 ? '#4ade80' : '#f87171', fontWeight: 700 }}>Nota: {s.grade}</span>
                                )}
                                {canFinal && <span className="career-final-badge">Final disponible</span>}
                              </div>
                            </div>
                            <span className="career-status-badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                              {cfg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
