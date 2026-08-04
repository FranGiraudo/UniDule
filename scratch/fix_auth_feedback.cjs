const fs = require('fs');

// 1. Fix todayDay in utils.js
let utils = fs.readFileSync('src/core/utils.js', 'utf8');
utils = utils.replace(
  'export function todayDay(dayJsArray) { \n  return dayJsArray[new Date().getDay()] || null; \n}',
  "export function todayDay() { \n  return [null,'Lunes','Martes','Miércoles','Jueves','Viernes',null][new Date().getDay()] || null; \n}"
);
fs.writeFileSync('src/core/utils.js', utils);
console.log('Fixed utils.js');

// 2. Update auth handlers in main.js
let main = fs.readFileSync('src/main.js', 'utf8');

const oldLogin = `window.handleLogin = async (e) => {
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
}`;

const newLogin = `function setAuthFeedback(msg, isError = true) {
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
}`;

main = main.replace(oldLogin, newLogin);

const oldRegister = `window.handleRegister = async (e) => {
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
}`;

const newRegister = `window.handleRegister = async (e) => {
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
}`;

main = main.replace(oldRegister, newRegister);
fs.writeFileSync('src/main.js', main);
console.log('Fixed main.js loading indicators');
