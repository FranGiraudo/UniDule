const fs = require('fs');

let settings = fs.readFileSync('src/views/settings.js', 'utf8');

settings = settings.replace(
  /if \('serviceWorker' in navigator\) \{\s*export function exportBackup/,
  "if ('serviceWorker' in navigator) {\n    navigator.serviceWorker.register('./sw.js').catch(() => {});\n  }\n}\n\nexport function exportBackup"
);

fs.writeFileSync('src/views/settings.js', settings);
console.log('Fixed settings.js completely!');
