import { S, save, activeCareerTab, setActiveCareerTab, selectedCareerNode, setSelectedCareerNode, careerGridFilter, setCareerGridFilterVal, careerGridSearch, setCareerGridSearchVal, syncSubjectsAndCareer, currentView } from '../core/state.js';
import { renderView } from '../core/router.js';
import { CAREER_STATUS_CFG, DEF_CAREER, DEF_ELECTIVES, DEF_SEMINARS } from '../core/constants.js';
import { showToast, openM, closeM } from '../core/utils.js';
import { SVG_ICONS } from '../core/icons.js';
import { THEMES } from '../core/theme.js';
import { renderCareerMap, clearCmHighlight, highlightCareerMapNodes } from './careerMap.js';

export function ensureCareerLoaded() {
  if (!S.career || !S.career.subjects || S.career.subjects.length < 30) {
    S.career = {
      subjects: DEF_CAREER.map(s => ({ ...s, correlatives: { toCurse: [...s.correlatives.toCurse], toPass: [...s.correlatives.toPass] } })),
      electives: DEF_ELECTIVES.map(e => ({ ...e })),
      seminars: DEF_SEMINARS.map(s => ({ ...s }))
    };
  }
  if (!S.career.electives) S.career.electives = DEF_ELECTIVES.map(e => ({ ...e }));
  if (!S.career.seminars) S.career.seminars = DEF_SEMINARS.map(s => ({ ...s }));
}

export function getComputedStatus(sub) {
  if (sub.status !== 'pendiente') return sub.status;
  const all = S.career.subjects;
  const met = (sub.correlatives.toCurse || []).every(id => {
    const dep = all.find(x => x.id === id);
    return dep && (dep.status === 'regular' || dep.status === 'aprobada');
  });
  return met ? 'disponible' : 'bloqueada';
}

