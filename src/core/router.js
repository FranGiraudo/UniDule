import { currentView, setCurrentView, sbOpen, setSbOpen } from './state.js';
import { SVG_ICONS } from './icons.js';
import { renderDash } from '../views/dashboard.js';
import { renderSched } from '../views/schedule.js';
import { renderSubs, openSubModal } from '../views/subjects.js';
import { renderTasks, openTaskModal } from '../views/tasks.js';
import { renderAtt } from '../views/attendance.js';
import { renderCareer } from '../views/career.js';
import { renderSettings } from '../views/settings.js';

const TITLES    = {dashboard:'Dashboard',schedule:'Horario Semanal',subjects:'Materias',tasks:'Tareas & Exámenes',attendance:'Asistencia',career:'Plan de Carrera',settings:'Configuración & Perfil'};
const ADD_VIEWS = {subjects:true,tasks:true};
const ADD_LBL   = {subjects:'Materia',tasks:'Tarea'};

export function navigate(v) {
  setCurrentView(v);
  document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
  document.getElementById('view-'+v).classList.add('active');
  // Sidebar desktop nav
  document.querySelectorAll('.nav-item[data-view]').forEach(x =>
    x.classList.toggle('active', x.dataset.view === v)
  );
  // Bottom nav mobile
  document.querySelectorAll('.bnav-item[data-view]').forEach(x =>
    x.classList.toggle('active', x.dataset.view === v)
  );
  document.getElementById('topbar-title').textContent = TITLES[v]||v;
  renderView(v);
  updateDate();
  // Close mobile sidebar if open
  closeMobileSidebar();
}

export function handleTopbarAdd() {
  if (currentView === 'subjects') openSubModal();
  else if (currentView === 'tasks') openTaskModal();
}

export function toggleSidebar() {
  setSbOpen(!sbOpen);
  document.getElementById('sidebar').classList.toggle('open', sbOpen);
  document.getElementById('sb-icon').innerHTML = sbOpen
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
}

export function toggleMobileSidebar() {
  const sb  = document.getElementById('sidebar');
  const ovr = document.getElementById('mobile-overlay');
  const open = sb.classList.toggle('mobile-open');
  ovr.style.display = open ? 'block' : 'none';
}
export function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('mobile-overlay').style.display = 'none';
}

// ═══════════════════════════════════════════════════════════
//  RENDER DISPATCHER
// ═══════════════════════════════════════════════════════════
export function renderView(v) {
  ({dashboard:renderDash, schedule:renderSched, subjects:renderSubs,
    tasks:renderTasks, attendance:renderAtt, career:renderCareer, settings:renderSettings}[v] || (()=>{}))();
}
export function updateDate() {
  document.getElementById('topbar-date').textContent =
    new Date().toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
}



window.navigate = navigate;
window.handleTopbarAdd = handleTopbarAdd;
window.toggleSidebar = toggleSidebar;
window.toggleMobileSidebar = toggleMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;
window.renderView = renderView;
window.updateDate = updateDate;
