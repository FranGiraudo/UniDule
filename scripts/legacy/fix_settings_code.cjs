const fs = require('fs');

// 1. Extract settings code from career.js
let career = fs.readFileSync('src/views/career.js', 'utf8');

// Find the index of function renderSettings()
const startIndex = career.indexOf('function renderSettings() {');
if (startIndex !== -1) {
  // Extract everything from renderSettings to the end of the file (before window exports)
  let extractedCode = career.slice(startIndex);
  // Cut off the window exports at the end since we already fixed them
  const windowExportsIndex = extractedCode.indexOf('window.setCareerTab = setCareerTab;');
  if (windowExportsIndex !== -1) {
    extractedCode = extractedCode.slice(0, windowExportsIndex).trim();
  }
  
  // Remove extracted code from career.js
  career = career.slice(0, startIndex) + '\n' + career.slice(startIndex + extractedCode.length);
  fs.writeFileSync('src/views/career.js', career.trim() + '\n\nwindow.setCareerTab = setCareerTab;\nwindow.setCareerGridFilter = setCareerGridFilter;\nwindow.setCareerGridSearch = setCareerGridSearch;\n');

  // 2. Append extracted code to settings.js
  let settings = fs.readFileSync('src/views/settings.js', 'utf8');
  
  // Replace the empty renderSettings function if it exists
  settings = settings.replace(/export function renderSettings\(\) {\s*\/\/\s*Implementation of renderSettings \(if any\)\s*}/g, '');
  // Remove the old handleBackupFile if it clashes
  settings = settings.replace(/window\.handleBackupFile = handleBackupFile;/g, 'window.handleFileImport = handleFileImport;');
  
  // We need to add the missing functions from extractedCode
  settings = settings.replace(/export function handleBackupFile/g, 'export function handleFileImport');
  
  // Append to settings.js, replacing the word `function renderSettings` with `export function renderSettings`
  extractedCode = extractedCode.replace('function renderSettings()', 'export function renderSettings()');
  extractedCode = extractedCode.replace('function setTheme(', 'export function setTheme(');
  
  // Add saveProfileSettings
  const saveProfileSettingsCode = `
export function saveProfileSettings() {
  if (!S.profile) S.profile = {};
  const elName = document.getElementById('setting-user-name');
  const elCareer = document.getElementById('setting-user-career');
  if (elName) S.profile.name = elName.value;
  if (elCareer) S.profile.career = elCareer.value;
  save();
  alert('Perfil guardado');
}
`;

  settings = settings.replace(/window\.renderSettings = renderSettings;/g, '');
  settings = settings.replace(/window\.exportBackup = exportBackup;/g, '');
  settings = settings.replace(/window\.importBackup = importBackup;/g, '');

  settings += '\n' + saveProfileSettingsCode + '\n' + extractedCode + '\n';
  settings += `
window.renderSettings = renderSettings;
window.setTheme = setTheme;
window.saveProfileSettings = saveProfileSettings;
window.exportBackup = exportBackup;
window.importBackup = importBackup;
window.handleFileImport = handleFileImport;
`;

  fs.writeFileSync('src/views/settings.js', settings);
  console.log('Fixed settings.js and career.js');
}
