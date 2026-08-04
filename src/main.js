import * as api from './services/api.js';
const { loginUser, registerUser, fetchFullState, logoutUser } = api;
window.api = api;
window.isLoggedIn = false;

async function checkAuth() {
  try {
    const state = await fetchFullState();
    if (state) {
      window.S = state;
      window.isLoggedIn = true;
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app').style.display = 'flex';
      
      // Init legacy app logic
      if (typeof window.init === 'function') {
        window.init();
      }
    } else {
      showLogin();
    }
  } catch (e) {
    console.error(e);
    showLogin();
  }
}

function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
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
