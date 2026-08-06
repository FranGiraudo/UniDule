import { STORAGE_KEY, DEF_SUBJECTS, DEF_TASKS, DEF_CAREER, DEF_SEMINARS, DEF_ELECTIVES, PATCHES } from './constants.js';
import { applyTheme } from './theme.js';

export let S = { subjects:[], tasks:[], notes:[] };

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
    const raw = localStorage.getItem(STORAGE_KEY);
    
    if (raw) {
      S = JSON.parse(raw);
      // Asegurar campos mínimos
      S.subjects = (S.subjects || []).map(s => ({
        absences:0, maxAbsences:6, schedules:[], email:'', code:'',
        grades:[], status:'cursando', allowsPromotion:false, ...s
      }));
      S.tasks = (S.tasks || []).map(t => ({
        done:false, notes:'', subjectId:null, dueDate:null, ...t
      }));
      S.notes = S.notes || [];
      // Migrar / Sincronizar career
      if (!S.career || !S.career.subjects || S.career.subjects.length < 30) {
        S.career = { subjects: DEF_CAREER.map(s=>({...s,correlatives:{toCurse:[...s.correlatives.toCurse],toPass:[...s.correlatives.toPass]}})) };
      } else {
        // Mantiene el plan guardado en lugar de forzar DEF_CAREER
        S.career.subjects = S.career.subjects.map(sub => ({
          ...sub,
          correlatives: sub.correlatives ? { toCurse: [...(sub.correlatives.toCurse||[])], toPass: [...(sub.correlatives.toPass||[])] } : { toCurse: [], toPass: [] }
        }));
      }
      syncSubjectsAndCareer();

      // MIGRACIÓN: parchear subjects con datos desactualizados
      let patched = false;
      S.subjects = S.subjects.map(s => {
        const p = PATCHES[s.id];
        if (p && s.schedules.length === 0) {
          patched = true;
          return { ...s, ...p };
        }
        if (s.id === 'gestion2' && s.room === 'A confirmar') {
          patched = true;
          return { ...s, code:'496', professor:'Vanden, Guillermo', room:'Aula Híbrida 33',
            schedules: s.schedules.length ? s.schedules : PATCHES.gestion2.schedules };
        }
        return s;
      });
      
      // MIGRACIÓN: arreglar IDs viejos (cs- o local-) para que sean UUIDs y evitar colisiones RLS
      S.subjects.forEach(s => {
        if (!s.id || s.id.startsWith('cs-') || s.id.startsWith('local-') || s.id.length < 20) {
          const newId = crypto.randomUUID();
          // Update dependencies
          S.tasks.filter(t => t.subjectId === s.id).forEach(t => t.subjectId = newId);
          S.notes.filter(n => n.subject_id === s.id).forEach(n => n.subject_id = newId);
          s.id = newId;
          patched = true;
        }
      });
      
      if (!S.profile) {
        S.profile = { name: 'Fran Giraudo', career: 'Ingeniería en Informática — IUA', theme: 'dark' };
      }
      if (S.profile && S.profile.theme) {
        applyTheme(S.profile.theme);
      }
      if (patched) save();
    } else {
      S = { subjects: DEF_SUBJECTS.map(s=>({...s})), tasks: DEF_TASKS.map(t=>({...t})), notes: [],
            career: { subjects: DEF_CAREER.map(s=>({...s,correlatives:{toCurse:[...s.correlatives.toCurse],toPass:[...s.correlatives.toPass]}})) },
            profile: { name: 'Fran Giraudo', career: 'Ingeniería en Informática — IUA', theme: 'dark' } };
      syncSubjectsAndCareer();
      if (S.profile && S.profile.theme) {
        applyTheme(S.profile.theme);
      }
      save();
    }

  } catch(e) {
    console.error('loadState error:', e);
    S = { subjects: DEF_SUBJECTS.map(s=>({...s})), tasks: DEF_TASKS.map(t=>({...t})),
          career: { subjects: DEF_CAREER.map(s=>({...s,correlatives:{toCurse:[...s.correlatives.toCurse],toPass:[...s.correlatives.toPass]}})) },
          profile: { name: 'Fran Giraudo', career: 'Ingeniería en Informática — IUA', theme: 'dark' } };
    syncSubjectsAndCareer();
  }
}

