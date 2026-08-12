import { useStore } from '../../../shared/store/useStore';
import { getComputedStatus } from '../lib/utils';
import { useMemo } from 'react';
import './stats.css'; // We'll create this to store the animations and complex styles

export function StatsTab() {
  const { career, profile } = useStore();
  const subjects = career?.subjects || [];

  const stats = useMemo(() => {
    const total = subjects.length;
    const aprobadas = subjects.filter(s => s.status === 'aprobada').length;
    const regulares = subjects.filter(s => s.status === 'regular').length;
    const cursando = subjects.filter(s => s.status === 'cursando').length;
    const disponible = subjects.filter(s => getComputedStatus(s, subjects) === 'disponible').length;

    const pctActual = total ? Math.round((aprobadas / total) * 100) : 0;
    const pctProy = total ? Math.round(((aprobadas + regulares) / total) * 100) : 0;

    const analistaSubs = subjects.filter(s => s.year <= 3);
    const anTotal = analistaSubs.length;
    const anAprob = analistaSubs.filter(s => s.status === 'aprobada').length;
    const anReg = analistaSubs.filter(s => s.status === 'regular').length;

    const pctAnActual = anTotal ? Math.round((anAprob / anTotal) * 100) : 0;
    const pctAnProy = anTotal ? Math.round(((anAprob + anReg) / anTotal) * 100) : 0;

    const allGrades = subjects.map(s => s.grade).filter((g): g is number => g != null && g > 0);
    const passGrades = allGrades.filter(g => g >= 4);
    const avgPass = passGrades.length ? (passGrades.reduce((a, b) => a + b, 0) / passGrades.length).toFixed(2) : '—';

    const totalCred = subjects.reduce((a, s) => a + (s.credits || 0), 0);
    const approvedCred = subjects.filter(s => s.status === 'aprobada').reduce((a, s) => a + (s.credits || 0), 0);

    const isLight = profile?.theme === 'light';
    const c = isLight 
      ? ['#16a34a','#7c3aed','#2563eb','#d97706','#e11d48','#059669','#4f46e5','var(--text2)']
      : ['#4ade80','#a78bfa','#60a5fa','#fbbf24','#f43f5e','#34d399','#818cf8','var(--text2)'];

    const miniGrid = [
      ['Aprobadas Total',  aprobadas,   c[0]],
      ['Regulares Pend.',  regulares,   c[1]],
      ['Cursando',         cursando,    c[2]],
      ['Disponibles',      disponible,  c[3]],
      ['Promedio',         avgPass,     c[4]],
      ['Avance Carrera',   pctActual + '%', c[5]],
      ['Créditos Aprob.',  approvedCred,c[6]],
      ['Créditos Total',   totalCred,   c[7]],
    ] as const;

    const R = 68;
    const C = 2 * Math.PI * R;

    return {
      total, aprobadas, regulares, pctActual, pctProy,
      anTotal, anAprob, pctAnActual, pctAnProy,
      miniGrid, R, C
    };
  }, [subjects, profile?.theme]);

  const { R, C } = stats;

  return (
    <div className="premium-stats-grid fade-in">
      {/* Título de Grado */}
      <div className="premium-card premium-ring-col">
        <div className="ring-title-badge" style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>Título de Grado</div>
        <div className="ring-title">{career?.name || 'Ingeniería en Informática'}</div>
        
        <svg width="180" height="180" viewBox="0 0 160 160" style={{ filter: 'drop-shadow(0 10px 20px rgba(74,222,128,0.2))', animation: 'popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <defs>
            <linearGradient id="gradIng" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="gradIngProy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(167,139,250,0.6)" />
              <stop offset="100%" stopColor="rgba(167,139,250,0.2)" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r={R} fill="none" className="svg-ring-bg" strokeWidth="14" />
          <circle cx="80" cy="80" r={R} fill="none" stroke="url(#gradIngProy)" strokeWidth="14"
            strokeDasharray={C} strokeDashoffset={C * (1 - stats.pctProy/100)}
            strokeLinecap="round" transform="rotate(-90 80 80)" style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }} />
          <circle cx="80" cy="80" r={R} fill="none" stroke="url(#gradIng)" strokeWidth="14"
            strokeDasharray={C} strokeDashoffset={C * (1 - stats.pctActual/100)}
            strokeLinecap="round" transform="rotate(-90 80 80)" style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1) 0.2s' }} />
          <text x="80" y="76" textAnchor="middle" fill="var(--text)" fontSize="32" fontWeight="900" fontFamily="system-ui, sans-serif">{stats.pctActual}%</text>
          <text x="80" y="94" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="700" letterSpacing="0.05em">ACTUAL</text>
          <text x="80" y="108" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">PROY: {stats.pctProy}%</text>
        </svg>
        
        <div className="ring-stats-box">
          <div className="ring-stat-item">
            <span className="ring-stat-val" style={{ color: '#4ade80' }}>{stats.aprobadas}</span>
            <span className="ring-stat-lbl">Aprobadas</span>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div className="ring-stat-item">
            <span className="ring-stat-val" style={{ color: '#a78bfa' }}>{stats.regulares}</span>
            <span className="ring-stat-lbl">Regulares</span>
          </div>
        </div>
      </div>

      {/* Título Intermedio */}
      <div className="premium-card premium-ring-col">
        <div className="ring-title-badge" style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>Título Intermedio</div>
        <div className="ring-title">Analista de Sistemas Informáticos</div>
        
        <svg width="180" height="180" viewBox="0 0 160 160" style={{ filter: 'drop-shadow(0 10px 20px rgba(96,165,250,0.2))', animation: 'popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both' }}>
          <defs>
            <linearGradient id="gradAna" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="gradAnaProy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(251,191,36,0.6)" />
              <stop offset="100%" stopColor="rgba(251,191,36,0.2)" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r={R} fill="none" className="svg-ring-bg" strokeWidth="14" />
          <circle cx="80" cy="80" r={R} fill="none" stroke="url(#gradAnaProy)" strokeWidth="14"
            strokeDasharray={C} strokeDashoffset={C * (1 - stats.pctAnProy/100)}
            strokeLinecap="round" transform="rotate(-90 80 80)" style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }} />
          <circle cx="80" cy="80" r={R} fill="none" stroke="url(#gradAna)" strokeWidth="14"
            strokeDasharray={C} strokeDashoffset={C * (1 - stats.pctAnActual/100)}
            strokeLinecap="round" transform="rotate(-90 80 80)" style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1) 0.2s' }} />
          <text x="80" y="76" textAnchor="middle" fill="var(--text)" fontSize="32" fontWeight="900" fontFamily="system-ui, sans-serif">{stats.pctAnActual}%</text>
          <text x="80" y="94" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="700" letterSpacing="0.05em">ACTUAL</text>
          <text x="80" y="108" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">PROY: {stats.pctAnProy}%</text>
        </svg>
        
        <div className="ring-stats-box">
          <div className="ring-stat-item">
            <span className="ring-stat-val" style={{ color: '#60a5fa' }}>{stats.anAprob}</span>
            <span className="ring-stat-lbl">Aprobadas</span>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div className="ring-stat-item">
            <span className="ring-stat-val" style={{ color: 'var(--text2)' }}>{stats.anTotal}</span>
            <span className="ring-stat-lbl">Total Requeridas</span>
          </div>
        </div>
      </div>

      {/* Mini Grid */}
      <div className="mini-stats-grid">
        {stats.miniGrid.map(([lbl, val, col], i) => (
          <div key={lbl} className="mini-stat-card" style={{ animation: `popIn 0.4s ease-out ${0.1 * i}s both` }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1, color: col, marginBottom: '0.35rem', fontFamily: 'system-ui, sans-serif' }}>
              {val}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {lbl}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
