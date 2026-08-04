import { loadState, currentView } from './core/state.js';
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
    const state = await fetchFullState();
    if (state) {
      const localSStr = localStorage.getItem('appState');
      if (localSStr) {
        try {
          const localS = JSON.parse(localSStr);
          if (localS.subjects && localS.subjects.length > 0 && (!state.subjects || state.subjects.length === 0)) {
            console.log("Sincronizando estado local a la nube...");
            await window.api.syncEntireStateToCloud(localS);
            const newState = await fetchFullState();
            window.S = newState || state;
          } else {
            window.S = state;
          }
        } catch(e) { window.S = state; }
      } else {
        window.S = state;
      }
      window.isLoggedIn = true;
      const loginScreen = document.getElementById('login-screen');
      const app = document.getElementById('app');
      if (loginScreen) loginScreen.style.display = 'none';
      if (app) app.style.display = 'flex';
      
      loadState();
      ensureCareerLoaded();
      applyTheme(localStorage.getItem('theme') || 'dark');
      renderView(currentView);
      
      updateDate();
      setInterval(updateDate, 60000);
    } else {
      showLogin();
    }
  } catch (e) {
    console.error(e);
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
