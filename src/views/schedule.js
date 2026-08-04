import { S, activeDay, setActiveDay } from '../core/state.js';
import { DAYS, DSHORT, GRID_START, GRID_END, PPM } from '../core/constants.js';
import { THEMES } from '../core/theme.js';
import { t2y, dur, t2m, m2t, daysUntil, formatDate, todayDay, nowMin, isMobile } from '../core/utils.js';
import { SVG_ICONS } from '../core/icons.js';

const GRID_H = (t2m(GRID_END) - t2m(GRID_START)) * PPM;
export function assignCols(blocks) {
  const sorted=[...blocks].sort((a,b)=>t2m(a.sc.startTime)-t2m(b.sc.startTime));
  const cols=[];
  const result=sorted.map(b=>{
    const st=t2m(b.sc.startTime);
    let col=cols.findIndex(e=>e<=st);
    if (col===-1){col=cols.length;cols.push(0);}
    cols[col]=t2m(b.sc.endTime);
    return {...b,col};
  });
  return result.map(b=>({...b,nCols:cols.length}));
}

export function setActiveDayGrid(day) {
  setActiveDay(day);
  renderSched();
}

export function renderSched() {
  const td=todayDay(), nowM=nowMin(), gs=t2m(GRID_START), tm=t2m(GRID_END)-gs;
  if (!activeDay) setActiveDay(td||'Lunes');

  const mobile=isMobile();

  // ── Legend (desktop only, rendered via HTML show/hide) ──
  const legendEl=document.getElementById('sched-legend');
  if (legendEl) {
    legendEl.innerHTML=S.subjects.filter(s=>s.schedules.length>0).map(s=>
      `<div class="legend-chip" style="background:${s.color}18;border:1px solid ${s.color}44;">
        <div style="width:7px;height:7px;border-radius:50%;background:${s.color};flex-shrink:0;"></div>
        <span style="color:${s.color};">${s.name}</span>
      </div>`).join('');
  }

  // ── Day tabs (mobile) ──
  const tabsEl=document.getElementById('day-tabs-bar');
  if (tabsEl) {
    tabsEl.innerHTML=DAYS.map((day,i)=>{
      const hasCls=S.subjects.some(s=>s.schedules.some(sc=>sc.day===day));
      const isAct =day===activeDay, isTd=day===td;
      return `<div class="day-tab ${isAct?'active':''} ${isTd?'today-tab':''}" onclick="setActiveDay('${day}')">
        <span>${DSHORT[i]}</span>
        <div class="day-tab-dot ${hasCls?'has-class':''}"></div>
      </div>`;
    }).join('');
  }

  // ── Time labels & hour lines ──
  let tlabels='', hlines='';
  for (let mn=0;mn<=tm;mn+=30) {
    const y=mn*PPM, isH=mn%60===0, ts=m2t(gs+mn);
    tlabels+=`<div style="position:absolute;top:${y-7}px;right:7px;font-size:${isH?10:9}px;font-weight:600;color:var(--text2);opacity:${isH?1:.45};">${ts}</div>`;
    hlines +=`<div style="position:absolute;top:${y}px;left:0;right:0;border-top:1px solid rgba(255,255,255,${isH?.06:.03});pointer-events:none;"></div>`;
  }

  if (mobile) {
    // ══ MOBILE: single day view ══
    const rawBlocks=[];
    S.subjects.forEach(s=>s.schedules.filter(sc=>sc.day===activeDay).forEach(sc=>rawBlocks.push({s,sc})));
    rawBlocks.sort((a,b)=>t2m(a.sc.startTime)-t2m(b.sc.startTime));

    if (!rawBlocks.length) {
      document.getElementById('sched-container').innerHTML=`
        <div class="empty-st" style="padding:40px 20px;">
          <div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);margin-bottom:0.5rem;">${SVG_ICONS.clock}</div>
          <div style="font-weight:700;">Sin clases ${activeDay==='Sábado'||activeDay==='Domingo'?'este día':'el '+activeDay}</div>
          <div style="font-size:12px;margin-top:6px;">¡Día libre!</div>
        </div>`;
      return;
    }

    const cards=rawBlocks.map(({s,sc})=>{
      const durationMin=t2m(sc.endTime)-t2m(sc.startTime);
      const isNow=nowM>=t2m(sc.startTime)&&nowM<t2m(sc.endTime)&&activeDay === td;
      return `
        <div class="mobile-class-card" style="border-left-color:${s.color};border-left-width:4px;${isNow?`background:${s.color}18;`:''}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
            <div style="font-size:15px;font-weight:800;color:${s.color};flex:1;">${s.name}</div>
            ${isNow?`<span class="badge" style="background:rgba(34,197,94,.15);color:#4ade80;border:1px solid rgba(34,197,94,.3);flex-shrink:0;">EN CURSO</span>`:''}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;font-size:11px;color:var(--text2);background:var(--card2);padding:8px 10px;border-radius:6px;margin-bottom:8px;">
            <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Horario</span><strong style="color:var(--text);">${sc.startTime} – ${sc.endTime}</strong> (${durationMin}m)</div>
            <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Aula / Sede</span><strong style="color:var(--text);">${s.room || '—'}</strong></div>
            <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Tipo</span><strong style="color:var(--text);">${sc.type || '—'}</strong></div>
            <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Docente</span><strong style="color:var(--text);">${s.professor || '—'}</strong></div>
            ${s.email?`<div style="grid-column:1/-1;"><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Contacto</span><a href="mailto:${s.email}" style="color:var(--primary);font-weight:600;">${s.email}</a></div>`:''}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:10px;color:var(--text2);">${s.code?`Cód. ${s.code}`:''}</span>
            <button class="btn btn-ghost btn-sm" onclick="openSubModal('${s.id}')" style="font-size:11px;">Editar Materia</button>
          </div>
        </div>`;
    }).join('');

    document.getElementById('sched-container').innerHTML=`
      <div style="padding:12px;">
        <div style="font-size:12px;color:var(--text2);margin-bottom:10px;font-weight:600;">${rawBlocks.length} clase${rawBlocks.length!==1?'s':''} · ${activeDay}${activeDay===td?' (hoy)':''}</div>
        ${cards}
      </div>`;

  } else {
    // ══ DESKTOP: full 6-day grid ══
    const dayCols=DAYS.map((day)=>{
      const isToday=day===td;
      const rawBlocks=[];
      S.subjects.forEach(s=>s.schedules.filter(sc=>sc.day===day).forEach(sc=>rawBlocks.push({s,sc})));
      const blocks=assignCols(rawBlocks);

      const bHtml=blocks.map(({s,sc,col,nCols})=>{
        const top=t2y(sc.startTime, GRID_START, PPM), h=dur(sc.startTime,sc.endTime, PPM);
        const w=100/nCols, lft=col*w;
        return `<div class="class-block"
          style="top:${top}px;height:${h}px;left:${3+lft*.97}%;right:${3+(100-lft-w)*.97}%;
          background:${s.color}1e;border-left:3px solid ${s.color};border-top:1px solid ${s.color}33;"
          onclick="showCP('${s.id}','${sc.id}',event)"
          title="${s.name} — ${sc.startTime} a ${sc.endTime}">
          <div class="cb-name" style="color:${s.color};">${s.name}</div>
          <div class="cb-type" style="color:${s.color}aa;">${sc.type}</div>
          ${h>55?`<div class="cb-room" style="color:${s.color}77;">${s.room}</div>`:''}
        </div>`;}).join('');

      let nowLine='';
      if (isToday&&nowM>=gs&&nowM<=gs+tm) {
        const y=t2y(m2t(nowM), GRID_START, PPM);
        nowLine=`<div class="now-line" style="top:${y}px;"><div class="now-dot"></div></div>`;
      }
      return `<div style="flex:1;min-width:0;position:relative;height:${GRID_H}px;border-left:1px solid var(--border);background:${isToday?'rgba(99,102,241,.03)':'transparent'};">${hlines}${bHtml}${nowLine}</div>`;
    }).join('');

    const headers=DAYS.map((d,i)=>`
      <div style="flex:1;min-width:0;padding:11px 6px;text-align:center;border-left:1px solid var(--border);
        font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;
        color:${d===td?'var(--primary)':'var(--text2)'};background:${d===td?'color-mix(in srgb, var(--primary) 4%, transparent)':'transparent'};">
        <div>${DSHORT[i]}</div>
        ${d===td?`<div style="width:5px;height:5px;background:var(--primary);border-radius:50%;margin:4px auto 0;box-shadow:0 0 6px var(--primary);"></div>`:''}
      </div>`).join('');

    document.getElementById('sched-container').innerHTML=`
      <div style="display:flex;border-bottom:1px solid var(--border);">
        <div style="min-width:54px;flex-shrink:0;"></div>
        <div style="flex:1;display:flex;">${headers}</div>
      </div>
      <div style="display:flex;">
        <div style="min-width:54px;width:54px;flex-shrink:0;background:var(--bg2);border-right:1px solid var(--border);z-index:2;height:${GRID_H}px;position:relative;">${tlabels}</div>
        <div style="flex:1;display:flex;min-width:0;">${dayCols}</div>
      </div>`;
  }
}

