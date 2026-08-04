import { S } from '../core/state.js';
import { TYPE_ICON, TYPE_FG, TYPE_BG, DAYS, EXAM_TYPES } from '../core/constants.js';
import { todayDay, nowMin, t2m, m2t, dur, daysUntil, urgColor, formatDate } from '../core/utils.js';
import { SVG_ICONS } from '../core/icons.js';
import { renderView, updateDate } from '../core/router.js';
import { toggleTask } from './tasks.js';
import { ensureCareerLoaded } from './career.js';

export function getNextClass() {
  const today=todayDay(), now=nowMin(), secs=new Date().getSeconds();
  const todays=[];
  S.subjects.forEach(s => s.schedules.filter(sc=>sc.day===today).forEach(sc=>todays.push({s,sc})));
  todays.sort((a,b)=>t2m(a.sc.startTime)-t2m(b.sc.startTime));
  for (const {s,sc} of todays) {
    const st=t2m(sc.startTime), en=t2m(sc.endTime);
    if (now>=st&&now<en) return {s,sc,status:'inProgress',sec:(en-now)*60-secs};
    if (now<st)          return {s,sc,status:'upcoming',  sec:(st-now)*60-secs};
  }
  if (!today) return null;
  for (let off=1;off<=6;off++) {
    const nd=DAYS[(DAYS.indexOf(today)+off)%DAYS.length];
    const nb=[];
    S.subjects.forEach(s=>s.schedules.filter(sc=>sc.day===nd).forEach(sc=>nb.push({s,sc})));
    if (!nb.length) continue;
    nb.sort((a,b)=>t2m(a.sc.startTime)-t2m(b.sc.startTime));
    const {s,sc}=nb[0];
    return {s,sc,status:'nextDay',sec:(off*1440+t2m(sc.startTime)-now)*60-secs,nextDay:nd};
  }
  return null;
}

