import { loadState, loadStateFromCloud, currentView } from './core/state.js';
import { STORAGE_KEY } from './core/constants.js';
import { renderView, updateDate } from './core/router.js';
import { ensureCareerLoaded } from './views/career.js';
import { applyTheme } from './core/theme.js';
import * as api from './services/api.js';

// Import all views so they attach to window
import './views/dashboard.js';
import './views/schedule.js';
import './views/subjects.js';
import './views/tasks.js';
import './views/attendance.js';
import './views/career.js';
import './views/careerMap.js';
import './views/settings.js';

const { loginUser, registerUser, fetchFullState, logoutUser } = api;
window.api = api;
window.isLoggedIn = false;

function showLogin() {
  const loginScreen = document.getElementById('login-screen');
  const app = document.getElementById('app');
  if (loginScreen) loginScreen.style.display = 'flex';
  if (app) app.style.display = 'none';
}

async function checkAuth() {
  try {
    const cloudState = await fetchFullState();

    if (cloudState) {
      // Tenemos usuario logueado y datos del servidor.
      // Leer local para hacer merge antes de sobreescribir.
      const localRaw = localStorage.getItem(STORAGE_KEY);
      let localS = null;
      try { localS = localRaw ? JSON.parse(localRaw) : null; } catch(e) {}

      // Si la nube devolvió subjects vacíos pero tenemos locales, sincronizarlos primero
      if (cloudState.subjects.length === 0 && localS && localS.subjects && localS.subjects.length > 0) {
        const realSubs = localS.subjects.filter(s => !['cs-aud','cs-ge2','cs-fis2','cs-iw3','cs-mn','cs-pe','cs-red1','cs-pfs'].includes(s.id));
        if (realSubs.length > 0) {
          console.log('Sincronizando materias locales a la nube...');
          for (const sub of realSubs) {
            try {
              await window.api.saveActiveSubject(sub);
              if (sub.grades && sub.grades.length > 0) {
                await window.api.syncGrades(sub.id, sub.grades);
              }
            } catch(e) { console.error('Error subiendo materia local:', sub.name, e); }
          }
          // Re-fetch con los datos ya subidos
          const refreshed = await fetchFullState();
          if (refreshed) {
            cloudState.subjects = refreshed.subjects;
            cloudState.tasks = [...cloudState.tasks, ...refreshed.tasks.filter(t => !cloudState.tasks.find(ct => ct.id === t.id))];
          }
        }
      }

      // Si la nube devolvió tasks vacías pero tenemos locales, sincronizarlas
      if (cloudState.tasks.length === 0 && localS && localS.tasks && localS.tasks.length > 0) {
        const realTasks = localS.tasks.filter(t => t.title !== '1er Parcial' && t.title !== 'TP Obligatorio — App Web');
        if (realTasks.length > 0) {
          console.log('Sincronizando tareas locales a la nube...');
          for (const task of realTasks) {
            try { await window.api.saveTask(task); } catch(e) { console.error('Error subiendo tarea local:', e); }
          }
          const refreshed = await fetchFullState();
          if (refreshed) cloudState.tasks = refreshed.tasks;
        }
      }

      // CLEANUP ASINCRÓNICO PARA ELIMINAR DATOS FALSOS QUE YA SE SUBIERON
      setTimeout(async () => {
        try {
          const fakes = cloudState.tasks.filter(t => t.title === '1er Parcial' || t.title === 'TP Obligatorio — App Web');
          for (const f of fakes) {
            await window.api.deleteTask(f.id);
          }
          const fakeSubs = cloudState.subjects.filter(s => ['cs-aud','cs-ge2','cs-fis2','cs-iw3','cs-mn','cs-pe','cs-red1','cs-pfs'].includes(s.id) && s.grades.length === 0);
          for (const s of fakeSubs) {
            await window.api.deleteActiveSubject(s.id);
          }
        } catch(e) {}
      }, 3000);

      // Cargar el estado de la nube directamente en S (el módulo exportado que usan todas las vistas)
      loadStateFromCloud(cloudState);

      window.isLoggedIn = true;
      const loginScreen = document.getElementById('login-screen');
      const app = document.getElementById('app');
      if (loginScreen) loginScreen.style.display = 'none';
      if (app) app.style.display = 'flex';

      ensureCareerLoaded();
      applyTheme(localStorage.getItem('theme') || 'dark');
      renderView(currentView);
      updateDate();
      setInterval(updateDate, 60000);
    } else {
      // No hay usuario logueado: cargar desde localStorage
      loadState();
      showLogin();
    }
  } catch (e) {
    console.error('checkAuth error:', e);
    loadState();
    showLogin();
  }
}

function setAuthFeedback(msg, isError = true) {
  const fb = document.getElementById('auth-feedback');
  if (!fb) return;
  fb.style.display = 'block';
  fb.style.color = isError ? '#ef4444' : '#3b82f6';
  fb.textContent = msg;
}

function setAuthLoading(isLoading, btnId, defaultText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = isLoading;
  btn.style.opacity = isLoading ? '0.7' : '1';
  btn.textContent = isLoading ? 'Cargando...' : defaultText;
  const fb = document.getElementById('auth-feedback');
  if (isLoading && fb) fb.style.display = 'none';
}

window.handleLogin = async (e) => {
  if (e) e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  if (!email || !pass) return setAuthFeedback('Por favor, completa los datos');
  
  setAuthLoading(true, 'btn-login', 'Entrar');
  try {
    await loginUser(email, pass);
    await checkAuth();
  } catch (err) {
    setAuthFeedback('Error al iniciar sesión: ' + err.message);
  } finally {
    setAuthLoading(false, 'btn-login', 'Entrar');
  }
}

window.handleRegister = async (e) => {
  if (e) e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  if (!email || !pass) return setAuthFeedback('Por favor, completa los datos');
  
  setAuthLoading(true, 'btn-register', 'Registrarse');
  try {
    await registerUser(email, pass);
    setAuthFeedback('Registro exitoso. Iniciando sesión...', false);
    await loginUser(email, pass);
    await checkAuth();
  } catch (err) {
    setAuthFeedback('Error al registrar: ' + err.message);
  } finally {
    setAuthLoading(false, 'btn-register', 'Registrarse');
  }
}

window.handleLogout = async () => {
  await logoutUser();
  window.location.reload();
}

window.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

// PWA installation logic
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  const btn = document.getElementById('install-btn');
  if (btn) btn.style.display = 'block';
});

// Support Enter key to save in modals
window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
    const openModal = document.querySelector('.modal-bd[style*="display: flex"]');
    if (openModal) {
      const primaryBtn = openModal.querySelector('.btn-primary');
      if (primaryBtn && !primaryBtn.disabled) {
        e.preventDefault();
        primaryBtn.click();
      }
    }
  }
});
