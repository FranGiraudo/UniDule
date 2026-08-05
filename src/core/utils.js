import { SVG_ICONS } from './icons.js';

export const t2m = t => { const [h,m]=t.split(':').map(Number); return h*60+m; };
export const m2t = m => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
export const t2y = (t, start, ppm) => (t2m(t) - t2m(start)) * ppm;
export const dur = (s, e, ppm) => (t2m(e) - t2m(s)) * ppm;

export function todayDay() { 
  return [null,'Lunes','Martes','Miércoles','Jueves','Viernes',null][new Date().getDay()] || null; 
}
export function nowMin() { 
  const n = new Date(); 
  return n.getHours()*60 + n.getMinutes(); 
}
export function isMobile() { 
  return window.innerWidth <= 768; 
}

export function formatDate(ds) {
  if (!ds) return 'Sin fecha';
  return new Date(ds+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'short',year:'numeric'});
}

export function daysUntil(ds) {
  if (!ds) return null;
  return Math.ceil((new Date(ds+'T12:00:00') - new Date()) / 86400000);
}

export function urgColor(d) {
  if (d===null) return 'var(--text2)';
  if (d<0||d<=2) return '#f87171';
  if (d<=7)  return '#fb923c';
  if (d<=14) return '#fbbf24';
  return '#34d399';
}

export function gid() { 
  return Date.now().toString(36) + Math.random().toString(36).slice(2,6); 
}

export function showToast(msg, type='success') {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'toast';
  el.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%) translateY(100px);
    background: ${type==='error'?'#ef4444':'var(--card2)'}; color: ${type==='error'?'#fff':'var(--text)'};
    padding: 12px 24px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    font-size: 14px; font-weight: 600; z-index: 10000; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex; align-items: center; gap: 8px; border: 1px solid var(--border);
  `;
  el.innerHTML = `
    <div style="width:20px;height:20px;border-radius:50%;background:${type==='error'?'#b91c1c':'rgba(16, 185, 129, 0.2)'};display:flex;align-items:center;justify-content:center;color:${type==='error'?'#fff':'#10b981'}">
      ${type==='error' ? SVG_ICONS.alert : SVG_ICONS.check}
    </div>
    ${msg}
  `;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.style.transform = 'translateX(-50%) translateY(0)');
  setTimeout(() => {
    el.style.transform = 'translateX(-50%) translateY(100px)';
    setTimeout(() => el.remove(), 400);
  }, 3500);
}

export function confirmDel(type, id) {
  const msg = type==='subject' ? '¿Eliminar materia y sus tareas?'
            : type==='task' ? '¿Eliminar tarea?'
            : '¿Eliminar calificación?';
  const titleEl = document.getElementById('confirm-title');
  const msgEl = document.getElementById('confirm-msg');
  const btnEl = document.getElementById('confirm-ok');
  if (titleEl) titleEl.innerHTML = `<span style="color:#ef4444">${SVG_ICONS.alert} Confirmar Eliminación</span>`;
  if (msgEl) msgEl.textContent = msg;
  if (btnEl) {
    btnEl.onclick = () => {
      if (type === 'subject' && window.delSubject) window.delSubject(id);
      else if (type === 'task' && window.delTask) window.delTask(id);
      closeM('modal-confirm');
    };
  }
  openM('modal-confirm');
}

export function openM(id) { const e = document.getElementById(id); if(e) e.style.display='flex'; }
export function closeM(id) { const e = document.getElementById(id); if(e) e.style.display='none'; }
export function closeBD(e, id) { if(e.target.id === id) closeM(id); }

window.openM = openM;
window.closeM = closeM;
window.closeBD = closeBD;
window.confirmDel = confirmDel;
window.gid = gid;
window.showToast = showToast;
