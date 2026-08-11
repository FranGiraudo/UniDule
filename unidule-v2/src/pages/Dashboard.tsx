import { useEffect, useState } from 'react';
import { Book, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { todayDay, t2m, daysUntil, urgColor, formatDate } from '../lib/utils';
import type { Subject, ScheduleEvent } from '../types';

export function Dashboard() {
  const { career, tasks } = useStore();
  const subjects = career?.subjects || [];
  
  // Stats
  const pending = tasks.filter(t => !t.done).length;
  const td = todayDay();
  const todayC = td ? subjects.reduce((a, s) => a + (s.schedules?.filter(sc => sc.day === td)?.length || 0), 0) : 0;
  
  // To avoid missing fields, assume absences = 0, maxAbsences = 10 if not present.
  const warnSubs: Subject[] = []; 
  const warn = warnSubs.length;

  // Next Class Logic (Countdown)
  const [nowSec, setNowSec] = useState(() => {
    const d = new Date();
    return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  });
  
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setNowSec(d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  const getNextClass = () => {
    const today = td;
    const nowM = Math.floor(nowSec / 60);
    const secs = nowSec % 60;
    
    if (today) {
      const todays: { s: Subject, sc: ScheduleEvent }[] = [];
      subjects.forEach(s => s.schedules?.filter(sc => sc.day === today).forEach(sc => todays.push({ s, sc })));
      todays.sort((a, b) => t2m(a.sc.startTime) - t2m(b.sc.startTime));
      
      for (const { s, sc } of todays) {
        const st = t2m(sc.startTime);
        const en = t2m(sc.endTime);
        if (nowM >= st && nowM < en) return { s, sc, status: 'inProgress', sec: (en - nowM) * 60 - secs };
        if (nowM < st) return { s, sc, status: 'upcoming', sec: (st - nowM) * 60 - secs };
      }
    }
    
    if (!today) return null;
    
    for (let off = 1; off <= 6; off++) {
      const nd = DAYS[(DAYS.indexOf(today) + off) % DAYS.length];
      const nb: { s: Subject, sc: ScheduleEvent }[] = [];
      subjects.forEach(s => s.schedules?.filter(sc => sc.day === nd).forEach(sc => nb.push({ s, sc })));
      if (!nb.length) continue;
      nb.sort((a, b) => t2m(a.sc.startTime) - t2m(b.sc.startTime));
      const { s, sc } = nb[0];
      return { s, sc, status: 'nextDay', sec: (off * 1440 + t2m(sc.startTime) - Math.floor(nowSec / 60)) * 60 - (nowSec % 60), nextDay: nd };
    }
    return null;
  };

  const nc = getNextClass();

  // Tasks styling logic matching V1
  const renderTask = (t: any) => {
    const sub = subjects.find(s => s.id === t.subjectId);
    const d = daysUntil(t.dueDate);
    const isExam = (t.type && (t.type.toLowerCase().includes('parcial') || t.type.toLowerCase().includes('final') || t.type.toLowerCase().includes('examen')));
    const isUrgentExam = isExam && d !== null && d >= 0 && d <= 3;
    const isOverdue = d !== null && d < 0;

    let badgeStyle = { background: `${urgColor(d)}1c`, color: urgColor(d), border: `1px solid ${urgColor(d)}33` };
    let cardStyle = { background: 'var(--card2)', borderLeft: '3px solid var(--primary)' };
    let statusLabel = d === null ? '—' : d < 0 ? 'Vencida' : d === 0 ? 'Hoy' : `${d}d`;

    if (isUrgentExam) {
      badgeStyle = { background: 'rgba(249,115,22,.25)', color: '#ffedd5', border: '1px solid #f97316' };
      cardStyle = { background: 'rgba(249,115,22,.08)', borderLeft: '3px solid #f97316' };
      statusLabel = d === 0 ? '¡RINDES HOY!' : `¡EXAMEN EN ${d}D!`;
    } else if (isOverdue) {
      cardStyle = { background: 'rgba(239,68,68,.06)', borderLeft: '3px solid #ef4444' };
    }

    return (
      <div key={t.id} className="upcoming-item" style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{t.title}</div>
            {sub && <div style={{ marginTop: '3px' }}><span className="badge" style={{ background: `${sub.color}18`, color: sub.color }}>{sub.name}</span></div>}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span className="badge" style={{ ...badgeStyle, fontSize: '10px' }}>{statusLabel}</span>
            <div style={{ fontSize: '10px', color: 'var(--text2)', marginTop: '2px' }}>{formatDate(t.dueDate)}</div>
          </div>
        </div>
      </div>
    );
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  // Today classes logic matching V1
  const todayClasses: { s: Subject, sc: ScheduleEvent }[] = [];
  if (td) subjects.forEach(s => s.schedules?.filter(sc => sc.day === td).forEach(sc => todayClasses.push({ s, sc })));
  todayClasses.sort((a, b) => t2m(a.sc.startTime) - t2m(b.sc.startTime));

  return (
    <div className="view-content fade-in" style={{ animation: 'fadeUp 0.3s ease' }}>
      <header className="view-header">
        <div>
          <h2 className="view-title">Dashboard</h2>
          <p className="view-sub">Resumen general de tu carrera</p>
        </div>
      </header>

      <div className="dash-panels">
        {/* Próxima Clase */}
        <div id="next-class-banner">
          <div id="nc-content">
            {!nc ? (
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <div style={{ display: 'inline-flex', padding: '0.6rem', borderRadius: '50%', background: 'rgba(74,222,128,.15)', color: '#4ade80', marginBottom: '5px' }}><CheckCircle2 size={24} /></div>
                <div style={{ fontWeight: 700 }}>Sin clases programadas</div>
                <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px' }}>Agrega horarios para ver el countdown.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(165,180,252,.7)', marginBottom: '6px' }}>
                    {nc.status === 'inProgress' ? '● EN CURSO AHORA' : nc.status === 'upcoming' ? 'PRÓXIMA CLASE HOY' : `PRÓXIMA — ${(nc.nextDay || '').toUpperCase()}`}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-.03em', color: nc.s.color || 'var(--primary)', marginBottom: '4px' }}>{nc.s.name}</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--text2)', alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>{nc.s.room || 'Aula'}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Clock size={12} /> {nc.sc.startTime}–{nc.sc.endTime}</span>
                    <span style={{ padding: '1px 6px', borderRadius: '5px', background: 'rgba(255,255,255,.08)', fontSize: '10px', fontWeight: 600 }}>{nc.sc.type}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(165,180,252,.7)', textAlign: 'center', marginBottom: '6px' }}>
                    {nc.status === 'inProgress' ? 'Finaliza en' : 'Empieza en'}
                  </div>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <div className="cd-unit"><div className="cd-num">{pad(Math.floor(Math.max(0, nc.sec) / 3600))}</div><div className="cd-lbl">hrs</div></div>
                    <div className="cd-sep">:</div>
                    <div className="cd-unit"><div className="cd-num">{pad(Math.floor((Math.max(0, nc.sec) % 3600) / 60))}</div><div className="cd-lbl">min</div></div>
                    <div className="cd-sep">:</div>
                    <div className="cd-unit"><div className="cd-num">{pad(Math.floor(Math.max(0, nc.sec) % 60))}</div><div className="cd-lbl">seg</div></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STATS GRID */}
        <div id="stats-grid" className="stats-grid">
          <div className="stat-card">
          <div className="stat-icon" style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}><Book size={20}/></div>
          <div className="stat-value gradient-text">{subjects.filter(s => s.status === 'cursando').length}</div>
          <div className="stat-label">Materias</div>
        </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,.15)', color: '#fbbf24' }}><CheckCircle2 size={20}/></div>
            <div className="stat-value" style={{ color: '#fbbf24' }}>{pending}</div>
            <div className="stat-label">Pendientes</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(34,197,94,.15)', color: '#34d399' }}><Clock size={20}/></div>
            <div className="stat-value" style={{ color: '#34d399' }}>{todayC}</div>
            <div className="stat-label">Hoy</div>
          </div>
          <div className="stat-card stat-card-alert">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,.15)', color: '#f87171' }}><AlertTriangle size={20}/></div>
            <div className="stat-value" style={{ color: warn ? '#f87171' : '#34d399' }}>{warn}</div>
            <div className="stat-label">Alertas</div>
            <div className="alert-tooltip">
              {warn ? (
                <>
                  <div style={{ fontWeight: 800, fontSize: '11px', marginBottom: '4px', color: '#f87171' }}>Materias en riesgo:</div>
                  {warnSubs.map(s => <div key={s.id} style={{ fontSize: '10px', marginTop: '2px' }}>• <strong>{s.name}</strong></div>)}
                </>
              ) : (
                <div style={{ fontWeight: 700, fontSize: '10px', color: '#4ade80' }}>Sin alertas de ausencias</div>
              )}
            </div>
          </div>
        </div>

        <div className="dash-bottom-grid">
          {/* Clases Hoy */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="section-header">
              <h3 className="section-title-sm">Clases de Hoy <span id="today-lbl" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text2)', marginLeft: '6px' }}>{td || 'Fin de semana'}</span></h3>
            </div>
            <div id="today-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
              {todayClasses.map(({ s, sc }, i) => {
                const past = (Math.floor(nowSec / 60)) > t2m(sc.endTime);
                const inPrg = (Math.floor(nowSec / 60)) >= t2m(sc.startTime) && (Math.floor(nowSec / 60)) < t2m(sc.endTime);
                return (
                  <div key={i} className="today-row" style={{ opacity: past ? 0.5 : 1, borderLeft: `3px solid ${s.color || 'var(--primary)'}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px' }}>{sc.startTime}–{sc.endTime} · {sc.type} · {s.room}</div>
                    </div>
                    {inPrg && <span className="badge" style={{ background: 'rgba(34,197,94,.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,.3)', whiteSpace: 'nowrap' }}>EN CURSO</span>}
                    {past && <span style={{ fontSize: '10px', color: 'var(--text2)' }}><CheckCircle2 size={14}/></span>}
                  </div>
                );
              })}
              {todayClasses.length === 0 && (
                <div className="empty-st" style={{ padding: '24px 16px' }}>
                  <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    <Clock size={24} />
                  </div>
                  <div style={{ fontWeight: 600 }}>Sin clases hoy</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Tareas */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="section-header">
              <div>
                <h3 className="section-title-sm">Próximas Entregas</h3>
              </div>
            </div>
            <div id="upcoming-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {tasks.filter(t => !t.done).slice(0, 5).map(renderTask)}
              {tasks.filter(t => !t.done).length === 0 && (
                <div className="empty-st" style={{ padding: '24px 16px' }}>
                  <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', background: 'rgba(74,222,128,.15)', color: '#4ade80', marginBottom: '0.5rem' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div style={{ fontWeight: 600 }}>Sin pendientes</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
