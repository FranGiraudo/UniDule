const fs = require('fs');

// 1. Fix utils.js
let utils = fs.readFileSync('src/core/utils.js', 'utf8');
if (!utils.includes('openM')) {
  utils += `\nexport function openM(id) { const e = document.getElementById(id); if(e) e.style.display='flex'; }\n`;
  utils += `export function closeM(id) { const e = document.getElementById(id); if(e) e.style.display='none'; }\n`;
  fs.writeFileSync('src/core/utils.js', utils);
}

// 2. Fix career.js
let career = fs.readFileSync('src/views/career.js', 'utf8');
if (!career.includes('const filterBarHtml = `')) {
  career = career.replace(
    /export function renderCareerGrid\(\) \{\s+const el = document.getElementById\('career-grid-container'\);\s+if \(!el\) return;\s+const subs = S.career.subjects;/,
    `export function renderCareerGrid() {\n  const el = document.getElementById('career-grid-container');\n  if (!el) return;\n  const subs = S.career.subjects;\n\n  const filterBarHtml = \``
  );
  fs.writeFileSync('src/views/career.js', career);
}

// 3. Fix settings.js
let settings = fs.readFileSync('src/views/settings.js', 'utf8');
if (!settings.includes('function init() {')) {
  // wait, did I delete init() completely? No, it's there.
}
// Actually let's just find the `if ('serviceWorker' in navigator) {` and ensure it's closed.
const swRegex = /if \('serviceWorker' in navigator\) \{\s*navigator\.serviceWorker\.register\('\.\/sw\.js'\)\.catch\(\(\) => \{\}\);\s*\}/;
if (!swRegex.test(settings)) {
  settings = settings.replace(/if \('serviceWorker' in navigator\) \{/, "if ('serviceWorker' in navigator) {\n    navigator.serviceWorker.register('./sw.js').catch(() => {});\n  }\n}");
  fs.writeFileSync('src/views/settings.js', settings);
}

console.log('Final fixes applied');
