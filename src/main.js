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
window.loadStateFromCloud = loadStateFromCloud;

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

      if (cloudState.subjects.length === 0 && localS && localS.subjects && localS.subjects.length > 0) {
        console.log('Sincronizando materias locales a la nube...');
        for (const sub of localS.subjects) {
          try {
            // Fix legacy IDs before uploading to avoid RLS 42501 conflicts
            if (!sub.id || sub.id.startsWith('cs-') || sub.id.startsWith('local-') || sub.id.length < 20) {
              sub.id = crypto.randomUUID();
            }
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
      applyTheme(cloudState.profile?.theme || 'dark');
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

window.authMode = 'login';

window.switchAuthTab = (mode) => {
  window.authMode = mode;
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const btnSubmit = document.getElementById('btn-auth-submit');
  const slider = document.getElementById('tab-slider');
  
  if (mode === 'login') {
    tabLogin.style.color = 'var(--text)';
    tabRegister.style.color = 'var(--text-muted)';
    if(slider) slider.style.transform = 'translateX(0)';
    
    btnSubmit.textContent = 'Iniciar Sesión';
    document.getElementById('auth-plan-wrapper').style.display = 'none';
  } else {
    tabRegister.style.color = 'var(--text)';
    tabLogin.style.color = 'var(--text-muted)';
    if(slider) slider.style.transform = 'translateX(100%)';
    
    btnSubmit.textContent = 'Crear Cuenta';
    document.getElementById('auth-plan-wrapper').style.display = 'block';
  }
};

window.togglePasswordVisibility = () => {
  const passInput = document.getElementById('auth-pass');
  const eyeIcon = document.getElementById('eye-icon');
  
  if (passInput.type === 'password') {
    passInput.type = 'text';
    // Eye off icon
    eyeIcon.innerHTML = '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>';
  } else {
    passInput.type = 'password';
    // Eye icon
    eyeIcon.innerHTML = '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>';
  }
};

window.handleAuthSubmit = async (e) => {
  if (e) e.preventDefault();
  if (window.authMode === 'login') {
    await window.handleLogin();
  } else {
    await window.handleRegister();
  }
};

window.handleLogin = async (e) => {
  if (e) e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  if (!email || !pass) return setAuthFeedback('Por favor, completa los datos');
  
  setAuthLoading(true, 'btn-auth-submit', 'Entrar');
  try {
    await loginUser(email, pass);
    await checkAuth();
  } catch (err) {
    setAuthFeedback('Error al iniciar sesión: ' + err.message);
  } finally {
    setAuthLoading(false, 'btn-auth-submit', 'Iniciar Sesión');
  }
}

window.handleRegister = async (e) => {
  if (e) e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  const planId = document.getElementById('auth-plan').value;
  if (!email || !pass) return setAuthFeedback('Por favor, completa los datos');
  
  setAuthLoading(true, 'btn-auth-submit', 'Registrando...');
  try {
    await registerUser(email, pass);
    setAuthFeedback('Registro exitoso. Iniciando sesión...', false);
    await loginUser(email, pass);
    
    if (window.api && window.api.syncProfile) {
      await window.api.syncProfile({
        name: 'Usuario',
        career: 'Ingeniería en Informática — IUA',
        theme: 'dark',
        plan_id: planId
      });
    }
    
    await checkAuth();
  } catch (err) {
    setAuthFeedback('Error al registrar: ' + err.message);
  } finally {
    setAuthLoading(false, 'btn-auth-submit', 'Crear Cuenta');
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