function getDaysToExpiration(expDateStr) {
  if (!expDateStr) return null;
  const parts = expDateStr.split('-');
  if (parts.length < 3) return null;
  const exp = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const now = new Date();
  now.setHours(0,0,0,0);
  const diffTime = exp - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ─── Estado de filtros para Carrera y Finales ─────────────────────────────
let careerGridFilterVal = 'all';
let careerGridSearchVal = '';

let finalsFilter = 'all';
let finalsSearch = '';
let finalsSort   = 'exp-asc';

export function setCareerGridFilter(val) { setCareerGridFilterVal(val); renderCareerGrid(); }
export function setCareerGridSearch(val) {
  const input = document.getElementById('career-grid-search');
  let start = input ? input.selectionStart : val.length;
  let end = input ? input.selectionEnd : val.length;
  setCareerGridSearchVal(val);
  renderCareerGrid();
  const newInput = document.getElementById('career-grid-search');
  if (newInput) {
    newInput.focus();
    try { newInput.setSelectionRange(start, end); } catch(e){}
  }
}

function setFinalsFilter(val) { finalsFilter = val; renderCareerFinals(); }
function setFinalsSearch(val) {
  const input = document.getElementById('finals-search');
  let start = input ? input.selectionStart : val.length;
  let end = input ? input.selectionEnd : val.length;
  finalsSearch = val;
  renderCareerFinals();
  const newInput = document.getElementById('finals-search');
  if (newInput) {
    newInput.focus();
    try { newInput.setSelectionRange(start, end); } catch(e){}
  }
}
function setFinalsSort(val)   { finalsSort   = val; renderCareerFinals(); }

// ═══════════════════════════════════════════════════════════
export function renderCareer() {
  ensureCareerLoaded();

  // Inject scaffold if not yet in the DOM
  const view = document.getElementById('view-career');
  if (view && !document.getElementById('career-grid-container')) {
    view.innerHTML = `
      <div style="padding:0 0 1rem;">
        <div class="view-title" style="margin-bottom:0.25rem;">Plan de Carrera</div>
        <div class="view-sub">Ingeniería en Informática — UTN</div>
      </div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.25rem;" id="career-tabs-bar">
        <button class="career-tab active" data-tab="grid" onclick="setCareerTab('grid')">
          Plan
        </button>
        <button class="career-tab" data-tab="finals" onclick="setCareerTab('finals')">
          Finales
        </button>
        <button class="career-tab" data-tab="stats" onclick="setCareerTab('stats')">
          Estadísticas
        </button>
        <button class="career-tab" data-tab="seminars" onclick="setCareerTab('seminars')">
          Seminarios
        </button>
        <button class="career-tab" data-tab="electives" onclick="setCareerTab('electives')">
          Electivas
        </button>
        <button class="career-tab" data-tab="map" onclick="setCareerTab('map')">
          Mapa
        </button>
      </div>
      <div id="career-grid-container"></div>
      <div id="career-map-container"       style="display:none;"></div>
      <div id="career-seminars-container"  style="display:none;"></div>
      <div id="career-electives-container" style="display:none;"></div>
      <div id="career-finals-container"    style="display:none;"></div>
      <div id="career-stats-container"     style="display:none;"></div>
    `;
  }

  if      (activeCareerTab === 'grid')      renderCareerGrid();
  else if (activeCareerTab === 'map') {
    const mapSubs = S.career.subjects.map(s => {
      const cs = getComputedStatus(s);
      return { ...s, cfg: CAREER_STATUS_CFG[cs] || CAREER_STATUS_CFG.pendiente };
    });
    renderCareerMap('career-map-container', mapSubs, (id) => {
      setSelectedCareerNode(id);
      const sub = S.career.subjects.find(x => x.id === id);
      if (!sub) return;
      const needed  = new Set(sub.correlatives.toCurse || []);
      const unlocks = new Set(S.career.subjects.filter(x => (x.correlatives.toCurse||[]).includes(id)).map(x=>x.id));
      highlightCareerMapNodes(id, needed, unlocks);
      openCareerSubDetail(id);
    });
  }
  else if (activeCareerTab === 'seminars')  renderCareerSeminars();
  else if (activeCareerTab === 'electives') renderCareerElectives();
  else if (activeCareerTab === 'finals')    renderCareerFinals();
  else                                      renderCareerStats();
}

export function setCareerTab(tab) {
  setActiveCareerTab(tab);
  document.querySelectorAll('.career-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === tab)
  );
  ['career-grid-container','career-map-container','career-seminars-container','career-electives-container','career-finals-container','career-stats-container'].forEach(pid => {
    const el = document.getElementById(pid);
    if (el) el.style.display = 'none';
  });
  const panelId = {
    grid: 'career-grid-container',
    map: 'career-map-container',
    seminars: 'career-seminars-container',
    electives: 'career-electives-container',
    finals: 'career-finals-container',
    stats: 'career-stats-container'
  }[tab];
  const panelEl = document.getElementById(panelId);
  if (panelEl) panelEl.style.display = '';
  renderCareer();
}
// ═══════════════════════════════════════════════════════════
//  TAB: SEMINARIOS & CURSOS ACREDITABLES
// ═══════════════════════════════════════════════════════════
function openAddSeminarModal() {
  document.getElementById('sem-name').value = '';
  document.getElementById('sem-code').value = '';
  document.getElementById('sem-hours').value = '';
  document.getElementById('sem-category').value = '';
  document.getElementById('sem-status').value = 'pendiente';
  document.getElementById('sem-date').value = '';
  document.getElementById('sem-notes').value = '';
  openM('modal-seminar');
}

function saveSeminar() {
  const name = document.getElementById('sem-name').value.trim();
  if (!name) return showToast('Debes ingresar un nombre para el seminario.', 'error');
  
  const code = document.getElementById('sem-code').value.trim();
  const hours = parseInt(document.getElementById('sem-hours').value) || 0;
  const category = document.getElementById('sem-category').value.trim() || 'Seminario';
  const status = document.getElementById('sem-status').value;
  let date = document.getElementById('sem-date').value;
  if(date) {
    const p = date.split('-');
    if(p.length===3) date = `${p[2]}/${p[1]}/${p[0]}`;
  }
  const notes = document.getElementById('sem-notes').value.trim();
  
  if (!S.career) S.career = {};
  if (!S.career.seminars) S.career.seminars = DEF_SEMINARS.map(s=>({...s}));
  
  S.career.seminars.push({
    id: 'sem-' + Date.now(),
    code,
    name,
    category,
    hours,
    status,
    date,
    notes
  });
  
  const sem = S.career.seminars[S.career.seminars.length - 1];
  save();
  if (window.api && window.api.saveSeminar) window.api.saveSeminar(sem).catch(console.error);
  closeM('modal-seminar');
  renderCareerSeminars();
}

export function renderCareerSeminars() {
  const el = document.getElementById('career-seminars-container');
  if (!el) return;
  if (!S.career) S.career = {};
  if (!S.career.seminars) S.career.seminars = DEF_SEMINARS.map(s=>({...s}));
  const sems = S.career.seminars;

  const approved = sems.filter(s => s.status === 'aprobada').length;
  const pct = sems.length ? Math.round((approved / sems.length) * 100) : 0;

  el.innerHTML = `
    <div style="margin-bottom:1rem;background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;">
      <div>
        <div style="font-size:1rem;font-weight:800;color:var(--text);">Seminarios & Cursos Acreditables</div>
        <div style="font-size:0.75rem;color:var(--text2);margin-top:0.15rem;">Control de seminarios exigidos para la titulación de grado</div>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div style="font-size:0.8125rem;font-weight:700;color:var(--text);">${approved} de ${sems.length} completados (${pct}%)</div>
        <button class="btn btn-primary btn-sm" onclick="openAddSeminarModal()">+ Nuevo Seminario</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:0.75rem;">
      ${sems.map(s => {
        const isDone = s.status === 'aprobada';
        const isCur = s.status === 'cursando';
        const statusBadge = isDone
          ? `<span style="display:inline-flex;align-items:center;gap:0.3rem;font-size:0.6875rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:0.375rem;background:rgba(74,222,128,.15);color:#4ade80;border:1px solid rgba(74,222,128,.3);">${SVG_ICONS.check} Aprobado / Hecho</span>`
          : isCur
          ? `<span style="display:inline-flex;align-items:center;gap:0.3rem;font-size:0.6875rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:0.375rem;background:rgba(96,165,250,.15);color:#60a5fa;border:1px solid rgba(96,165,250,.3);">${SVG_ICONS.clock} En Cursado</span>`
          : `<span style="display:inline-flex;align-items:center;gap:0.3rem;font-size:0.6875rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:0.375rem;background:rgba(148,163,184,.15);color:#94a3b8;border:1px solid rgba(148,163,184,.3);">${SVG_ICONS.lock} Pendiente</span>`;

        return `
          <div style="background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1rem;display:flex;flex-direction:column;justify-content:space-between;gap:0.75rem;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.375rem;">
                <div style="font-size:0.9375rem;font-weight:700;color:var(--text);">${s.name}</div>
                <span style="font-size:0.625rem;font-weight:700;padding:0.125rem 0.375rem;border-radius:0.25rem;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);white-space:nowrap;">${s.hours} hs</span>
              </div>
              <div style="font-size:0.6875rem;color:var(--text2);margin-bottom:0.5rem;">Código: ${s.code || '—'} · ${s.category}</div>
              <div style="margin-bottom:0.25rem;">${statusBadge}</div>
              ${s.notes ? `<div style="font-size:0.6875rem;color:var(--text2);margin-top:0.25rem;">${s.notes}</div>` : ''}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;padding-top:0.5rem;border-top:1px solid var(--border);">
              <span style="font-size:0.6875rem;color:var(--text2);">${s.date ? 'Acreditado: ' + s.date : 'Fecha: —'}</span>
              <button class="btn btn-ghost btn-sm" onclick="toggleSeminarStatus('${s.id}')">Cambiar Estado</button>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

function toggleSeminarStatus(id) {
  if (!S.career || !S.career.seminars) return;
  const sem = S.career.seminars.find(x => x.id === id);
  if (!sem) return;
  if (sem.status === 'aprobada') sem.status = 'pendiente';
  else if (sem.status === 'pendiente') sem.status = 'cursando';
  else sem.status = 'aprobada';
  save();
  if (window.api && window.api.saveSeminar) window.api.saveSeminar(sem).catch(console.error);
  renderCareerSeminars();
}

// ═══════════════════════════════════════════════════════════
//  TAB: OPTATIVAS DE INGENIERÍA
// ═══════════════════════════════════════════════════════════
export function renderCareerElectives() {
  const el = document.getElementById('career-electives-container');
  if (!el) return;
  if (!S.career) S.career = {};
  if (!S.career.electives || S.career.electives.length !== DEF_ELECTIVES.length) {
    const old = S.career.electives || [];
    S.career.electives = DEF_ELECTIVES.map(e => {
       const o = old.find(x => x.id === e.id || x.code === e.code);
       return o ? {...e, status: o.status, grade: o.grade} : {...e};
    });
    save();
  }
  const elecs = S.career.electives;

  const approved = elecs.filter(s => s.status === 'aprobada').length;
  const cursando = elecs.filter(s => s.status === 'cursando').length;

  el.innerHTML = `
    <div style="margin-bottom:1rem;background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;">
      <div>
        <div style="font-size:1rem;font-weight:800;color:var(--text);">Optativas de Ingeniería en Informática</div>
        <div style="font-size:0.75rem;color:var(--text2);margin-top:0.15rem;">Selección y acreditación de materias optativas de especialización</div>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div style="font-size:0.8125rem;font-weight:700;color:var(--text);">${approved} Aprobadas · ${cursando} Cursando</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:0.75rem;">
      ${elecs.map(s => {
        const cs = s.status;
        const cfg = CAREER_STATUS_CFG[cs] || CAREER_STATUS_CFG.pendiente;
        return `
          <div style="background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1rem;display:flex;flex-direction:column;justify-content:space-between;gap:0.75rem;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.375rem;">
                <div style="font-size:0.9375rem;font-weight:700;color:var(--text);">${s.name}</div>
                <span style="font-size:0.625rem;font-weight:700;padding:0.125rem 0.375rem;border-radius:0.25rem;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);white-space:nowrap;">${s.credits} créditos</span>
              </div>
              <div style="font-size:0.6875rem;color:var(--text2);margin-bottom:0.5rem;">Código: ${s.code || '—'} · Área: ${s.category}</div>
              <div style="display:flex;align-items:center;gap:0.5rem;">
                <span class="career-status-badge" style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.border};">${cfg.label}</span>
                ${s.status === 'aprobada' && s.grade !== null ? `<span style="font-size:0.75rem;font-weight:800;color:${s.grade>=4?'#4ade80':'#f87171'};">Nota: ${s.grade}</span>` : ''}
              </div>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:0.5rem;padding-top:0.5rem;border-top:1px solid var(--border);">
              <button class="btn btn-ghost btn-sm" onclick="openCareerSubDetail('${s.id}')">Gestionar Optativa</button>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

// ═══════════════════════════════════════════════════════════
//  TAB 1: GRILLA (Resumen por Año / Semestre con Filtros)
// ═══════════════════════════════════════════════════════════
export function renderCareerGrid() {
  const el = document.getElementById('career-grid-container');
  if (!el) return;
  const subs = S.career.subjects;

  const filterBarHtml = `
    <div style="margin-bottom:1rem;display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;justify-content:space-between;background:var(--card);padding:0.75rem;border-radius:0.75rem;border:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:0.5rem;flex:1;min-width:200px;">
        <input type="text" class="f-input" placeholder="Buscar materia o código..."
          id="career-grid-search" value="${careerGridSearch}" oninput="setCareerGridSearch(this.value)" style="font-size:0.75rem;padding:0.375rem 0.625rem;">
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
        <select class="f-input" onchange="setCareerGridFilter(this.value)" style="font-size:0.75rem;padding:0.375rem 0.625rem;">
          <option value="all"       ${careerGridFilter==='all'?'selected':''}>Todos los estados</option>
          <option value="aprobada"  ${careerGridFilter==='aprobada'?'selected':''}>🟢 Aprobadas</option>
          <option value="regular"   ${careerGridFilter==='regular'?'selected':''}>🟣 Regulares</option>
          <option value="cursando"  ${careerGridFilter==='cursando'?'selected':''}>🔵 Cursando</option>
          <option value="disponible"${careerGridFilter==='disponible'?'selected':''}>🟡 Disponibles</option>
          <option value="bloqueada" ${careerGridFilter==='bloqueada'?'selected':''}>⚪ Pendientes/Bloqueadas</option>
        </select>
      </div>
    </div>`;

  const yearBlocksHtml = [1,2,3,4,5].map(year => {
    let yearSubs = subs.filter(s => s.year === year);
    
    // Aplicar filtro de búsqueda
    if (careerGridSearch) {
      const q = careerGridSearch.toLowerCase();
      yearSubs = yearSubs.filter(s => s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q)));
    }
    // Aplicar filtro de estado
    if (careerGridFilter !== 'all') {
      yearSubs = yearSubs.filter(s => {
        const cs = getComputedStatus(s);
        if (careerGridFilter === 'bloqueada') return cs === 'pendiente' || cs === 'bloqueada';
        return cs === careerGridFilter;
      });
    }

    if (!yearSubs.length) return '';

    const approved = subs.filter(s => s.year === year && s.status === 'aprobada').length;
    const totalYear = subs.filter(s => s.year === year).length;
    const pct = totalYear ? Math.round(approved / totalYear * 100) : 0;
    const barColor = pct >= 100 ? '#4ade80' : pct >= 50 ? '#60a5fa' : 'var(--primary)';

    const semHtml = [0,1,2].map(sem => {
      const semSubs = yearSubs.filter(s => s.semester === sem);
      if (!semSubs.length) return '';
      const lbl = sem === 0 ? 'Anual' : `${sem}° Semestre`;
      return `
      <div class="career-sem-section">
        <div class="career-sem-label">${lbl}</div>
        ${semSubs.map(s => {
          const cs = getComputedStatus(s);
          const cfg = CAREER_STATUS_CFG[cs] || CAREER_STATUS_CFG.pendiente;
          const canFinal = s.status === 'regular' &&
            (s.correlatives.toPass || []).every(id => {
              const dep = subs.find(x => x.id === id);
              return dep && dep.status === 'aprobada';
            });
          return `
          <div class="career-sub-row" style="border-left-color:${cfg.color};" onclick="openCareerSubDetail('${s.id}')">
            <div class="career-sub-info">
              <div class="career-sub-name">${s.name}</div>
              <div class="career-sub-meta">
                <span>${s.credits} créditos</span>
                ${s.status === 'aprobada' && s.grade !== null ? `<span style="color:${s.grade>=4?'#4ade80':'#f87171'};font-weight:700;">Nota: ${s.grade}</span>` : ''}
                ${canFinal ? `<span class="career-final-badge">Final disponible</span>` : ''}
              </div>
            </div>
            <span class="career-status-badge" style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.border};">${cfg.label}</span>
          </div>`;
        }).join('')}
      </div>`;
    }).join('');

    return `
    <div class="career-year-block">
      <div class="career-year-header" onclick="this.closest('.career-year-block').classList.toggle('collapsed')">
        <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
          <span class="career-year-num">${year}° Año</span>
          <span style="font-size:11px;color:var(--text2);white-space:nowrap;">${approved}/${totalYear}</span>
          <div class="career-year-bar-wrap">
            <div class="career-year-bar-fill" style="width:${pct}%;background:${barColor};"></div>
          </div>
          <span style="font-size:11px;color:var(--text2);min-width:2.5rem;">${pct}%</span>
        </div>
        <span class="career-chevron">▾</span>
      </div>
      <div class="career-year-body">${semHtml}</div>
    </div>`;
  }).join('');

  el.innerHTML = filterBarHtml + (yearBlocksHtml || `<div class="empty-st"><div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);margin-bottom:0.5rem;">${SVG_ICONS.search}</div><div>No se encontraron materias con el filtro aplicado.</div></div>`);
}



