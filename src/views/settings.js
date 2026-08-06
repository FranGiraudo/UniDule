import { S, save, loadState } from '../core/state.js';
import { THEMES, applyTheme } from '../core/theme.js';
import { showToast, gid } from '../core/utils.js';
import { SVG_ICONS } from '../core/icons.js';
import { navigate } from '../core/router.js';

export function exportBackup() {
  const data = { version:3, exportedAt:new Date().toISOString(), data:S };
  const blob  = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  const ds    = new Date().toISOString().slice(0,10);
  a.href = url; a.download = `unischedule-backup-${ds}.json`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

export function importBackup() { document.getElementById('backup-file-input').click(); }

export function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const parsed = JSON.parse(ev.target.result);
      const d = parsed.data || parsed;
      if (!d.subjects || !Array.isArray(d.subjects)) throw new Error();
      document.getElementById('confirm-title').textContent = '¿Restaurar backup?';
      document.getElementById('confirm-msg').textContent =
        `Se cargarán ${d.subjects.length} materias y ${(d.tasks||[]).length} tareas. Esto reemplazará todos los datos actuales.`;
      document.getElementById('confirm-ok').onclick = async () => {
        S.subjects = d.subjects.map(s => ({
          absences:0, maxAbsences:6, schedules:[], email:'', code:'',
          grades:[], status:'cursando', allowsPromotion:false, ...s
        }));
        S.tasks = (d.tasks||[]).map(t => ({ done:false, notes:'', subjectId:null, dueDate:null, ...t }));
        save();
        document.getElementById('modal-confirm').style.display = 'none';
        // Sincronizar backup a la nube
        if (window.api) {
          try {
            await window.api.syncEntireStateToCloud(S);
            showToast('Backup restaurado y sincronizado a la nube', 'success');
          } catch(e) {
            console.error(e);
            showToast('Backup restaurado solo localmente (error de nube)', 'error');
          }
        }
        navigate(S.currentView||'dashboard');
      };
      document.getElementById('modal-confirm').style.display = 'flex';
    } catch(_) { alert('Archivo inválido o corrupto.'); }
    e.target.value = '';
  };
  reader.readAsText(file);
}



export function exportScheduleToClipboard() {
  const scheds = (S.subjects || []).filter(s => s.schedules && s.schedules.length > 0).map(s => ({
    id: s.id,
    code: s.code,
    name: s.name,
    professor: s.professor,
    room: s.room,
    schedules: s.schedules
  }));
  if (scheds.length === 0) {
    showToast('No tenés horarios cargados para compartir.', 'error');
    return;
  }
  const payload = { type: 'unidule-schedule', v: 1, data: scheds };
  const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
  navigator.clipboard.writeText(encoded).then(() => {
    showToast('¡Horario copiado! Pasáselo a un compañero.', 'success');
  }).catch(() => {
    prompt('Copia este código y pasáselo a tu compañero:', encoded);
  });
}

