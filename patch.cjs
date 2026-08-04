const fs = require('fs');
let code = fs.readFileSync('src/views/subjects.js', 'utf8');

const target1 = `  let careerMatch = null;
  if (S.career && S.career.subjects) {
    careerMatch = S.career.subjects.find(cs => cs.id === sub.id || (cs.code && cs.code === sub.code) || cs.name.toLowerCase() === sub.name.toLowerCase());
    if (careerMatch) {
      careerMatch.id = sub.id;
      careerMatch.status = (statusVal === 'aprobado' || statusVal === 'promocionado') ? 'aprobada' : statusVal;
    }
  }`;

const replacement1 = `  let careerMatch = null;
  let isElective = false;
  if (S.career) {
    if (S.career.subjects) careerMatch = S.career.subjects.find(cs => cs.id === sub.id || (cs.code && cs.code === sub.code) || cs.name.toLowerCase() === sub.name.toLowerCase());
    if (!careerMatch && S.career.electives) {
      careerMatch = S.career.electives.find(ce => ce.id === sub.id || (ce.code && ce.code === sub.code) || ce.name.toLowerCase() === sub.name.toLowerCase());
      if (careerMatch) isElective = true;
    }
    if (careerMatch) {
      careerMatch.id = sub.id;
      careerMatch.status = (statusVal === 'aprobado' || statusVal === 'promocionado') ? 'aprobada' : statusVal;
    }
  }`;

const target2 = `await window.api.syncSubjectProgress(careerMatch.id, 'subject', careerMatch.status, careerMatch.grade, careerMatch.regDate, careerMatch.expDate);`;
const replacement2 = `await window.api.syncSubjectProgress(careerMatch.id, isElective ? 'elective' : 'subject', careerMatch.status, careerMatch.grade, careerMatch.regDate, careerMatch.expDate);`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);
fs.writeFileSync('src/views/subjects.js', code);
console.log('Fixed subjects.js');
