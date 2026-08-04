import { loadState, currentView } from './core/state.js';
import { renderView } from './core/router.js';
import { updateDate } from './core/router.js';
import { ensureCareerLoaded } from './views/career.js';
import { applyTheme } from './core/theme.js';

// Import all views so they attach to window (for inline onclick handlers)
import './views/dashboard.js';
import './views/schedule.js';
import './views/subjects.js';
import './views/tasks.js';
import './views/attendance.js';
import './views/career.js';
import './views/careerMap.js';
import './views/settings.js';

window.addEventListener('DOMContentLoaded', () => {
  loadState();
  ensureCareerLoaded();
  applyTheme(localStorage.getItem('theme') || 'dark');
  renderView(currentView);
  
  // start date update interval
  updateDate();
  setInterval(updateDate, 60000);
});

// PWA installation logic
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.setDeferredPrompt(e);
  const btn = document.getElementById('install-btn');
  if (btn) btn.style.display = 'block';
});
