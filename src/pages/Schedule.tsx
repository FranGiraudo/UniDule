import { useState, useEffect } from 'react';
import { useStore } from '../shared/store/useStore';
import { todayDay, nowMin, t2m, m2t, t2y, dur } from '../shared/lib/utils';
import type { Subject, ScheduleEvent } from '../shared/types';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DSHORT = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const GRID_START = '08:00';
const GRID_END = '23:30';
const PPM = 1.2;
const GRID_H = (t2m(GRID_END) - t2m(GRID_START)) * PPM;

export function Schedule() {
  const { career } = useStore();
  const subjects = career?.subjects || [];
  
  const [activeDay, setActiveDay] = useState(todayDay() || 'Lunes');
  const [now, setNow] = useState(nowMin());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    const timer = setInterval(() => setNow(nowMin()), 60000);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
    };
  }, []);

  const td = todayDay();
  const gs = t2m(GRID_START);
  const tm = t2m(GRID_END) - gs;

  const getBlocksForDay = (day: string) => {
    const blocks: { s: Subject, sc: ScheduleEvent }[] = [];
    subjects.forEach(s => {
      s.schedules?.filter(sc => sc.day === day).forEach(sc => {
        blocks.push({ s, sc });
      });
    });
    return blocks.sort((a, b) => t2m(a.sc.startTime) - t2m(b.sc.startTime));
  };

  const assignCols = (blocks: { s: Subject, sc: ScheduleEvent }[]) => {
    const cols: number[] = [];
    return blocks.map(b => {
      const st = t2m(b.sc.startTime);
      let col = cols.findIndex(e => e <= st);
      if (col === -1) { col = cols.length; cols.push(0); }
      cols[col] = t2m(b.sc.endTime);
      return { ...b, col, nCols: 0 }; // nCols calculated in next pass
    }).map(b => ({ ...b, nCols: cols.length }));
  };

  const activeSubjects = subjects.filter(s => s.status === 'cursando');

  const exportPDF = () => {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { alert('Permití popups para exportar el PDF.'); return; }

    const byDay: Record<string, any[]> = {};
    DAYS.forEach(d => { byDay[d] = []; });
    activeSubjects.forEach(s => {
      s.schedules?.forEach(sc => {
        byDay[sc.day]?.push({ ...sc, subName: s.name, subColor: s.color, room: s.room, type: sc.type });
      });
    });
    DAYS.forEach(d => byDay[d].sort((a, b) => t2m(a.startTime) - t2m(b.startTime)));

    const tasksPending = useStore.getState().tasks.filter(t => !t.done);
    const pendingHtml = tasksPending.map(t => {
      const sub = subjects.find(s => s.id === t.subjectId);
      return `<tr>
        <td>${t.title}</td>
        <td>${sub ? sub.name : '—'}</td>
        <td>${t.type}</td>
        <td>${t.dueDate ? new Date(t.dueDate + 'T12:00:00').toLocaleDateString('es-AR') : '—'}</td>
      </tr>`;
    }).join('');

    const dayCols = DAYS.map(day => {
      const classes = byDay[day];
      const cells = classes.length
        ? classes.map(c => `
            <div style="background:${c.subColor}18;border-left:3px solid ${c.subColor};border-radius:6px;padding:7px 9px;margin-bottom:6px;">
              <div style="font-weight:700;font-size:12px;color:${c.subColor};">${c.subName}</div>
              <div style="font-size:11px;color:#555;margin-top:3px;">${c.startTime}–${c.endTime}</div>
              <div style="font-size:10px;color:#777;">${c.type} · ${c.room}</div>
            </div>`).join('')
        : `<div style="color:#bbb;font-size:11px;text-align:center;padding:16px 0;">Libre</div>`;
      return `<td style="vertical-align:top;padding:6px;border-right:1px solid #eee;min-width:110px;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#555;margin-bottom:8px;">${day}</div>
        ${cells}
      </td>`;
    }).join('');

    const nowStr = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
    const themeColor = 'var(--primary, #6366f1)';

    win.document.write(`<!DOCTYPE html><html lang="es"><head>
      <meta charset="UTF-8">
      <title>Horario IUA — Ingeniería</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #fff; color: #111; padding: 32px 28px; }
        h1 { font-size: 22px; font-weight: 900; color: #1a1a2e; letter-spacing: -.02em; }
        .sub { font-size: 12px; color: #666; margin-top: 3px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid ${themeColor}; padding-bottom: 16px; }
        .badge-utn { background: linear-gradient(135deg,${themeColor},#8b5cf6); color: #fff; padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; }
        .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: ${themeColor}; margin: 24px 0 12px; border-left: 3px solid ${themeColor}; padding-left: 10px; }
        table.sched { width: 100%; border-collapse: collapse; }
        table.sched td { vertical-align: top; }
        table.tasks { width: 100%; border-collapse: collapse; font-size: 12px; }
        table.tasks th { background: #f5f5ff; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: ${themeColor}; border-bottom: 2px solid ${themeColor}; }
        table.tasks td { padding: 8px 10px; border-bottom: 1px solid #eee; }
        table.tasks tr:hover td { background: #f9f9ff; }
        .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #eee; font-size: 10px; color: #999; display: flex; justify-content: space-between; }
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { padding: 16px; }
          .no-print { display: none !important; }
        }
      </style>
    </head><body>
      <div class="header">
        <div>
          <h1>UniDule</h1>
          <div class="sub">Horario Semanal</div>
          <div class="sub">Generado el ${nowStr}</div>
        </div>
        <div>
          <div class="badge-utn">UniDule</div>
          <div style="margin-top:8px;text-align:right;">
            <button class="no-print" onclick="window.print()" style="background:${themeColor};color:#fff;border:none;padding:7px 16px;border-radius:7px;cursor:pointer;font-weight:700;font-size:12px;">Guardar como PDF</button>
          </div>
        </div>
      </div>

      <div class="section-title">Materias Activas</div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
        ${activeSubjects.map(s => `<div style="background:${s.color}18; color:${s.color}; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:700;">${s.name}</div>`).join('')}
      </div>

      <div class="section-title">Horario Semanal</div>
      <table class="sched"><tr>${dayCols}</tr></table>

      ${tasksPending.length ? `
      <div class="section-title">Tareas & Exámenes Pendientes (${tasksPending.length})</div>
      <table class="tasks">
        <thead><tr><th>Título</th><th>Materia</th><th>Tipo</th><th>Fecha</th></tr></thead>
        <tbody>${pendingHtml}</tbody>
      </table>` : ''}

      <div class="footer">
        <span>UniDule</span>
        <span>${nowStr}</span>
      </div>
    </body></html>`);
    win.document.close();
    win.focus();
  };

  return (
    <div className="view-content fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="view-header" style={{ marginBottom: '16px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="view-title">Horarios</h2>
          <p className="view-sub">Grilla semanal de clases</p>
        </div>
        <button onClick={exportPDF} className="btn btn-primary btn-sm" style={{ fontWeight: 600 }}>
          Exportar PDF
        </button>
      </header>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {activeSubjects.map(s => (
          <div key={s.id} style={{ background: `${s.color}18`, color: s.color, padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
            {s.name}
          </div>
        ))}
      </div>

      {/* MOBILE TABS */}
      {isMobile && (
        <div className="day-tabs-bar" id="day-tabs-bar" style={{ flexShrink: 0, marginBottom: '12px' }}>
          {DAYS.map((day, i) => {
            const hasCls = subjects.some(s => s.schedules?.some(sc => sc.day === day));
            return (
              <div 
                key={day} 
                className={`day-tab ${day === activeDay ? 'active' : ''} ${day === td ? 'today-tab' : ''}`}
                onClick={() => setActiveDay(day)}
              >
                <span>{DSHORT[i]}</span>
                <div className={`day-tab-dot ${hasCls ? 'has-class' : ''}`}></div>
              </div>
            );
          })}
        </div>
      )}

      {/* SCHEDULE CONTAINER */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {isMobile ? (
          <div style={{ padding: '12px', overflowY: 'auto', flex: 1 }}>
            {getBlocksForDay(activeDay).map(({ s, sc }, idx) => {
              const durationMin = t2m(sc.endTime) - t2m(sc.startTime);
              const isNow = now >= t2m(sc.startTime) && now < t2m(sc.endTime) && activeDay === td;
              
              return (
                <div key={idx} className="mobile-class-card" style={{ borderLeftColor: s.color, borderLeftWidth: '4px', background: isNow ? `${s.color}18` : undefined }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: s.color, flex: 1 }}>{s.name}</div>
                    {isNow && <span className="badge" style={{ background: 'rgba(34,197,94,.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,.3)', flexShrink: 0 }}>EN CURSO</span>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: '11px', color: 'var(--text2)', background: 'var(--card2)', padding: '8px 10px', borderRadius: '6px', marginBottom: '8px' }}>
                    <div><span style={{ opacity: .6, fontSize: '9px', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Horario</span><strong style={{ color: 'var(--text)' }}>{sc.startTime} – {sc.endTime}</strong> ({durationMin}m)</div>
                    <div><span style={{ opacity: .6, fontSize: '9px', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Aula / Sede</span><strong style={{ color: 'var(--text)' }}>{s.room || '—'}</strong></div>
                    <div><span style={{ opacity: .6, fontSize: '9px', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Tipo</span><strong style={{ color: 'var(--text)' }}>{sc.type || '—'}</strong></div>
                    <div><span style={{ opacity: .6, fontSize: '9px', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Docente</span><strong style={{ color: 'var(--text)' }}>{/*s.professor*/ '—'}</strong></div>
                  </div>
                </div>
              );
            })}
            {getBlocksForDay(activeDay).length === 0 && (
              <div className="empty-st" style={{ padding: '40px 20px' }}>
                <div style={{ fontWeight: 700 }}>Sin clases {activeDay === 'Sábado' || activeDay === 'Domingo' ? 'este día' : 'el ' + activeDay}</div>
                <div style={{ fontSize: '12px', marginTop: '6px' }}>¡Día libre!</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* DESKTOP HEADERS */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
              <div style={{ minWidth: '54px', flexShrink: 0 }}></div>
              <div style={{ flex: 1, display: 'flex' }}>
                {DAYS.map((d, i) => (
                  <div key={d} style={{
                    flex: 1, minWidth: 0, padding: '11px 6px', textAlign: 'center', borderLeft: '1px solid var(--border)',
                    fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
                    color: d === td ? 'var(--primary)' : 'var(--text2)',
                    background: d === td ? 'color-mix(in srgb, var(--primary) 4%, transparent)' : 'transparent'
                  }}>
                    <div>{DSHORT[i]}</div>
                    {d === td && <div style={{ width: '5px', height: '5px', background: 'var(--primary)', borderRadius: '50%', margin: '4px auto 0', boxShadow: '0 0 6px var(--primary)' }}></div>}
                  </div>
                ))}
              </div>
            </div>
            
            {/* DESKTOP GRID */}
            <div style={{ display: 'flex', flex: 1, overflowY: 'auto' }}>
              <div style={{ minWidth: '54px', width: '54px', flexShrink: 0, background: 'var(--bg2)', borderRight: '1px solid var(--border)', zIndex: 2, height: `${GRID_H}px`, position: 'relative' }}>
                {Array.from({ length: Math.floor(tm / 30) + 1 }).map((_, i) => {
                  const mn = i * 30;
                  const y = mn * PPM;
                  const isH = mn % 60 === 0;
                  return (
                    <div key={mn} style={{ position: 'absolute', top: `${y - 7}px`, right: '7px', fontSize: isH ? '10px' : '9px', fontWeight: 600, color: 'var(--text2)', opacity: isH ? 1 : .45 }}>
                      {m2t(gs + mn)}
                    </div>
                  );
                })}
              </div>
              <div style={{ flex: 1, display: 'flex', minWidth: 0, height: `${GRID_H}px` }}>
                {DAYS.map(day => {
                  const isToday = day === td;
                  const blocks = assignCols(getBlocksForDay(day));
                  
                  return (
                    <div key={day} style={{ flex: 1, minWidth: 0, position: 'relative', height: `${GRID_H}px`, borderLeft: '1px solid var(--border)', background: isToday ? 'rgba(99,102,241,.03)' : 'transparent' }}>
                      {Array.from({ length: Math.floor(tm / 30) + 1 }).map((_, i) => {
                        const mn = i * 30;
                        const y = mn * PPM;
                        const isH = mn % 60 === 0;
                        return <div key={mn} style={{ position: 'absolute', top: `${y}px`, left: 0, right: 0, borderTop: `1px solid rgba(255,255,255,${isH ? .06 : .03})`, pointerEvents: 'none' }}></div>
                      })}
                      
                      {blocks.map(({ s, sc, col, nCols }, idx) => {
                        const top = t2y(sc.startTime, GRID_START, PPM);
                        const h = dur(sc.startTime, sc.endTime, PPM);
                        const w = 100 / nCols;
                        const lft = col * w;
                        
                        return (
                          <div key={idx} className="class-block" style={{
                            top: `${top}px`, height: `${h}px`, left: `${3 + lft * .97}%`, right: `${3 + (100 - lft - w) * .97}%`,
                            background: `${s.color}1e`, borderLeft: `3px solid ${s.color}`, borderTop: `1px solid ${s.color}33`
                          }}>
                            <div className="cb-name" style={{ color: s.color }}>{s.name}</div>
                            <div className="cb-type" style={{ color: `${s.color}aa` }}>{sc.type}</div>
                            {h > 55 && <div className="cb-room" style={{ color: `${s.color}77` }}>{s.room}</div>}
                          </div>
                        );
                      })}
                      
                      {isToday && now >= gs && now <= gs + tm && (
                        <div className="now-line" style={{ top: `${t2y(m2t(now), GRID_START, PPM)}px` }}><div className="now-dot"></div></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
