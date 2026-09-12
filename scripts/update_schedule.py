import re

def update_schedule(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace(
        "import { todayDay, nowMin, t2m, m2t, t2y, dur, escapeHtml } from '../shared/lib/utils';",
        "import { todayDay, nowMin, t2m, m2t, t2y, dur, escapeHtml } from '../shared/lib/utils';\nimport { ChevronLeft, ChevronRight } from 'lucide-react';"
    )

    date_helpers = """
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const getStartOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};
const getDaysOfWeek = (start: Date) => Array.from({ length: 7 }).map((_, i) => {
  const d = new Date(start);
  d.setDate(start.getDate() + i);
  return d;
});
const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const getStartOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
"""
    content = content.replace("const GRID_H = (t2m(GRID_END) - t2m(GRID_START)) * PPM;", "const GRID_H = (t2m(GRID_END) - t2m(GRID_START)) * PPM;\n" + date_helpers)

    state_repl = """  const [activeDay, setActiveDay] = useState(todayDay() || 'Lunes');
  const [now, setNow] = useState(nowMin());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);"""
    
    new_state = """  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [activeDate, setActiveDate] = useState(new Date());
  const [now, setNow] = useState(nowMin());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const weekStart = getStartOfWeek(currentDate);
  const weekDates = getDaysOfWeek(weekStart);"""
    content = content.replace(state_repl, new_state)

    get_blocks_old = """  const getBlocksForDay = (day: string) => {
    const blocks: { s: any; sc: any }[] = [];
    subjects.forEach((s) => {
      s.schedules
        ?.filter((sc) => sc.day === day)
        .forEach((sc) => {
          blocks.push({ s, sc });
        });
    });

    const dayIndex = DAYS.indexOf(day) + 1;
    const userEvents = useStore.getState().userEvents;
    
    userEvents.forEach((e) => {
      let shouldShow = false;
      if (e.isRecurring) {
        if (e.dayOfWeek === dayIndex) shouldShow = true;
      } else if (e.date) {
        const parts = e.date.split('-');
        if (parts.length === 3) {
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          let jsDay = d.getDay();
          let myDay = jsDay === 0 ? 7 : jsDay;
          if (myDay === dayIndex) shouldShow = true;
        }
      }

      if (shouldShow) {
        blocks.push({
          s: { name: e.title, color: e.color || '#a855f7', room: '' },
          sc: { 
            startTime: e.startTime, 
            endTime: e.endTime, 
            type: e.category.charAt(0).toUpperCase() + e.category.slice(1) 
          }
        });
      }
    });

    return blocks.sort((a, b) => t2m(a.sc.startTime) - t2m(b.sc.startTime));
  };"""

    get_blocks_new = """  const getBlocksForDate = (date: Date) => {
    const blocks: { s: any; sc: any }[] = [];
    const jsDay = date.getDay();
    const myDay = jsDay === 0 ? 7 : jsDay;
    const dayName = DAYS[myDay - 1];
    const dateStr = toYMD(date);

    subjects.forEach((s) => {
      s.schedules
        ?.filter((sc) => sc.day === dayName || sc.day === myDay)
        .forEach((sc) => {
          blocks.push({ s, sc });
        });
    });

    const userEvents = useStore.getState().userEvents;
    
    userEvents.forEach((e) => {
      let shouldShow = false;
      if (e.isRecurring) {
        if (e.dayOfWeek === myDay) shouldShow = true;
      } else if (e.date === dateStr) {
        shouldShow = true;
      }

      if (shouldShow) {
        blocks.push({
          s: { name: e.title, color: e.color || '#a855f7', room: '' },
          sc: { 
            startTime: e.startTime, 
            endTime: e.endTime, 
            type: e.category.charAt(0).toUpperCase() + e.category.slice(1) 
          }
        });
      }
    });

    return blocks.sort((a, b) => t2m(a.sc.startTime) - t2m(b.sc.startTime));
  };"""
    content = content.replace(get_blocks_old, get_blocks_new)

    header_old = """      <header
        className="view-header"
        style={{
          marginBottom: '16px',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <h2 className="view-title">Horarios</h2>
          <p className="view-sub">Grilla semanal de clases</p>
        </div>
        <button onClick={exportPDF} className="btn btn-primary btn-sm" style={{ fontWeight: 600 }}>
          Exportar PDF
        </button>
      </header>"""

    header_new = """      <header
        className="view-header"
        style={{
          marginBottom: '16px',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 className="view-title">Horarios</h2>
          <p className="view-sub">
            {viewMode === 'week' ? `Semana del ${weekDates[0].getDate()} de ${MONTHS[weekDates[0].getMonth()]}` : `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border)' }}>
            <button
              onClick={() => setViewMode('week')}
              style={{
                padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: 'none',
                background: viewMode === 'week' ? 'var(--bg3)' : 'transparent',
                color: viewMode === 'week' ? 'var(--text)' : 'var(--text2)',
                cursor: 'pointer'
              }}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              style={{
                padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: 'none',
                background: viewMode === 'month' ? 'var(--bg3)' : 'transparent',
                color: viewMode === 'month' ? 'var(--text)' : 'var(--text2)',
                cursor: 'pointer'
              }}
            >
              Mes
            </button>
          </div>
          
          <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <button
              onClick={() => {
                const d = new Date(currentDate);
                if (viewMode === 'week') d.setDate(d.getDate() - 7);
                else d.setMonth(d.getMonth() - 1);
                setCurrentDate(d);
                if (viewMode === 'week') {
                  const ad = new Date(activeDate);
                  ad.setDate(ad.getDate() - 7);
                  setActiveDate(ad);
                }
              }}
              style={{ padding: '6px', background: 'transparent', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                setActiveDate(today);
              }}
              style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, background: 'transparent', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)' }}
            >
              Hoy
            </button>
            <button
              onClick={() => {
                const d = new Date(currentDate);
                if (viewMode === 'week') d.setDate(d.getDate() + 7);
                else d.setMonth(d.getMonth() + 1);
                setCurrentDate(d);
                if (viewMode === 'week') {
                  const ad = new Date(activeDate);
                  ad.setDate(ad.getDate() + 7);
                  setActiveDate(ad);
                }
              }}
              style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button onClick={exportPDF} className="btn btn-primary btn-sm" style={{ fontWeight: 600 }}>
            PDF
          </button>
        </div>
      </header>"""
    content = content.replace(header_old, header_new)

    mobile_tabs_old = """      {/* MOBILE TABS */}
      {isMobile && (
        <div
          className="day-tabs-bar"
          id="day-tabs-bar"
          style={{ flexShrink: 0, marginBottom: '12px' }}
        >
          {DAYS.map((day, i) => {
            const hasCls = subjects.some((s) => s.schedules?.some((sc) => sc.day === day));
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
      )}"""
      
    mobile_tabs_new = """      {/* MOBILE TABS */}
      {isMobile && viewMode === 'week' && (
        <div
          className="day-tabs-bar"
          id="day-tabs-bar"
          style={{ flexShrink: 0, marginBottom: '12px' }}
        >
          {weekDates.map((date, i) => {
            const hasCls = getBlocksForDate(date).length > 0;
            const isToday = isSameDay(date, new Date());
            const isActive = isSameDay(date, activeDate);
            return (
              <div
                key={i}
                className={`day-tab ${isActive ? 'active' : ''} ${isToday ? 'today-tab' : ''}`}
                onClick={() => setActiveDate(date)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
              >
                <span>{DSHORT[i]}</span>
                <span style={{ fontSize: '13px', fontWeight: isActive ? 800 : 600 }}>{date.getDate()}</span>
                <div className={`day-tab-dot ${hasCls ? 'has-class' : ''}`}></div>
              </div>
            );
          })}
        </div>
      )}"""
    content = content.replace(mobile_tabs_old, mobile_tabs_new)

    content = content.replace("getBlocksForDay(activeDay)", "getBlocksForDate(activeDate)")
    content = content.replace("activeDay === td", "isSameDay(activeDate, new Date())")
    
    content = content.replace("activeDay === 'Sábado' || activeDay === 'Domingo'", "activeDate.getDay() === 0 || activeDate.getDay() === 6")
    content = content.replace("el ' + activeDay", "el ' + activeDate.toLocaleDateString('es-AR', { weekday: 'long' })")

    desk_headers_old = """            {/* DESKTOP HEADERS */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', paddingRight: '6px' }}>
              <div style={{ minWidth: '54px', flexShrink: 0 }}></div>
              <div style={{ flex: 1, display: 'flex' }}>
                {DAYS.map((d, i) => (
                  <div
                    key={d}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: '11px 6px',
                      textAlign: 'center',
                      borderLeft: '1px solid var(--border)',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.05em',
                      color: d === td ? 'var(--primary)' : 'var(--text2)',
                      background:
                        d === td
                          ? 'color-mix(in srgb, var(--primary) 4%, transparent)'
                          : 'transparent',
                    }}
                  >
                    <div>{DSHORT[i]}</div>
                    {d === td && (
                      <div
                        style={{
                          width: '5px',
                          height: '5px',
                          background: 'var(--primary)',
                          borderRadius: '50%',
                          margin: '4px auto 0',
                          boxShadow: '0 0 6px var(--primary)',
                        }}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>"""

    desk_headers_new = """            {/* DESKTOP HEADERS */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', paddingRight: '6px' }}>
              <div style={{ minWidth: '54px', flexShrink: 0 }}></div>
              <div style={{ flex: 1, display: 'flex' }}>
                {weekDates.map((date, i) => {
                  const isToday = isSameDay(date, new Date());
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        padding: '8px 6px',
                        textAlign: 'center',
                        borderLeft: '1px solid var(--border)',
                        color: isToday ? 'var(--primary)' : 'var(--text2)',
                        background: isToday ? 'color-mix(in srgb, var(--primary) 4%, transparent)' : 'transparent',
                      }}
                    >
                      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        {DSHORT[i]}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: isToday ? 800 : 500, marginTop: '2px' }}>
                        {date.getDate()}
                      </div>
                      {isToday && (
                        <div
                          style={{
                            width: '5px',
                            height: '5px',
                            background: 'var(--primary)',
                            borderRadius: '50%',
                            margin: '4px auto 0',
                            boxShadow: '0 0 6px var(--primary)',
                          }}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>"""
    content = content.replace(desk_headers_old, desk_headers_new)

    desk_grid_loop_old = """                {DAYS.map((day) => {
                  const isToday = day === td;
                  const blocks = assignCols(getBlocksForDay(day));"""
    
    desk_grid_loop_new = """                {weekDates.map((date, idx) => {
                  const isToday = isSameDay(date, new Date());
                  const blocks = assignCols(getBlocksForDate(date));"""
    content = content.replace(desk_grid_loop_old, desk_grid_loop_new)
    
    content = content.replace(
        "key={day}\n                      style={{",
        "key={idx}\n                      style={{"
    )

    month_view_func = """
  const renderMonthView = () => {
    const monthStart = getStartOfMonth(currentDate);
    const startDay = monthStart.getDay();
    const prefixDays = startDay === 0 ? 6 : startDay - 1;
    const daysInMonth = getDaysInMonth(currentDate);
    
    const days = [];
    for (let i = 0; i < prefixDays; i++) {
      const d = new Date(monthStart);
      d.setDate(d.getDate() - (prefixDays - i));
      days.push({ date: d, currentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(monthStart);
      d.setDate(i);
      days.push({ date: d, currentMonth: true });
    }
    const suffixDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= suffixDays; i++) {
      const d = new Date(monthStart);
      d.setDate(daysInMonth + i);
      days.push({ date: d, currentMonth: false });
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {DSHORT.map((d) => (
            <div key={d} style={{ padding: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text2)' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr', flex: 1, minHeight: 0 }}>
          {days.map((dayObj, i) => {
            const isToday = isSameDay(dayObj.date, new Date());
            const blocks = getBlocksForDate(dayObj.date);
            const maxBlocks = isMobile ? 3 : 5;
            
            return (
              <div 
                key={i} 
                onClick={() => {
                  setCurrentDate(dayObj.date);
                  setActiveDate(dayObj.date);
                  setViewMode('week');
                }}
                style={{ 
                  borderRight: '1px solid var(--border)', 
                  borderBottom: '1px solid var(--border)', 
                  padding: '4px',
                  background: isToday ? 'rgba(99,102,241,.05)' : dayObj.currentMonth ? 'transparent' : 'var(--bg2)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: isToday ? 800 : 500, 
                  color: isToday ? 'var(--primary)' : dayObj.currentMonth ? 'var(--text)' : 'var(--text3)',
                  marginBottom: '4px',
                  textAlign: 'center',
                  background: isToday ? 'var(--primary)' : 'transparent',
                  width: '24px', height: '24px', lineHeight: '24px', borderRadius: '50%', margin: '0 auto 4px'
                }}>
                  <span style={{ color: isToday ? '#fff' : 'inherit' }}>{dayObj.date.getDate()}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                  {blocks.slice(0, maxBlocks).map((b, bi) => (
                    <div key={bi} style={{ 
                      fontSize: '9px', 
                      background: `${b.s.color}1e`, 
                      color: b.s.color,
                      padding: '2px 4px', 
                      borderRadius: '4px',
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      fontWeight: 600
                    }}>
                      {b.s.name}
                    </div>
                  ))}
                  {blocks.length > maxBlocks && (
                    <div style={{ fontSize: '9px', color: 'var(--text3)', textAlign: 'center', fontWeight: 600 }}>
                      +{blocks.length - maxBlocks} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
"""
    # Specifically insert before the MAIN component return
    main_return = """  return (
    <div
      className="view-content fade-in"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >"""
    content = content.replace(main_return, month_view_func + "\n" + main_return)
    content = content.replace("{isMobile ?", "{viewMode === 'month' ? renderMonthView() : isMobile ?")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_schedule('/home/frangiraudo/Proyectos/UniDule/src/pages/Schedule.tsx')
