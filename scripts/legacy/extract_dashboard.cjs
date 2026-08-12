const fs = require('fs');
const lines = fs.readFileSync('app.js', 'utf8').split('\n');

let out = `import { S } from '../core/state.js';
import { TYPE_ICON, TYPE_FG, TYPE_BG } from '../core/constants.js';
import { todayDay, nowMin, t2m, m2t, dur, daysUntil, urgColor, formatDate } from '../core/utils.js';
import { SVG_ICONS } from '../core/icons.js';
import { renderView } from '../core/router.js';
import { toggleTask } from './tasks.js';

`;

out += lines.slice(438, 591).join('\n') + '\n\n';

out = out.replace(/function getNextClass/g, 'export function getNextClass');
out = out.replace(/function renderNC/g, 'export function renderNC');
out = out.replace(/function renderDash/g, 'export function renderDash');

out += `
window.renderDash = renderDash;
`;

fs.writeFileSync('src/views/dashboard.js', out);
console.log('dashboard.js written.');
