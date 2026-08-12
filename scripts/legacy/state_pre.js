import { STORAGE_KEY, DEF_SUBJECTS, DEF_TASKS, DEF_CAREER, DEF_SEMINARS, DEF_ELECTIVES, PATCHES } from './constants.js';
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

export function loadState() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    // Si estamos logueados y tenemos estado cargado en S, usamos ese estado en vez del localStorage
    if (window.isLoggedIn && window.S && window.S.subjects) {
      // S ya tiene los datos, no leemos de raw
      raw = JSON.stringify(window.S);
    }
    
    if (raw) {
      S = JSON.parse(raw);
      // Asegurar campos m├¡nimos
      S.subjects = (S.subjects || []).map(s => ({
        absences:0, maxAbsences:6, schedules:[], email:'', code:'',
        grades:[], status:'cursando', allowsPromotion:false, ...s
      }));
      S.tasks = (S.tasks || []).map(t => ({
        done:false, notes:'', subjectId:null, dueDate:null, ...t
      }));
      // ÔöÇÔöÇ Migrar / Sincronizar career ÔöÇÔöÇ
      if (!S.career || !S.career.subjects || S.career.subjects.length < 30) {
        S.career = { subjects: DEF_CAREER.map(s=>({...s,correlatives:{toCurse:[...s.correlatives.toCurse],toPass:[...s.correlatives.toPass]}})) };
      } else {
        // Fusionar DEF_CAREER con el estado guardado del usuario
        S.career.subjects = DEF_CAREER.map(def => {
          const existing = S.career.subjects.find(x => x.id === def.id || (x.code && x.code === def.code));
          if (!existing) return {...def, correlatives:{toCurse:[...def.correlatives.toCurse],toPass:[...def.correlatives.toPass]}};
          return {
            ...def,
            ...existing,
            // Conservar el estado guardado del usuario
            status: (existing.status !== undefined && existing.status !== null) ? existing.status : def.status,
            grade: (existing.grade !== null && existing.grade !== undefined) ? existing.grade : def.grade,
            regDate: existing.regDate || def.regDate || null,
            expDate: existing.expDate || def.expDate || null,
            correlatives: { toCurse: [...def.correlatives.toCurse], toPass: [...def.correlatives.toPass] }
          };
        });
      }
      // ÔöÇÔöÇ Sincronizaci├│n bidireccional entre S.subjects y S.career.subjects ÔöÇÔöÇ
      syncSubjectsAndCareer();

      // ÔöÇÔöÇ MIGRACI├ôN: parchear subjects que ten├¡an datos desactualizados ÔöÇÔöÇ
      let patched = false;
      S.subjects = S.subjects.map(s => {
        const p = PATCHES[s.id];
        if (p && s.schedules.length === 0) {
          patched = true;
          return { ...s, ...p };
        }
        if (s.id === 'gestion2' && s.room === 'A confirmar') {
          patched = true;
          return { ...s, code:'496', professor:'Vanden, Guillermo', room:'Aula H├¡brida 33',
            schedules: s.schedules.length ? s.schedules : PATCHES.gestion2.schedules };
        }
        return s;
      });
      if (!S.profile) {
        S.profile = { name: 'Fran Giraudo', career: 'Ingenier├¡a en Inform├ítica ÔÇö IUA', theme: 'dark' };
      }
      if (S.profile && S.profile.theme) {
        applyTheme(S.profile.theme);
      }
      if (patched) save();
    } else {
      S = { subjects: DEF_SUBJECTS.map(s=>({...s})), tasks: DEF_TASKS.map(t=>({...t})),
            career: { subjects: DEF_CAREER.map(s=>({...s,correlatives:{toCurse:[...s.correlatives.toCurse],toPass:[...s.correlatives.toPass]}})) },
            profile: { name: 'Fran Giraudo', career: 'Ingenier├¡a en Inform├ítica ÔÇö IUA', theme: 'dark' } };
      syncSubjectsAndCareer();
      if (S.profile && S.profile.theme) {
        applyTheme(S.profile.theme);
      }
      save();
    }

  } catch(e) {
    S = { subjects: DEF_SUBJECTS.map(s=>({...s})), tasks: DEF_TASKS.map(t=>({...t})),
          career: { subjects: DEF_CAREER.map(s=>({...s,correlatives:{toCurse:[...s.correlatives.toCurse],toPass:[...s.correlatives.toPass]}})) },
          profile: { name: 'Fran Giraudo', career: 'Ingenier├¡a en Inform├ítica ÔÇö IUA', theme: 'dark' } };
    syncSubjectsAndCareer();
  }
}