// Class popup (desktop)
export function showCP(sid,scid,e) {
  e.stopPropagation();
  const s=S.subjects.find(x=>x.id===sid); if(!s) return;
  const sc=s.schedules.find(x=>x.id===scid); if(!sc) return;
  const box=document.getElementById('class-popup-box');
  box.style.borderTop=`3px solid ${s.color}`;
  box.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
      <div style="font-size:14px;font-weight:800;color:${s.color};">${s.name}</div>
      ${s.code?`<span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;background:${s.color}18;color:${s.color};">Cód. ${s.code}</span>`:''}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;font-size:11px;color:var(--text2);background:var(--card2);padding:8px 10px;border-radius:6px;margin-bottom:8px;">
      <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Horario</span><strong style="color:var(--text);">${sc.day} ${sc.startTime}–${sc.endTime}</strong></div>
      <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Aula / Sede</span><strong style="color:var(--text);">${s.room || '—'}</strong></div>
      <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Modalidad</span><strong style="color:var(--text);">${sc.type || '—'}</strong></div>
      <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Docente</span><strong style="color:var(--text);">${s.professor || '—'}</strong></div>
      ${s.email?`<div style="grid-column:1/-1;"><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Contacto</span><a href="mailto:${s.email}" style="color:var(--primary);font-weight:600;">${s.email}</a></div>`:''}
    </div>
    <div style="margin-top:10px;display:flex;justify-content:flex-end;gap:6px;">
      <button class="btn btn-ghost btn-sm" style="font-size:11px;"
        onclick="document.getElementById('class-popup').style.display='none';openSubModal('${s.id}')">Editar Materia</button>
      <button class="btn btn-ghost btn-sm" style="font-size:11px;"
        onclick="document.getElementById('class-popup').style.display='none'">Cerrar</button>
    </div>`;
  const popup=document.getElementById('class-popup');
  popup.style.display='block';
  const r=e.currentTarget.getBoundingClientRect();
  popup.style.left=Math.min(r.left,window.innerWidth-240)+'px';
  popup.style.top=Math.max(10,r.top-10)+'px';
  popup.style.transform='translateY(-100%)';
}
document.addEventListener('click',()=>{ document.getElementById('class-popup').style.display='none'; });

// ═══════════════════════════════════════════════════════════
//  PDF EXPORT
// ═══════════════════════════════════════════════════════════
export function exportPDF() {
  const win=window.open('','_blank','width=900,height=700');
  if (!win) { alert('Permití popups para exportar el PDF.'); return; }

  // Build a day→classes map
  const byDay={};
  DAYS.forEach(d=>{ byDay[d]=[]; });
  S.subjects.forEach(s=>{
    s.schedules.forEach(sc=>{
      byDay[sc.day].push({...sc,subName:s.name,subColor:s.color,prof:s.professor,room:s.room,code:s.code});
    });
  });
  DAYS.forEach(d=>byDay[d].sort((a,b)=>t2m(a.startTime)-t2m(b.startTime)));

  // Build tasks section
  const pending=[...S.tasks].filter(t=>!t.done).sort((a,b)=>(a.dueDate||'9999')<(b.dueDate||'9999')?-1:1);

  const taskRows=pending.map(t=>{
    const sub=S.subjects.find(s=>s.id===t.subjectId);
    const d=daysUntil(t.dueDate);
    const urg=d===null?'':d<0?'VENCIDA':d===0?'HOY':d<=7?'≤7d':'OK';
    return `<tr>
      <td>${t.title}</td>
      <td>${sub?sub.name:'—'}</td>
      <td>${t.type}</td>
      <td>${formatDate(t.dueDate)}</td>
      <td>${urg} ${d===null?'':d<0?`hace ${Math.abs(d)}d`:d===0?'Hoy':`${d}d`}</td>
    </tr>`;
  }).join('');

  // Build schedule columns
  const dayCols=DAYS.map(day=>{
    const classes=byDay[day];
    const cells=classes.length
      ? classes.map(c=>`
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

  const now=new Date().toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'});
  const themeColor = THEMES[S.profile?.theme] ? THEMES[S.profile.theme].primary : '#6366f1';

  win.document.write(`<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Horario IUA — Ingeniería en Informática</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; padding: 32px 28px; }
      h1   { font-size: 22px; font-weight: 900; color: #1a1a2e; letter-spacing: -.02em; }
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
        <div class="sub">Ingeniería en Informática · IUA · 2do Semestre 2026</div>
        <div class="sub">Generado el ${now}</div>
      </div>
      <div>
        <div class="badge-utn">UniDule</div>
        <div style="margin-top:8px;text-align:right;">
          <button class="no-print" onclick="window.print()" style="background:${themeColor};color:#fff;border:none;padding:7px 16px;border-radius:7px;cursor:pointer;font-weight:700;font-size:12px;">Guardar como PDF</button>
        </div>
      </div>
    </div>

    <div class="section-title">Horario Semanal</div>
    <table class="sched"><tr>${dayCols}</tr></table>

    ${pending.length?`
    <div class="section-title">Tareas & Exámenes Pendientes (${pending.length})</div>
    <table class="tasks">
      <thead><tr><th>Título</th><th>Materia</th><th>Tipo</th><th>Fecha</th><th>Urgencia</th></tr></thead>
      <tbody>${taskRows}</tbody>
    </table>`:''}

    <div class="footer">
      <span>UniDule · IUA Ingeniería en Informática</span>
      <span>${now}</span>
    </div>
  </body></html>`);
  win.document.close();
  win.focus();
}


window.setActiveDay = setActiveDayGrid;
window.renderSched = renderSched;
window.showCP = showCP;
window.exportPDF = exportPDF;
