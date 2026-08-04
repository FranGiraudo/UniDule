const fs = require('fs');
const lines = fs.readFileSync('app.js', 'utf8').split('\n');

let out = `import { currentView, setCurrentView, sbOpen, setSbOpen } from './state.js';
import { SVG_ICONS } from './icons.js';
import { renderDash } from '../views/dashboard.js';
import { renderSched } from '../views/schedule.js';
import { renderSubs, openSubModal } from '../views/subjects.js';
import { renderTasks, openTaskModal } from '../views/tasks.js';
import { renderAtt } from '../views/attendance.js';
import { renderCareer } from '../views/career.js';
import { renderSettings } from '../views/settings.js';

`;

out += lines.slice(376, 435).join('\n') + '\n\n';

out = out.replace(/function navigate/g, 'export function navigate');
out = out.replace(/function handleTopbarAdd/g, 'export function handleTopbarAdd');
out = out.replace(/function toggleSidebar/g, 'export function toggleSidebar');
out = out.replace(/function toggleMobileSidebar/g, 'export function toggleMobileSidebar');
out = out.replace(/function closeMobileSidebar/g, 'export function closeMobileSidebar');
out = out.replace(/function renderView/g, 'export function renderView');
out = out.replace(/function updateDate/g, 'export function updateDate');

out += `
window.navigate = navigate;
window.handleTopbarAdd = handleTopbarAdd;
window.toggleSidebar = toggleSidebar;
window.toggleMobileSidebar = toggleMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;
window.renderView = renderView;
window.updateDate = updateDate;
`;

fs.writeFileSync('src/core/router.js', out);
console.log('router.js written.');
