const fs = require('fs');

// 1. Fix main.js authentication
const mainJs = `import { loadState, currentView } from './core/state.js';
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
      window.S = state;
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

window.handleLogin = async (e) => {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  if (!email || !pass) return alert('Por favor, completa los datos');
  try {
    await loginUser(email, pass);
    checkAuth();
  } catch (err) {
    alert('Error al iniciar sesión: ' + err.message);
  }
}

window.handleRegister = async (e) => {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  if (!email || !pass) return alert('Por favor, completa los datos');
  try {
    await registerUser(email, pass);
    alert('Registro exitoso. Iniciando sesión...');
    await loginUser(email, pass);
    checkAuth();
  } catch (err) {
    alert('Error al registrar: ' + err.message);
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
`;

fs.writeFileSync('src/main.js', mainJs);
console.log('Fixed main.js');

// 2. Fix chgAbs in subjects.js and attendance.js
let subjects = fs.readFileSync('src/views/subjects.js', 'utf8');
subjects = subjects.replace('window.chgAbs = chgAbs;', '');
fs.writeFileSync('src/views/subjects.js', subjects);

let att = fs.readFileSync('src/views/attendance.js', 'utf8');
if (!att.includes('window.chgAbs = chgAbs;')) {
  att += '\nwindow.chgAbs = chgAbs;\n';
  fs.writeFileSync('src/views/attendance.js', att);
}
console.log('Fixed chgAbs export');

// 3. Create public/favicon.ico (if public doesn't exist, create it)
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}
fs.writeFileSync('public/favicon.ico', ''); // Empty file just to prevent 404
fs.writeFileSync('favicon.ico', ''); // Empty file in root just in case
console.log('Created favicon.ico');
