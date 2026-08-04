const fs = require('fs');
const lines = fs.readFileSync('app.js', 'utf8').split('\n');

let out = `import { STORAGE_KEY, DEF_SUBJECTS, DEF_TASKS, DEF_CAREER, DEF_SEMINARS, DEF_ELECTIVES, PATCHES } from './constants.js';
import { applyTheme } from './theme.js';

export let S = { subjects:[], tasks:[] };

export let currentView = 'dashboard';
export let taskFilter = 'all';
export let selColor = '#6366f1';
export let slots = [];
export let sbOpen = true;
export let activeDay = null;
export let gradesWork = [];
export let gradesSubId = null;
export let deferredPrompt = null;
export let activeCareerTab = 'grid';
export let selectedCareerNode = null;
export let careerGridFilter = 'all';
export let careerGridSearch = '';

`;

// functions loadState, save
out += lines.slice(259, 344).join('\n') + '\n\n';
out = out.replace(/function loadState/g, 'export function loadState');
out = out.replace(/function save/g, 'export function save');

// syncSubjectsAndCareer
out += lines.slice(1687, 1800).join('\n') + '\n\n';
out = out.replace(/function syncSubjectsAndCareer/g, 'export function syncSubjectsAndCareer');

// Setter functions to allow mutation from other modules
out += `
export function setS(newState) { Object.assign(S, newState); }
export function setCurrentView(v) { currentView = v; }
export function setTaskFilter(v) { taskFilter = v; }
export function setSelColor(v) { selColor = v; }
export function setSlots(v) { slots = v; }
export function setSbOpen(v) { sbOpen = v; }
export function setActiveDay(v) { activeDay = v; }
export function setGradesWork(v) { gradesWork = v; }
export function setGradesSubId(v) { gradesSubId = v; }
export function setDeferredPrompt(v) { deferredPrompt = v; }
export function setActiveCareerTab(v) { activeCareerTab = v; }
export function setSelectedCareerNode(v) { selectedCareerNode = v; }
export function setCareerGridFilterVal(v) { careerGridFilter = v; }
export function setCareerGridSearchVal(v) { careerGridSearch = v; }

window.S = S;
window.save = save;
window.loadState = loadState;
`;

fs.writeFileSync('src/core/state.js', out);
console.log('state.js written.');
