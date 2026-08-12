const fs = require('fs');
let c = fs.readFileSync('src/views/career.js', 'utf8');

c = c.replace(/import \{ CAREER_STATUS_CFG, DEF_SEMINARS \} from '\.\.\/core\/constants\.js';/, 
  "import { CAREER_STATUS_CFG, DEF_CAREER, DEF_ELECTIVES, DEF_SEMINARS } from '../core/constants.js';");

const ensureFunc = `
export function ensureCareerLoaded() {
  if (!S) S = { subjects:[], tasks:[] };
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
`;

c = c.replace(/export function getComputedStatus\(sub\)/, ensureFunc + '\nexport function getComputedStatus(sub)');

fs.writeFileSync('src/views/career.js', c);
console.log('Fixed ensureCareerLoaded');