export function importScheduleFromCode() {
  const code = prompt('Pegá acá el código de horario que te pasaron:');
  if (!code) return;
  try {
    const decoded = JSON.parse(decodeURIComponent(atob(code)));
    if (decoded.type !== 'unidule-schedule' || !Array.isArray(decoded.data)) throw new Error('Invalid type');
    
    let addedCount = 0;
    decoded.data.forEach(extSub => {
      // Find matching subject by id or code
      let localSub = S.subjects.find(s => s.id === extSub.id || (s.code && s.code === extSub.code) || s.name.toLowerCase() === extSub.name.toLowerCase());
      if (localSub) {
        localSub.schedules = extSub.schedules;
        if (!localSub.professor) localSub.professor = extSub.professor;
        if (!localSub.room) localSub.room = extSub.room;
        addedCount++;
      } else {
        // If they don't have it, create it
        localSub = {
          id: gid(), // MUST be a new UUID, not extSub.id
          code: extSub.code || '',
          name: extSub.name,
          color: '#6366f1',
          professor: extSub.professor || '',
          room: extSub.room || '',
          email: '', maxAbsences: 6, absences: 0, grades: [], status: 'cursando', allowsPromotion: false,
          schedules: extSub.schedules
        };
        S.subjects.push(localSub);
        addedCount++;
      }
      if (window.api) {
        window.api.saveActiveSubject(localSub).then(saved => {
          if (saved && saved.id && localSub.id !== saved.id) {
            localSub.id = saved.id;
            save();
          }
        }).catch(e => {
          console.error('Error guardando materia importada', e);
          if (e.code === '42501' || (e.message && e.message.includes('row-level security'))) {
            alert('🚨 ERROR DE PERMISOS (42501) 🚨\n\nSupabase bloqueó el guardado. Esto significa que NO ejecutaste los permisos SQL en tu panel de Supabase.\n\nPor favor, copiá el script SQL que te pasó el asistente en el chat y ejecutalo en el SQL Editor de tu Supabase. Si no lo hacés, la app NO te va a dejar guardar nada.');
          }
        });
      }
    });
    
    save();
    showToast(`Se importaron los horarios de ${addedCount} materia(s).`, 'success');
  } catch(e) {
    console.error(e);
    showToast('Código inválido. Asegurate de copiarlo completo.', 'error');
  }
}

window.exportScheduleToClipboard = exportScheduleToClipboard;
window.importScheduleFromCode = importScheduleFromCode;
window.handleFileImport = handleFileImport;


export async function saveProfileSettings() {
  if (!S.profile) S.profile = {};
  const elName = document.getElementById('setting-user-name');
  const elCareer = document.getElementById('setting-user-career');
  const elPlan = document.getElementById('setting-user-plan');
  
  let planChanged = false;

  if (elName) S.profile.name = elName.value;
  if (elCareer) S.profile.career = elCareer.value;
  if (elPlan && S.profile.plan_id !== elPlan.value) {
    S.profile.plan_id = elPlan.value;
    planChanged = true;
  }

  save();
  if (window.api) {
    try {
      await window.api.syncProfile(S.profile);
      showToast('Perfil guardado', 'success');
      if (planChanged) {
        setTimeout(() => window.location.reload(), 800);
      }
    } catch(e) {
      console.error(e);
      showToast('Perfil guardado localmente (error de nube)', 'error');
    }
  } else {
    showToast('Perfil guardado', 'success');
    if (planChanged) {
      setTimeout(() => window.location.reload(), 800);
    }
  }
}

