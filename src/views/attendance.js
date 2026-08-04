import { S } from '../core/state.js';
import { renderSubs } from './subjects.js';
export function renderAtt() {
  const grid=document.getElementById('att-grid');
  if (!S.subjects.length) { grid.innerHTML=`<div class="empty-st" style="grid-column:1/-1;"><div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);margin-bottom:0.5rem;">${SVG_ICONS.chart}</div><div>Sin materias.</div></div>`; return; }
  grid.innerHTML=S.subjects.map(s=>{
    const pct=s.maxAbsences>0?s.absences/s.maxAbsences:0;
    const bc=pct>=1?'#ef4444':pct>=.75?'#f97316':pct>=.5?'#f59e0b':'#22c55e';
    const rem=Math.max(0,s.maxAbsences-s.absences);
    const pipW=Math.max(6,Math.min(24,Math.floor(192/s.maxAbsences)));
    const pips=Array.from({length:s.maxAbsences},(_,i)=>`<div class="pip" style="width:${pipW}px;background:${i<s.absences?bc:'rgba(255,255,255,.08)'};"></div>`).join('');
    const statusLabel = pct>=1?'LÍMITE ALCANZADO':pct>=.75?`Quedan ${rem} ausencias`:`${rem} disponibles`;
    return `<div class="att-card" style="border-top:3px solid ${s.color};">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <div><div style="font-size:14px;font-weight:800;">${s.name}</div>
        <div style="font-size:10px;color:var(--text2);margin-top:2px;">Máx: ${s.maxAbsences} ausencias</div></div>
        <div style="text-align:center;">
          <div style="font-size:34px;font-weight:900;line-height:1;color:${bc};">${s.absences}</div>
          <div style="font-size:9px;color:var(--text2);font-weight:700;text-transform:uppercase;">ausencias</div>
        </div>
      </div>
      <div class="abs-bar-bg" style="margin-bottom:8px;"><div class="abs-bar-fill" style="width:${Math.min(100,pct*100)}%;background:linear-gradient(90deg,${s.color},${bc});"></div></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
        <span style="display:inline-flex;align-items:center;gap:0.3rem;font-size:11px;color:${bc};font-weight:600;">${pct>=.75?SVG_ICONS.alert:SVG_ICONS.check} ${statusLabel}</span>
        <span style="font-size:10px;color:var(--text2);">${Math.round(pct*100)}%</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <button class="btn-abs" onclick="chgAbs('${s.id}',-1)" ${s.absences<=0?'disabled':''} style="color:${s.absences>0?'#f87171':'inherit'};">−</button>
        <div class="pip-dots">${pips}</div>
        <button class="btn-abs" onclick="chgAbs('${s.id}',1)" ${s.absences>=s.maxAbsences?'disabled':''} style="color:${s.absences<s.maxAbsences?'#34d399':'inherit'};">+</button>
      </div>
      ${s.schedules.length?`<div style="margin-top:11px;padding-top:11px;border-top:1px solid var(--border);">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text2);margin-bottom:5px;">Horarios</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">${s.schedules.map(sc=>`<span class="sched-chip" style="font-size:10px;">${sc.day.slice(0,3)} ${sc.startTime}–${sc.endTime}</span>`).join('')}</div>
      </div>`:''}
    </div>`;
  }).join('');
}
function chgAbs(id,d){ const s=S.subjects.find(x=>x.id===id); if(s){s.absences=Math.max(0,Math.min(s.maxAbsences,s.absences+d));save();if(window.api)window.api.saveActiveSubject(s).catch(console.error);renderAtt();} }


window.renderAtt = renderAtt;

window.chgAbs = chgAbs;
