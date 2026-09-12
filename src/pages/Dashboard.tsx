import { useEffect, useState } from 'react';
import { Book, CheckCircle2, Clock, AlertTriangle, Circle, GraduationCap } from 'lucide-react';
import { toggleEventCompletion } from '../features/events/lib/api';
import { useStore } from '../shared/store/useStore';
import { todayDay, t2m, daysUntil, urgColor, formatDate } from '../shared/lib/utils';
import type { Subject } from '../shared/types';

export function Dashboard() {
  const { career, tasks, session, eventCompletions, setEventCompletions } = useStore();
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleToggleEvent = async (eventId: string, currentCompleted: boolean) => {
    if (!session?.user?.id) return;
    const dateStr = getTodayStr();
    
    if (currentCompleted) {
      setEventCompletions(eventCompletions.filter(c => !(c.event_id === eventId && c.date_str === dateStr)));
    } else {
      setEventCompletions([...eventCompletions, { id: 'temp', user_id: session.user.id, event_id: eventId, date_str: dateStr }]);
    }
    await toggleEventCompletion(session.user.id, eventId, dateStr, !currentCompleted);
  };
  const subjects = career?.subjects || [];

  // Stats
  const pending = tasks.filter((t) => !t.done).length;
  const td = todayDay();
  

  const warnSubs: Subject[] = subjects.filter(
    (s) => s.activeId && (s.absences || 0) >= (s.maxAbsences || 6) * 0.75,
  );
  const warn = warnSubs.length;

  const expiringSubs = subjects.filter((s) => {
    if (s.status !== 'regular' || !s.expDate) return false;
    const d = daysUntil(s.expDate);
    return d !== null && d >= 0 && d <= 90;
  });
  const warnExpiring = expiringSubs.length;

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
  const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const getBlocksForDay = (day: string) => {
    const blocks: { s: any; sc: any }[] = [];
    subjects.forEach((s) => {
      s.schedules?.filter((sc) => sc.day === day).forEach((sc) => blocks.push({ s, sc }));
    });

    const dayIndex = DAYS.indexOf(day);
    const myDayIndex = dayIndex === 0 ? 7 : dayIndex;
    const userEvents = useStore.getState().userEvents;

    userEvents.forEach((e) => {
      let shouldShow = false;
      if (e.isRecurring) {
        if (e.dayOfWeek === myDayIndex) shouldShow = true;
      } else if (e.date) {
        // Fix: Only show one-time events if their exact date matches today/the target date
        // Since Dashboard only cares about today and relative next days, we need to compare exact dates.
        // To keep it simple, we approximate by calculating the target Date based on the day string offset from today.
        const todayIdx = DAYS.indexOf(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
        let offset = dayIndex - todayIdx;
        if (offset < 0) offset += 7;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + offset);
        if (e.date === toYMD(targetDate)) shouldShow = true;
      }
      if (shouldShow) {
        blocks.push({
          s: { name: e.title, color: e.color || '#a855f7', room: '' },
          sc: { 
            id: e.id,
            isEvent: true,
            startTime: e.startTime, 
            endTime: e.endTime, 
            type: e.category.charAt(0).toUpperCase() + e.category.slice(1) 
          }
        });
      }
    });

    const tasks = useStore.getState().tasks;
    tasks.forEach((t) => {
      if ((t.type === 'Parcial' || t.type === 'Final') && t.dueDate && t.startTime && t.endTime) {
        const todayIdx = DAYS.indexOf(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
        let offset = dayIndex - todayIdx;
        if (offset < 0) offset += 7;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + offset);
        
        if (t.dueDate === toYMD(targetDate)) {
          const sub = subjects.find(s => s.id === t.subjectId);
          blocks.push({
            s: { 
              name: t.title, 
              color: sub?.color || '#ef4444', 
              room: sub?.name || 'Examen' 
            },
            sc: {
              startTime: t.startTime,
              endTime: t.endTime,
              type: t.type
            }
          });
        }
      }
    });
    return blocks.sort((a, b) => t2m(a.sc.startTime) - t2m(b.sc.startTime));
  };


  const pad = (n: number) => String(n).padStart(2, "0");
  // Next Exam Logic (MEJ-017)
  const nextExams = tasks
    .filter(t => !t.done && t.dueDate && (t.type.toLowerCase().includes('parcial') || t.type.toLowerCase().includes('final') || t.type.toLowerCase().includes('examen')))
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1));
  const nextExam = nextExams.length > 0 ? nextExams[0] : null;

  const [examSecs, setExamSecs] = useState<number | null>(null);
  
  useEffect(() => {
    if (!nextExam || !nextExam.dueDate) return;
    const updateCountdown = () => {
      const examDate = new Date(nextExam.dueDate + 'T00:00:00');
      const diff = Math.floor((examDate.getTime() - Date.now()) / 1000);
      setExamSecs(diff > 0 ? diff : 0);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [nextExam]);


  const getNextClass = () => {
    const today = td;
    const nowM = Math.floor(nowSec / 60);
    const secs = nowSec % 60;

    if (today) {
      const todays = getBlocksForDay(today);
      for (const { s, sc } of todays) {
        const st = t2m(sc.startTime);
        const en = t2m(sc.endTime);
        if (nowM >= st && nowM < en)
          return { s, sc, status: 'inProgress', sec: (en - nowM) * 60 - secs };
        if (nowM < st) return { s, sc, status: 'upcoming', sec: (st - nowM) * 60 - secs };
      }
    }

    if (!today) return null;

    for (let off = 1; off <= 7; off++) {
      const nd = DAYS[(DAYS.indexOf(today) + off) % DAYS.length];
      const nb = getBlocksForDay(nd);
      if (!nb.length) continue;
      const { s, sc } = nb[0];
      return {
        s,
        sc,
        status: 'nextDay',
        sec: (off * 1440 + t2m(sc.startTime) - Math.floor(nowSec / 60)) * 60 - (nowSec % 60),
        nextDay: nd,
      };
    }
    return null;
  };

  const nc = getNextClass();

  // Tasks styling logic matching V1
  const renderTask = (t: any) => {
    const sub = subjects.find((s) => s.id === t.subjectId);
    const d = daysUntil(t.dueDate);
    const isExam =
      t.type &&
      (t.type.toLowerCase().includes('parcial') ||
        t.type.toLowerCase().includes('final') ||
        t.type.toLowerCase().includes('examen'));
    const isUrgentExam = isExam && d !== null && d >= 0 && d <= 3;
    const isOverdue = d !== null && d < 0;

    let badgeStyle = {
      background: `${urgColor(d)}1c`,
      color: urgColor(d),
      border: `1px solid ${urgColor(d)}33`,
    };
    let cardStyle = { background: 'var(--card2)', borderLeft: '3px solid var(--primary)' };
    let statusLabel = d === null ? '—' : d < 0 ? 'Vencida' : d === 0 ? 'Hoy' : `${d}d`;

    if (isUrgentExam) {
      badgeStyle = {
        background: 'rgba(249,115,22,.25)',
        color: '#ffedd5',
        border: '1px solid #f97316',
      };
      cardStyle = { background: 'rgba(249,115,22,.08)', borderLeft: '3px solid #f97316' };
      statusLabel = d === 0 ? '¡RINDES HOY!' : `¡EXAMEN EN ${d}D!`;
    } else if (isOverdue) {
      cardStyle = { background: 'rgba(239,68,68,.06)', borderLeft: '3px solid #ef4444' };
    }

    return (
      <div key={t.id} className="upcoming-item" style={cardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{t.title}</div>
            {sub && (
              <div style={{ marginTop: '3px' }}>
                <span className="badge" style={{ background: `${sub.color}18`, color: sub.color }}>
                  {sub.name}
                </span>
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span className="badge" style={{ ...badgeStyle, fontSize: '10px' }}>
              {statusLabel}
            </span>
            <div style={{ fontSize: '10px', color: 'var(--text2)', marginTop: '2px' }}>
              {formatDate(t.dueDate)}
            </div>
          </div>
        </div>
      </div>
    );
  };


  // Today classes logic matching V1

  

  const todayClasses = td ? getBlocksForDay(td) : [];
  const academicClasses = todayClasses.filter(b => !b.s.isEvent);
  const dailyHabits = todayClasses.filter(b => b.s.isEvent);

  return (
    <div className="view-content fade-in" style={{ animation: 'fadeUp 0.3s ease' }}>
      <header className="view-header">
        <div>
          <h2 className="view-title">Dashboard</h2>
          <p className="view-sub">Resumen general de tu carrera</p>
        </div>
      </header>

      <div className="dash-panels">

        {/* EXAM COUNTDOWN BANNER (MEJ-017) */}
        {nextExam && examSecs !== null && examSecs > 0 && examSecs <= 30 * 86400 && (
          <div className="fade-in" style={{
            background: 'color-mix(in srgb, var(--primary) 10%, var(--card2))',
            borderRadius: '16px',
            padding: '20px 24px',
            color: 'var(--text)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
            boxShadow: '0 8px 24px color-mix(in srgb, var(--primary) 15%, transparent)',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GraduationCap size={14} /> Próximo {nextExam.type}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                {nextExam.title}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px', fontWeight: 600 }}>
                 {subjects.find(s => s.id === nextExam.subjectId)?.name || 'Materia'}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg)', padding: '10px 4px', borderRadius: '12px', minWidth: '64px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1, color: 'var(--primary)' }}>{Math.floor(examSecs / 86400)}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', marginTop: '2px' }}>Días</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg)', padding: '10px 4px', borderRadius: '12px', minWidth: '64px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1, color: 'var(--primary)' }}>{pad(Math.floor((examSecs % 86400) / 3600))}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', marginTop: '2px' }}>Hrs</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg)', padding: '10px 4px', borderRadius: '12px', minWidth: '64px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1, color: 'var(--primary)' }}>{pad(Math.floor((examSecs % 3600) / 60))}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', marginTop: '2px' }}>Min</span>
              </div>
            </div>
          </div>
        )}

        {/* Próxima Clase */}

        <div id="next-class-banner">
          <div id="nc-content">
            {!nc ? (
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    padding: '0.6rem',
                    borderRadius: '50%',
                    background: 'rgba(74,222,128,.15)',
                    color: '#4ade80',
                    marginBottom: '5px',
                  }}
                >
                  <CheckCircle2 size={24} />
                </div>
                <div style={{ fontWeight: 700 }}>Sin clases programadas</div>
                <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px' }}>
                  Agrega horarios para ver el countdown.
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.1em',
                      color: 'rgba(165,180,252,.7)',
                      marginBottom: '6px',
                    }}
                  >
                    {nc.status === 'inProgress'
                      ? '● EN CURSO AHORA'
                      : nc.status === 'upcoming'
                        ? 'PRÓXIMA CLASE HOY'
                        : `PRÓXIMA — ${(nc.nextDay || '').toUpperCase()}`}
                  </div>
                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: 900,
                      letterSpacing: '-.03em',
                      color: nc.s.color || 'var(--primary)',
                      marginBottom: '4px',
                    }}
                  >
                    {nc.s.name}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap',
                      fontSize: '11px',
                      color: 'var(--text2)',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      {nc.s.room || 'Aula'}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={12} /> {nc.sc.startTime}–{nc.sc.endTime}
                    </span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '5px',
                        background: 'rgba(255,255,255,.08)',
                        fontSize: '10px',
                        fontWeight: 600,
                      }}
                    >
                      {nc.sc.type}
                    </span>
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.08em',
                      color: 'rgba(165,180,252,.7)',
                      textAlign: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    {nc.status === 'inProgress' ? 'Finaliza en' : 'Empieza en'}
                  </div>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <div className="cd-unit">
                      <div className="cd-num">{pad(Math.floor(Math.max(0, nc.sec) / 3600))}</div>
                      <div className="cd-lbl">hrs</div>
                    </div>
                    <div className="cd-sep">:</div>
                    <div className="cd-unit">
                      <div className="cd-num">
                        {pad(Math.floor((Math.max(0, nc.sec) % 3600) / 60))}
                      </div>
                      <div className="cd-lbl">min</div>
                    </div>
                    <div className="cd-sep">:</div>
                    <div className="cd-unit">
                      <div className="cd-num">{pad(Math.floor(Math.max(0, nc.sec) % 60))}</div>
                      <div className="cd-lbl">seg</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STATS GRID */}
        <div id="stats-grid" className="stats-grid">
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                color: 'var(--primary)',
              }}
            >
              <Book size={20} />
            </div>
            <div className="stat-value gradient-text">
              {subjects.filter((s) => s.status === 'cursando').length}
            </div>
            <div className="stat-label">Materias</div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: 'rgba(245,158,11,.15)', color: '#fbbf24' }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div className="stat-value" style={{ color: '#fbbf24' }}>
              {pending}
            </div>
            <div className="stat-label">Pendientes</div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: 'rgba(34,197,94,.15)', color: '#34d399' }}
            >
              <Clock size={20} />
            </div>
            <div className="stat-value" style={{ color: '#34d399' }}>
              {todayClasses.length}
            </div>
            <div className="stat-label">Hoy</div>
          </div>
          <div className="stat-card stat-card-alert">
            <div
              className="stat-icon"
              style={{ background: 'rgba(239,68,68,.15)', color: '#f87171' }}
            >
              <AlertTriangle size={20} />
            </div>
            <div className="stat-value" style={{ color: warn ? '#f87171' : '#34d399' }}>
              {warn}
            </div>
            <div className="stat-label">Alertas</div>
            <div className="alert-tooltip">
              {warn ? (
                <>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: '11px',
                      marginBottom: '4px',
                      color: '#f87171',
                    }}
                  >
                    Materias en riesgo:
                  </div>
                  {warnSubs.map((s) => (
                    <div key={s.id} style={{ fontSize: '10px', marginTop: '2px' }}>
                      • <strong>{s.name}</strong> ({s.absences}/{s.maxAbsences} faltas)
                    </div>
                  ))}
                  
                  {warnExpiring > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '11px',
                          marginBottom: '4px',
                          color: '#f87171',
                        }}
                      >
                        Vencimientos (próximos 90 días):
                      </div>
                      {expiringSubs.map((s) => (
                        <div key={s.id} style={{ fontSize: '10px', marginTop: '2px' }}>
                          • <strong>{s.name}</strong> (vence en {daysUntil(s.expDate)}d)
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontWeight: 700, fontSize: '10px', color: '#4ade80' }}>
                  Sin alertas pendientes
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dash-bottom-grid">
          {/* Clases Hoy */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="section-header">
              <h3 className="section-title-sm">
                Clases de Hoy{' '}
                <span
                  id="today-lbl"
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text2)',
                    marginLeft: '6px',
                  }}
                >
                  {td || 'Fin de semana'}
                </span>
              </h3>
            </div>
            <div
              id="today-list"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                flex: 1,
                overflowY: 'auto',
              }}
            >
              {academicClasses.map(({ s, sc }, i) => {
                const past = Math.floor(nowSec / 60) > t2m(sc.endTime);
                const inPrg =
                  Math.floor(nowSec / 60) >= t2m(sc.startTime) &&
                  Math.floor(nowSec / 60) < t2m(sc.endTime);
                
                const isEvent = sc.isEvent;
                const isCompleted = isEvent && eventCompletions.some(c => c.event_id === sc.id && c.date_str === getTodayStr());

                return (
                  <div
                    key={i}
                    className="today-row"
                    style={{
                      opacity: past || isCompleted ? 0.5 : 1,
                      borderLeft: `3px solid ${s.color || 'var(--primary)'}`,
                      cursor: isEvent ? 'pointer' : 'default'
                    }}
                    onClick={() => isEvent && handleToggleEvent(sc.id, isCompleted)}
                  >
                    {isEvent && (
                      <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                        {isCompleted ? <CheckCircle2 size={18} color="var(--primary)" /> : <Circle size={18} color="var(--text2)" />}
                      </div>
                    )}
                    <div style={{ flex: 1, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px' }}>
                        {sc.startTime}–{sc.endTime} · {sc.type} {s.room ? `· ${s.room}` : ''}
                      </div>
                    </div>
                    {inPrg && (
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(34,197,94,.15)',
                          color: '#4ade80',
                          border: '1px solid rgba(34,197,94,.3)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        EN CURSO
                      </span>
                    )}
                    {past && (
                      <span style={{ fontSize: '10px', color: 'var(--text2)' }}>
                        <CheckCircle2 size={14} />
                      </span>
                    )}
                  </div>
                );
              })}
              {todayClasses.length === 0 && (
                <div className="empty-st" style={{ padding: '24px 16px' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      padding: '0.75rem',
                      borderRadius: '50%',
                      background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                      color: 'var(--primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <Clock size={24} />
                  </div>
                  <div style={{ fontWeight: 600 }}>Sin clases hoy</div>
                </div>
              )}
            </div>
          </div>

          {/* Hábitos Diarios */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="section-header">
              <h3 className="section-title-sm">
                Hábitos y Rutinas
              </h3>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                flex: 1,
                overflowY: 'auto',
              }}
            >
              {dailyHabits.length === 0 ? (
                <div style={{ color: 'var(--text2)', fontSize: '11px', textAlign: 'center', marginTop: '16px' }}>
                  No tienes rutinas para hoy.
                </div>
              ) : (
                dailyHabits.map(({ s, sc }, i) => {
                  const isCompleted = eventCompletions.some(c => c.event_id === sc.id && c.date_str === getTodayStr());
                  return (
                    <div
                      key={i}
                      className="today-row"
                      style={{
                        opacity: isCompleted ? 0.5 : 1,
                        borderLeft: `3px solid ${s.color || 'var(--primary)'}`,
                        cursor: 'pointer',
                        padding: '10px 12px',
                        background: 'var(--bg)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onClick={() => handleToggleEvent(sc.id, isCompleted)}
                    >
                      <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                        {isCompleted ? <CheckCircle2 size={18} color="var(--primary)" /> : <Circle size={18} color="var(--text2)" />}
                      </div>
                      <div style={{ flex: 1, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{s.name}</div>
                        {sc.startTime && sc.endTime && (
                          <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px' }}>
                            {sc.startTime}–{sc.endTime} · {sc.type}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
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
            <div
              id="upcoming-list"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}
            >
              {tasks
                .filter((t) => !t.done)
                .sort((a, b) => {
                  if (!a.dueDate) return 1;
                  if (!b.dueDate) return -1;
                  return a.dueDate.localeCompare(b.dueDate);
                })
                .slice(0, 5)
                .map(renderTask)}
              {tasks.filter((t) => !t.done).length === 0 && (
                <div className="empty-st" style={{ padding: '24px 16px' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      padding: '0.75rem',
                      borderRadius: '50%',
                      background: 'rgba(74,222,128,.15)',
                      color: '#4ade80',
                      marginBottom: '0.5rem',
                    }}
                  >
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