export function renderSettings() {
  // Inject scaffold if not yet in the DOM
  const view = document.getElementById('view-settings');
  if (view && !document.getElementById('theme-presets-grid')) {
    view.innerHTML = `
      <div style="max-width:700px;margin:0 auto;">
        <div class="view-title" style="margin-bottom:1.5rem;">Configuración & Perfil</div>

        <div style="background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1.25rem;margin-bottom:1.25rem;">
          <div style="font-weight:700;margin-bottom:1rem;color:var(--text);">Perfil</div>
          <div style="display:flex;flex-direction:column;gap:0.75rem;">
            <div>
              <label class="f-label">Nombre</label>
              <input class="f-input" id="setting-user-name" type="text" placeholder="Tu nombre">
            </div>
            <div>
              <label class="f-label">Carrera</label>
              <input class="f-input" id="setting-user-career" type="text" placeholder="Tu carrera">
            </div>
            <div>
              <label class="f-label">Plan de Estudio</label>
              <select class="f-input" id="setting-user-plan" style="width:100%; border:1px solid var(--border); padding:0.75rem; background:var(--bg); color:var(--text); border-radius:0.5rem; outline:none; font-family:inherit;">
                <option value="2016">Plan 2016</option>
                <option value="2026">Plan 2026</option>
              </select>
            </div>
            <button class="btn btn-primary" onclick="saveProfileSettings()">Guardar perfil</button>
          </div>
        </div>

        <div style="background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1.25rem;margin-bottom:1.25rem;">
          <div style="font-weight:700;margin-bottom:1rem;color:var(--text);">Tema de color</div>
          <div id="theme-presets-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:0.75rem;"></div>
        </div>

        <div style="background:color-mix(in srgb, var(--primary) 10%, transparent);border:1px solid color-mix(in srgb, var(--primary) 30%, transparent);border-radius:0.75rem;padding:1.25rem;margin-bottom:1.25rem;">
          <div style="font-weight:700;margin-bottom:0.5rem;color:var(--primary);display:flex;align-items:center;gap:6px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            Compartir Horario
          </div>
          <p style="font-size:13px;color:var(--text2);margin-bottom:1rem;line-height:1.4;">Compartí tu grilla de horarios con compañeros, o pegá un código que te hayan pasado para no cargar todo a mano.</p>
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
            <button class="btn btn-primary btn-sm" onclick="exportScheduleToClipboard()">Copiar mi horario</button>
            <button class="btn btn-ghost btn-sm" onclick="importScheduleFromCode()">Importar con código</button>
          </div>
        </div>

        <div style="background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1.25rem;margin-bottom:1.25rem;">
          <div style="font-weight:700;margin-bottom:0.5rem;color:var(--text);">Datos y Respaldo</div>
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
            <button class="btn btn-ghost btn-sm" onclick="exportBackup()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Exportar backup JSON
            </button>
            <label class="btn btn-ghost btn-sm" style="cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Importar archivo
              <input type="file" accept=".json,.csv" style="display:none;" onchange="handleFileImport(event)">
            </label>
          </div>
        </div>

        <div style="background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1.25rem;">
          <div style="font-weight:700;margin-bottom:0.5rem;color:var(--text);">Cuenta</div>
          <button class="btn btn-ghost" onclick="window.handleLogout && window.handleLogout()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Cerrar sesión
          </button>
        </div>
      </div>
    `;
  }

  const elName   = document.getElementById('setting-user-name');
  const elCareer = document.getElementById('setting-user-career');
  const elPlan   = document.getElementById('setting-user-plan');
  if (elName   && S.profile) elName.value   = S.profile.name   || 'Fran Giraudo';
  if (elCareer && S.profile) elCareer.value = S.profile.career || 'Ingeniería en Informática — IUA';
  if (elPlan   && S.profile) elPlan.value   = S.profile.plan_id || '2016';

  const grid = document.getElementById('theme-presets-grid');
  if (!grid) return;

  const currentTheme = S.profile ? (S.profile.theme || 'dark') : 'dark';

  grid.innerHTML = Object.entries(THEMES).map(([key, t]) => {
    const isSel = key === currentTheme;
    const textColor = t.vars['--text'];
    const cardBorder = isSel ? t.primary : (t.isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)');
    return `
      <div onclick="setTheme('${key}')" style="cursor:pointer;background:${t.bg};border:2px solid ${cardBorder};border-radius:0.5rem;padding:0.625rem;display:flex;align-items:center;justify-content:space-between;gap:0.5rem;box-shadow:${isSel?'0 0 10px '+t.primary+'44':'none'};">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <div style="width:14px;height:14px;border-radius:50%;background:${t.primary};flex-shrink:0;box-shadow:0 0 4px ${t.primary};"></div>
          <span style="font-size:0.75rem;font-weight:700;color:${textColor};">${t.name}</span>
        </div>
        ${isSel ? `<span style="font-size:0.65rem;font-weight:800;color:${t.primary};">Activo</span>` : ''}
      </div>`;
  }).join('');
}

export function setTheme(themeKey) {
  if (!S.profile) S.profile = {};
  S.profile.theme = themeKey;
  applyTheme(themeKey);
  save();
  if (window.api) {
    window.api.syncProfile(S.profile).catch(console.error);
  }
  renderSettings();
}

window.renderSettings = renderSettings;
window.setTheme = setTheme;
window.saveProfileSettings = saveProfileSettings;
window.exportBackup = exportBackup;
window.importBackup = importBackup;
window.handleFileImport = handleFileImport;
