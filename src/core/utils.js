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

export function confirmDel(type, id, onConfirm) {
  const msg = type==='subject' ? '¿Eliminar materia y sus tareas?'
            : type==='task' ? '¿Eliminar tarea?'
            : '¿Eliminar calificación?';
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-title" style="color:#ef4444">${SVG_ICONS.alert} Confirmar Eliminación</div>
      <p style="font-size:14px;color:var(--text);margin-top:10px;">${msg}</p>
      <div style="display:flex;gap:12px;margin-top:20px;">
        <button class="btn btn-ghost" style="flex:1" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-primary" style="flex:1;background:#ef4444;color:#fff" onclick="window.__confirmDel_cb(); this.closest('.modal-overlay').remove()">Eliminar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  window.__confirmDel_cb = () => {
    onConfirm(id);
    delete window.__confirmDel_cb;
  };
}

export function openM(id) { const e = document.getElementById(id); if(e) e.style.display='flex'; }
export function closeM(id) { const e = document.getElementById(id); if(e) e.style.display='none'; }

window.openM = openM;
window.closeM = closeM;
window.confirmDel = confirmDel;
window.gid = gid;
window.showToast = showToast;
