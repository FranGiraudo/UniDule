const fs = require('fs');

// 1. Fix career.js
let career = fs.readFileSync('src/views/career.js', 'utf8');

// Replace emojis in filters with colored dots emojis
career = career.replace('🟩 Aprobadas', '🟢 Aprobadas');
career = career.replace('🟪 Regulares', '🟣 Regulares');
career = career.replace('🟦 Cursando', '🔵 Cursando');
career = career.replace('🟨 Disponibles', '🟡 Disponibles');
career = career.replace('⬜ Pendientes', '⚪ Pendientes');

// Remove SVGs from tabs
career = career.replace(/<svg[^>]*>.*?<\/svg>Plan/g, 'Plan');
career = career.replace(/<svg[^>]*>.*?<\/svg>Finales/g, 'Finales');
career = career.replace(/<svg[^>]*>.*?<\/svg>Estadísticas/g, 'Estadísticas');
career = career.replace(/<svg[^>]*>.*?<\/svg>Seminarios/g, 'Seminarios');
career = career.replace(/<svg[^>]*>.*?<\/svg>Electivas/g, 'Electivas');
career = career.replace(/<svg[^>]*>.*?<\/svg>Mapa/g, 'Mapa');

fs.writeFileSync('src/views/career.js', career);
console.log('Fixed career.js filters and tabs');

// 2. Fix index.html export PDF button
let index = fs.readFileSync('index.html', 'utf8');

// The export PDF button is currently inside the view-header of view-schedule
// <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
// Let's improve the positioning and ensure there's no emoji. 
// I'll update the button HTML just in case.
const oldBtn = `<button class="btn btn-ghost btn-sm" onclick="exportPDF()" title="Exportar horario a PDF">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>Exportar PDF
          </button>`;
const newBtn = `<button class="btn btn-primary btn-sm" onclick="exportPDF()" title="Exportar horario a PDF" style="display:flex;align-items:center;gap:6px;border-radius:20px;padding:6px 14px;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span style="font-weight:600;">Exportar PDF</span>
          </button>`;

if (index.includes(oldBtn)) {
  index = index.replace(oldBtn, newBtn);
  fs.writeFileSync('index.html', index);
  console.log('Fixed index.html export PDF button');
} else {
  console.log('Export PDF button not found exactly, it might already be different.');
}
