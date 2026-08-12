const fs = require('fs');
const lines = fs.readFileSync('app.js', 'utf8').split('\n');

const outFiles = {};

// schedule.js (lines 592 to 887)
let sched = `import { S, activeDay, setActiveDay } from '../core/state.js';
import { DAYS, DSHORT, GRID_START, GRID_END, PPM, THEMES } from '../core/constants.js';
import { t2y, dur, t2m, daysUntil, formatDate } from '../core/utils.js';
`;
sched += lines.slice(594, 888).join('\n') + '\n';
sched = sched.replace(/function assignCols/g, 'export function assignCols');
sched = sched.replace(/function setActiveDay/g, 'export function setActiveDayGrid'); 
sched = sched.replace(/function renderSched/g, 'export function renderSched');
sched = sched.replace(/function showCP/g, 'export function showCP');
sched = sched.replace(/function exportPDF/g, 'export function exportPDF');
sched += `
window.setActiveDay = setActiveDayGrid;
window.renderSched = renderSched;
window.showCP = showCP;
window.exportPDF = exportPDF;
`;
outFiles['src/views/schedule.js'] = sched;

// subjects.js
let subs = `import { S, save, syncSubjectsAndCareer, selColor, setSelColor, slots, setSlots, gradesWork, setGradesWork, gradesSubId, setGradesSubId } from '../core/state.js';
import { DEF_SUBJECTS, COLORS, SUBJECT_STATUS, GRADE_TYPES } from '../core/constants.js';
import { gid, confirmDel, showToast, isMobile } from '../core/utils.js';
import { SVG_ICONS } from '../core/icons.js';
`;
subs += lines.slice(891, 946).join('\n') + '\n';
subs += lines.slice(1155, 1277).join('\n') + '\n';
subs += lines.slice(1333, 1451).join('\n') + '\n';
subs = subs.replace(/function renderSubs/g, 'export function renderSubs');
subs = subs.replace(/function chgAbs/g, 'export function chgAbs');
subs = subs.replace(/function openSubModal/g, 'export function openSubModal');
subs = subs.replace(/function onCareerSubSelect/g, 'export function onCareerSubSelect');
subs = subs.replace(/function renderSwatches/g, 'export function renderSwatches');
subs = subs.replace(/function pickColor/g, 'export function pickColor');
subs = subs.replace(/function renderSlots/g, 'export function renderSlots');
subs = subs.replace(/function addSlot/g, 'export function addSlot');
subs = subs.replace(/function rmSlot/g, 'export function rmSlot');
subs = subs.replace(/function updSlot/g, 'export function updSlot');
subs = subs.replace(/function saveSub/g, 'export function saveSub');
subs = subs.replace(/function openGradesModal/g, 'export function openGradesModal');
subs = subs.replace(/function renderGradesInModal/g, 'export function renderGradesInModal');
subs = subs.replace(/function addGrade/g, 'export function addGrade');
subs = subs.replace(/function rmGrade/g, 'export function rmGrade');
subs = subs.replace(/function updGrade/g, 'export function updGrade');
subs = subs.replace(/function saveGrades/g, 'export function saveGrades');

subs += `
window.renderSubs = renderSubs;
window.chgAbs = chgAbs;
window.openSubModal = openSubModal;
window.onCareerSubSelect = onCareerSubSelect;
window.pickColor = pickColor;
window.addSlot = addSlot;
window.rmSlot = rmSlot;
window.updSlot = updSlot;
window.saveSub = saveSub;
window.openGradesModal = openGradesModal;
window.addGrade = addGrade;
window.rmGrade = rmGrade;
window.updGrade = updGrade;
window.saveGrades = saveGrades;
`;
outFiles['src/views/subjects.js'] = subs;

// tasks.js (lines 947 to 1110 AND 1278 to 1329)
let tasks = `import { S, save, taskFilter, setTaskFilter } from '../core/state.js';
import { TYPE_BG, TYPE_FG, TYPE_ICON } from '../core/constants.js';
import { gid, daysUntil, urgColor, formatDate, confirmDel, showToast } from '../core/utils.js';
import { SVG_ICONS } from '../core/icons.js';
`;
tasks += lines.slice(949, 1111).join('\n') + '\n';
tasks += lines.slice(1280, 1330).join('\n') + '\n';
tasks = tasks.replace(/function setFilter/g, 'export function setFilter');
tasks = tasks.replace(/function syncTaskWithGrade/g, 'export function syncTaskWithGrade');
tasks = tasks.replace(/function renderTasks/g, 'export function renderTasks');
tasks = tasks.replace(/function toggleTask/g, 'export function toggleTask');
tasks = tasks.replace(/function promptGradeFromTask/g, 'export function promptGradeFromTask');
tasks = tasks.replace(/function saveGradeFromModal/g, 'export function saveGradeFromModal');
tasks = tasks.replace(/function openTaskModal/g, 'export function openTaskModal');
tasks = tasks.replace(/function saveTask/g, 'export function saveTask');

