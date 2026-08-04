const fs = require('fs');

let c = fs.readFileSync('src/views/career.js', 'utf8');
const search = '    <div style="margin-bottom:1rem;display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;justify-content:space-between;background:var(--card);padding:0.75rem;border-radius:0.75rem;border:1px solid var(--border);">';

const replacement = `}

// ═══════════════════════════════════════════════════════════
//  TAB 1: GRILLA (Resumen por Año / Semestre con Filtros)
// ═══════════════════════════════════════════════════════════
export function renderCareerGrid() {
  const el = document.getElementById('career-grid-container');
  if (!el) return;
  const subs = S.career.subjects;

  const filterBarHtml = \`
` + search;

if (c.includes(search) && !c.includes('export function renderCareerGrid')) {
  c = c.replace(search, replacement);
  fs.writeFileSync('src/views/career.js', c);
  console.log('Fixed JSX error in career.js');
}
