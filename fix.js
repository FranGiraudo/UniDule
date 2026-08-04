const fs = require('fs');
let file = fs.readFileSync('src/views/subjects.js', 'utf8');

file = file.replace('export function saveGrades() {', 'export async function saveGrades() {');
file = file.replace('window.api.syncGrades(s.id, s.grades).catch(console.error);', 'try { await window.api.saveActiveSubject(s); await window.api.syncGrades(s.id, s.grades); } catch(e) { console.error(e); }');
file = file.replace(`if (careerMatch) window.api.syncSubjectProgress(careerMatch.id, 'subject', careerMatch.status, careerMatch.grade, careerMatch.regDate, careerMatch.expDate).catch(console.error);`, `if (careerMatch) { try { await window.api.syncSubjectProgress(careerMatch.id, 'subject', careerMatch.status, careerMatch.grade, careerMatch.regDate, careerMatch.expDate); } catch(e) { console.error(e); } }`);

fs.writeFileSync('src/views/subjects.js', file);