// ═══════════════════════════════════════════════════════════
//  TAB 3: FINALES DISPONIBLES & VENCIMIENTOS (CON FILTROS)
// ═══════════════════════════════════════════════════════════
export function renderCareerFinals() {
  const el = document.getElementById('career-finals-container');
  if (!el) return;
  const subs = S.career.subjects;

  // Ver TODOS los finales de materias en estado 'regular'
  const regularSubs = subs.filter(s => s.status === 'regular');

  if (!regularSubs.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:2.5rem 1rem;color:var(--text2);background:var(--card);border-radius:0.75rem;border:1px solid var(--border);">
        <div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);margin-bottom:0.5rem;">${SVG_ICONS.book}</div>
        <div style="font-size:0.9375rem;font-weight:700;color:var(--text);">No hay materias regulares registradas</div>
        <div style="font-size:0.8125rem;margin-top:0.25rem;">Cuando tengas materias regularizadas aparecerán aquí con sus fechas de vencimiento.</div>
      </div>`;
    return;
  }

  // Filtrado y búsqueda
  let filteredSubs = regularSubs.filter(s => {
    if (finalsSearch) {
      const q = finalsSearch.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchCode = (s.code || '').toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    const missingToPass = (s.correlatives.toPass || []).map(id => subs.find(x => x.id === id)).filter(dep => !dep || dep.status !== 'aprobada');
    const canRendir = missingToPass.length === 0;
    if (finalsFilter === 'ready' && !canRendir) return false;
    if (finalsFilter === 'pending' && canRendir) return false;
    return true;
  });

  // Ordenamiento
  filteredSubs.sort((a, b) => {
    if (finalsSort === 'exp-asc') {
      const da = getDaysToExpiration(a.expDate) ?? 9999;
      const db = getDaysToExpiration(b.expDate) ?? 9999;
      return da - db;
    } else if (finalsSort === 'exp-desc') {
      const da = getDaysToExpiration(a.expDate) ?? -9999;
      const db = getDaysToExpiration(b.expDate) ?? -9999;
      return db - da;
    } else if (finalsSort === 'name-asc') {
      return a.name.localeCompare(b.name);
    } else if (finalsSort === 'year-asc') {
      return (a.year - b.year) || (a.semester - b.semester);
    }
    return 0;
  });

  const filterBarHtml = `
    <div style="margin-bottom:1rem;display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;justify-content:space-between;background:var(--card);padding:0.75rem;border-radius:0.75rem;border:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:0.5rem;flex:1;min-width:180px;">
        <input type="text" class="f-input" placeholder="Buscar final o código..."
          id="finals-search" value="${finalsSearch}" oninput="setFinalsSearch(this.value)" style="font-size:0.75rem;padding:0.375rem 0.625rem;">
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
        <select class="f-input" onchange="setFinalsFilter(this.value)" style="font-size:0.75rem;padding:0.375rem 0.625rem;">
          <option value="all" ${finalsFilter==='all'?'selected':''}>Todos los finales (${regularSubs.length})</option>
          <option value="ready" ${finalsFilter==='ready'?'selected':''}>Habilitados para rendir</option>
          <option value="pending" ${finalsFilter==='pending'?'selected':''}>Pendiente correlativas</option>
        </select>
        <select class="f-input" onchange="setFinalsSort(this.value)" style="font-size:0.75rem;padding:0.375rem 0.625rem;">
          <option value="exp-asc" ${finalsSort==='exp-asc'?'selected':''}>Vencimiento más próximo</option>
          <option value="exp-desc" ${finalsSort==='exp-desc'?'selected':''}>Vencimiento más lejano</option>
          <option value="name-asc" ${finalsSort==='name-asc'?'selected':''}>Nombre (A - Z)</option>
          <option value="year-asc" ${finalsSort==='year-asc'?'selected':''}>Año (1° a 5°)</option>
        </select>
      </div>
    </div>`;

  if (!filteredSubs.length) {
    el.innerHTML = filterBarHtml + `
      <div class="empty-st" style="background:var(--card);border-radius:0.75rem;border:1px solid var(--border);">
        <div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);margin-bottom:0.5rem;">${SVG_ICONS.search}</div>
        <div>No se encontraron finales que coincidan con la búsqueda o filtro seleccionado.</div>
      </div>`;
    return;
  }

  const cardsHtml = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:0.75rem;">
      ${filteredSubs.map(s => {
        const missingToPass = (s.correlatives.toPass || []).map(id => subs.find(x => x.id === id)).filter(dep => !dep || dep.status !== 'aprobada');
        const canRendir = missingToPass.length === 0;

        const daysLeft = getDaysToExpiration(s.expDate);
        let badgeBg = 'rgba(74,222,128,.15)', badgeColor = '#4ade80', badgeText = 'Regularidad activa';
        if (daysLeft !== null) {
          if (daysLeft < 0) { badgeBg = 'rgba(248,113,113,.2)'; badgeColor = '#f87171'; badgeText = '¡Vencida!'; }
          else if (daysLeft <= 90) { badgeBg = 'rgba(248,113,113,.15)'; badgeColor = '#f87171'; badgeText = `Vence en ${daysLeft} días`; }
          else if (daysLeft <= 180) { badgeBg = 'rgba(251,191,36,.15)'; badgeColor = '#fbbf24'; badgeText = `Vence en ${daysLeft} días`; }
          else { badgeBg = 'rgba(74,222,128,.15)'; badgeColor = '#4ade80'; badgeText = `Vence en ${daysLeft} días`; }
        }

        const regFormatted = s.regDate ? new Date(s.regDate.replace(/-/g,'/')).toLocaleDateString('es-AR') : '—';
        const expFormatted = s.expDate ? new Date(s.expDate.replace(/-/g,'/')).toLocaleDateString('es-AR') : '—';

        const statusRendirBadge = canRendir
          ? `<span style="display:inline-flex;align-items:center;gap:0.35rem;font-size:0.6875rem;font-weight:700;padding:0.25rem 0.5rem;border-radius:0.375rem;background:rgba(74,222,128,.15);color:#4ade80;border:1px solid rgba(74,222,128,.3);">${SVG_ICONS.check} Habilitado para rendir</span>`
          : `<span style="display:inline-flex;align-items:center;gap:0.35rem;font-size:0.6875rem;font-weight:700;padding:0.25rem 0.5rem;border-radius:0.375rem;background:rgba(248,113,113,.15);color:#f87171;border:1px solid rgba(248,113,113,.3);">${SVG_ICONS.lock} Pendiente correlativas</span>`;

        return `
          <div style="background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1rem;display:flex;flex-direction:column;justify-content:space-between;gap:0.75rem;cursor:pointer;" onclick="openCareerSubDetail('${s.id}')">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.375rem;">
                <div style="font-size:0.9375rem;font-weight:700;color:var(--text);line-height:1.2;">${s.name}</div>
                <span style="font-size:0.625rem;font-weight:700;padding:0.125rem 0.375rem;border-radius:0.25rem;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);white-space:nowrap;">${s.year}° Año</span>
              </div>
              <div style="font-size:0.6875rem;color:var(--text2);margin-bottom:0.5rem;">Código: ${s.code || '—'} · ${s.credits} créditos</div>
              <div style="margin-bottom:0.375rem;">${statusRendirBadge}</div>
              ${!canRendir ? `<div style="font-size:0.6875rem;color:#f87171;margin-top:0.25rem;">Falta aprobar: ${missingToPass.map(m=>m?m.name:'?').join(', ')}</div>` : ''}
            </div>

            <div style="background:var(--card2);padding:0.625rem;border-radius:0.5rem;display:flex;flex-direction:column;gap:0.25rem;font-size:0.6875rem;">
              <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text2);">Regularizada:</span>
                <span style="font-weight:600;">${regFormatted}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text2);">Vencimiento:</span>
                <span style="font-weight:700;color:${badgeColor};">${expFormatted}</span>
              </div>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;flex-wrap:nowrap;">
              <span style="display:inline-flex;align-items:center;gap:0.3rem;font-size:0.6875rem;font-weight:700;padding:0.25rem 0.5rem;border-radius:0.375rem;background:${badgeBg};color:${badgeColor};white-space:nowrap;">${badgeText}</span>
              <button class="btn-action" style="font-size:0.75rem;padding:0.35rem 0.65rem;" onclick="event.stopPropagation();openCareerSubDetail('${s.id}')">${SVG_ICONS.fileEdit} Rendir Final</button>
            </div>
          </div>`;
      }).join('')}
    </div>`;

  el.innerHTML = filterBarHtml + cardsHtml;
}

