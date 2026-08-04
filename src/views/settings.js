import { S, save, loadState } from '../core/state.js';
import { THEMES, applyTheme } from '../core/theme.js';
import { showToast } from '../core/utils.js';
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

export function handleBackupFile(e) {
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
      document.getElementById('confirm-ok').onclick = () => {
        S.subjects = d.subjects.map(s => ({
          absences:0, maxAbsences:6, schedules:[], email:'', code:'',
          grades:[], status:'cursando', allowsPromotion:false, ...s
        }));
        S.tasks = (d.tasks||[]).map(t => ({ done:false, notes:'', subjectId:null, dueDate:null, ...t }));
        save(); document.getElementById('modal-confirm').style.display = 'none'; navigate(S.currentView||'dashboard');
      };
      document.getElementById('modal-confirm').style.display = 'flex';
    } catch(_) { alert('Archivo inválido o corrupto.'); }
    e.target.value = '';
  };
  reader.readAsText(file);
}

export function renderSettings() {
  // Implementation of renderSettings (if any)
}

window.renderSettings = renderSettings;
window.exportBackup = exportBackup;
window.importBackup = importBackup;
window.handleBackupFile = handleBackupFile;