tasks += `
window.setFilter = setFilter;
window.renderTasks = renderTasks;
window.toggleTask = toggleTask;
window.promptGradeFromTask = promptGradeFromTask;
window.saveGradeFromModal = saveGradeFromModal;
window.openTaskModal = openTaskModal;
window.saveTask = saveTask;
`;
outFiles['src/views/tasks.js'] = tasks;

// attendance.js (lines 1112 to 1151)
let att = `import { S } from '../core/state.js';
import { renderSubs } from './subjects.js';
`;
att += lines.slice(1114, 1152).join('\n') + '\n';
att = att.replace(/function renderAtt/g, 'export function renderAtt');
att += `
window.renderAtt = renderAtt;
`;
outFiles['src/views/attendance.js'] = att;

// settings.js (lines 1452 to 1603)
let sett = `import { S, save, loadState } from '../core/state.js';
import { THEMES, applyTheme } from '../core/theme.js';
import { showToast } from '../core/utils.js';
import { SVG_ICONS } from '../core/icons.js';
import { navigate } from '../core/router.js';
`;
sett += lines.slice(1454, 1604).join('\n') + '\n';
sett = sett.replace(/function renderSettings/g, 'export function renderSettings');
sett = sett.replace(/function setTheme/g, 'export function setTheme');
sett = sett.replace(/function exportBackup/g, 'export function exportBackup');
sett = sett.replace(/function triggerFileSelect/g, 'export function triggerFileSelect');
sett = sett.replace(/function handleFileImport/g, 'export function handleFileImport');
sett = sett.replace(/function parseAndImportCSV/g, 'export function parseAndImportCSV');

sett += `
window.renderSettings = renderSettings;
window.setTheme = setTheme;
window.exportBackup = exportBackup;
window.triggerFileSelect = triggerFileSelect;
window.handleFileImport = handleFileImport;
`;
outFiles['src/views/settings.js'] = sett;

// career.js (lines 1801 to 2905 except svg icons)
let career = `import { S, save, activeCareerTab, setActiveCareerTab, selectedCareerNode, setSelectedCareerNode, careerGridFilter, setCareerGridFilterVal, careerGridSearch, setCareerGridSearchVal } from '../core/state.js';
import { CAREER_STATUS_CFG } from '../core/constants.js';
import { showToast } from '../core/utils.js';
import { SVG_ICONS } from '../core/icons.js';
`;
career += lines.slice(1801, 1845).join('\n') + '\n';
career += lines.slice(1908, 2906).join('\n') + '\n';

career = career.replace(/function ensureCareerLoaded/g, 'export function ensureCareerLoaded');
career = career.replace(/function renderCareer/g, 'export function renderCareer');
career = career.replace(/function switchCareerTab/g, 'export function switchCareerTab');
career = career.replace(/function setCareerGridFilter/g, 'export function setCareerGridFilter');
career = career.replace(/function setCareerGridSearch/g, 'export function setCareerGridSearch');
career = career.replace(/function renderCareerGrid/g, 'export function renderCareerGrid');
career = career.replace(/function renderCareerMap/g, 'export function renderCareerMap');
career = career.replace(/function renderSeminars/g, 'export function renderSeminars');
career = career.replace(/function saveSeminars/g, 'export function saveSeminars');
career = career.replace(/function renderElectives/g, 'export function renderElectives');
career = career.replace(/function saveElective/g, 'export function saveElective');
career = career.replace(/function renderCareerStats/g, 'export function renderCareerStats');

career += `
window.switchCareerTab = switchCareerTab;
window.setCareerGridFilter = setCareerGridFilter;
window.setCareerGridSearch = setCareerGridSearch;
window.saveSeminars = saveSeminars;
window.saveElective = saveElective;
`;
outFiles['src/views/career.js'] = career;

for (let k in outFiles) {
  fs.writeFileSync(k, outFiles[k]);
  console.log(k + ' written.');
}