// ═══════════════════════════════════════════════════════════
//  TAB 4: ESTADÍSTICAS & TÍTULOS
// ═══════════════════════════════════════════════════════════
export function renderCareerStats() {
  const el = document.getElementById('career-stats-container');
  if (!el) return;
  const subs = S.career.subjects;

  // 1. Título de Grado (Ingeniero en Informática)
  const total = subs.length;
  const aprobadas = subs.filter(s => s.status === 'aprobada').length;
  const regulares = subs.filter(s => s.status === 'regular').length;
  const cursandoN = subs.filter(s => s.status === 'cursando').length;
  const disponible = subs.filter(s => getComputedStatus(s) === 'disponible').length;
  
  const pctActual = total ? Math.round((aprobadas / total) * 100) : 0;
  const pctProyectado = total ? Math.round(((aprobadas + regulares) / total) * 100) : 0;

  // 2. Título Intermedio (Analista de Sistemas Informáticos - Años 1 a 3)
  const analistaSubs = subs.filter(s => s.year <= 3);
  const analistaTotal = analistaSubs.length;
  const analistaAprobadas = analistaSubs.filter(s => s.status === 'aprobada').length;
  const analistaRegulares = analistaSubs.filter(s => s.status === 'regular').length;
  
  const pctAnalistaActual = analistaTotal ? Math.round((analistaAprobadas / analistaTotal) * 100) : 0;
  const pctAnalistaProyectado = analistaTotal ? Math.round(((analistaAprobadas + analistaRegulares) / analistaTotal) * 100) : 0;

  // Promedios
  const allGrades = subs.filter(s => s.grade !== null).map(s => s.grade);
  const passGrades = allGrades.filter(g => g >= 4);
  const avg = allGrades.length ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length).toFixed(2) : '—';
  const avgPass = passGrades.length ? (passGrades.reduce((a, b) => a + b, 0) / passGrades.length).toFixed(2) : '—';
  
  const totalCred = subs.reduce((a, s) => a + s.credits, 0);
  const approvedCred = subs.filter(s => s.status === 'aprobada').reduce((a, s) => a + s.credits, 0);

  const R = 68, C = 2 * Math.PI * R;
  const dashOffActual = C * (1 - pctActual / 100);
  const dashOffProy = C * (1 - pctProyectado / 100);

  // Histograma de notas
  const bins = Array(11).fill(0);
  allGrades.forEach(g => bins[Math.min(10, Math.floor(g))]++);
  const maxBin = Math.max(...bins, 1);

  el.innerHTML = `
    <div class="cs-layout">
      <!-- Card Ing. Informática -->
      <div class="cs-card cs-ring-card">
        <div style="font-size:0.75rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.25rem;">Título de Grado</div>
        <div style="font-size:1rem;font-weight:900;color:var(--text);margin-bottom:0.75rem;text-align:center;">Ingeniería en Informática</div>
        
        <svg width="150" height="150" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="${R}" fill="none" stroke="var(--border)" stroke-width="12"/>
          <circle cx="80" cy="80" r="${R}" fill="none" stroke="rgba(167,139,250,.35)" stroke-width="12"
            stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${dashOffProy.toFixed(1)}"
            stroke-linecap="round" transform="rotate(-90 80 80)" style="transition:stroke-dashoffset .8s ease;"/>
          <circle cx="80" cy="80" r="${R}" fill="none" stroke="#4ade80" stroke-width="12"
            stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${dashOffActual.toFixed(1)}"
            stroke-linecap="round" transform="rotate(-90 80 80)" style="transition:stroke-dashoffset .8s ease;"/>
          <text x="80" y="72" text-anchor="middle" fill="var(--text)" font-size="24" font-weight="900">${pctActual}%</text>
          <text x="80" y="88" text-anchor="middle" fill="#4ade80" font-size="9" font-weight="700">Actual</text>
          <text x="80" y="100" text-anchor="middle" fill="#a78bfa" font-size="8.5">Proy: ${pctProyectado}%</text>
        </svg>
        <div style="font-size:0.75rem;color:var(--text2);text-align:center;margin-top:0.5rem;">
          <b>${aprobadas}</b> aprobadas · <b>${regulares}</b> regulares
        </div>
      </div>

      <!-- Card Título Intermedio -->
      <div class="cs-card cs-ring-card" style="border-color:rgba(96,165,250,.3);">
        <div style="font-size:0.75rem;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.25rem;">Título Intermedio</div>
        <div style="font-size:1rem;font-weight:900;color:var(--text);margin-bottom:0.75rem;text-align:center;">Analista de Sistemas Informáticos</div>
        
        <svg width="150" height="150" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="${R}" fill="none" stroke="var(--border)" stroke-width="12"/>
          <circle cx="80" cy="80" r="${R}" fill="none" stroke="rgba(96,165,250,.35)" stroke-width="12"
            stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pctAnalistaProyectado/100)).toFixed(1)}"
            stroke-linecap="round" transform="rotate(-90 80 80)" style="transition:stroke-dashoffset .8s ease;"/>
          <circle cx="80" cy="80" r="${R}" fill="none" stroke="#60a5fa" stroke-width="12"
            stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pctAnalistaActual/100)).toFixed(1)}"
            stroke-linecap="round" transform="rotate(-90 80 80)" style="transition:stroke-dashoffset .8s ease;"/>
          <text x="80" y="72" text-anchor="middle" fill="var(--text)" font-size="24" font-weight="900">${pctAnalistaActual}%</text>
          <text x="80" y="88" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="700">Actual (1º-3º año)</text>
          <text x="80" y="100" text-anchor="middle" fill="#93c5fd" font-size="8.5">Proy: ${pctAnalistaProyectado}%</text>
        </svg>
        <div style="font-size:0.75rem;color:var(--text2);text-align:center;margin-top:0.5rem;">
          <b>${analistaAprobadas} / ${analistaTotal}</b> materias aprobadas
        </div>
      </div>

      <!-- Mini Grid de Estadísticas -->
      <div class="cs-mini-grid" style="grid-column: 1 / -1;">
        ${(()=>{
          const isL = THEMES[S.profile?.theme||'dark']?.isLight;
          const c = isL 
            ? ['#16a34a','#7c3aed','#2563eb','#d97706','#7c3aed','#059669','#4f46e5','var(--text2)']
            : ['#4ade80','#a78bfa','#60a5fa','#fbbf24','#c4b5fd','#34d399','var(--primary)','var(--text2)'];
          return [
            ['Aprobadas Total',  aprobadas,   c[0]],
            ['Regulares Pend.',  regulares,   c[1]],
            ['Cursando',         cursandoN,   c[2]],
            ['Disponibles',      disponible,  c[3]],
            ['Promedio General', avg,         c[4]],
            ['Prom. Aprobadas',  avgPass,     c[5]],
            ['Créditos Aprob.',  approvedCred,c[6]],
            ['Créditos Total',   totalCred,   c[7]],
          ].map(([lbl,val,col])=>`
            <div class="cs-mini-card">
              <div class="cs-mini-val" style="color:${col};">${val}</div>
              <div class="cs-mini-lbl">${lbl}</div>
            </div>`).join('');
        })()}
      </div>

      ${allGrades.length >= 2 ? `
      <div class="cs-card cs-histo-card">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text2);margin-bottom:14px;">Distribución de Notas (Exámenes Finales)</div>
        <div style="display:flex;align-items:flex-end;gap:5px;height:90px;">
          ${bins.map((count,i) => {
            const h = count ? Math.max(8,Math.round(count/maxBin*78)) : 2;
            const c = i>=4 ? '#4ade80' : '#f87171';
            return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
              <div style="font-size:9px;color:var(--text2);min-height:12px;">${count||''}</div>
              <div style="height:${h}px;width:100%;background:${c};border-radius:3px 3px 0 0;opacity:${count?1:.15};transition:height .4s ease;"></div>
              <div style="font-size:9px;color:var(--text2);">${i}</div>
            </div>`;
          }).join('')}
        </div>
      </div>` : ''}
    </div>`;
}

// ═══════════════════════════════════════════════════════════
//  PANEL DE DETALLE DE MATERIA
// ═══════════════════════════════════════════════════════════
export function openCareerSubDetail(id) {
  let s = S.career.subjects.find(x => x.id === id);
  let isElective = false;
  if (!s && S.career.electives) {
    s = S.career.electives.find(x => x.id === id);
    isElective = true;
  }
  if (!s) return;
  const cs  = isElective ? s.status : getComputedStatus(s);
  const cfg = CAREER_STATUS_CFG[cs] || CAREER_STATUS_CFG.pendiente;
  const all = S.career.subjects;

  const corrItem = dep => {
    if (!dep) return '';
    const dcs = getComputedStatus(dep), dc = CAREER_STATUS_CFG[dcs];
    return `<div class="career-corr-row">
      <span class="career-status-badge" style="background:${dc.bg};color:${dc.color};border:1px solid ${dc.border};">${dc.label}</span>
      <span style="font-size:12px;">${dep.name}</span>
    </div>`;
  };

  const correlatives = s.correlatives || {toCurse:[], toPass:[]};
  const needsHtml = (correlatives.toCurse||[]).map(cid=>corrItem(all.find(x=>x.id===cid))).join('')
    || '<div style="font-size:11px;color:var(--text2);">Sin correlativas</div>';
  const unlocksHtml = all.filter(x=>(x.correlatives&&x.correlatives.toCurse||[]).includes(id))
    .map(x=>corrItem(x)).join('')
    || '<div style="font-size:11px;color:var(--text2);">—</div>';

  const statusOpts = ['pendiente','cursando','regular','aprobada'].map(st =>
    `<option value="${st}" ${s.status===st?'selected':''}>${CAREER_STATUS_CFG[st].label}</option>`
  ).join('');

  document.getElementById('career-detail-title').textContent = s.name;
  document.getElementById('career-detail-meta').textContent  = isElective 
      ? `Categoría: ${s.category} · ${s.credits} créditos`
      : `${s.year}° Año · ${s.semester === 0 ? 'Anual' : s.semester + '° Semestre'} · ${s.credits} créditos`;
  document.getElementById('career-detail-body').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <span class="career-status-badge" style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.border};font-size:12px;padding:.3rem .75rem;align-self:flex-start;">${cfg.label}</span>
      <div>
        <label class="f-label">Estado</label>
        <select class="f-input" id="cd-status" onchange="csSetStatus('${id}',this.value)">${statusOpts}</select>
      </div>
      <div id="cd-grade-row" style="${s.status==='aprobada'?'':'display:none;'}">
        <label class="f-label">Nota final (0 – 10)</label>
        <input type="number" class="f-input" id="cd-grade" min="0" max="10" step="0.5"
          value="${s.grade!==null?s.grade:''}" placeholder="Ej: 8"
          style="font-size:20px;font-weight:800;text-align:center;"
          oninput="var v=parseFloat(this.value);this.style.color=isNaN(v)?'var(--text)':v>=4?'#4ade80':'#f87171';csSetGrade('${id}',this.value)">
      </div>
      <div>
        <div class="f-label" style="margin-bottom:6px;">Para cursar (necesitás regular)</div>
        ${needsHtml}
      </div>
      <div>
        <div class="f-label" style="margin-bottom:6px;">Desbloquea</div>
        ${unlocksHtml}
      </div>
    </div>`;

  const panel = document.getElementById('career-detail-panel');
  panel.style.display = 'flex';
  requestAnimationFrame(() => panel.classList.add('open'));
}

function closeCareerDetail() {
  const panel = document.getElementById('career-detail-panel');
  panel.classList.remove('open');
  setTimeout(() => { panel.style.display='none'; }, 280);
  clearCmHighlight();
}

function csSetStatus(id, status) {
  let s = S.career.subjects.find(x => x.id === id);
  let isElective = false;
  if (!s && S.career.electives) {
    s = S.career.electives.find(x => x.id === id);
    isElective = true;
  }
  if (!s) return;
  
  s.status = status;
  if (status !== 'aprobada') s.grade = null;
  if (window.api) window.api.syncSubjectProgress(s.id, isElective ? 'elective' : 'subject', s.status, s.grade, s.regDate, s.expDate).catch(console.error);

  if (status === 'regular') {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const expDateObj = new Date(now.getFullYear() + 1, now.getMonth() + 6, now.getDate());
    const expStr = `${expDateObj.getFullYear()}-${String(expDateObj.getMonth()+1).padStart(2,'0')}-${String(expDateObj.getDate()).padStart(2,'0')}`;
    if (!s.regDate) s.regDate = todayStr;
    if (!s.expDate) s.expDate = expStr;
  }

  const orig = S.subjects.find(x => x.id === id || (x.code && x.code === s.code) || x.name.toLowerCase() === s.name.toLowerCase());
  if (orig) {
    orig.status = status;
  }

  const gr = document.getElementById('cd-grade-row');
  if (gr) gr.style.display = status==='aprobada' ? '' : 'none';
  if (!isElective) syncSubjectsAndCareer();
  save();
  renderView(currentView);
}

function csSetGrade(id, val) {
  let s = S.career.subjects.find(x => x.id === id);
  let isElective = false;
  if (!s && S.career.electives) {
    s = S.career.electives.find(x => x.id === id);
    isElective = true;
  }
  if (!s) return;
  const v = parseFloat(val);
  s.grade = isNaN(v) ? null : Math.min(10, Math.max(0, v));
  if (s.grade !== null && s.grade >= 4 && s.status !== 'aprobada') {
    s.status = 'aprobada';
  }
  if (!isElective) syncSubjectsAndCareer();
  save();
  renderView(currentView);
}

// ═══════════════════════════════════════════════════════════
//  VIEW: CONFIGURACIÓN & PERFIL & TEMAS & BACKUP (CSV / JSON)
// ═══════════════════════════════════════════════════════════




window.setCareerTab = setCareerTab;
window.setCareerGridFilter = setCareerGridFilter;
window.setCareerGridSearch = setCareerGridSearch;
window.openCareerSubDetail = openCareerSubDetail;
window.csSetStatus = csSetStatus;
window.csSetGrade = csSetGrade;
window.openAddSeminarModal = openAddSeminarModal;
window.saveSeminarModal = saveSeminar;
window.toggleSeminarStatus = toggleSeminarStatus;
window.closeCareerDetail = closeCareerDetail;

window.setFinalsFilter = setFinalsFilter;
window.setFinalsSearch = setFinalsSearch;
window.setFinalsSort = setFinalsSort;