let _lastNcKey='';
export function renderNC() {
  const nc=getNextClass(), el=document.getElementById('nc-content');
  if (!el) return;
  if (!nc) {
    el.innerHTML=`<div style="text-align:center;padding:10px;">
      <div style="display:inline-flex;padding:0.6rem;border-radius:50%;background:rgba(74,222,128,.15);color:#4ade80;margin-bottom:5px;">${SVG_ICONS.check}</div>
      <div style="font-weight:700;">Sin clases programadas</div>
      <div style="font-size:11px;color:var(--text2);margin-top:2px;">Agrega horarios para ver el countdown.</div>
    </div>`;
    return;
  }
  const {s,sc,status,sec,nextDay}=nc;
  const h=Math.floor(Math.max(0,sec)/3600), m=Math.floor((Math.max(0,sec)%3600)/60), ss=Math.floor(Math.max(0,sec)%60);
  const pad=n=>String(n).padStart(2,'0');
  const statusTxt = status==='inProgress'?'● EN CURSO AHORA':status==='upcoming'?'PRÓXIMA CLASE HOY':`PRÓXIMA — ${(nextDay||'').toUpperCase()}`;
  const cdLabel   = status==='inProgress'?'Finaliza en':'Empieza en';
  const key=s.id+status;
  if (key!==_lastNcKey) {
    _lastNcKey=key;
    el.innerHTML=`
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div style="flex:1;min-width:160px;">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(165,180,252,.7);margin-bottom:6px;">${statusTxt}</div>
          <div style="font-size:20px;font-weight:900;letter-spacing:-.03em;color:${s.color};margin-bottom:4px;">${s.name}</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:11px;color:var(--text2);align-items:center;">
            <span style="display:inline-flex;align-items:center;gap:3px;">${SVG_ICONS.target} ${s.room || 'Aula'}</span>
            <span style="display:inline-flex;align-items:center;gap:3px;">${SVG_ICONS.clock} ${sc.startTime}–${sc.endTime}</span>
            <span style="padding:1px 6px;border-radius:5px;background:rgba(255,255,255,.08);font-size:10px;font-weight:600;">${sc.type}</span>
          </div>
        </div>
        <div>
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(165,180,252,.7);text-align:center;margin-bottom:6px;">${cdLabel}</div>
          <div style="display:flex;gap:5px;align-items:center;">
            <div class="cd-unit"><div class="cd-num" id="cd-h">${pad(h)}</div><div class="cd-lbl">hrs</div></div>
            <div class="cd-sep">:</div>
            <div class="cd-unit"><div class="cd-num" id="cd-m">${pad(m)}</div><div class="cd-lbl">min</div></div>
            <div class="cd-sep">:</div>
            <div class="cd-unit"><div class="cd-num" id="cd-s">${pad(ss)}</div><div class="cd-lbl">seg</div></div>
          </div>
        </div>
      </div>`;
  } else {
    const hE=document.getElementById('cd-h'), mE=document.getElementById('cd-m'), sE=document.getElementById('cd-s');
    if (hE) { hE.textContent=pad(h); mE.textContent=pad(m); sE.textContent=pad(ss); }
  }
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════
export function renderDash() {
  ensureCareerLoaded();
  _lastNcKey=''; renderNC(); updateDate();
  const td=todayDay(), now=nowMin();
  const pending=S.tasks.filter(t=>!t.done).length;
  const todayC=td?S.subjects.reduce((a,s)=>a+s.schedules.filter(sc=>sc.day===td).length,0):0;
  const warnSubs=S.subjects.filter(s=>s.absences>=s.maxAbsences*.75);
  const warn=warnSubs.length;

  document.getElementById('stats-grid').innerHTML=`
    <div class="stat-card"><div class="stat-icon" style="background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);">${SVG_ICONS.book}</div><div class="stat-value gradient-text">${S.subjects.length}</div><div class="stat-label">Materias</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(245,158,11,.15);color:#fbbf24;">${SVG_ICONS.check}</div><div class="stat-value" style="color:#fbbf24;">${pending}</div><div class="stat-label">Pendientes</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(34,197,94,.15);color:#34d399;">${SVG_ICONS.clock}</div><div class="stat-value" style="color:#34d399;">${todayC}</div><div class="stat-label">Hoy</div></div>
    <div class="stat-card stat-card-alert">
      <div class="stat-icon" style="background:rgba(239,68,68,.15);color:#f87171;">${SVG_ICONS.alert}</div>
      <div class="stat-value" style="color:${warn?'#f87171':'#34d399'};">${warn}</div>
      <div class="stat-label">Alertas</div>
      ${warn ? `
        <div class="alert-tooltip">
          <div style="font-weight:800;font-size:11px;margin-bottom:4px;color:#f87171;">Materias en riesgo de ausencias:</div>
          ${warnSubs.map(s => `<div style="font-size:10px;margin-top:2px;">• <strong>${s.name}</strong> (${s.absences}/${s.maxAbsences} faltas)</div>`).join('')}
        </div>
      ` : `
        <div class="alert-tooltip">
          <div style="font-weight:700;font-size:10px;color:#4ade80;">Sin alertas de ausencias</div>
        </div>
      `}
    </div>`;

  document.getElementById('today-lbl').textContent=td||'Fin de semana';
  const blocks=[];
  if (td) S.subjects.forEach(s=>s.schedules.filter(sc=>sc.day===td).forEach(sc=>blocks.push({s,sc})));
  blocks.sort((a,b)=>t2m(a.sc.startTime)-t2m(b.sc.startTime));

  document.getElementById('today-list').innerHTML=blocks.length
    ? blocks.map(({s,sc})=>{
        const past=now>t2m(sc.endTime), inPrg=now>=t2m(sc.startTime)&&now<t2m(sc.endTime);
        return `<div class="today-row" style="opacity:${past?.5:1};border-left:3px solid ${s.color};">
          <div style="flex:1;"><div style="font-weight:700;font-size:13px;">${s.name}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:2px;">${sc.startTime}–${sc.endTime} · ${sc.type} · ${s.room}</div></div>
          ${inPrg?`<span class="badge" style="background:rgba(34,197,94,.15);color:#4ade80;border:1px solid rgba(34,197,94,.3);white-space:nowrap;">EN CURSO</span>`:''}
          ${past?`<span style="font-size:10px;color:var(--text2);">${SVG_ICONS.check}</span>`:''}
        </div>`;}).join('')
    : `<div class="empty-st" style="padding:24px 16px;"><div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);margin-bottom:0.5rem;">${SVG_ICONS.clock}</div><div style="font-weight:600;">Sin clases hoy</div></div>`;

  const ups=[...S.tasks].filter(t=>!t.done).sort((a,b)=>(a.dueDate||'9999')<(b.dueDate||'9999')?-1:1).slice(0,5);
  document.getElementById('upcoming-list').innerHTML=ups.length
    ? ups.map(t=>{
        const sub=S.subjects.find(s=>s.id===t.subjectId), d=daysUntil(t.dueDate);
        const isExam = EXAM_TYPES.has(t.type) || (t.type && (t.type.toLowerCase().includes('parcial') || t.type.toLowerCase().includes('final') || t.type.toLowerCase().includes('examen')));
        const isUrgentExam = isExam && d !== null && d >= 0 && d <= 3;
        const isOverdue = d !== null && d < 0;

        let badgeStyle = `background:${urgColor(d)}1c;color:${urgColor(d)};border:1px solid ${urgColor(d)}33;`;
        let cardStyle = '';
        let statusLabel = d===null?'—':d<0?'Vencida':d===0?'Hoy':`${d}d`;

        if (isUrgentExam) {
          badgeStyle = `background:rgba(249,115,22,.25);color:#ffedd5;border:1px solid #f97316;box-shadow:0 0 8px rgba(249,115,22,.4);font-weight:800;`;
          cardStyle = `background:rgba(249,115,22,.08);border-left:3px solid #f97316;`;
          statusLabel = d===0 ? '¡RINDES HOY!' : `¡EXAMEN EN ${d}D!`;
        } else if (isOverdue) {
          cardStyle = `background:rgba(239,68,68,.06);border-left:3px solid #ef4444;`;
        }

        return `<div class="upcoming-item" style="${cardStyle}">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <div>
              <div style="font-size:13px;font-weight:700;">${t.title}</div>
              ${sub?`<div style="margin-top:3px;"><span class="badge" style="background:${sub.color}18;color:${sub.color};">${sub.name}</span></div>`:``}
            </div>
            <div style="text-align:right;flex-shrink:0;">
              <span class="badge" style="${badgeStyle}font-size:10px;">${statusLabel}</span>
              <div style="font-size:10px;color:var(--text2);margin-top:2px;">${formatDate(t.dueDate)}</div>
            </div>
          </div></div>`;}).join('')
    : `<div class="empty-st" style="padding:24px 16px;"><div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:rgba(74,222,128,.15);color:#4ade80;margin-bottom:0.5rem;">${SVG_ICONS.check}</div><div style="font-weight:600;">Sin pendientes</div></div>`;
}



window.renderDash = renderDash;

import { currentView } from '../core/state.js';
setInterval(() => {
  if (currentView === 'dashboard') renderNC();
}, 1000);
