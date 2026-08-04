const fs = require('fs');

const file = 'src/views/career.js';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const statsIdx = lines.findIndex(l => l.includes('data-tab="stats"'));
const openSeminarIdx = lines.findIndex(l => l.includes('function openAddSeminarModal()'));

if (statsIdx === -1 || openSeminarIdx === -1) {
  console.error('Could not find boundaries');
  process.exit(1);
}

const before = lines.slice(0, statsIdx);
const after = lines.slice(openSeminarIdx - 3); // keep the separator comment

const middle = `        <button class="career-tab" data-tab="stats" onclick="setCareerTab('stats')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>Estadísticas
        </button>
        <button class="career-tab" data-tab="seminars" onclick="setCareerTab('seminars')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 6H20"/></svg>Seminarios
        </button>
        <button class="career-tab" data-tab="electives" onclick="setCareerTab('electives')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>Electivas
        </button>
        <button class="career-tab" data-tab="map" onclick="setCareerTab('map')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>Mapa
        </button>
      </div>
      <div id="career-grid-container"></div>
      <div id="career-map-container"       style="display:none;"></div>
      <div id="career-seminars-container"  style="display:none;"></div>
      <div id="career-electives-container" style="display:none;"></div>
      <div id="career-finals-container"    style="display:none;"></div>
      <div id="career-stats-container"     style="display:none;"></div>
    \`;
  }

  if      (activeCareerTab === 'grid')      renderCareerGrid();
  else if (activeCareerTab === 'map')       renderCareerMap();
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
}`;

const finalContent = before.join('\n') + '\n' + middle + '\n' + after.join('\n');
fs.writeFileSync(file, finalContent, 'utf8');
console.log('Fixed career.js successfully.');