export function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); }

// Carga datos de la nube directamente en S y los persiste en localStorage.
// Esta es la fuente de verdad cuando el usuario está logueado.
export function loadStateFromCloud(cloudState) {
  try {
    // Materias activas (las que el usuario está cursando este cuatrimestre)
    S.subjects = (cloudState.subjects || []).map(s => ({
      absences: 0, maxAbsences: 6, schedules: [], email: '', code: '',
      grades: [], status: 'cursando', allowsPromotion: false, ...s
    }));

    // Tareas
    S.tasks = (cloudState.tasks || []).map(t => ({
      done: false, notes: '', subjectId: null, dueDate: null, ...t
    }));

    // Notas
    S.notes = cloudState.notes || [];

    // Perfil
    S.profile = cloudState.profile || { name: 'Usuario', career: 'Ingeniería en Informática', theme: 'dark' };

    // Career: usar datos de la nube (user_progress) sobre la base de DEF_CAREER
    const cloudCareerSubs = cloudState.career && cloudState.career.subjects;
    if (cloudCareerSubs && cloudCareerSubs.length > 30) {
      S.career = {
        subjects: cloudCareerSubs,
        electives: cloudState.career.electives || [],
        seminars: cloudState.career.seminars || []
      };
    } else {
      // La nube no tiene career data todavía: usar local si existe, sino defaults
      const localRaw = localStorage.getItem(STORAGE_KEY);
      const localS = localRaw ? JSON.parse(localRaw) : null;
      if (localS && localS.career && localS.career.subjects && localS.career.subjects.length >= 30) {
        S.career = localS.career;
      } else {
        S.career = {
          subjects: DEF_CAREER.map(s => ({...s, correlatives:{toCurse:[...s.correlatives.toCurse],toPass:[...s.correlatives.toPass]}})),
          electives: [],
          seminars: []
        };
      }
    }

    syncSubjectsAndCareer();

    if (S.profile && S.profile.theme) {
      applyTheme(S.profile.theme);
    }

    // Persistir en localStorage para que esté disponible offline y en recargas
    save();
  } catch(e) {
    console.error('loadStateFromCloud error:', e);
  }
}

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

  // Mapa de alías para migrar IDs antiguos a los oficiales del plan
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

  // 3. Reconstruir S.subjects ÚNICAMENTE con las materias que están CURSANDO
  const cursandoSubs = [
    ...(S.career.subjects ? S.career.subjects.filter(cs => cs.status === 'cursando') : []),
    ...(S.career.electives ? S.career.electives.filter(ce => ce.status === 'cursando') : [])
  ];
  const cleanSubjects = [];
  const processedIds = new Set();

  cursandoSubs.forEach(cs => {
    if (processedIds.has(cs.id)) return;
    processedIds.add(cs.id);

    const existing = S.subjects.find(s =>
      s.id === cs.id ||
      (s.code && cs.code && (s.code === cs.code || s.code.slice(-3) === cs.code.slice(-3))) ||
      s.name.toLowerCase() === cs.name.toLowerCase()
    );

    if (existing) {
      cleanSubjects.push({
        ...existing,
        id: (existing.id && existing.id.length >= 20 && !existing.id.startsWith('cs-') && !existing.id.startsWith('local-')) ? existing.id : crypto.randomUUID(),
        name: cs.name,
        code: cs.code || existing.code,
        professor: cs.professor || existing.professor || '',
        room: cs.room || existing.room || '',
        status: 'cursando'
      });
    } else {
      const defMatch = DEF_SUBJECTS.find(d => d.id === cs.id || d.name.toLowerCase() === cs.name.toLowerCase());
      if (defMatch) {
        cleanSubjects.push({
          ...defMatch,
          id: crypto.randomUUID(),
          professor: cs.professor || defMatch.professor || '',
          room: cs.room || defMatch.room || '',
          status: 'cursando'
        });
      } else {
        cleanSubjects.push({
          id: crypto.randomUUID(),
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