export function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); }


export function syncSubjectsAndCareer() {
  if (!S.career || !S.career.subjects) return;

  const now = new Date();
  const yearStr = now.getFullYear();
  const monthStr = String(now.getMonth() + 1).padStart(2, '0');
  const dayStr = String(now.getDate()).padStart(2, '0');
  const todayFormatted = `${yearStr}-${monthStr}-${dayStr}`;

  const expDateObj = new Date(now.getFullYear() + 1, now.getMonth() + 6, now.getDate());
  const expYearStr = expDateObj.getFullYear();
  const expMonthStr = String(expDateObj.getMonth() + 1).padStart(2, '0');
  const expDayStr = String(expDateObj.getDate()).padStart(2, '0');
  const expFormatted = `${expYearStr}-${expMonthStr}-${expDayStr}`;

  // Mapa de al├¡as para migrar IDs antiguos a los oficiales del plan
  const idAliasMap = {
    'auditoria': 'cs-aud',
    'fisica2': 'cs-fis2',
    'gestion2': 'cs-ge2',
    'ingweb3': 'cs-iw3',
    'metodos': 'cs-mn',
    'probest': 'cs-pe',
    'redes1': 'cs-red1',
    'progfunc': 'cs-pfs',
    'bd1': 'cs-bd1'
  };

  // 1. Normalizar IDs en S.subjects
  S.subjects.forEach(sub => {
    if (idAliasMap[sub.id]) sub.id = idAliasMap[sub.id];

    const match = S.career.subjects.find(cs =>
      cs.id === sub.id ||
      (cs.code && sub.code && (cs.code === sub.code || cs.code.slice(-3) === sub.code.slice(-3))) ||
      cs.name.toLowerCase() === sub.name.toLowerCase()
    );
    if (match) {
      sub.id = match.id;
      sub.name = match.name;
      sub.code = match.code || sub.code;
    }
  });

  // 2. Migrar subjectId en las tareas
  if (S.tasks) {
    S.tasks.forEach(task => {
      if (task.subjectId && idAliasMap[task.subjectId]) {
        task.subjectId = idAliasMap[task.subjectId];
      }
    });
  }

  // 3. Reconstruir S.subjects ├ÜNICAMENTE con las materias que est├ín CURSANDO
  const cursandoSubs = S.career.subjects.filter(cs => cs.status === 'cursando');
  const cleanSubjects = [];
  const processedIds = new Set();

  cursandoSubs.forEach(cs => {
    if (processedIds.has(cs.id)) return;
    processedIds.add(cs.id);

    // Buscar si ya existen datos ingresados previamente por el usuario
    const existing = S.subjects.find(s =>
      s.id === cs.id ||
      (s.code && cs.code && (s.code === cs.code || s.code.slice(-3) === cs.code.slice(-3))) ||
      s.name.toLowerCase() === cs.name.toLowerCase()
    );

    if (existing) {
      cleanSubjects.push({
        ...existing,
        id: cs.id,
        name: cs.name,
        code: cs.code || existing.code,
        professor: cs.professor || existing.professor || '',
        room: cs.room || existing.room || '',
        status: 'cursando'
      });
    } else {
      // Buscar en los valores por defecto predefinidos
      const defMatch = DEF_SUBJECTS.find(d => d.id === cs.id || d.name.toLowerCase() === cs.name.toLowerCase());
      if (defMatch) {
        cleanSubjects.push({
          ...defMatch,
          id: cs.id,
          professor: cs.professor || defMatch.professor || '',
          room: cs.room || defMatch.room || '',
          status: 'cursando'
        });
      } else {
        cleanSubjects.push({
          id: cs.id,
          name: cs.name,
          code: cs.code || '',
          color: '#6366f1',
          professor: cs.professor || '',
          room: cs.room || '',
          email: '',
          maxAbsences: 6,
          absences: 0,
          grades: [],
          status: 'cursando',
          allowsPromotion: false,
          schedules: []
        });
      }
    }
  });

  // 4. Asegurar fechas de regularidad y vencimiento para materias regulares
  S.career.subjects.forEach(cs => {
    if (cs.status === 'regular') {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const expDateObj = new Date(now.getFullYear() + 1, now.getMonth() + 6, now.getDate());
      const expFormatted = `${expDateObj.getFullYear()}-${String(expDateObj.getMonth()+1).padStart(2,'0')}-${String(expDateObj.getDate()).padStart(2,'0')}`;
      if (!cs.regDate) cs.regDate = todayStr;
      if (!cs.expDate) cs.expDate = expFormatted;
    }
  });

  S.subjects = cleanSubjects;
}
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
