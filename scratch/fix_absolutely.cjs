const fs = require('fs');

// Fix career.js
let careerLines = fs.readFileSync('src/views/career.js', 'utf8').split('\n');
let renderIdx = careerLines.findIndex(l => l.includes('export function renderCareerGrid()'));
if (renderIdx !== -1) {
  let divIdx = -1;
  for (let i = renderIdx; i < renderIdx + 10; i++) {
    if (careerLines[i].includes('<div style="margin-bottom:1rem;display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;justify-content:space-between;background:var(--card);padding:0.75rem;border-radius:0.75rem;border:1px solid var(--border);">')) {
      divIdx = i;
      break;
    }
  }
  if (divIdx !== -1) {
    careerLines.splice(divIdx, 0, '  const filterBarHtml = `');
    fs.writeFileSync('src/views/career.js', careerLines.join('\n'));
    console.log('Fixed career.js');
  }
}

// Fix settings.js
let settings = fs.readFileSync('src/views/settings.js', 'utf8');
// Let's just find `export function exportBackup() {` and make sure the previous line has a closing brace for init().
// In my settings.js, function init() {} wraps exportBackup because I removed its closing brace.
// Let's close it right before export function exportBackup()
settings = settings.replace(/if \('serviceWorker' in navigator\) \{\s*navigator\.serviceWorker\.register\('\.\/sw\.js'\)\.catch\(\(\) => \{\}\);\s*\}(\s*)export function exportBackup/, 
"if ('serviceWorker' in navigator) {\n    navigator.serviceWorker.register('./sw.js').catch(() => {});\n  }\n}\n\nexport function exportBackup");

fs.writeFileSync('src/views/settings.js', settings);
console.log('Fixed settings.js');
