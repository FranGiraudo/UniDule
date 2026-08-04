/* ══════════════════════════════════════════════
   UniSchedule — app.js  v2 (mobile + PDF)
══════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════
const STORAGE_KEY = 'unischedule-v3';
const DAYS   = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
const DSHORT = ['Lun','Mar','Mié','Jue','Vie'];
const DAY_JS = [null,'Lunes','Martes','Miércoles','Jueves','Viernes'];
const GRID_START = '07:30', GRID_END = '22:30', PPM = 1.55;
const COLORS = [
  '#6366f1','#8b5cf6','#a855f7','#ec4899','#f43f5e','#ef4444',
  '#f97316','#f59e0b','#84cc16','#22c55e','#10b981','#14b8a6',
  '#06b6d4','#0ea5e9','#3b82f6','#64748b'
];
const TYPE_ICON = { 'Tarea':'','Trabajo Práctico':'','Parcial':'','Final':'','Proyecto':'','Laboratorio':'','Otro':'' };
const TYPE_BG   = { 'Tarea':'color-mix(in srgb, var(--primary) 15%, transparent)','Trabajo Práctico':'rgba(16,185,129,.15)','Parcial':'rgba(239,68,68,.17)','Final':'rgba(239,68,68,.24)','Proyecto':'rgba(236,72,153,.15)','Laboratorio':'rgba(245,158,11,.15)','Otro':'rgba(255,255,255,.08)' };
const TYPE_FG   = { 'Tarea':'var(--primary)','Trabajo Práctico':'#6ee7b7','Parcial':'#f87171','Final':'#f87171','Proyecto':'#f9a8d4','Laboratorio':'#fcd34d','Otro':'var(--text2)' };

const SUBJECT_STATUS = {
  cursando:    { label:'Cursando',     color:'var(--primary)', bg:'color-mix(in srgb, var(--primary) 12%, transparent)'  },
  regular:     { label:'Regular',      color:'#60a5fa', bg:'rgba(59,130,246,.12)'  },
  aprobado:    { label:'Aprobada',     color:'#4ade80', bg:'rgba(34,197,94,.12)'   },
  aprobada:    { label:'Aprobada',     color:'#4ade80', bg:'rgba(34,197,94,.12)'   },
  libre:       { label:'Libre',        color:'#f87171', bg:'rgba(239,68,68,.12)'   },
  promocionado:{ label:'Promocionada', color:'#fbbf24', bg:'rgba(245,158,11,.12)'  },
  promocionada:{ label:'Promocionada', color:'#fbbf24', bg:'rgba(245,158,11,.12)'  },
  pendiente:   { label:'Pendiente',    color:'var(--text2)', bg:'rgba(255,255,255,.05)' }
};
const GRADE_TYPES = ['Parcial 1','Parcial 2','Parcial 3','Recuperatorio','Final','TP','Lab','Otro'];
const EXAM_TYPES  = new Set(['Parcial 1','Parcial 2','Parcial 3','Recuperatorio','Final']);

// ═══════════════════════════════════════════════════════════
//  THEMES & DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════
const THEMES = {
  dark: {
    name: 'Midnight Dark',
    primary: '#6366f1',
    bg: '#09090b',
    isLight: false,
    vars: {
      '--bg': '#09090b',
      '--bg2': '#121215',
      '--card': '#18181c',
      '--card2': '#222228',
      '--border': 'rgba(255,255,255,.08)',
      '--text': '#eeeeff',
      '--text2': '#94a3b8',
      '--primary': '#6366f1'
    }
  },
  emerald: {
    name: 'Emerald Obsidian',
    primary: '#10b981',
    bg: '#061412',
    isLight: false,
    vars: {
      '--bg': '#061412',
      '--bg2': '#0b1f1c',
      '--card': '#102a26',
      '--card2': '#163631',
      '--border': 'rgba(52,211,153,.18)',
      '--text': '#e6f7f3',
      '--text2': '#6ee7b7',
      '--primary': '#10b981'
    }
  },
  dracula: {
    name: 'Dracula Purple',
    primary: '#a855f7',
    bg: '#181424',
    isLight: false,
    vars: {
      '--bg': '#181424',
      '--bg2': '#211c30',
      '--card': '#2b253e',
      '--card2': '#37304e',
      '--border': 'rgba(192,132,252,.2)',
      '--text': '#f5f3ff',
      '--text2': '#c084fc',
      '--primary': '#a855f7'
    }
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    primary: '#06b6d4',
    bg: '#070913',
    isLight: false,
    vars: {
      '--bg': '#070913',
      '--bg2': '#0e1225',
      '--card': '#151a36',
      '--card2': '#1e254b',
      '--border': 'rgba(6,182,212,.25)',
      '--text': '#e0f2fe',
      '--text2': '#38bdf8',
      '--primary': '#06b6d4'
    }
  },
  crimson: {
    name: 'Crimson Red',
    primary: '#ef4444',
    bg: '#180808',
    isLight: false,
    vars: {
      '--bg': '#180808',
      '--bg2': '#250d0d',
      '--card': '#2e1212',
      '--card2': '#3c1818',
      '--border': 'rgba(239,68,68,.25)',
      '--text': '#fee2e2',
      '--text2': '#fca5a5',
      '--primary': '#ef4444'
    }
  },
  light: {
    name: 'Enterprise Light',
    primary: '#4f46e5',
    bg: '#f8fafc',
    isLight: true,
    vars: {
      '--bg': '#f8fafc',
      '--bg2': '#f1f5f9',
      '--card': '#ffffff',
      '--card2': '#f1f5f9',
      '--border': '#cbd5e1',
      '--text': '#0f172a',
      '--text2': '#475569',
      '--primary': '#4f46e5'
    }
  },
  sunset: {
    name: 'Sunset Amber (Naranja)',
    primary: '#ea580c',
    bg: '#fff7ed',
    isLight: true,
    vars: {
      '--bg': '#fff7ed',
      '--bg2': '#ffedd5',
      '--card': '#ffffff',
      '--card2': '#ffedd5',
      '--border': '#fed7aa',
      '--text': '#431407',
      '--text2': '#9a3412',
      '--primary': '#ea580c'
    }
  },
  sakura: {
    name: 'Sakura Blossom (Rosa)',
    primary: '#db2777',
    bg: '#fdf2f8',
    isLight: true,
    vars: {
      '--bg': '#fdf2f8',
      '--bg2': '#fce7f3',
      '--card': '#ffffff',
      '--card2': '#fce7f3',
      '--border': '#fbcfe8',
      '--text': '#500724',
      '--text2': '#9d174d',
      '--primary': '#db2777'
    }
  }
};

function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES.dark;
  const root = document.documentElement;
  if (!root) return;
  Object.entries(theme.vars).forEach(([k, v]) => {
    root.style.setProperty(k, v);
  });
}
applyTheme('dark');

function gid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

const DEF_SUBJECTS = [
  { id:'cs-aud', name:'Auditoría', code:'000478', color:'#6366f1',
    professor:'Tapia, C. / Casanovas, J.I.', room:'Aula 14', email:'', maxAbsences:6, absences:0,
    grades:[], status:'cursando', allowsPromotion:false,
    schedules:[
      {id:'a1',day:'Martes',startTime:'10:35',endTime:'12:10',type:'Práctico'},
      {id:'a2',day:'Jueves',startTime:'14:45',endTime:'16:20',type:'Teórico'}
    ]},
  { id:'cs-fis2', name:'Física II', code:'000456', color:'#f59e0b',
    professor:'A confirmar', room:'A confirmar', email:'', maxAbsences:6, absences:0,
    grades:[], status:'cursando', allowsPromotion:false, schedules:[] },
  { id:'cs-ge2', name:'Gestión de Empresas II', code:'000496', color:'#10b981',
    professor:'Vanden, Guillermo', room:'Aula Híbrida 33', email:'', maxAbsences:6, absences:0,
    grades:[], status:'cursando', allowsPromotion:false,
    schedules:[
      {id:'g1',day:'Lunes',startTime:'11:25',endTime:'13:00',type:'Teórico'}
    ]},
  { id:'cs-iw3', name:'Ingeniería Web III', code:'000806', color:'#ec4899',
    professor:'García Mattio, M. / Silvestre, A.', room:'Aula 26', email:'', maxAbsences:6, absences:0,
    grades:[], status:'cursando', allowsPromotion:false,
    schedules:[
      {id:'b1',day:'Martes',startTime:'13:55',endTime:'15:30',type:'Teórico-Lab'},
      {id:'b2',day:'Jueves',startTime:'19:00',endTime:'20:35',type:'Práctico-Lab'}
    ]},
  { id:'cs-mn', name:'Métodos Numéricos', code:'000467', color:'#a855f7',
    professor:'A confirmar', room:'A confirmar', email:'', maxAbsences:6, absences:0,
    grades:[], status:'cursando', allowsPromotion:false, schedules:[] },
  { id:'cs-pe', name:'Probabilidad y Estadística', code:'000256', color:'#14b8a6',
    professor:'Luczywo, Nadia', room:'Aula 28', email:'', maxAbsences:6, absences:0,
    grades:[], status:'cursando', allowsPromotion:false,
    schedules:[
      {id:'c1',day:'Martes',startTime:'10:15',endTime:'12:15',type:'Clases'}
    ]},
  { id:'cs-red1', name:'Redes I', code:'000471', color:'#f97316',
    professor:'Giovanardi, E. / Ávila Mattar, C.', room:'Lab Redes', email:'', maxAbsences:6, absences:0,
    grades:[], status:'cursando', allowsPromotion:false,
    schedules:[
      {id:'d1',day:'Jueves',startTime:'09:45',endTime:'12:10',type:'Teórico-Lab'},
      {id:'d2',day:'Viernes',startTime:'08:00',endTime:'09:30',type:'Práctico-Lab'}
    ]},
  { id:'cs-pfs', name:'Programación Funcional y Scripting', code:'000813', color:'#f43f5e',
    professor:'Montes, M. / García Mattio, M.', room:'Aula 14', email:'', maxAbsences:6, absences:0,
    grades:[], status:'cursando', allowsPromotion:false,
    schedules:[
      {id:'e1',day:'Lunes',startTime:'14:45',endTime:'16:20',type:'Teórico'},
      {id:'e2',day:'Martes',startTime:'13:55',endTime:'15:30',type:'Práctico-Lab'}
    ]}
];

const DEF_TASKS = [
  {id:gid(),title:'1er Parcial',subjectId:'cs-aud',type:'Parcial',dueDate:'2026-09-20',notes:'',done:false},
  {id:gid(),title:'TP Obligatorio — App Web',subjectId:'cs-iw3',type:'Trabajo Práctico',dueDate:'2026-10-05',notes:'Proyecto web completo',done:false},
  {id:gid(),title:'1er Parcial',subjectId:'cs-red1',type:'Parcial',dueDate:'2026-09-18',notes:'',done:false},
  {id:gid(),title:'1er Parcial',subjectId:'cs-pe',type:'Parcial',dueDate:'2026-09-25',notes:'',done:false},
  {id:gid(),title:'1er Parcial',subjectId:'cs-pfs',type:'Parcial',dueDate:'2026-09-22',notes:'',done:false},
];

// Patches: subjects cuyos datos cambiaron después del primer guardado en localStorage
const PATCHES = {
  gestion2: {
    code:'496', professor:'Vanden, Guillermo', room:'Aula Híbrida 33',
    schedules:[{id:'g1',day:'Lunes',startTime:'11:25',endTime:'13:00',type:'Teórico'}]
  }
};

// ═══════════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════════
var S = { subjects:[], tasks:[] };
let currentView = 'dashboard';
let taskFilter  = 'all';
let selColor    = '#6366f1';
let slots       = [];
let sbOpen      = true;
let activeDay   = null;   // día activo en schedule (mobile day-picker)
let gradesWork  = [];     // copia de trabajo para modal de calificaciones
let gradesSubId = null;
let deferredPrompt = null; // PWA install prompt

function loadState() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    // Si estamos logueados y tenemos estado cargado en S, usamos ese estado en vez del localStorage
    if (window.isLoggedIn && window.S && window.S.subjects) {
      // S ya tiene los datos, no leemos de raw
      raw = JSON.stringify(window.S);
    }
    
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
      // ── Migrar / Sincronizar career ──
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
      // ── Sincronización bidireccional entre S.subjects y S.career.subjects ──
      syncSubjectsAndCareer();

      // ── MIGRACIÓN: parchear subjects que tenían datos desactualizados ──
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
      if (!S.profile) {
        S.profile = { name: 'Fran Giraudo', career: 'Ingeniería en Informática — IUA', theme: 'dark' };
      }
      if (S.profile && S.profile.theme) {
        applyTheme(S.profile.theme);
      }
      if (patched) save();
    } else {
      S = { subjects: DEF_SUBJECTS.map(s=>({...s})), tasks: DEF_TASKS.map(t=>({...t})),
            career: { subjects: DEF_CAREER.map(s=>({...s,correlatives:{toCurse:[...s.correlatives.toCurse],toPass:[...s.correlatives.toPass]}})) },
            profile: { name: 'Fran Giraudo', career: 'Ingeniería en Informática — IUA', theme: 'dark' } };
      syncSubjectsAndCareer();
      if (S.profile && S.profile.theme) {
        applyTheme(S.profile.theme);
      }
      save();
    }

  } catch(e) {
    S = { subjects: DEF_SUBJECTS.map(s=>({...s})), tasks: DEF_TASKS.map(t=>({...t})),
          career: { subjects: DEF_CAREER.map(s=>({...s,correlatives:{toCurse:[...s.correlatives.toCurse],toPass:[...s.correlatives.toPass]}})) },
          profile: { name: 'Fran Giraudo', career: 'Ingeniería en Informática — IUA', theme: 'dark' } };
    syncSubjectsAndCareer();
  }
}

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); }

// ═══════════════════════════════════════════════════════════
//  TIME UTILITIES
// ═══════════════════════════════════════════════════════════
const t2m  = t  => { const [h,m]=t.split(':').map(Number); return h*60+m; };
const m2t  = m  => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
const t2y  = t  => (t2m(t) - t2m(GRID_START)) * PPM;
const dur  = (s,e) => (t2m(e) - t2m(s)) * PPM;
const GRID_H = dur(GRID_START, GRID_END);

function todayDay()  { return DAY_JS[new Date().getDay()] || null; }
function nowMin()    { const n=new Date(); return n.getHours()*60+n.getMinutes(); }
function isMobile()  { return window.innerWidth <= 768; }

function formatDate(ds) {
  if (!ds) return 'Sin fecha';
  return new Date(ds+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'short',year:'numeric'});
}
function daysUntil(ds) {
  if (!ds) return null;
  return Math.ceil((new Date(ds+'T12:00:00') - new Date()) / 86400000);
}
function urgColor(d) {
  if (d===null) return 'var(--text2)';
  if (d<0||d<=2) return '#f87171';
  if (d<=7)  return '#fb923c';
  if (d<=14) return '#fbbf24';
  return '#34d399';
}

// ═══════════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════════
const TITLES    = {dashboard:'Dashboard',schedule:'Horario Semanal',subjects:'Materias',tasks:'Tareas & Exámenes',attendance:'Asistencia',career:'Plan de Carrera',settings:'Configuración & Perfil'};
const ADD_VIEWS = {subjects:true,tasks:true};
const ADD_LBL   = {subjects:'Materia',tasks:'Tarea'};

function navigate(v) {
  currentView = v;
  document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
  document.getElementById('view-'+v).classList.add('active');
  // Sidebar desktop nav
  document.querySelectorAll('.nav-item[data-view]').forEach(x =>
    x.classList.toggle('active', x.dataset.view === v)
  );
  // Bottom nav mobile
  document.querySelectorAll('.bnav-item[data-view]').forEach(x =>
    x.classList.toggle('active', x.dataset.view === v)
  );
  document.getElementById('topbar-title').textContent = TITLES[v]||v;
  renderView(v);
  updateDate();
  // Close mobile sidebar if open
  closeMobileSidebar();
}

function handleTopbarAdd() {
  if (currentView==='subjects') openSubModal();
  else if (currentView==='tasks') openTaskModal();
}

function toggleSidebar() {
  sbOpen = !sbOpen;
  document.getElementById('sidebar').classList.toggle('open', sbOpen);
  document.getElementById('sb-icon').innerHTML = sbOpen
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
}

function toggleMobileSidebar() {
  const sb  = document.getElementById('sidebar');
  const ovr = document.getElementById('mobile-overlay');
  const open = sb.classList.toggle('mobile-open');
  ovr.style.display = open ? 'block' : 'none';
}
function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('mobile-overlay').style.display = 'none';
}

// ═══════════════════════════════════════════════════════════
//  RENDER DISPATCHER
// ═══════════════════════════════════════════════════════════
function renderView(v) {
  ({dashboard:renderDash, schedule:renderSched, subjects:renderSubs,
    tasks:renderTasks, attendance:renderAtt, career:renderCareer, settings:renderSettings}[v] || (()=>{}))();
}
function updateDate() {
  document.getElementById('topbar-date').textContent =
    new Date().toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
}

// ═══════════════════════════════════════════════════════════
//  NEXT CLASS LOGIC
// ═══════════════════════════════════════════════════════════
function getNextClass() {
  const today=todayDay(), now=nowMin(), secs=new Date().getSeconds();
  const todays=[];
  S.subjects.forEach(s => s.schedules.filter(sc=>sc.day===today).forEach(sc=>todays.push({s,sc})));
  todays.sort((a,b)=>t2m(a.sc.startTime)-t2m(b.sc.startTime));
  for (const {s,sc} of todays) {
    const st=t2m(sc.startTime), en=t2m(sc.endTime);
    if (now>=st&&now<en) return {s,sc,status:'inProgress',sec:(en-now)*60-secs};
    if (now<st)          return {s,sc,status:'upcoming',  sec:(st-now)*60-secs};
  }
  if (!today) return null;
  for (let off=1;off<=6;off++) {
    const nd=DAYS[(DAYS.indexOf(today)+off)%DAYS.length];
    const nb=[];
    S.subjects.forEach(s=>s.schedules.filter(sc=>sc.day===nd).forEach(sc=>nb.push({s,sc})));
    if (!nb.length) continue;
    nb.sort((a,b)=>t2m(a.sc.startTime)-t2m(b.sc.startTime));
    const {s,sc}=nb[0];
    return {s,sc,status:'nextDay',sec:(off*1440+t2m(sc.startTime)-now)*60-secs,nextDay:nd};
  }
  return null;
}

let _lastNcKey='';
function renderNC() {
  const nc=getNextClass(), el=document.getElementById('nc-content');
  if (!el) return;
  if (!nc) {
    el.innerHTML=`<div style="text-align:center;padding:10px;">
      <div style="display:inline-flex;padding:0.6rem;border-radius:50%;background:rgba(74,222,128,.15);color:#4ade80;margin-bottom:5px;">${SVG_ICONS.check}</div>
      <div style="font-weight:700;">Sin clases programadas</div>
      <div style="font-size:11px;color:var(--text2);margin-top:2px;">Agrega horarios para ver el countdown.</div>
    </div>`;
    return;
  }
  const {s,sc,status,sec,nextDay}=nc;
  const h=Math.floor(Math.max(0,sec)/3600), m=Math.floor((Math.max(0,sec)%3600)/60), ss=Math.floor(Math.max(0,sec)%60);
  const pad=n=>String(n).padStart(2,'0');
  const statusTxt = status==='inProgress'?'● EN CURSO AHORA':status==='upcoming'?'PRÓXIMA CLASE HOY':`PRÓXIMA — ${(nextDay||'').toUpperCase()}`;
  const cdLabel   = status==='inProgress'?'Finaliza en':'Empieza en';
  const key=s.id+status;
  if (key!==_lastNcKey) {
    _lastNcKey=key;
    el.innerHTML=`
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div style="flex:1;min-width:160px;">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(165,180,252,.7);margin-bottom:6px;">${statusTxt}</div>
          <div style="font-size:20px;font-weight:900;letter-spacing:-.03em;color:${s.color};margin-bottom:4px;">${s.name}</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:11px;color:var(--text2);align-items:center;">
            <span style="display:inline-flex;align-items:center;gap:3px;">${SVG_ICONS.target} ${s.room || 'Aula'}</span>
            <span style="display:inline-flex;align-items:center;gap:3px;">${SVG_ICONS.clock} ${sc.startTime}–${sc.endTime}</span>
            <span style="padding:1px 6px;border-radius:5px;background:rgba(255,255,255,.08);font-size:10px;font-weight:600;">${sc.type}</span>
          </div>
        </div>
        <div>
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(165,180,252,.7);text-align:center;margin-bottom:6px;">${cdLabel}</div>
          <div style="display:flex;gap:5px;align-items:center;">
            <div class="cd-unit"><div class="cd-num" id="cd-h">${pad(h)}</div><div class="cd-lbl">hrs</div></div>
            <div class="cd-sep">:</div>
            <div class="cd-unit"><div class="cd-num" id="cd-m">${pad(m)}</div><div class="cd-lbl">min</div></div>
            <div class="cd-sep">:</div>
            <div class="cd-unit"><div class="cd-num" id="cd-s">${pad(ss)}</div><div class="cd-lbl">seg</div></div>
          </div>
        </div>
      </div>`;
  } else {
    const hE=document.getElementById('cd-h'), mE=document.getElementById('cd-m'), sE=document.getElementById('cd-s');
    if (hE) { hE.textContent=pad(h); mE.textContent=pad(m); sE.textContent=pad(ss); }
  }
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════
function renderDash() {
  ensureCareerLoaded();
  _lastNcKey=''; renderNC(); updateDate();
  const td=todayDay(), now=nowMin();
  const pending=S.tasks.filter(t=>!t.done).length;
  const todayC=td?S.subjects.reduce((a,s)=>a+s.schedules.filter(sc=>sc.day===td).length,0):0;
  const warnSubs=S.subjects.filter(s=>s.absences>=s.maxAbsences*.75);
  const warn=warnSubs.length;

  document.getElementById('stats-grid').innerHTML=`
    <div class="stat-card"><div class="stat-icon" style="background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);">${SVG_ICONS.book}</div><div class="stat-value gradient-text">${S.subjects.length}</div><div class="stat-label">Materias</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(245,158,11,.15);color:#fbbf24;">${SVG_ICONS.check}</div><div class="stat-value" style="color:#fbbf24;">${pending}</div><div class="stat-label">Pendientes</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(34,197,94,.15);color:#34d399;">${SVG_ICONS.clock}</div><div class="stat-value" style="color:#34d399;">${todayC}</div><div class="stat-label">Hoy</div></div>
    <div class="stat-card stat-card-alert">
      <div class="stat-icon" style="background:rgba(239,68,68,.15);color:#f87171;">${SVG_ICONS.alert}</div>
      <div class="stat-value" style="color:${warn?'#f87171':'#34d399'};">${warn}</div>
      <div class="stat-label">Alertas</div>
      ${warn ? `
        <div class="alert-tooltip">
          <div style="font-weight:800;font-size:11px;margin-bottom:4px;color:#f87171;">Materias en riesgo de ausencias:</div>
          ${warnSubs.map(s => `<div style="font-size:10px;margin-top:2px;">• <strong>${s.name}</strong> (${s.absences}/${s.maxAbsences} faltas)</div>`).join('')}
        </div>
      ` : `
        <div class="alert-tooltip">
          <div style="font-weight:700;font-size:10px;color:#4ade80;">Sin alertas de ausencias</div>
        </div>
      `}
    </div>`;

  document.getElementById('today-lbl').textContent=td||'Fin de semana';
  const blocks=[];
  if (td) S.subjects.forEach(s=>s.schedules.filter(sc=>sc.day===td).forEach(sc=>blocks.push({s,sc})));
  blocks.sort((a,b)=>t2m(a.sc.startTime)-t2m(b.sc.startTime));

  document.getElementById('today-list').innerHTML=blocks.length
    ? blocks.map(({s,sc})=>{
        const past=now>t2m(sc.endTime), inPrg=now>=t2m(sc.startTime)&&now<t2m(sc.endTime);
        return `<div class="today-row" style="opacity:${past?.5:1};border-left:3px solid ${s.color};">
          <div style="flex:1;"><div style="font-weight:700;font-size:13px;">${s.name}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:2px;">${sc.startTime}–${sc.endTime} · ${sc.type} · ${s.room}</div></div>
          ${inPrg?`<span class="badge" style="background:rgba(34,197,94,.15);color:#4ade80;border:1px solid rgba(34,197,94,.3);white-space:nowrap;">EN CURSO</span>`:''}
          ${past?`<span style="font-size:10px;color:var(--text2);">${SVG_ICONS.check}</span>`:''}
        </div>`;}).join('')
    : `<div class="empty-st" style="padding:24px 16px;"><div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);margin-bottom:0.5rem;">${SVG_ICONS.clock}</div><div style="font-weight:600;">Sin clases hoy</div></div>`;

  const ups=[...S.tasks].filter(t=>!t.done).sort((a,b)=>(a.dueDate||'9999')<(b.dueDate||'9999')?-1:1).slice(0,5);
  document.getElementById('upcoming-list').innerHTML=ups.length
    ? ups.map(t=>{
        const sub=S.subjects.find(s=>s.id===t.subjectId), d=daysUntil(t.dueDate);
        const isExam = EXAM_TYPES.has(t.type) || (t.type && (t.type.toLowerCase().includes('parcial') || t.type.toLowerCase().includes('final') || t.type.toLowerCase().includes('examen')));
        const isUrgentExam = isExam && d !== null && d >= 0 && d <= 3;
        const isOverdue = d !== null && d < 0;

        let badgeStyle = `background:${urgColor(d)}1c;color:${urgColor(d)};border:1px solid ${urgColor(d)}33;`;
        let cardStyle = '';
        let statusLabel = d===null?'—':d<0?'Vencida':d===0?'Hoy':`${d}d`;

        if (isUrgentExam) {
          badgeStyle = `background:rgba(249,115,22,.25);color:#ffedd5;border:1px solid #f97316;box-shadow:0 0 8px rgba(249,115,22,.4);font-weight:800;`;
          cardStyle = `background:rgba(249,115,22,.08);border-left:3px solid #f97316;`;
          statusLabel = d===0 ? '¡RINDES HOY!' : `¡EXAMEN EN ${d}D!`;
        } else if (isOverdue) {
          cardStyle = `background:rgba(239,68,68,.06);border-left:3px solid #ef4444;`;
        }

        return `<div class="upcoming-item" style="${cardStyle}">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <div>
              <div style="font-size:13px;font-weight:700;">${t.title}</div>
              ${sub?`<div style="margin-top:3px;"><span class="badge" style="background:${sub.color}18;color:${sub.color};">${sub.name}</span></div>`:``}
            </div>
            <div style="text-align:right;flex-shrink:0;">
              <span class="badge" style="${badgeStyle}font-size:10px;">${statusLabel}</span>
              <div style="font-size:10px;color:var(--text2);margin-top:2px;">${formatDate(t.dueDate)}</div>
            </div>
          </div></div>`;}).join('')
    : `<div class="empty-st" style="padding:24px 16px;"><div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:rgba(74,222,128,.15);color:#4ade80;margin-bottom:0.5rem;">${SVG_ICONS.check}</div><div style="font-weight:600;">Sin pendientes</div></div>`;
}

// ═══════════════════════════════════════════════════════════
//  SCHEDULE GRID
// ═══════════════════════════════════════════════════════════
function assignCols(blocks) {
  const sorted=[...blocks].sort((a,b)=>t2m(a.sc.startTime)-t2m(b.sc.startTime));
  const cols=[];
  const result=sorted.map(b=>{
    const st=t2m(b.sc.startTime);
    let col=cols.findIndex(e=>e<=st);
    if (col===-1){col=cols.length;cols.push(0);}
    cols[col]=t2m(b.sc.endTime);
    return {...b,col};
  });
  return result.map(b=>({...b,nCols:cols.length}));
}

function setActiveDay(day) {
  activeDay=day;
  renderSched();
}

function renderSched() {
  const td=todayDay(), nowM=nowMin(), gs=t2m(GRID_START), tm=t2m(GRID_END)-gs;
  if (!activeDay) activeDay=td||'Lunes';

  const mobile=isMobile();

  // ── Legend (desktop only, rendered via HTML show/hide) ──
  const legendEl=document.getElementById('sched-legend');
  if (legendEl) {
    legendEl.innerHTML=S.subjects.filter(s=>s.schedules.length>0).map(s=>
      `<div class="legend-chip" style="background:${s.color}18;border:1px solid ${s.color}44;">
        <div style="width:7px;height:7px;border-radius:50%;background:${s.color};flex-shrink:0;"></div>
        <span style="color:${s.color};">${s.name}</span>
      </div>`).join('');
  }

  // ── Day tabs (mobile) ──
  const tabsEl=document.getElementById('day-tabs-bar');
  if (tabsEl) {
    tabsEl.innerHTML=DAYS.map((day,i)=>{
      const hasCls=S.subjects.some(s=>s.schedules.some(sc=>sc.day===day));
      const isAct =day===activeDay, isTd=day===td;
      return `<div class="day-tab ${isAct?'active':''} ${isTd?'today-tab':''}" onclick="setActiveDay('${day}')">
        <span>${DSHORT[i]}</span>
        <div class="day-tab-dot ${hasCls?'has-class':''}"></div>
      </div>`;
    }).join('');
  }

  // ── Time labels & hour lines ──
  let tlabels='', hlines='';
  for (let mn=0;mn<=tm;mn+=30) {
    const y=mn*PPM, isH=mn%60===0, ts=m2t(gs+mn);
    tlabels+=`<div style="position:absolute;top:${y-7}px;right:7px;font-size:${isH?10:9}px;font-weight:600;color:var(--text2);opacity:${isH?1:.45};">${ts}</div>`;
    hlines +=`<div style="position:absolute;top:${y}px;left:0;right:0;border-top:1px solid rgba(255,255,255,${isH?.06:.03});pointer-events:none;"></div>`;
  }

  if (mobile) {
    // ══ MOBILE: single day view ══
    const rawBlocks=[];
    S.subjects.forEach(s=>s.schedules.filter(sc=>sc.day===activeDay).forEach(sc=>rawBlocks.push({s,sc})));
    rawBlocks.sort((a,b)=>t2m(a.sc.startTime)-t2m(b.sc.startTime));

    if (!rawBlocks.length) {
      document.getElementById('sched-container').innerHTML=`
        <div class="empty-st" style="padding:40px 20px;">
          <div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);margin-bottom:0.5rem;">${SVG_ICONS.clock}</div>
          <div style="font-weight:700;">Sin clases ${activeDay==='Sábado'||activeDay==='Domingo'?'este día':'el '+activeDay}</div>
          <div style="font-size:12px;margin-top:6px;">¡Día libre!</div>
        </div>`;
      return;
    }

    const cards=rawBlocks.map(({s,sc})=>{
      const durationMin=t2m(sc.endTime)-t2m(sc.startTime);
      const isNow=nowM>=t2m(sc.startTime)&&nowM<t2m(sc.endTime)&&activeDay===td;
      return `
        <div class="mobile-class-card" style="border-left-color:${s.color};border-left-width:4px;${isNow?`background:${s.color}18;`:''}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
            <div style="font-size:15px;font-weight:800;color:${s.color};flex:1;">${s.name}</div>
            ${isNow?`<span class="badge" style="background:rgba(34,197,94,.15);color:#4ade80;border:1px solid rgba(34,197,94,.3);flex-shrink:0;">EN CURSO</span>`:''}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;font-size:11px;color:var(--text2);background:var(--card2);padding:8px 10px;border-radius:6px;margin-bottom:8px;">
            <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Horario</span><strong style="color:var(--text);">${sc.startTime} – ${sc.endTime}</strong> (${durationMin}m)</div>
            <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Aula / Sede</span><strong style="color:var(--text);">${s.room || '—'}</strong></div>
            <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Tipo</span><strong style="color:var(--text);">${sc.type || '—'}</strong></div>
            <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Docente</span><strong style="color:var(--text);">${s.professor || '—'}</strong></div>
            ${s.email?`<div style="grid-column:1/-1;"><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Contacto</span><a href="mailto:${s.email}" style="color:var(--primary);font-weight:600;">${s.email}</a></div>`:''}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:10px;color:var(--text2);">${s.code?`Cód. ${s.code}`:''}</span>
            <button class="btn btn-ghost btn-sm" onclick="openSubModal('${s.id}')" style="font-size:11px;">Editar Materia</button>
          </div>
        </div>`;
    }).join('');

    document.getElementById('sched-container').innerHTML=`
      <div style="padding:12px;">
        <div style="font-size:12px;color:var(--text2);margin-bottom:10px;font-weight:600;">${rawBlocks.length} clase${rawBlocks.length!==1?'s':''} · ${activeDay}${activeDay===td?' (hoy)':''}</div>
        ${cards}
      </div>`;

  } else {
    // ══ DESKTOP: full 6-day grid ══
    const dayCols=DAYS.map((day)=>{
      const isToday=day===td;
      const rawBlocks=[];
      S.subjects.forEach(s=>s.schedules.filter(sc=>sc.day===day).forEach(sc=>rawBlocks.push({s,sc})));
      const blocks=assignCols(rawBlocks);

      const bHtml=blocks.map(({s,sc,col,nCols})=>{
        const top=t2y(sc.startTime), h=dur(sc.startTime,sc.endTime);
        const w=100/nCols, lft=col*w;
        return `<div class="class-block"
          style="top:${top}px;height:${h}px;left:${3+lft*.97}%;right:${3+(100-lft-w)*.97}%;
          background:${s.color}1e;border-left:3px solid ${s.color};border-top:1px solid ${s.color}33;"
          onclick="showCP('${s.id}','${sc.id}',event)"
          title="${s.name} — ${sc.startTime} a ${sc.endTime}">
          <div class="cb-name" style="color:${s.color};">${s.name}</div>
          <div class="cb-type" style="color:${s.color}aa;">${sc.type}</div>
          ${h>55?`<div class="cb-room" style="color:${s.color}77;">${s.room}</div>`:''}
        </div>`;}).join('');

      let nowLine='';
      if (isToday&&nowM>=gs&&nowM<=gs+tm) {
        const y=t2y(m2t(nowM));
        nowLine=`<div class="now-line" style="top:${y}px;"><div class="now-dot"></div></div>`;
      }
      return `<div style="flex:1;min-width:0;position:relative;height:${GRID_H}px;border-left:1px solid var(--border);background:${isToday?'rgba(99,102,241,.03)':'transparent'};">${hlines}${bHtml}${nowLine}</div>`;
    }).join('');

    const headers=DAYS.map((d,i)=>`
      <div style="flex:1;min-width:0;padding:11px 6px;text-align:center;border-left:1px solid var(--border);
        font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;
        color:${d===td?'var(--primary)':'var(--text2)'};background:${d===td?'color-mix(in srgb, var(--primary) 4%, transparent)':'transparent'};">
        <div>${DSHORT[i]}</div>
        ${d===td?`<div style="width:5px;height:5px;background:var(--primary);border-radius:50%;margin:4px auto 0;box-shadow:0 0 6px var(--primary);"></div>`:''}
      </div>`).join('');

    document.getElementById('sched-container').innerHTML=`
      <div style="display:flex;border-bottom:1px solid var(--border);">
        <div style="min-width:54px;flex-shrink:0;"></div>
        <div style="flex:1;display:flex;">${headers}</div>
      </div>
      <div style="display:flex;">
        <div style="min-width:54px;width:54px;flex-shrink:0;background:var(--bg2);border-right:1px solid var(--border);z-index:2;height:${GRID_H}px;position:relative;">${tlabels}</div>
        <div style="flex:1;display:flex;min-width:0;">${dayCols}</div>
      </div>`;
  }
}

// Class popup (desktop)
function showCP(sid,scid,e) {
  e.stopPropagation();
  const s=S.subjects.find(x=>x.id===sid); if(!s) return;
  const sc=s.schedules.find(x=>x.id===scid); if(!sc) return;
  const box=document.getElementById('class-popup-box');
  box.style.borderTop=`3px solid ${s.color}`;
  box.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
      <div style="font-size:14px;font-weight:800;color:${s.color};">${s.name}</div>
      ${s.code?`<span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;background:${s.color}18;color:${s.color};">Cód. ${s.code}</span>`:''}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;font-size:11px;color:var(--text2);background:var(--card2);padding:8px 10px;border-radius:6px;margin-bottom:8px;">
      <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Horario</span><strong style="color:var(--text);">${sc.day} ${sc.startTime}–${sc.endTime}</strong></div>
      <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Aula / Sede</span><strong style="color:var(--text);">${s.room || '—'}</strong></div>
      <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Modalidad</span><strong style="color:var(--text);">${sc.type || '—'}</strong></div>
      <div><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Docente</span><strong style="color:var(--text);">${s.professor || '—'}</strong></div>
      ${s.email?`<div style="grid-column:1/-1;"><span style="opacity:.6;font-size:9px;display:block;font-weight:700;text-transform:uppercase;">Contacto</span><a href="mailto:${s.email}" style="color:var(--primary);font-weight:600;">${s.email}</a></div>`:''}
    </div>
    <div style="margin-top:10px;display:flex;justify-content:flex-end;gap:6px;">
      <button class="btn btn-ghost btn-sm" style="font-size:11px;"
        onclick="document.getElementById('class-popup').style.display='none';openSubModal('${s.id}')">Editar Materia</button>
      <button class="btn btn-ghost btn-sm" style="font-size:11px;"
        onclick="document.getElementById('class-popup').style.display='none'">Cerrar</button>
    </div>`;
  const popup=document.getElementById('class-popup');
  popup.style.display='block';
  const r=e.currentTarget.getBoundingClientRect();
  popup.style.left=Math.min(r.left,window.innerWidth-240)+'px';
  popup.style.top=Math.max(10,r.top-10)+'px';
  popup.style.transform='translateY(-100%)';
}
document.addEventListener('click',()=>{ document.getElementById('class-popup').style.display='none'; });

// ═══════════════════════════════════════════════════════════
//  PDF EXPORT
// ═══════════════════════════════════════════════════════════
function exportPDF() {
  const win=window.open('','_blank','width=900,height=700');
  if (!win) { alert('Permití popups para exportar el PDF.'); return; }

  // Build a day→classes map
  const byDay={};
  DAYS.forEach(d=>{ byDay[d]=[]; });
  S.subjects.forEach(s=>{
    s.schedules.forEach(sc=>{
      byDay[sc.day].push({...sc,subName:s.name,subColor:s.color,prof:s.professor,room:s.room,code:s.code});
    });
  });
  DAYS.forEach(d=>byDay[d].sort((a,b)=>t2m(a.startTime)-t2m(b.startTime)));

  // Build tasks section
  const pending=[...S.tasks].filter(t=>!t.done).sort((a,b)=>(a.dueDate||'9999')<(b.dueDate||'9999')?-1:1);

  const taskRows=pending.map(t=>{
    const sub=S.subjects.find(s=>s.id===t.subjectId);
    const d=daysUntil(t.dueDate);
    const urg=d===null?'':d<0?'VENCIDA':d===0?'HOY':d<=7?'≤7d':'OK';
    return `<tr>
      <td>${t.title}</td>
      <td>${sub?sub.name:'—'}</td>
      <td>${t.type}</td>
      <td>${formatDate(t.dueDate)}</td>
      <td>${urg} ${d===null?'':d<0?`hace ${Math.abs(d)}d`:d===0?'Hoy':`${d}d`}</td>
    </tr>`;
  }).join('');

  // Build schedule columns
  const dayCols=DAYS.map(day=>{
    const classes=byDay[day];
    const cells=classes.length
      ? classes.map(c=>`
          <div style="background:${c.subColor}18;border-left:3px solid ${c.subColor};border-radius:6px;padding:7px 9px;margin-bottom:6px;">
            <div style="font-weight:700;font-size:12px;color:${c.subColor};">${c.subName}</div>
            <div style="font-size:11px;color:#555;margin-top:3px;">${c.startTime}–${c.endTime}</div>
            <div style="font-size:10px;color:#777;">${c.type} · ${c.room}</div>
          </div>`).join('')
      : `<div style="color:#bbb;font-size:11px;text-align:center;padding:16px 0;">Libre</div>`;
    return `<td style="vertical-align:top;padding:6px;border-right:1px solid #eee;min-width:110px;">
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#555;margin-bottom:8px;">${day}</div>
      ${cells}
    </td>`;
  }).join('');

  const now=new Date().toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'});
  const themeColor = THEMES[S.profile?.theme] ? THEMES[S.profile.theme].primary : '#6366f1';

  win.document.write(`<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Horario IUA — Ingeniería en Informática</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; padding: 32px 28px; }
      h1   { font-size: 22px; font-weight: 900; color: #1a1a2e; letter-spacing: -.02em; }
      .sub { font-size: 12px; color: #666; margin-top: 3px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid ${themeColor}; padding-bottom: 16px; }
      .badge-utn { background: linear-gradient(135deg,${themeColor},#8b5cf6); color: #fff; padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; }
      .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: ${themeColor}; margin: 24px 0 12px; border-left: 3px solid ${themeColor}; padding-left: 10px; }
      table.sched { width: 100%; border-collapse: collapse; }
      table.sched td { vertical-align: top; }
      table.tasks { width: 100%; border-collapse: collapse; font-size: 12px; }
      table.tasks th { background: #f5f5ff; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: ${themeColor}; border-bottom: 2px solid ${themeColor}; }
      table.tasks td { padding: 8px 10px; border-bottom: 1px solid #eee; }
      table.tasks tr:hover td { background: #f9f9ff; }
      .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #eee; font-size: 10px; color: #999; display: flex; justify-content: space-between; }
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { padding: 16px; }
        .no-print { display: none !important; }
      }
    </style>
  </head><body>
    <div class="header">
      <div>
        <h1>Horario Universitario</h1>
        <div class="sub">Ingeniería en Informática · IUA · 2do Semestre 2026</div>
        <div class="sub">Generado el ${now}</div>
      </div>
      <div>
        <div class="badge-utn">UniSchedule</div>
        <div style="margin-top:8px;text-align:right;">
          <button class="no-print" onclick="window.print()" style="background:${themeColor};color:#fff;border:none;padding:7px 16px;border-radius:7px;cursor:pointer;font-weight:700;font-size:12px;">Guardar como PDF</button>
        </div>
      </div>
    </div>

    <div class="section-title">Horario Semanal</div>
    <table class="sched"><tr>${dayCols}</tr></table>

    ${pending.length?`
    <div class="section-title">Tareas & Exámenes Pendientes (${pending.length})</div>
    <table class="tasks">
      <thead><tr><th>Título</th><th>Materia</th><th>Tipo</th><th>Fecha</th><th>Urgencia</th></tr></thead>
      <tbody>${taskRows}</tbody>
    </table>`:''}

    <div class="footer">
      <span>UniSchedule · IUA Ingeniería en Informática</span>
      <span>${now}</span>
    </div>
  </body></html>`);
  win.document.close();
  win.focus();
}

// ═══════════════════════════════════════════════════════════
//  SUBJECTS VIEW
// ═══════════════════════════════════════════════════════════
function renderSubs() {
  const n=S.subjects.length;
  document.getElementById('sub-count-lbl').textContent=`${n} materia${n!==1?'s':''} registrada${n!==1?'s':''}`;
  if (!n) {
    document.getElementById('subjects-grid').innerHTML=`<div class="empty-st" style="grid-column:1/-1;"><div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);margin-bottom:0.5rem;">${SVG_ICONS.book}</div><div style="font-weight:700;">No hay materias todavía</div></div>`;
    return;
  }
  document.getElementById('subjects-grid').innerHTML=S.subjects.map(s=>{
    const pct=s.absences/s.maxAbsences;
    const bc=pct>=1?'#ef4444':pct>=.75?'#f97316':'#22c55e';
    const chips=s.schedules.length
      ?s.schedules.map(sc=>`<div class="sched-chip"><span style="color:${s.color};font-size:9px;">●</span>${sc.day.slice(0,3)} ${sc.startTime}–${sc.endTime} <span style="opacity:.6;">${sc.type}</span></div>`).join('')
      :`<span style="font-size:11px;color:var(--text2);font-style:italic;">Sin horario asignado</span>`;
    const st=SUBJECT_STATUS[s.status||'cursando']||SUBJECT_STATUS.cursando;
    const gradeItems=(s.grades||[]).slice(-4);
    const gradeChips=gradeItems.map(g=>{
      const gsc=g.score!==''&&g.score!==null?parseFloat(g.score):null;
      const gc=gsc!==null?(gsc>=4?'#4ade80':'#f87171'):'var(--text2)';
      return `<span style="font-size:10px;padding:2px 8px;border-radius:5px;background:${gc}1a;color:${gc};border:1px solid ${gc}30;font-weight:700;">${g.type}: ${gsc!==null?gsc:'—'}</span>`;
    }).join('');
    return `<div class="sub-card">
      <div class="sub-card-accent" style="background:${s.color};"></div>
      <div class="sub-card-body">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:10px;">
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:800;line-height:1.2;margin-bottom:5px;">${s.name}</div>
            <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;">
              ${s.code?`<span style="padding:2px 7px;border-radius:5px;font-size:10px;font-weight:700;background:${s.color}18;color:${s.color};">Cód. ${s.code}</span>`:''}
              <span style="padding:2px 8px;border-radius:5px;font-size:10px;font-weight:700;background:${st.bg};color:${st.color};">${st.label}</span>
            </div>
          </div>
          <div style="display:flex;gap:5px;">
            <button class="btn-xs" onclick="openGradesModal('${s.id}')" title="Calificaciones">${SVG_ICONS.chart}</button>
            <button class="btn-xs" onclick="openSubModal('${s.id}')" title="Editar">${SVG_ICONS.edit}</button>
            <button class="btn-xs" onclick="confirmDel('subject','${s.id}')" title="Eliminar" style="color:#f87171;">${SVG_ICONS.trash}</button>
          </div>
        </div>
        ${gradeChips?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">${gradeChips}</div>`:''}
        <div style="font-size:11px;color:var(--text2);display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
          <div><span style="opacity:.6;">Prof:</span> ${s.professor}</div><div><span style="opacity:.6;">Aula:</span> ${s.room}</div>
          ${s.email?`<div><span style="opacity:.6;">Email:</span> <a href="mailto:${s.email}" style="color:var(--primary);">${s.email}</a></div>`:''}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px;">${chips}</div>
        <div style="border-top:1px solid var(--border);padding-top:10px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
            <span style="font-size:10px;font-weight:700;color:var(--text2);">ASISTENCIA</span>
            <span style="font-size:11px;font-weight:700;color:${bc};">${s.absences}/${s.maxAbsences}</span>
          </div>
          <div class="abs-bar-bg"><div class="abs-bar-fill" style="width:${Math.min(100,pct*100)}%;background:${bc};"></div></div>
          ${pct>=.75?`<div style="margin-top:5px;font-size:10px;font-weight:700;color:${bc};">${pct>=1?'LÍMITE ALCANZADO':'Cerca del límite'}</div>`:''}
        </div>
      </div></div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════
//  TASKS VIEW
// ═══════════════════════════════════════════════════════════
function setFilter(f,el) {
  taskFilter=f;
  document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderTasks();
}

function syncTaskWithGrade(task) {
  if (!task || !task.subjectId) return null;
  const s = S.subjects.find(x => x.id === task.subjectId);
  if (!s) return null;
  if (!s.grades) s.grades = [];

  let gradeType = task.type;
  if (task.type === 'Trabajo Práctico') gradeType = 'TP';
  else if (task.type === 'Laboratorio') gradeType = 'Lab';
  else if (task.type === 'Parcial') {
    const titleLower = (task.title || '').toLowerCase();
    if (titleLower.includes('2')) gradeType = 'Parcial 2';
    else if (titleLower.includes('3')) gradeType = 'Parcial 3';
    else gradeType = 'Parcial 1';
  } else if (task.type === 'Tarea' || task.type === 'Proyecto') {
    gradeType = 'TP';
  }

  let g = task.gradeId ? s.grades.find(x => x.id === task.gradeId) : null;
  if (!g) {
    g = { id: gid(), type: gradeType, score: '', date: task.dueDate || '' };
    s.grades.push(g);
    task.gradeId = g.id;
  } else {
    g.type = gradeType;
    if (task.dueDate) g.date = task.dueDate;
  }
  return g;
}

function renderTasks() {
  let tasks=[...S.tasks];
  if (taskFilter==='pending')         tasks=tasks.filter(t=>!t.done);
  else if (taskFilter==='done')       tasks=tasks.filter(t=>t.done);
  else if (taskFilter.startsWith('type-')) tasks=tasks.filter(t=>t.type===taskFilter.slice(5));
  tasks.sort((a,b)=>{
    if (a.done!==b.done) return a.done?1:-1;
    if (!a.dueDate&&!b.dueDate) return 0;
    if (!a.dueDate) return 1; if (!b.dueDate) return -1;
    return a.dueDate<b.dueDate?-1:1;
  });
  document.getElementById('task-count-lbl').textContent=`${tasks.length} tarea${tasks.length!==1?'s':''}`;
  if (!tasks.length) {
    document.getElementById('tasks-list').innerHTML=`<div class="empty-st"><div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:rgba(74,222,128,.15);color:#4ade80;margin-bottom:0.5rem;">${SVG_ICONS.check}</div><div style="font-weight:700;">No hay tareas aquí</div></div>`;
    return;
  }
  document.getElementById('tasks-list').innerHTML=tasks.map(t=>{
    const sub=S.subjects.find(s=>s.id===t.subjectId), d=daysUntil(t.dueDate);
    const dt=d===null?'—':d<0?`Vencida`:d===0?'Hoy':`${d}d`;

    let gradeBadge = '';
    if (t.subjectId) {
      const g2 = syncTaskWithGrade(t);
      if (g2 && g2.score !== '' && g2.score !== null) {
        const sc = parseFloat(g2.score);
        const gc = sc >= 4 ? '#4ade80' : '#f87171';
        gradeBadge = `<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();promptGradeFromTask(S.tasks.find(x=>x.id==='${t.id}'))" style="font-size:10px;padding:2px 8px;background:${gc}1a;color:${gc};border:1px solid ${gc}30;font-weight:800;">Nota: ${sc}</button>`;
      } else {
        gradeBadge = `<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();promptGradeFromTask(S.tasks.find(x=>x.id==='${t.id}'))" style="font-size:10px;padding:2px 8px;">Anotar nota</button>`;
      }
    }

    const isExam = EXAM_TYPES.has(t.type) || (t.type && (t.type.toLowerCase().includes('parcial') || t.type.toLowerCase().includes('final') || t.type.toLowerCase().includes('examen')));
    const isUrgentExam = !t.done && isExam && d !== null && d >= 0 && d <= 3;

    let urgBadge = !t.done && d !== null ? `<span style="font-size:11px;font-weight:700;color:${urgColor(d)};">${dt}</span>` : '';
    let urgentCardStyle = '';

    if (isUrgentExam) {
      urgBadge = `<span style="padding:2px 8px;border-radius:6px;font-size:10px;font-weight:800;background:rgba(249,115,22,.25);color:#ffedd5;border:1px solid #f97316;box-shadow:0 0 8px rgba(249,115,22,.4);">¡RINDES EN ${d===0?'HOY':d+'D'}!</span>`;
      urgentCardStyle = `background:rgba(249,115,22,.08);border:1px solid #f97316;box-shadow:0 0 10px rgba(249,115,22,.2);`;
    }

    return `<div class="task-card ${t.done?'done':''}" style="${urgentCardStyle}">
      <div class="t-check ${t.done?'done':''}" onclick="toggleTask('${t.id}')">${t.done?'✓':''}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <div style="font-size:13px;font-weight:700;${t.done?'text-decoration:line-through;':''}">${t.title}</div>
          <div style="display:flex;gap:6px;flex-shrink:0;align-items:center;flex-wrap:wrap;">
            <span style="padding:2px 7px;border-radius:6px;font-size:10px;font-weight:700;background:${TYPE_BG[t.type]||'rgba(255,255,255,.08)'};color:${TYPE_FG[t.type]||'var(--text2)'};">${t.type}</span>
            ${urgBadge}
            ${gradeBadge}
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:5px;">
          ${sub?`<span class="badge" style="background:${sub.color}18;color:${sub.color};">${sub.name}</span>`:''}
          ${t.dueDate?`<span style="font-size:10px;color:var(--text2);">${formatDate(t.dueDate)}</span>`:''}
          ${t.notes?`<span style="font-size:10px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:150px;" title="${t.notes}">${t.notes}</span>`:''}
        </div>
      </div>
      <div style="display:flex;gap:5px;flex-shrink:0;">
        <button class="btn-xs" onclick="openTaskModal('${t.id}')" title="Editar">${SVG_ICONS.edit}</button>
        <button class="btn-xs" onclick="confirmDel('task','${t.id}')" title="Eliminar" style="color:#f87171;">${SVG_ICONS.trash}</button>
      </div>
    </div>`;
  }).join('');
}

function toggleTask(id) {
  const t = S.tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  if (t.subjectId) {
    syncTaskWithGrade(t);
  }
  save();
  renderTasks();
  if (t.done && t.subjectId) {
    const s = S.subjects.find(x => x.id === t.subjectId);
    const g = s && s.grades && s.grades.find(x => x.id === t.gradeId);
    if (!g || g.score === '' || g.score === null) {
      setTimeout(() => promptGradeFromTask(t), 80);
    }
  }
}

let targetGradeTask = null;

function promptGradeFromTask(task) {
  if (!task) return;
  const g = syncTaskWithGrade(task);
  if (!g) return;
  targetGradeTask = task;
  document.getElementById('grade-prompt-task-id').value = task.id;
  document.getElementById('grade-prompt-sub').textContent = task.title;
  const scoreInput = document.getElementById('grade-prompt-score');
  const currentScore = (g.score !== '' && g.score !== null) ? g.score : '';
  scoreInput.value = currentScore;
  const v = parseFloat(currentScore);
  scoreInput.style.color = isNaN(v) ? 'var(--text)' : v >= 4 ? '#4ade80' : '#f87171';
  document.getElementById('modal-grade-prompt').style.display = 'flex';
  setTimeout(() => { scoreInput.focus(); scoreInput.select(); }, 100);
}

function saveGradeFromModal() {
  const taskId = document.getElementById('grade-prompt-task-id').value;
  const task = S.tasks.find(x => x.id === taskId) || targetGradeTask;
  if (!task) return;
  const g = syncTaskWithGrade(task);
  if (!g) return;
  const raw = document.getElementById('grade-prompt-score').value.trim();
  if (raw === '') {
    g.score = '';
  } else {
    const v = parseFloat(raw);
    if (isNaN(v) || v < 0 || v > 10) { alert('Nota inválida. Ingresá un número entre 0 y 10.'); return; }
    g.score = v;
  }
  save();
  const s = S.subjects.find(x => x.id === task.subjectId);
  if (window.api && s) window.api.syncGrades(s.id, s.grades).catch(console.error);
  closeM('modal-grade-prompt');
  renderView(currentView);
}

// ═══════════════════════════════════════════════════════════
//  ATTENDANCE VIEW
// ═══════════════════════════════════════════════════════════
function renderAtt() {
  const grid=document.getElementById('att-grid');
  if (!S.subjects.length) { grid.innerHTML=`<div class="empty-st" style="grid-column:1/-1;"><div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);margin-bottom:0.5rem;">${SVG_ICONS.chart}</div><div>Sin materias.</div></div>`; return; }
  grid.innerHTML=S.subjects.map(s=>{
    const pct=s.maxAbsences>0?s.absences/s.maxAbsences:0;
    const bc=pct>=1?'#ef4444':pct>=.75?'#f97316':pct>=.5?'#f59e0b':'#22c55e';
    const rem=Math.max(0,s.maxAbsences-s.absences);
    const pipW=Math.max(6,Math.min(24,Math.floor(192/s.maxAbsences)));
    const pips=Array.from({length:s.maxAbsences},(_,i)=>`<div class="pip" style="width:${pipW}px;background:${i<s.absences?bc:'rgba(255,255,255,.08)'};"></div>`).join('');
    const statusLabel = pct>=1?'LÍMITE ALCANZADO':pct>=.75?`Quedan ${rem} ausencias`:`${rem} disponibles`;
    return `<div class="att-card" style="border-top:3px solid ${s.color};">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <div><div style="font-size:14px;font-weight:800;">${s.name}</div>
        <div style="font-size:10px;color:var(--text2);margin-top:2px;">Máx: ${s.maxAbsences} ausencias</div></div>
        <div style="text-align:center;">
          <div style="font-size:34px;font-weight:900;line-height:1;color:${bc};">${s.absences}</div>
          <div style="font-size:9px;color:var(--text2);font-weight:700;text-transform:uppercase;">ausencias</div>
        </div>
      </div>
      <div class="abs-bar-bg" style="margin-bottom:8px;"><div class="abs-bar-fill" style="width:${Math.min(100,pct*100)}%;background:linear-gradient(90deg,${s.color},${bc});"></div></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
        <span style="display:inline-flex;align-items:center;gap:0.3rem;font-size:11px;color:${bc};font-weight:600;">${pct>=.75?SVG_ICONS.alert:SVG_ICONS.check} ${statusLabel}</span>
        <span style="font-size:10px;color:var(--text2);">${Math.round(pct*100)}%</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <button class="btn-abs" onclick="chgAbs('${s.id}',-1)" ${s.absences<=0?'disabled':''} style="color:${s.absences>0?'#f87171':'inherit'};">−</button>
        <div class="pip-dots">${pips}</div>
        <button class="btn-abs" onclick="chgAbs('${s.id}',1)" ${s.absences>=s.maxAbsences?'disabled':''} style="color:${s.absences<s.maxAbsences?'#34d399':'inherit'};">+</button>
      </div>
      ${s.schedules.length?`<div style="margin-top:11px;padding-top:11px;border-top:1px solid var(--border);">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text2);margin-bottom:5px;">Horarios</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">${s.schedules.map(sc=>`<span class="sched-chip" style="font-size:10px;">${sc.day.slice(0,3)} ${sc.startTime}–${sc.endTime}</span>`).join('')}</div>
      </div>`:''}
    </div>`;
  }).join('');
}
function chgAbs(id,d){ const s=S.subjects.find(x=>x.id===id); if(s){s.absences=Math.max(0,Math.min(s.maxAbsences,s.absences+d));save();if(window.api)window.api.saveActiveSubject(s).catch(console.error);renderAtt();} }

// ═══════════════════════════════════════════════════════════
//  SUBJECT MODAL
// ═══════════════════════════════════════════════════════════
function openSubModal(id) {
  const isEdit=!!id;
  document.getElementById('sub-modal-title').textContent=isEdit?'Editar Materia':'Nueva Materia';
  selColor='#6366f1'; slots=[];

  // Cargar desplegable de materias del plan de carrera
  const careerSel = document.getElementById('sub-career-select');
  if (careerSel && S.career && S.career.subjects) {
    const sorted = [...S.career.subjects].sort((a,b) => (a.year - b.year) || (a.semester - b.semester) || a.name.localeCompare(b.name));
    careerSel.innerHTML = `<option value="">— Seleccionar materia del plan —</option>` +
      sorted.map(cs => `<option value="${cs.id}">${cs.year}° Año ${cs.semester}° Sem: ${cs.name} (${cs.code||'Sin cód'})</option>`).join('');
  }

  if (isEdit) {
    const s=S.subjects.find(x=>x.id===id); if(!s) return;
    document.getElementById('sub-edit-id').value=s.id;
    document.getElementById('sub-name').value=s.name;
    document.getElementById('sub-code').value=s.code||'';
    document.getElementById('sub-room').value=s.room||'';
    document.getElementById('sub-prof').value=s.professor||'';
    document.getElementById('sub-email').value=s.email||'';
    document.getElementById('sub-maxabs').value=s.maxAbsences||6;
    const subStatusEl = document.getElementById('sub-status');
    if (subStatusEl) subStatusEl.value = s.status || 'cursando';
    if (careerSel) careerSel.value = s.id;
    selColor=s.color||'#6366f1';
    document.getElementById('sub-color-custom').value=selColor;
    slots=s.schedules.map(x=>({...x}));
  } else {
    ['sub-edit-id','sub-name','sub-code','sub-room','sub-prof','sub-email'].forEach(i=>document.getElementById(i).value='');
    document.getElementById('sub-maxabs').value=6;
    const subStatusEl = document.getElementById('sub-status');
    if (subStatusEl) subStatusEl.value = 'cursando';
    if (careerSel) careerSel.value = '';
    document.getElementById('sub-color-custom').value=selColor;
  }
  renderSwatches(); renderSlots();
  document.getElementById('modal-sub').style.display='flex';
}

function onCareerSubSelect(cid) {
  if (!cid) return;
  const cs = S.career && S.career.subjects ? S.career.subjects.find(x => x.id === cid) : null;
  if (!cs) return;
  document.getElementById('sub-edit-id').value = cs.id;
  document.getElementById('sub-name').value = cs.name;
  document.getElementById('sub-code').value = cs.code || '';
}

function renderSwatches() {
  document.getElementById('color-swatches').innerHTML=COLORS.map(c=>
    `<div class="color-dot ${c===selColor?'sel':''}" style="background:${c};" onclick="pickColor('${c}')" title="${c}"></div>`).join('');
}
function pickColor(c) {
  selColor=c;
  document.querySelectorAll('.color-dot').forEach(d=>d.classList.toggle('sel',d.title===c));
  document.getElementById('sub-color-custom').value=c;
}
document.getElementById('sub-color-custom').addEventListener('input',function(){
  selColor=this.value;
  document.querySelectorAll('.color-dot').forEach(d=>d.classList.remove('sel'));
});

function renderSlots() {
  const c=document.getElementById('slots-container');
  if (!slots.length){c.innerHTML=`<div style="font-size:11px;color:var(--text2);padding:6px 0;">Sin horarios — haz clic en "+ Horario"</div>`;return;}
  c.innerHTML=slots.map((sl,i)=>`
    <div class="slot-row">
      <select class="f-input" style="font-size:12px;" onchange="updSlot(${i},'day',this.value)">
        ${DAYS.map(d=>`<option ${sl.day===d?'selected':''}>${d}</option>`).join('')}
      </select>
      <input type="time" class="f-input" style="font-size:12px;" value="${sl.startTime}" onchange="updSlot(${i},'startTime',this.value)">
      <input type="time" class="f-input" style="font-size:12px;" value="${sl.endTime}" onchange="updSlot(${i},'endTime',this.value)">
      <select class="f-input" style="font-size:12px;" onchange="updSlot(${i},'type',this.value)">
        ${['Teórico','Práctico','Teórico-Lab','Práctico-Lab','Lab','Clases','Otro'].map(t=>`<option ${sl.type===t?'selected':''}>${t}</option>`).join('')}
      </select>
      <div class="slot-rm" onclick="rmSlot(${i})">✕</div>
    </div>`).join('');
}
function addSlot()        { slots.push({id:gid(),day:'Lunes',startTime:'08:00',endTime:'10:00',type:'Teórico'}); renderSlots(); }
function rmSlot(i)        { slots.splice(i,1); renderSlots(); }
function updSlot(i,f,v)   { slots[i][f]=v; }

function saveSub() {
  const name=document.getElementById('sub-name').value.trim();
  if (!name){alert('Nombre requerido.');return;}
  const eid=document.getElementById('sub-edit-id').value;
  const existing=S.subjects.find(s=>s.id===eid);
  const statusEl = document.getElementById('sub-status');
  const statusVal = statusEl ? statusEl.value : (existing ? existing.status : 'cursando');
  const sub={
    id:eid||gid(), name, code:document.getElementById('sub-code').value.trim(),
    color:selColor, professor:document.getElementById('sub-prof').value.trim(),
    room:document.getElementById('sub-room').value.trim(),
    email:document.getElementById('sub-email').value.trim(),
    maxAbsences:parseInt(document.getElementById('sub-maxabs').value)||6,
    absences:existing?existing.absences:0,
    grades:existing?existing.grades:[],
    status: statusVal,
    allowsPromotion:existing?existing.allowsPromotion:false,
    schedules:slots.map(s=>({...s}))
  };
  if (existing) Object.assign(existing,sub); else S.subjects.push(sub);

  // Vincular y sincronizar bidireccionalmente con plan de carrera
  if (S.career && S.career.subjects) {
    const match = S.career.subjects.find(cs => cs.id === sub.id || (cs.code && cs.code === sub.code) || cs.name.toLowerCase() === sub.name.toLowerCase());
    if (match) {
      match.id = sub.id;
      match.status = (statusVal === 'aprobado' || statusVal === 'promocionado') ? 'aprobada' : statusVal;
    }
  }

  syncSubjectsAndCareer();
  save();
  if (window.api) {
    window.api.saveActiveSubject(sub).catch(console.error);
    if (match) window.api.syncSubjectProgress(match.id, 'subject', match.status, match.grade, match.regDate, match.expDate).catch(console.error);
  }
  closeM('modal-sub'); renderView(currentView);
}

// ═══════════════════════════════════════════════════════════
//  TASK MODAL
// ═══════════════════════════════════════════════════════════
function openTaskModal(id) {
  const isEdit=!!id;
  document.getElementById('task-modal-title').textContent=isEdit?'Editar Tarea':'Nueva Tarea';
  const sel=document.getElementById('task-sub');
  sel.innerHTML=`<option value="">— Ninguna —</option>`+S.subjects.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
  if (isEdit) {
    const t=S.tasks.find(x=>x.id===id); if(!t) return;
    document.getElementById('task-edit-id').value=t.id;
    document.getElementById('task-title').value=t.title;
    document.getElementById('task-type').value=t.type;
    sel.value=t.subjectId||'';
    document.getElementById('task-date').value=t.dueDate||'';
    document.getElementById('task-notes').value=t.notes||'';
  } else {
    ['task-edit-id','task-title','task-date','task-notes'].forEach(i=>document.getElementById(i).value='');
    document.getElementById('task-type').value='Tarea'; sel.value='';
  }
  document.getElementById('modal-task').style.display='flex';
}
function saveTask() {
  const title=document.getElementById('task-title').value.trim();
  if (!title){showToast('Debes ingresar un título para la tarea.', 'error');return;}
  const eid=document.getElementById('task-edit-id').value;
  const existing=S.tasks.find(t=>t.id===eid);
  const task={
    id:eid||gid(), title,
    subjectId:document.getElementById('task-sub').value||null,
    type:document.getElementById('task-type').value,
    dueDate:document.getElementById('task-date').value||null,
    notes:document.getElementById('task-notes').value.trim(),
    gradeId: existing ? existing.gradeId : null,
    done:existing?existing.done:false
  };

  if (task.subjectId) {
    syncTaskWithGrade(task);
  } else if (existing && existing.gradeId && existing.subjectId) {
    const oldSub = S.subjects.find(s => s.id === existing.subjectId);
    if (oldSub && oldSub.grades) {
      oldSub.grades = oldSub.grades.filter(g => g.id !== existing.gradeId);
    }
    task.gradeId = null;
  }

  if (existing) Object.assign(existing,task); else S.tasks.push(task);
  save();
  if (window.api) window.api.saveTask(task).catch(console.error);
  closeM('modal-task'); renderView(currentView);
}

// ═══════════════════════════════════════════════════════════
//  GRADES MODAL
// ═══════════════════════════════════════════════════════════
function openGradesModal(subId) {
  let s = S.subjects.find(x => x.id === subId || (x.code && subId && (x.code === subId || x.code.slice(-3) === subId.slice(-3))));
  if (!s && S.career && S.career.subjects) {
    const cs = S.career.subjects.find(x => x.id === subId || (x.code && subId && (x.code === subId || x.code.slice(-3) === subId.slice(-3))));
    if (cs) {
      s = {
        id: cs.id,
        name: cs.name,
        code: cs.code || '',
        color: '#6366f1',
        professor: '',
        room: '',
        email: '',
        maxAbsences: 6,
        absences: 0,
        grades: [],
        status: cs.status || 'cursando',
        allowsPromotion: false,
        schedules: []
      };
      S.subjects.push(s);
    }
  }
  if (!s) return;
  gradesSubId = s.id;
  gradesWork = (s.grades || []).map(g => ({...g}));
  document.getElementById('grades-modal-sub').textContent = s.name;
  document.getElementById('grades-sub-id').value = s.id;
  document.getElementById('grades-status').value = s.status || 'cursando';
  document.getElementById('grades-promotion').checked = !!s.allowsPromotion;
  renderGradesInModal();
  document.getElementById('modal-grades').style.display = 'flex';
}

function renderGradesInModal() {
  const c = document.getElementById('grades-container');
  if (!gradesWork.length) {
    c.innerHTML = `<div style="font-size:11px;color:var(--text2);padding:10px 0;text-align:center;">Sin evaluaciones — hacé clic en "+ Agregar"</div>`;
    return;
  }
  c.innerHTML = gradesWork.map((g, i) => {
    const sc = g.score !== '' && g.score !== null ? parseFloat(g.score) : null;
    const scoreColor = sc !== null ? (sc >= 4 ? '#4ade80' : '#f87171') : 'var(--text)';
    return `<div class="grade-row">
      <select class="f-input" style="font-size:12px;" onchange="updGrade(${i},'type',this.value)">
        ${GRADE_TYPES.map(t => `<option ${g.type===t?'selected':''}>${t}</option>`).join('')}
      </select>
      <input type="number" class="f-input" min="0" max="10" step="0.5" placeholder="—"
        style="font-size:14px;font-weight:800;text-align:center;color:${scoreColor};"
        value="${sc !== null ? sc : ''}"
        oninput="updGrade(${i},'score',this.value);var v=parseFloat(this.value);this.style.color=isNaN(v)?'var(--text)':v>=4?'#4ade80':'#f87171';">
      <input type="date" class="f-input grade-date-field" style="font-size:12px;"
        value="${g.date||''}" onchange="updGrade(${i},'date',this.value)">
      <div class="slot-rm" onclick="rmGrade(${i})">✕</div>
    </div>`;
  }).join('');
}

function addGrade()      { gradesWork.push({id:gid(),type:'Parcial 1',score:'',date:''}); renderGradesInModal(); }
function rmGrade(i)      { gradesWork.splice(i,1); renderGradesInModal(); }
function updGrade(i,f,v) { gradesWork[i][f] = f==='score'?(v===''?'':parseFloat(v)):v; }

function saveGrades() {
  const s = S.subjects.find(x => x.id === gradesSubId);
  if (!s) return;

  // Sincronizar evaluaciones ↔ tareas
  const prevGrades = s.grades || [];
  const newGrades  = gradesWork.map(g => ({...g}));

  // Crear/actualizar tarea por cada evaluación que no tenga nota aún
  newGrades.forEach(g => {
    if (g.score !== '' && g.score !== null) return; // ya tiene nota, no hacer tarea
    const existing = S.tasks.find(t => t.gradeId === g.id);
    if (!existing) {
      // Crear tarea nueva vinculada
      S.tasks.push({
        id: gid(),
        title: `${g.type} — ${s.name}`,
        type: EXAM_TYPES.has(g.type) ? g.type : 'Tarea',
        subjectId: s.id,
        gradeId: g.id,
        dueDate: g.date || null,
        notes: '',
        done: false
      });
    } else {
      // Actualizar fecha si cambió
      existing.dueDate = g.date || null;
    }
  });

  // Eliminar tareas de evaluaciones que ya no existen
  const newIds = new Set(newGrades.map(g => g.id));
  S.tasks = S.tasks.filter(t => !t.gradeId || newIds.has(t.gradeId));

  s.grades = newGrades;
  const newStatus = document.getElementById('grades-status').value;
  s.status = newStatus;
  s.allowsPromotion = document.getElementById('grades-promotion').checked;

  if (S.career && S.career.subjects) {
    const match = S.career.subjects.find(cs => cs.id === s.id || (cs.code && cs.code === s.code) || cs.name.toLowerCase() === s.name.toLowerCase());
    if (match) {
      match.status = (newStatus === 'aprobado' || newStatus === 'promocionado') ? 'aprobada' : newStatus;
    }
  }

  syncSubjectsAndCareer();
  save();
  if (window.api) {
    window.api.syncGrades(s.id, s.grades).catch(console.error);
    if (match) window.api.syncSubjectProgress(match.id, 'subject', match.status, match.grade, match.regDate, match.expDate).catch(console.error);
  }
  closeM('modal-grades');
  renderView(currentView);
}

// ═══════════════════════════════════════════════════════════
//  BACKUP EXPORT / IMPORT
// ═══════════════════════════════════════════════════════════
function exportBackup() {
  const data = { version:3, exportedAt:new Date().toISOString(), data:S };
  const blob  = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  const ds    = new Date().toISOString().slice(0,10);
  a.href = url; a.download = `unischedule-backup-${ds}.json`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function importBackup() { document.getElementById('backup-file-input').click(); }

function handleBackupFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const parsed = JSON.parse(ev.target.result);
      const d = parsed.data || parsed;
      if (!d.subjects || !Array.isArray(d.subjects)) throw new Error();
      document.getElementById('confirm-title').textContent = '¿Restaurar backup?';
      document.getElementById('confirm-msg').textContent =
        `Se cargarán ${d.subjects.length} materias y ${(d.tasks||[]).length} tareas. Esto reemplazará todos los datos actuales.`;
      document.getElementById('confirm-ok').onclick = () => {
        S = { subjects: d.subjects, tasks: d.tasks || [] };
        S.subjects = S.subjects.map(s => ({
          absences:0, maxAbsences:6, schedules:[], email:'', code:'',
          grades:[], status:'cursando', allowsPromotion:false, ...s
        }));
        S.tasks = S.tasks.map(t => ({ done:false, notes:'', subjectId:null, dueDate:null, ...t }));
        save(); closeM('modal-confirm'); navigate(currentView);
      };
      document.getElementById('modal-confirm').style.display = 'flex';
    } catch(_) { alert('Archivo inválido o corrupto.'); }
    e.target.value = '';
  };
  reader.readAsText(file);
}

// ═══════════════════════════════════════════════════════════
//  CONFIRM DELETE
// ═══════════════════════════════════════════════════════════
function confirmDel(type,id) {
  const lbl=type==='subject'?'materia':'tarea';
  document.getElementById('confirm-title').textContent=`¿Eliminar ${lbl}?`;
  document.getElementById('confirm-msg').textContent=`La ${lbl} se eliminará de forma permanente.`;
  document.getElementById('confirm-ok').onclick=()=>{
    if (type==='subject'){
      S.subjects=S.subjects.filter(s=>s.id!==id);
      S.tasks=S.tasks.map(t=>t.subjectId===id?{...t,subjectId:null,gradeId:null}:t);
      if (window.api) window.api.deleteActiveSubject(id).catch(console.error);
    } else {
      const t = S.tasks.find(x => x.id === id);
      if (t && t.subjectId && t.gradeId) {
        const s = S.subjects.find(x => x.id === t.subjectId);
        if (s && s.grades) {
          s.grades = s.grades.filter(g => g.id !== t.gradeId);
          if (window.api) window.api.syncGrades(s.id, s.grades).catch(console.error);
        }
      }
      S.tasks=S.tasks.filter(t=>t.id!==id);
      if (window.api) window.api.deleteTask(id).catch(console.error);
    }
    save(); closeM('modal-confirm'); renderView(currentView);
  };
  document.getElementById('modal-confirm').style.display='flex';
}

// ═══════════════════════════════════════════════════════════
//  MODAL UTILS
// ═══════════════════════════════════════════════════════════
function openM(id)      { document.getElementById(id).style.display='flex'; }
function closeM(id)     { document.getElementById(id).style.display='none'; }
function closeBD(e,id)  { if(e.target.id===id) closeM(id); }
// Manejo global de teclas: Escape (cerrar) y Enter (guardar) en modales
document.addEventListener('keydown', e => {
  const ALL_MODALS = ['modal-sub','modal-task','modal-confirm','modal-grades','modal-grade-prompt'];

  if (e.key === 'Escape') {
    ALL_MODALS.forEach(id => closeM(id));
    return;
  }

  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
    for (const id of ALL_MODALS) {
      const el = document.getElementById(id);
      if (el && el.style.display !== 'none') {
        e.preventDefault();
        if (id === 'modal-sub') saveSub();
        else if (id === 'modal-task') saveTask();
        else if (id === 'modal-grades') saveGrades();
        else if (id === 'modal-grade-prompt') saveGradeFromModal();
        else if (id === 'modal-seminar') saveSeminar();
        else if (id === 'modal-confirm') {
          const btn = document.getElementById('confirm-ok');
          if (btn) btn.click();
        }
        break;
      }
    }
  }
});

// Re-render schedule on resize (desktop ↔ mobile)
let _resizeTimer;
window.addEventListener('resize',()=>{
  clearTimeout(_resizeTimer);
  _resizeTimer=setTimeout(()=>{ if(currentView==='schedule') renderSched(); },150);
});

// ═══════════════════════════════════════════════════════════
//  PWA INSTALL
// ═══════════════════════════════════════════════════════════
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  const b = document.getElementById('install-banner');
  if (b) b.style.display = 'flex';
});

function installApp() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(() => {
    deferredPrompt = null;
    const b = document.getElementById('install-banner');
    if (b) b.style.display = 'none';
  });
}

// ═══════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════
function init() {
  loadState();
  activeDay = todayDay() || 'Lunes';
  sbOpen    = window.innerWidth > 900;
  document.getElementById('sidebar').classList.toggle('open', sbOpen);
  document.getElementById('sb-icon').textContent = sbOpen ? '‹' : '›';
  navigate('dashboard');
  setInterval(renderNC, 1000);
  setInterval(updateDate, 60000);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}


// ═══════════════════════════════════════════════════════════
//  CAREER PLAN v2.0 — CONSTANTES Y DATOS
// ═══════════════════════════════════════════════════════════
var CAREER_STATUS_CFG = {
  pendiente:  { label:'Pendiente',  color:'#64748b', bg:'rgba(100,116,139,.12)', border:'rgba(100,116,139,.3)'  },
  bloqueada:  { label:'Bloqueada',  color:'#374151', bg:'rgba(55,65,81,.1)',     border:'rgba(55,65,81,.25)'    },
  disponible: { label:'Disponible', color:'#fbbf24', bg:'rgba(251,191,36,.12)',  border:'rgba(251,191,36,.4)'   },
  cursando:   { label:'Cursando',   color:'#60a5fa', bg:'rgba(96,165,250,.12)',  border:'rgba(96,165,250,.4)'   },
  regular:    { label:'Regular',    color:'#a78bfa', bg:'rgba(167,139,250,.12)', border:'rgba(167,139,250,.4)'  },
  aprobada:   { label:'Aprobada',   color:'#4ade80', bg:'rgba(74,222,128,.12)',  border:'rgba(74,222,128,.4)'   },
};

var DEF_CAREER = [
  // ── Año 1, Semestre 1 ─────────────────────────────────────────────────
  {id:'cs-info1',    code:'000450', name:'Informática 1',                 year:1,semester:1,credits:6,status:'aprobada',grade:7,correlatives:{toCurse:[], toPass:[]}},
  {id:'cs-teccomp',  code:'000451', name:'Tecnología de Computadoras',    year:1,semester:1,credits:6,status:'regular',grade:null,regDate:'2025-06-17',expDate:'2027-02-19',correlatives:{toCurse:[], toPass:[]}},
  {id:'cs-algegeo',  code:'000453', name:'Álgebra y Geometría',           year:1,semester:1,credits:6,status:'regular',grade:null,regDate:'2025-06-18',expDate:'2027-02-19',correlatives:{toCurse:[], toPass:[]}},
  {id:'cs-am1a',     code:'000452', name:'Análisis Matemático 1A',        year:1,semester:1,credits:6,status:'aprobada',grade:8,correlatives:{toCurse:[], toPass:[]}},
  {id:'cs-fis1',     code:'000454', name:'Física 1',                      year:1,semester:1,credits:6,status:'regular',grade:null,regDate:'2025-06-19',expDate:'2027-02-19',correlatives:{toCurse:[], toPass:[]}},
  // ── Año 1, Semestre 2 ─────────────────────────────────────────────────
  {id:'cs-info2',    code:'000455', name:'Informática 2',                 year:1,semester:2,credits:6,status:'aprobada',grade:10,correlatives:{toCurse:['cs-info1'], toPass:['cs-info1']}},
  {id:'cs-algelin',  code:'000654', name:'Álgebra Lineal',                year:1,semester:2,credits:4,status:'regular',grade:null,regDate:'2025-11-20',expDate:'2027-07-20',correlatives:{toCurse:['cs-algegeo'], toPass:['cs-algegeo']}},
  {id:'cs-quimica',  code:'000459', name:'Química',                       year:1,semester:2,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:[], toPass:[]}},
  {id:'cs-am1b',     code:'000457', name:'Análisis Matemático 1B',        year:1,semester:2,credits:6,status:'regular',grade:null,regDate:'2025-11-20',expDate:'2027-07-20',correlatives:{toCurse:['cs-am1a'], toPass:['cs-am1a']}},
  {id:'cs-fis2',     code:'000456', name:'Física 2',                      year:1,semester:2,credits:6,status:'cursando',grade:null,correlatives:{toCurse:['cs-fis1'], toPass:['cs-fis1']}},
  // ── Año 2, Semestre 1 ─────────────────────────────────────────────────
  {id:'cs-ingweb1',  code:'000465', name:'Ingeniería Web 1',              year:2,semester:1,credits:6,status:'aprobada',grade:8,correlatives:{toCurse:['cs-info2'], toPass:['cs-info2']}},
  {id:'cs-ingsoft1', code:'000461', name:'Ingeniería de Software 1',      year:2,semester:1,credits:6,status:'aprobada',grade:6,correlatives:{toCurse:['cs-info2'], toPass:['cs-info2']}},
  {id:'cs-bd1',      code:'000463', name:'Base de Datos 1',               year:2,semester:1,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-info2','cs-ingsoft1'], toPass:['cs-info2','cs-ingsoft1']}},
  {id:'cs-am2a',     code:'000462', name:'Análisis Matemático 2A',        year:2,semester:1,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-am1b'], toPass:['cs-am1b']}},
  {id:'cs-estdisc',  code:'000464', name:'Estructuras Discretas',         year:2,semester:1,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-algegeo'], toPass:['cs-algegeo']}},
  // ── Año 2, Semestre 2 ─────────────────────────────────────────────────
  {id:'cs-info3',    code:'000460', name:'Informática 3',                 year:2,semester:2,credits:6,status:'regular',grade:null,regDate:'2025-11-20',expDate:'2027-07-20',correlatives:{toCurse:['cs-info2'], toPass:['cs-info2']}},
  {id:'cs-arqcomp1', code:'000468', name:'Arquitectura de Comp. 1',       year:2,semester:2,credits:6,status:'regular',grade:null,regDate:'2025-11-20',expDate:'2027-07-20',correlatives:{toCurse:['cs-teccomp'], toPass:['cs-teccomp']}},
  {id:'cs-am2b',     code:'000466', name:'Análisis Matemático 2B',        year:2,semester:2,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-am2a'], toPass:['cs-am2a']}},
  {id:'cs-metnum',   code:'000467', name:'Métodos Numéricos',             year:2,semester:2,credits:6,status:'cursando',grade:null,correlatives:{toCurse:['cs-algelin','cs-am2a'], toPass:['cs-algelin','cs-am2a']}},
  {id:'cs-probest',  code:'000256', name:'Probabilidad y Estadística',    year:2,semester:2,credits:6,status:'cursando',grade:null,correlatives:{toCurse:['cs-am2a'], toPass:['cs-am2a']}},
  // ── Año 3, Semestre 1 ─────────────────────────────────────────────────
  {id:'cs-arqcomp2', code:'000473', name:'Arquitectura de Comp. 2',       year:3,semester:1,credits:6,status:'regular',grade:null,regDate:'2026-06-22',expDate:'2028-02-19',correlatives:{toCurse:['cs-arqcomp1'], toPass:['cs-arqcomp1']}},
  {id:'cs-fis3',     code:'000924', name:'Física 3',                      year:3,semester:1,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-fis2','cs-am2b'], toPass:['cs-fis2','cs-am2b']}},
  {id:'cs-pds1',     code:'000470', name:'Proceso de Desarrollo 1',       year:3,semester:1,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-info3'], toPass:['cs-info3']}},
  {id:'cs-sisop',    code:'000477', name:'Sistemas Operativos',           year:3,semester:1,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-arqcomp1'], toPass:['cs-arqcomp1']}},
  {id:'cs-teocomp',  code:'000475', name:'Teoría de la Computación',      year:3,semester:1,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-estdisc'], toPass:['cs-estdisc']}},
  // ── Año 3, Semestre 2 ─────────────────────────────────────────────────
  {id:'cs-audit',    code:'000478', name:'Auditoría',                     year:3,semester:2,credits:6,status:'cursando',grade:null,correlatives:{toCurse:[], toPass:[]}},
  {id:'cs-derecho',  code:'000479', name:'Derecho y Ética Profesional',   year:3,semester:2,credits:6,status:'aprobada',grade:4,correlatives:{toCurse:[], toPass:[]}},
  {id:'cs-orgemp',   code:'000474', name:'Organización de Empresas',      year:3,semester:2,credits:6,status:'regular',grade:null,regDate:'2025-11-20',expDate:'2027-07-20',correlatives:{toCurse:['cs-arqcomp2'], toPass:['cs-arqcomp2']}},
  {id:'cs-pds2',     code:'000476', name:'Proceso de Desarrollo 2',       year:3,semester:2,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-pds1'], toPass:['cs-pds1']}},
  {id:'cs-redes1',   code:'000471', name:'Redes 1',                       year:3,semester:2,credits:6,status:'cursando',grade:null,correlatives:{toCurse:['cs-sisop'], toPass:['cs-sisop']}},
  {id:'cs-dhs',      code:'000480', name:'Desarrollo Herramientas SW',    year:3,semester:2,credits:7,status:'pendiente',grade:null,correlatives:{toCurse:[], toPass:[]}},
  {id:'cs-ingles',   code:'000621', name:'Nivel Idioma Inglés',           year:3,semester:2,credits:2,status:'aprobada',grade:null,correlatives:{toCurse:[], toPass:[]}},
  // ── Año 4, Semestre 1 ─────────────────────────────────────────────────
  {id:'cs-ingweb2',  code:'000800', name:'Ingeniería Web 2',              year:4,semester:1,credits:6,status:'aprobada',grade:8,correlatives:{toCurse:['cs-ingweb1','cs-bd1'], toPass:['cs-ingweb1','cs-bd1']}},
  {id:'cs-bd2',      code:'000485', name:'Base de Datos 2',               year:4,semester:1,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-bd1'], toPass:['cs-bd1']}},
  {id:'cs-ingsoft2', code:'000481', name:'Ingeniería de Software 2',      year:4,semester:1,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:[], toPass:[]}},
  {id:'cs-redes2',   code:'000482', name:'Redes 2',                       year:4,semester:1,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-redes1'], toPass:['cs-redes1']}},
  {id:'cs-economia', code:'000491', name:'Economía',                      year:4,semester:1,credits:6,status:'regular',grade:null,regDate:'2026-06-19',expDate:'2028-02-19',correlatives:{toCurse:[], toPass:[]}},
  {id:'cs-progfunc', code:'000813', name:'Prog. Funcional y Scripting',  year:4,semester:1,credits:6,status:'cursando',grade:null,correlatives:{toCurse:[], toPass:[]}},
  {id:'cs-tecmov',   code:'000801', name:'Tecnologías Móviles',           year:4,semester:1,credits:6,status:'aprobada',grade:8,correlatives:{toCurse:[], toPass:[]}},
  // ── Año 4, Semestre 2 ─────────────────────────────────────────────────
  {id:'cs-gestemp1', code:'000490', name:'Gestión de Empresas 1',         year:4,semester:2,credits:6,status:'regular',grade:null,regDate:'2026-06-19',expDate:'2028-02-19',correlatives:{toCurse:['cs-orgemp'], toPass:['cs-orgemp']}},
  {id:'cs-gestproy', code:'000761', name:'Gestión de Proyectos Inf.',     year:4,semester:2,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-pds2'], toPass:['cs-pds2']}},
  {id:'cs-modsim',   code:'000489', name:'Modelos y Simulación',          year:4,semester:2,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-probest'], toPass:['cs-probest']}},
  {id:'cs-redes3',   code:'000486', name:'Redes 3',                       year:4,semester:2,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-redes2'], toPass:['cs-redes2']}},
  // ── Año 5, Semestre 1 ─────────────────────────────────────────────────
  {id:'cs-ingweb3',  code:'000806', name:'Ingeniería Web 3',              year:5,semester:1,credits:6,status:'cursando',grade:null,correlatives:{toCurse:['cs-ingweb2'], toPass:['cs-ingweb2']}},
  {id:'cs-compgraf', code:'000494', name:'Computación Gráfica y AV',      year:5,semester:1,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-am2b'], toPass:['cs-am2b']}},
  {id:'cs-gestemp2', code:'000496', name:'Gestión de Empresas 2',         year:5,semester:1,credits:6,status:'cursando',grade:null,correlatives:{toCurse:['cs-gestemp1'], toPass:['cs-gestemp1']}},
  {id:'cs-sisrt',    code:'000495', name:'Sistemas en Tiempo Real',       year:5,semester:1,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-bd2'], toPass:['cs-bd2']}},
  // ── Año 5, Semestre 2 ─────────────────────────────────────────────────
  {id:'cs-planneg',  code:'000499', name:'Plan de Negocios',              year:5,semester:2,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-gestemp2'], toPass:['cs-gestemp2']}},
  {id:'cs-seginf',   code:'000500', name:'Seguridad Informática',         year:5,semester:2,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-redes3'], toPass:['cs-redes3']}},
  {id:'cs-tfg',      code:'000501', name:'Trabajo Final de Grado',        year:5,semester:2,credits:12,status:'pendiente',grade:null,correlatives:{toCurse:[], toPass:[]}},
  {id:'cs-pps',      code:'000616', name:'Práctica Profesional Sup.',     year:5,semester:2,credits:13,status:'pendiente',grade:null,correlatives:{toCurse:[], toPass:[]}},
  {id:'cs-ia',       code:'000762', name:'Inteligencia Artificial',       year:5,semester:2,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-economia','cs-modsim'], toPass:['cs-economia','cs-modsim']}},
];

// ─── Estado del módulo carrera ──────────────────────────────
let activeCareerTab   = 'grid';
let selectedCareerNode = null;
let _cmT = { x:0, y:0, s:0.72 };

// ─── Sincronización bidireccional y desduplicación limpia entre S.subjects y S.career.subjects ───
function syncSubjectsAndCareer() {
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
      if (!cs.regDate) cs.regDate = todayFormatted;
      if (!cs.expDate) cs.expDate = expFormatted;
    }
  });

  S.subjects = cleanSubjects;
}

// ─── Disponibilidad dinámica ────────────────────────────────
function getComputedStatus(sub) {
  if (sub.status !== 'pendiente') return sub.status;
  const all = S.career.subjects;
  const met = (sub.correlatives.toCurse || []).every(id => {
    const dep = all.find(x => x.id === id);
    return dep && (dep.status === 'regular' || dep.status === 'aprobada');
  });
  return met ? 'disponible' : 'bloqueada';
}

function getDaysToExpiration(expDateStr) {
  if (!expDateStr) return null;
  const parts = expDateStr.split('-');
  if (parts.length < 3) return null;
  const exp = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const now = new Date();
  now.setHours(0,0,0,0);
  const diffTime = exp - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ─── Estado de filtros para Carrera y Finales ─────────────────────────────
let careerGridFilter = 'all';
let careerGridSearch = '';

let finalsFilter = 'all';
let finalsSearch = '';
let finalsSort   = 'exp-asc';

function setCareerGridFilter(val) { careerGridFilter = val; renderCareerGrid(); }
function setCareerGridSearch(val) { careerGridSearch = val; renderCareerGrid(); }

function setFinalsFilter(val) { finalsFilter = val; renderCareerFinals(); }
function setFinalsSearch(val) { finalsSearch = val; renderCareerFinals(); }
function setFinalsSort(val)   { finalsSort   = val; renderCareerFinals(); }

// ═══════════════════════════════════════════════════════════
//  SVG ICONOS PROFESIONALES (Enterprise UI)
// ═══════════════════════════════════════════════════════════
const SVG_ICONS = {
  book: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 6H20"/></svg>`,
  search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  lock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  alert: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
  clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  target: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  award: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  chart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>`,
  fileEdit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  edit: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  trash: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`
};

const DEF_SEMINARS = [
  { id: 'sem-linux', code: '001835', name: 'Fundamentos de Linux', category: 'Seminario Técnico', hours: 40, status: 'aprobada', date: '15/05/2024', notes: 'Acreditado (IUA)' },
  { id: 'sem-labview', code: '001636', name: 'Adquisición Electrónica de Datos y Programación en Lenguaje LABVIEW', category: 'Seminario Técnico', hours: 0, status: 'pendiente', date: '', notes: 'Optativa compartida' },
  { id: 'sem-1', code: '001836', name: 'Seminario I: Ciberseguridad & Hacking Ético', category: 'Seminario Especializado', hours: 30, status: 'cursando', date: '', notes: 'Formación continua' },
  { id: 'sem-2', code: '001837', name: 'Seminario II: Ética Profesional & Responsabilidad Social', category: 'Seminario Institucional', hours: 20, status: 'aprobada', date: '10/11/2025', notes: 'Acreditado' },
  { id: 'sem-3', code: '001838', name: 'Seminario III: Innovación Tecnológica & Emprendedurismo', category: 'Seminario Técnico', hours: 30, status: 'pendiente', date: '', notes: 'Requisito de carrera' },
  { id: 'sem-4', code: '001839', name: 'Seminario IV: Inteligencia Artificial & Aprendizaje Automático', category: 'Seminario Avanzado', hours: 40, status: 'pendiente', date: '', notes: 'Requisito de carrera' },
  { id: 'sem-5', code: '001840', name: 'Taller de Metodología de la Investigación / TFG', category: 'Taller de Grado', hours: 60, status: 'pendiente', date: '', notes: 'Requisito para proyecto final' }
];

const DEF_ELECTIVES = [
  { id: 'opt-aed', code: '000814', name: 'Algoritmos y Estructuras de Datos', category: 'Optativa Informática 2017', credits: 0, status: 'pendiente', grade: null },
  { id: 'opt-aos', code: '000809', name: 'Arquitectura Orientada a Servicios', category: 'Optativa Informática 2017', credits: 0, status: 'pendiente', grade: null },
  { id: 'opt-cap', code: '000808', name: 'Cómputo de Altas Prestaciones', category: 'Optativa Informática 2017', credits: 0, status: 'pendiente', grade: null },
  { id: 'cs-ingweb2', code: '000800', name: 'Ingeniería Web II', category: 'Optativa Informática 2017', credits: 6, status: 'aprobada', grade: 8 },
  { id: 'opt-io', code: '000803', name: 'Investigación de Operaciones', category: 'Optativa Informática 2017', credits: 0, status: 'pendiente', grade: null },
  { id: 'opt-pds', code: '000812', name: 'Procesamiento Digital de Señales', category: 'Optativa Informática 2017', credits: 0, status: 'pendiente', grade: null },
  { id: 'opt-pc', code: '000810', name: 'Programación Concurrente', category: 'Optativa Informática 2017', credits: 0, status: 'pendiente', grade: null },
  { id: 'cs-progfunc', code: '000813', name: 'Programación Funcional y Scripting', category: 'Optativa Informática 2017', credits: 4, status: 'cursando', grade: null },
  { id: 'opt-sc1', code: '000805', name: 'Sistemas de Comunicaciones I', category: 'Optativa Informática 2017', credits: 6, status: 'pendiente', grade: null },
  { id: 'cs-tecmov', code: '000801', name: 'Tecnologías Móviles', category: 'Optativa Informática 2017', credits: 6, status: 'aprobada', grade: 8 },
  { id: 'opt-st1', code: '000804', name: 'Sistemas de Telecomunicaciones I', category: 'Optativa Informática 2017', credits: 0, status: 'pendiente', grade: null },
  { id: 'cs-ingweb3', code: '000806', name: 'Ingeniería Web III', category: 'Optativa Informática 2017', credits: 6, status: 'cursando', grade: null },
  { id: 'opt-cm', code: '000811', name: 'Comunicaciones Móviles', category: 'Optativa Informática 2017', credits: 6, status: 'pendiente', grade: null },
  { id: 'opt-gr', code: '000929', name: 'Gestión de Redes', category: 'Optativa Informática 2017', credits: 6, status: 'pendiente', grade: null },
  { id: 'opt-ip', code: '000933', name: 'Ingeniería de Protocolo', category: 'Optativa Informática 2017', credits: 4, status: 'pendiente', grade: null },
  { id: 'opt-bci', code: '001636', name: 'Blockchain y Contratos Inteligentes', category: 'Optativa Informática 2017', credits: 0, status: 'pendiente', grade: null },
  { id: 'opt-sr', code: '000816', name: 'Sistemas de Radioenlace', category: 'Optativa Informática 2017', credits: 0, status: 'pendiente', grade: null }
];

function ensureCareerLoaded() {
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

// ═══════════════════════════════════════════════════════════
//  CAREER — DISPATCHER & TABS
// ═══════════════════════════════════════════════════════════
function renderCareer() {
  ensureCareerLoaded();

  // Inject scaffold if not yet in the DOM
  const view = document.getElementById('view-career');
  if (view && !document.getElementById('career-grid-container')) {
    view.innerHTML = `
      <div style="padding:0 0 1rem;">
        <div class="view-title" style="margin-bottom:0.25rem;">Plan de Carrera</div>
        <div class="view-sub">Ingeniería en Informática — UTN</div>
      </div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.25rem;" id="career-tabs-bar">
        <button class="career-tab active" data-tab="grid" onclick="setCareerTab('grid')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Plan
        </button>
        <button class="career-tab" data-tab="finals" onclick="setCareerTab('finals')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>Finales
        </button>
        <button class="career-tab" data-tab="stats" onclick="setCareerTab('stats')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>Estadísticas
        </button>
        <button class="career-tab" data-tab="seminars" onclick="setCareerTab('seminars')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 6H20"/></svg>Seminarios
        </button>
        <button class="career-tab" data-tab="electives" onclick="setCareerTab('electives')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>Electivas
        </button>
        <button class="career-tab" data-tab="map" onclick="setCareerTab('map')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>Mapa
        </button>
      </div>
      <div id="career-grid-container"></div>
      <div id="career-map-container"       style="display:none;"></div>
      <div id="career-seminars-container"  style="display:none;"></div>
      <div id="career-electives-container" style="display:none;"></div>
      <div id="career-finals-container"    style="display:none;"></div>
      <div id="career-stats-container"     style="display:none;"></div>
    `;
  }

  if      (activeCareerTab === 'grid')      renderCareerGrid();
  else if (activeCareerTab === 'map')       renderCareerMap();
  else if (activeCareerTab === 'seminars')  renderCareerSeminars();
  else if (activeCareerTab === 'electives') renderCareerElectives();
  else if (activeCareerTab === 'finals')    renderCareerFinals();
  else                                      renderCareerStats();
}

function setCareerTab(tab) {
  activeCareerTab = tab;
  document.querySelectorAll('.career-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === tab)
  );
  ['career-grid-container','career-map-container','career-seminars-container','career-electives-container','career-finals-container','career-stats-container'].forEach(pid => {
    const el = document.getElementById(pid);
    if (el) el.style.display = 'none';
  });
  const panelId = {
    grid: 'career-grid-container',
    map: 'career-map-container',
    seminars: 'career-seminars-container',
    electives: 'career-electives-container',
    finals: 'career-finals-container',
    stats: 'career-stats-container'
  }[tab];
  const panelEl = document.getElementById(panelId);
  if (panelEl) panelEl.style.display = '';
  renderCareer();
}

// ═══════════════════════════════════════════════════════════
//  TAB: SEMINARIOS & CURSOS ACREDITABLES
// ═══════════════════════════════════════════════════════════
function openAddSeminarModal() {
  document.getElementById('sem-name').value = '';
  document.getElementById('sem-code').value = '';
  document.getElementById('sem-hours').value = '';
  document.getElementById('sem-category').value = '';
  document.getElementById('sem-status').value = 'pendiente';
  document.getElementById('sem-date').value = '';
  document.getElementById('sem-notes').value = '';
  openM('modal-seminar');
}

function saveSeminar() {
  const name = document.getElementById('sem-name').value.trim();
  if (!name) return showToast('Debes ingresar un nombre para el seminario.', 'error');
  
  const code = document.getElementById('sem-code').value.trim();
  const hours = parseInt(document.getElementById('sem-hours').value) || 0;
  const category = document.getElementById('sem-category').value.trim() || 'Seminario';
  const status = document.getElementById('sem-status').value;
  let date = document.getElementById('sem-date').value;
  if(date) {
    const p = date.split('-');
    if(p.length===3) date = `${p[2]}/${p[1]}/${p[0]}`;
  }
  const notes = document.getElementById('sem-notes').value.trim();
  
  if (!S.career) S.career = {};
  if (!S.career.seminars) S.career.seminars = DEF_SEMINARS.map(s=>({...s}));
  
  S.career.seminars.push({
    id: 'sem-' + Date.now(),
    code,
    name,
    category,
    hours,
    status,
    date,
    notes
  });
  
  const sem = S.career.seminars[S.career.seminars.length - 1];
  save();
  if (window.api && window.api.saveSeminar) window.api.saveSeminar(sem).catch(console.error);
  closeM('modal-seminar');
  renderCareerSeminars();
}

function renderCareerSeminars() {
  const el = document.getElementById('career-seminars-container');
  if (!el) return;
  if (!S.career) S.career = {};
  if (!S.career.seminars) S.career.seminars = DEF_SEMINARS.map(s=>({...s}));
  const sems = S.career.seminars;

  const approved = sems.filter(s => s.status === 'aprobada').length;
  const pct = sems.length ? Math.round((approved / sems.length) * 100) : 0;

  el.innerHTML = `
    <div style="margin-bottom:1rem;background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;">
      <div>
        <div style="font-size:1rem;font-weight:800;color:var(--text);">Seminarios & Cursos Acreditables</div>
        <div style="font-size:0.75rem;color:var(--text2);margin-top:0.15rem;">Control de seminarios exigidos para la titulación de grado</div>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div style="font-size:0.8125rem;font-weight:700;color:var(--text);">${approved} de ${sems.length} completados (${pct}%)</div>
        <button class="btn btn-primary btn-sm" onclick="openAddSeminarModal()">+ Nuevo Seminario</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:0.75rem;">
      ${sems.map(s => {
        const isDone = s.status === 'aprobada';
        const isCur = s.status === 'cursando';
        const statusBadge = isDone
          ? `<span style="display:inline-flex;align-items:center;gap:0.3rem;font-size:0.6875rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:0.375rem;background:rgba(74,222,128,.15);color:#4ade80;border:1px solid rgba(74,222,128,.3);">${SVG_ICONS.check} Aprobado / Hecho</span>`
          : isCur
          ? `<span style="display:inline-flex;align-items:center;gap:0.3rem;font-size:0.6875rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:0.375rem;background:rgba(96,165,250,.15);color:#60a5fa;border:1px solid rgba(96,165,250,.3);">${SVG_ICONS.clock} En Cursado</span>`
          : `<span style="display:inline-flex;align-items:center;gap:0.3rem;font-size:0.6875rem;font-weight:700;padding:0.2rem 0.5rem;border-radius:0.375rem;background:rgba(148,163,184,.15);color:#94a3b8;border:1px solid rgba(148,163,184,.3);">${SVG_ICONS.lock} Pendiente</span>`;

        return `
          <div style="background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1rem;display:flex;flex-direction:column;justify-content:space-between;gap:0.75rem;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.375rem;">
                <div style="font-size:0.9375rem;font-weight:700;color:var(--text);">${s.name}</div>
                <span style="font-size:0.625rem;font-weight:700;padding:0.125rem 0.375rem;border-radius:0.25rem;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);white-space:nowrap;">${s.hours} hs</span>
              </div>
              <div style="font-size:0.6875rem;color:var(--text2);margin-bottom:0.5rem;">Código: ${s.code || '—'} · ${s.category}</div>
              <div style="margin-bottom:0.25rem;">${statusBadge}</div>
              ${s.notes ? `<div style="font-size:0.6875rem;color:var(--text2);margin-top:0.25rem;">${s.notes}</div>` : ''}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;padding-top:0.5rem;border-top:1px solid var(--border);">
              <span style="font-size:0.6875rem;color:var(--text2);">${s.date ? 'Acreditado: ' + s.date : 'Fecha: —'}</span>
              <button class="btn btn-ghost btn-sm" onclick="toggleSeminarStatus('${s.id}')">Cambiar Estado</button>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

function toggleSeminarStatus(id) {
  if (!S.career || !S.career.seminars) return;
  const sem = S.career.seminars.find(x => x.id === id);
  if (!sem) return;
  if (sem.status === 'aprobada') sem.status = 'pendiente';
  else if (sem.status === 'pendiente') sem.status = 'cursando';
  else sem.status = 'aprobada';
  save();
  if (window.api && window.api.saveSeminar) window.api.saveSeminar(sem).catch(console.error);
  renderCareerSeminars();
}

// ═══════════════════════════════════════════════════════════
//  TAB: OPTATIVAS DE INGENIERÍA
// ═══════════════════════════════════════════════════════════
function renderCareerElectives() {
  const el = document.getElementById('career-electives-container');
  if (!el) return;
  if (!S.career) S.career = {};
  if (!S.career.electives || S.career.electives.length !== DEF_ELECTIVES.length) {
    const old = S.career.electives || [];
    S.career.electives = DEF_ELECTIVES.map(e => {
       const o = old.find(x => x.id === e.id || x.code === e.code);
       return o ? {...e, status: o.status, grade: o.grade} : {...e};
    });
    save();
  }
  const elecs = S.career.electives;

  const approved = elecs.filter(s => s.status === 'aprobada').length;
  const cursando = elecs.filter(s => s.status === 'cursando').length;

  el.innerHTML = `
    <div style="margin-bottom:1rem;background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;">
      <div>
        <div style="font-size:1rem;font-weight:800;color:var(--text);">Optativas de Ingeniería en Informática</div>
        <div style="font-size:0.75rem;color:var(--text2);margin-top:0.15rem;">Selección y acreditación de materias optativas de especialización</div>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div style="font-size:0.8125rem;font-weight:700;color:var(--text);">${approved} Aprobadas · ${cursando} Cursando</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:0.75rem;">
      ${elecs.map(s => {
        const cs = s.status;
        const cfg = CAREER_STATUS_CFG[cs] || CAREER_STATUS_CFG.pendiente;
        return `
          <div style="background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1rem;display:flex;flex-direction:column;justify-content:space-between;gap:0.75rem;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.375rem;">
                <div style="font-size:0.9375rem;font-weight:700;color:var(--text);">${s.name}</div>
                <span style="font-size:0.625rem;font-weight:700;padding:0.125rem 0.375rem;border-radius:0.25rem;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);white-space:nowrap;">${s.credits} créditos</span>
              </div>
              <div style="font-size:0.6875rem;color:var(--text2);margin-bottom:0.5rem;">Código: ${s.code || '—'} · Área: ${s.category}</div>
              <div style="display:flex;align-items:center;gap:0.5rem;">
                <span class="career-status-badge" style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.border};">${cfg.label}</span>
                ${s.grade !== null ? `<span style="font-size:0.75rem;font-weight:800;color:${s.grade>=4?'#4ade80':'#f87171'};">Nota: ${s.grade}</span>` : ''}
              </div>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:0.5rem;padding-top:0.5rem;border-top:1px solid var(--border);">
              <button class="btn btn-ghost btn-sm" onclick="openCareerSubDetail('${s.id}')">Gestionar Optativa</button>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

// ═══════════════════════════════════════════════════════════
//  TAB 1: GRILLA (Resumen por Año / Semestre con Filtros)
// ═══════════════════════════════════════════════════════════
function renderCareerGrid() {
  const el = document.getElementById('career-grid-container');
  if (!el) return;
  const subs = S.career.subjects;

  const filterBarHtml = `
    <div style="margin-bottom:1rem;display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;justify-content:space-between;background:var(--card);padding:0.75rem;border-radius:0.75rem;border:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:0.5rem;flex:1;min-width:200px;">
        <input type="text" class="f-input" placeholder="Buscar materia o código..."
          value="${careerGridSearch}" oninput="setCareerGridSearch(this.value)" style="font-size:0.75rem;padding:0.375rem 0.625rem;">
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
        <select class="f-input" onchange="setCareerGridFilter(this.value)" style="font-size:0.75rem;padding:0.375rem 0.625rem;">
          <option value="all"       ${careerGridFilter==='all'?'selected':''}>Todos los estados</option>
          <option value="aprobada"  ${careerGridFilter==='aprobada'?'selected':''}>🟩 Aprobadas</option>
          <option value="regular"   ${careerGridFilter==='regular'?'selected':''}>🟪 Regulares</option>
          <option value="cursando"  ${careerGridFilter==='cursando'?'selected':''}>🟦 Cursando</option>
          <option value="disponible"${careerGridFilter==='disponible'?'selected':''}>🟨 Disponibles</option>
          <option value="bloqueada" ${careerGridFilter==='bloqueada'?'selected':''}>⬜ Pendientes/Bloqueadas</option>
        </select>
      </div>
    </div>`;

  const yearBlocksHtml = [1,2,3,4,5].map(year => {
    let yearSubs = subs.filter(s => s.year === year);
    
    // Aplicar filtro de búsqueda
    if (careerGridSearch) {
      const q = careerGridSearch.toLowerCase();
      yearSubs = yearSubs.filter(s => s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q)));
    }
    // Aplicar filtro de estado
    if (careerGridFilter !== 'all') {
      yearSubs = yearSubs.filter(s => {
        const cs = getComputedStatus(s);
        if (careerGridFilter === 'bloqueada') return cs === 'pendiente' || cs === 'bloqueada';
        return cs === careerGridFilter;
      });
    }

    if (!yearSubs.length) return '';

    const approved = subs.filter(s => s.year === year && s.status === 'aprobada').length;
    const totalYear = subs.filter(s => s.year === year).length;
    const pct = totalYear ? Math.round(approved / totalYear * 100) : 0;
    const barColor = pct >= 100 ? '#4ade80' : pct >= 50 ? '#60a5fa' : 'var(--primary)';

    const semHtml = [1,2].map(sem => {
      const semSubs = yearSubs.filter(s => s.semester === sem);
      if (!semSubs.length) return '';
      return `
      <div class="career-sem-section">
        <div class="career-sem-label">${sem}° Semestre</div>
        ${semSubs.map(s => {
          const cs = getComputedStatus(s);
          const cfg = CAREER_STATUS_CFG[cs] || CAREER_STATUS_CFG.pendiente;
          const canFinal = s.status === 'regular' &&
            (s.correlatives.toPass || []).every(id => {
              const dep = subs.find(x => x.id === id);
              return dep && dep.status === 'aprobada';
            });
          return `
          <div class="career-sub-row" style="border-left-color:${cfg.color};" onclick="openCareerSubDetail('${s.id}')">
            <div class="career-sub-info">
              <div class="career-sub-name">${s.name}</div>
              <div class="career-sub-meta">
                <span>${s.credits} créditos</span>
                ${s.grade !== null ? `<span style="color:${s.grade>=4?'#4ade80':'#f87171'};font-weight:700;">Nota: ${s.grade}</span>` : ''}
                ${canFinal ? `<span class="career-final-badge">Final disponible</span>` : ''}
              </div>
            </div>
            <span class="career-status-badge" style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.border};">${cfg.label}</span>
          </div>`;
        }).join('')}
      </div>`;
    }).join('');

    return `
    <div class="career-year-block">
      <div class="career-year-header" onclick="this.closest('.career-year-block').classList.toggle('collapsed')">
        <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
          <span class="career-year-num">${year}° Año</span>
          <span style="font-size:11px;color:var(--text2);white-space:nowrap;">${approved}/${totalYear}</span>
          <div class="career-year-bar-wrap">
            <div class="career-year-bar-fill" style="width:${pct}%;background:${barColor};"></div>
          </div>
          <span style="font-size:11px;color:var(--text2);min-width:2.5rem;">${pct}%</span>
        </div>
        <span class="career-chevron">▾</span>
      </div>
      <div class="career-year-body">${semHtml}</div>
    </div>`;
  }).join('');

  el.innerHTML = filterBarHtml + (yearBlocksHtml || `<div class="empty-st"><div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);margin-bottom:0.5rem;">${SVG_ICONS.search}</div><div>No se encontraron materias con el filtro aplicado.</div></div>`);
}

// ═══════════════════════════════════════════════════════════
//  TAB 2: MAPA SVG (Grafo de Correlatividades)
// ═══════════════════════════════════════════════════════════
const CM = { NW:148, NH:44, HGAP:36, VGAP:12, HEADER:66, M:16 };

function renderCareerMap() {
  const el = document.getElementById('career-map-container');
  if (!el) return;
  const subs = S.career.subjects;

  // Agrupar por columna: col = (year-1)*2 + (semester-1)
  const cols = {};
  for (let i = 0; i < 10; i++) cols[i] = [];
  subs.forEach(s => cols[(s.year-1)*2 + (s.semester-1)].push(s));

  const COL_W = CM.NW + CM.HGAP, ROW_H = CM.NH + CM.VGAP;
  const maxRows = Math.max(...Object.values(cols).map(c => c.length));
  const SVG_W = CM.M * 2 + 10 * COL_W;
  const SVG_H = CM.HEADER + maxRows * ROW_H + CM.M;

  // Posiciones de nodos
  const posMap = {};
  Object.entries(cols).forEach(([ci, colSubs]) => {
    colSubs.forEach((s, row) => {
      posMap[s.id] = { x: CM.M + parseInt(ci) * COL_W, y: CM.HEADER + row * ROW_H };
    });
  });

  // Marcadores SVG (flechas)
  const defs = `<defs>
    <marker id="cm-arr" markerWidth="7" markerHeight="7" refX="5.5" refY="2.5" orient="auto">
      <path d="M0,0 L0,5 L6,2.5 z" fill="rgba(255,255,255,0.2)"/>
    </marker>
    <marker id="cm-arr-in" markerWidth="7" markerHeight="7" refX="5.5" refY="2.5" orient="auto">
      <path d="M0,0 L0,5 L6,2.5 z" fill="#f87171"/>
    </marker>
    <marker id="cm-arr-out" markerWidth="7" markerHeight="7" refX="5.5" refY="2.5" orient="auto">
      <path d="M0,0 L0,5 L6,2.5 z" fill="#4ade80"/>
    </marker>
  </defs>`;

  // Cabeceras de columna
  const headers = Array.from({length:10}, (_,ci) => {
    if (!cols[ci].length) return '';
    const year = Math.floor(ci/2)+1, sem = (ci%2)+1;
    const cx = CM.M + ci * COL_W + CM.NW/2;
    return `
      <text x="${cx}" y="18" text-anchor="middle" fill="rgba(165,180,252,.85)"
        font-size="10" font-weight="700" font-family="Inter,sans-serif" letter-spacing=".06em">${year}° AÑO</text>
      <text x="${cx}" y="33" text-anchor="middle" fill="rgba(165,180,252,.45)"
        font-size="9" font-family="Inter,sans-serif">${sem}° sem</text>
      <line x1="${CM.M + ci*COL_W}" y1="42" x2="${CM.M + ci*COL_W + CM.NW}" y2="42"
        stroke="rgba(99,102,241,.2)" stroke-width="1"/>`;
  }).join('');

  // Aristas (inter-columna únicamente)
  const edgeSvg = subs.flatMap(tgt =>
    (tgt.correlatives.toCurse || []).map(srcId => {
      const sp = posMap[srcId], tp = posMap[tgt.id];
      if (!sp || !tp) return '';
      const srcSub = subs.find(x => x.id === srcId);
      if (!srcSub) return '';
      const srcCol = (srcSub.year-1)*2 + (srcSub.semester-1);
      const tgtCol = (tgt.year-1)*2  + (tgt.semester-1);
      if (srcCol === tgtCol) return ''; // omitir intra-columna
      const sx = sp.x + CM.NW, sy = sp.y + CM.NH/2;
      const tx = tp.x,          ty = tp.y + CM.NH/2;
      const mid = (tx - sx) * 0.42;
      return `<path class="cm-edge" data-src="${srcId}" data-tgt="${tgt.id}"
        d="M${sx},${sy} C${sx+mid},${sy},${tx-mid},${ty},${tx},${ty}"
        fill="none" stroke="rgba(255,255,255,.15)" stroke-width="1.5" marker-end="url(#cm-arr)"/>`;
    })
  ).join('');

  // Nodos
  const nodeSvg = subs.map(s => {
    const p = posMap[s.id]; if (!p) return '';
    const cs = getComputedStatus(s);
    const cfg = CAREER_STATUS_CFG[cs] || CAREER_STATUS_CFG.pendiente;
    const cx = p.x + CM.NW/2;
    const short = s.name.length > 19 ? s.name.slice(0,18)+'…' : s.name;
    return `
    <g class="cm-node" data-id="${s.id}" onclick="handleCareerNodeClick('${s.id}')" style="cursor:pointer;">
      <rect class="cm-node-rect" data-id="${s.id}"
        x="${p.x}" y="${p.y}" width="${CM.NW}" height="${CM.NH}" rx="6"
        fill="${cfg.bg}" stroke="${cfg.color}" stroke-width="1.5" stroke-opacity=".55"/>
      <text x="${cx}" y="${p.y+16}" text-anchor="middle" fill="${cfg.color}"
        font-size="10" font-weight="700" font-family="Inter,sans-serif" pointer-events="none">${short}</text>
      <text x="${cx}" y="${p.y+30}" text-anchor="middle" fill="${cfg.color}" opacity=".55"
        font-size="8.5" font-family="Inter,sans-serif" pointer-events="none">${cfg.label}</text>
      ${s.grade !== null ? `
        <rect x="${p.x+CM.NW-24}" y="${p.y+3}" width="21" height="14" rx="3"
          fill="${s.grade>=4?'rgba(74,222,128,.25)':'rgba(248,113,113,.25)'}"/>
        <text x="${p.x+CM.NW-13}" y="${p.y+14}" text-anchor="middle"
          fill="${s.grade>=4?'#4ade80':'#f87171'}"
          font-size="9.5" font-weight="800" font-family="Inter,sans-serif" pointer-events="none">${s.grade}</text>
      ` : ''}
    </g>`;
  }).join('');

  el.innerHTML = `
    <div class="cm-toolbar">
      <button class="btn btn-ghost btn-sm" onclick="cmZoom(.15)">＋</button>
      <button class="btn btn-ghost btn-sm" onclick="cmZoom(-.15)">－</button>
      <button class="btn btn-ghost btn-sm" onclick="cmReset()" title="Centrar la vista del mapa">Centrar Mapa</button>
      <span style="font-size:11px;color:var(--text2);margin-left:8px;">Arrastrá · Rueda · Click en materia</span>
    </div>
    <div class="cm-canvas" id="cm-canvas" style="cursor:grab;overflow:hidden;">
      <svg id="cm-svg" xmlns="http://www.w3.org/2000/svg"
           width="${SVG_W}" height="${SVG_H}"
           style="display:block;transform-origin:0 0;will-change:transform;">
        ${defs}
        <g id="cm-g">${edgeSvg}${headers}${nodeSvg}</g>
      </svg>
    </div>`;

  cmApplyTransform();
  setupCmPanZoom();
}

function cmApplyTransform() {
  const svg = document.getElementById('cm-svg');
  if (svg) svg.style.transform = `translate(${_cmT.x}px,${_cmT.y}px) scale(${_cmT.s})`;
}
function cmZoom(d) { _cmT.s = Math.max(.22, Math.min(2.5, _cmT.s+d)); cmApplyTransform(); }
function cmReset() { _cmT = {x:0,y:0,s:.72}; cmApplyTransform(); }

function setupCmPanZoom() {
  const canvas = document.getElementById('cm-canvas');
  if (!canvas) return;
  let drag=false, ox,oy,otx,oty;
  canvas.onmousedown = e => {
    if (e.target.closest('.cm-node')) return;
    drag=true; ox=e.clientX; oy=e.clientY; otx=_cmT.x; oty=_cmT.y;
    canvas.style.cursor='grabbing'; e.preventDefault();
  };
  const mm = e => { if(!drag) return; _cmT.x=otx+e.clientX-ox; _cmT.y=oty+e.clientY-oy; cmApplyTransform(); };
  const mu = () => { drag=false; const c=document.getElementById('cm-canvas'); if(c) c.style.cursor='grab'; };
  window.addEventListener('mousemove', mm);
  window.addEventListener('mouseup', mu);
  canvas.onwheel = e => { e.preventDefault(); cmZoom(e.deltaY>0?-.08:.08); };
}

function handleCareerNodeClick(id) {
  selectedCareerNode = id;
  const sub = S.career.subjects.find(x => x.id === id);
  if (!sub) return;
  const needed  = new Set(sub.correlatives.toCurse || []);
  const unlocks = new Set(S.career.subjects.filter(x => (x.correlatives.toCurse||[]).includes(id)).map(x=>x.id));

  document.querySelectorAll('.cm-edge').forEach(e => {
    const src = e.dataset.src, tgt = e.dataset.tgt;
    if      (tgt === id) { e.style.stroke='#f87171'; e.setAttribute('marker-end','url(#cm-arr-in)');  e.style.opacity='1'; }
    else if (src === id) { e.style.stroke='#4ade80'; e.setAttribute('marker-end','url(#cm-arr-out)'); e.style.opacity='1'; }
    else                 { e.style.stroke='rgba(255,255,255,.06)'; e.setAttribute('marker-end','url(#cm-arr)'); e.style.opacity='.4'; }
  });
  document.querySelectorAll('.cm-node-rect').forEach(r => {
    const nid = r.dataset.id;
    r.style.opacity = (nid===id || needed.has(nid) || unlocks.has(nid)) ? '1' : '0.28';
  });
  openCareerSubDetail(id);
}

function clearCmHighlight() {
  document.querySelectorAll('.cm-edge').forEach(e => {
    e.style.stroke='rgba(255,255,255,.15)'; e.style.opacity='1';
    e.setAttribute('marker-end','url(#cm-arr)');
  });
  document.querySelectorAll('.cm-node-rect').forEach(r => { r.style.opacity='1'; });
  selectedCareerNode = null;
}

// ═══════════════════════════════════════════════════════════
//  TAB 3: FINALES DISPONIBLES & VENCIMIENTOS (CON FILTROS)
// ═══════════════════════════════════════════════════════════
function renderCareerFinals() {
  const el = document.getElementById('career-finals-container');
  if (!el) return;
  const subs = S.career.subjects;

  // Ver TODOS los finales de materias en estado 'regular'
  const regularSubs = subs.filter(s => s.status === 'regular');

  if (!regularSubs.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:2.5rem 1rem;color:var(--text2);background:var(--card);border-radius:0.75rem;border:1px solid var(--border);">
        <div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);margin-bottom:0.5rem;">${SVG_ICONS.book}</div>
        <div style="font-size:0.9375rem;font-weight:700;color:var(--text);">No hay materias regulares registradas</div>
        <div style="font-size:0.8125rem;margin-top:0.25rem;">Cuando tengas materias regularizadas aparecerán aquí con sus fechas de vencimiento.</div>
      </div>`;
    return;
  }

  // Filtrado y búsqueda
  let filteredSubs = regularSubs.filter(s => {
    if (finalsSearch) {
      const q = finalsSearch.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchCode = (s.code || '').toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    const missingToPass = (s.correlatives.toPass || []).map(id => subs.find(x => x.id === id)).filter(dep => !dep || dep.status !== 'aprobada');
    const canRendir = missingToPass.length === 0;
    if (finalsFilter === 'ready' && !canRendir) return false;
    if (finalsFilter === 'pending' && canRendir) return false;
    return true;
  });

  // Ordenamiento
  filteredSubs.sort((a, b) => {
    if (finalsSort === 'exp-asc') {
      const da = getDaysToExpiration(a.expDate) ?? 9999;
      const db = getDaysToExpiration(b.expDate) ?? 9999;
      return da - db;
    } else if (finalsSort === 'exp-desc') {
      const da = getDaysToExpiration(a.expDate) ?? -9999;
      const db = getDaysToExpiration(b.expDate) ?? -9999;
      return db - da;
    } else if (finalsSort === 'name-asc') {
      return a.name.localeCompare(b.name);
    } else if (finalsSort === 'year-asc') {
      return (a.year - b.year) || (a.semester - b.semester);
    }
    return 0;
  });

  const filterBarHtml = `
    <div style="margin-bottom:1rem;display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;justify-content:space-between;background:var(--card);padding:0.75rem;border-radius:0.75rem;border:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:0.5rem;flex:1;min-width:180px;">
        <input type="text" class="f-input" placeholder="Buscar final o código..."
          value="${finalsSearch}" oninput="setFinalsSearch(this.value)" style="font-size:0.75rem;padding:0.375rem 0.625rem;">
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
        <select class="f-input" onchange="setFinalsFilter(this.value)" style="font-size:0.75rem;padding:0.375rem 0.625rem;">
          <option value="all" ${finalsFilter==='all'?'selected':''}>Todos los finales (${regularSubs.length})</option>
          <option value="ready" ${finalsFilter==='ready'?'selected':''}>Habilitados para rendir</option>
          <option value="pending" ${finalsFilter==='pending'?'selected':''}>Pendiente correlativas</option>
        </select>
        <select class="f-input" onchange="setFinalsSort(this.value)" style="font-size:0.75rem;padding:0.375rem 0.625rem;">
          <option value="exp-asc" ${finalsSort==='exp-asc'?'selected':''}>Vencimiento más próximo</option>
          <option value="exp-desc" ${finalsSort==='exp-desc'?'selected':''}>Vencimiento más lejano</option>
          <option value="name-asc" ${finalsSort==='name-asc'?'selected':''}>Nombre (A - Z)</option>
          <option value="year-asc" ${finalsSort==='year-asc'?'selected':''}>Año (1° a 5°)</option>
        </select>
      </div>
    </div>`;

  if (!filteredSubs.length) {
    el.innerHTML = filterBarHtml + `
      <div class="empty-st" style="background:var(--card);border-radius:0.75rem;border:1px solid var(--border);">
        <div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);margin-bottom:0.5rem;">${SVG_ICONS.search}</div>
        <div>No se encontraron finales que coincidan con la búsqueda o filtro seleccionado.</div>
      </div>`;
    return;
  }

  const cardsHtml = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:0.75rem;">
      ${filteredSubs.map(s => {
        const missingToPass = (s.correlatives.toPass || []).map(id => subs.find(x => x.id === id)).filter(dep => !dep || dep.status !== 'aprobada');
        const canRendir = missingToPass.length === 0;

        const daysLeft = getDaysToExpiration(s.expDate);
        let badgeBg = 'rgba(74,222,128,.15)', badgeColor = '#4ade80', badgeText = 'Regularidad activa';
        if (daysLeft !== null) {
          if (daysLeft < 0) { badgeBg = 'rgba(248,113,113,.2)'; badgeColor = '#f87171'; badgeText = '¡Vencida!'; }
          else if (daysLeft <= 90) { badgeBg = 'rgba(248,113,113,.15)'; badgeColor = '#f87171'; badgeText = `Vence en ${daysLeft} días`; }
          else if (daysLeft <= 180) { badgeBg = 'rgba(251,191,36,.15)'; badgeColor = '#fbbf24'; badgeText = `Vence en ${daysLeft} días`; }
          else { badgeBg = 'rgba(74,222,128,.15)'; badgeColor = '#4ade80'; badgeText = `Vence en ${daysLeft} días`; }
        }

        const regFormatted = s.regDate ? new Date(s.regDate.replace(/-/g,'/')).toLocaleDateString('es-AR') : '—';
        const expFormatted = s.expDate ? new Date(s.expDate.replace(/-/g,'/')).toLocaleDateString('es-AR') : '—';

        const statusRendirBadge = canRendir
          ? `<span style="display:inline-flex;align-items:center;gap:0.35rem;font-size:0.6875rem;font-weight:700;padding:0.25rem 0.5rem;border-radius:0.375rem;background:rgba(74,222,128,.15);color:#4ade80;border:1px solid rgba(74,222,128,.3);">${SVG_ICONS.check} Habilitado para rendir</span>`
          : `<span style="display:inline-flex;align-items:center;gap:0.35rem;font-size:0.6875rem;font-weight:700;padding:0.25rem 0.5rem;border-radius:0.375rem;background:rgba(248,113,113,.15);color:#f87171;border:1px solid rgba(248,113,113,.3);">${SVG_ICONS.lock} Pendiente correlativas</span>`;

        return `
          <div style="background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1rem;display:flex;flex-direction:column;justify-content:space-between;gap:0.75rem;cursor:pointer;" onclick="openCareerSubDetail('${s.id}')">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.375rem;">
                <div style="font-size:0.9375rem;font-weight:700;color:var(--text);line-height:1.2;">${s.name}</div>
                <span style="font-size:0.625rem;font-weight:700;padding:0.125rem 0.375rem;border-radius:0.25rem;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);white-space:nowrap;">${s.year}° Año</span>
              </div>
              <div style="font-size:0.6875rem;color:var(--text2);margin-bottom:0.5rem;">Código: ${s.code || '—'} · ${s.credits} créditos</div>
              <div style="margin-bottom:0.375rem;">${statusRendirBadge}</div>
              ${!canRendir ? `<div style="font-size:0.6875rem;color:#f87171;margin-top:0.25rem;">Falta aprobar: ${missingToPass.map(m=>m?m.name:'?').join(', ')}</div>` : ''}
            </div>

            <div style="background:var(--card2);padding:0.625rem;border-radius:0.5rem;display:flex;flex-direction:column;gap:0.25rem;font-size:0.6875rem;">
              <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text2);">Regularizada:</span>
                <span style="font-weight:600;">${regFormatted}</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:var(--text2);">Vencimiento:</span>
                <span style="font-weight:700;color:${badgeColor};">${expFormatted}</span>
              </div>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;flex-wrap:nowrap;">
              <span style="display:inline-flex;align-items:center;gap:0.3rem;font-size:0.6875rem;font-weight:700;padding:0.25rem 0.5rem;border-radius:0.375rem;background:${badgeBg};color:${badgeColor};white-space:nowrap;">${badgeText}</span>
              <button class="btn-action" style="font-size:0.75rem;padding:0.35rem 0.65rem;" onclick="event.stopPropagation();openCareerSubDetail('${s.id}')">${SVG_ICONS.fileEdit} Rendir Final</button>
            </div>
          </div>`;
      }).join('')}
    </div>`;

  el.innerHTML = filterBarHtml + cardsHtml;
}

// ═══════════════════════════════════════════════════════════
//  TAB 4: ESTADÍSTICAS & TÍTULOS
// ═══════════════════════════════════════════════════════════
function renderCareerStats() {
  const el = document.getElementById('career-stats-container');
  if (!el) return;
  const subs = S.career.subjects;

  // 1. Título de Grado (Ingeniero en Informática)
  const total = subs.length;
  const aprobadas = subs.filter(s => s.status === 'aprobada').length;
  const regulares = subs.filter(s => s.status === 'regular').length;
  const cursandoN = subs.filter(s => s.status === 'cursando').length;
  const disponible = subs.filter(s => getComputedStatus(s) === 'disponible').length;
  
  const pctActual = total ? Math.round((aprobadas / total) * 100) : 0;
  const pctProyectado = total ? Math.round(((aprobadas + regulares) / total) * 100) : 0;

  // 2. Título Intermedio (Analista de Sistemas Informáticos - Años 1 a 3)
  const analistaSubs = subs.filter(s => s.year <= 3);
  const analistaTotal = analistaSubs.length;
  const analistaAprobadas = analistaSubs.filter(s => s.status === 'aprobada').length;
  const analistaRegulares = analistaSubs.filter(s => s.status === 'regular').length;
  
  const pctAnalistaActual = analistaTotal ? Math.round((analistaAprobadas / analistaTotal) * 100) : 0;
  const pctAnalistaProyectado = analistaTotal ? Math.round(((analistaAprobadas + analistaRegulares) / analistaTotal) * 100) : 0;

  // Promedios
  const allGrades = subs.filter(s => s.grade !== null).map(s => s.grade);
  const passGrades = allGrades.filter(g => g >= 4);
  const avg = allGrades.length ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length).toFixed(2) : '—';
  const avgPass = passGrades.length ? (passGrades.reduce((a, b) => a + b, 0) / passGrades.length).toFixed(2) : '—';
  
  const totalCred = subs.reduce((a, s) => a + s.credits, 0);
  const approvedCred = subs.filter(s => s.status === 'aprobada').reduce((a, s) => a + s.credits, 0);

  const R = 68, C = 2 * Math.PI * R;
  const dashOffActual = C * (1 - pctActual / 100);
  const dashOffProy = C * (1 - pctProyectado / 100);

  // Histograma de notas
  const bins = Array(11).fill(0);
  allGrades.forEach(g => bins[Math.min(10, Math.floor(g))]++);
  const maxBin = Math.max(...bins, 1);

  el.innerHTML = `
    <div class="cs-layout">
      <!-- Card Ing. Informática -->
      <div class="cs-card cs-ring-card">
        <div style="font-size:0.75rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.25rem;">Título de Grado</div>
        <div style="font-size:1rem;font-weight:900;color:var(--text);margin-bottom:0.75rem;text-align:center;">Ingeniería en Informática</div>
        
        <svg width="150" height="150" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="${R}" fill="none" stroke="var(--border)" stroke-width="12"/>
          <circle cx="80" cy="80" r="${R}" fill="none" stroke="rgba(167,139,250,.35)" stroke-width="12"
            stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${dashOffProy.toFixed(1)}"
            stroke-linecap="round" transform="rotate(-90 80 80)" style="transition:stroke-dashoffset .8s ease;"/>
          <circle cx="80" cy="80" r="${R}" fill="none" stroke="#4ade80" stroke-width="12"
            stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${dashOffActual.toFixed(1)}"
            stroke-linecap="round" transform="rotate(-90 80 80)" style="transition:stroke-dashoffset .8s ease;"/>
          <text x="80" y="72" text-anchor="middle" fill="var(--text)" font-size="24" font-weight="900">${pctActual}%</text>
          <text x="80" y="88" text-anchor="middle" fill="#4ade80" font-size="9" font-weight="700">Actual</text>
          <text x="80" y="100" text-anchor="middle" fill="#a78bfa" font-size="8.5">Proy: ${pctProyectado}%</text>
        </svg>
        <div style="font-size:0.75rem;color:var(--text2);text-align:center;margin-top:0.5rem;">
          <b>${aprobadas}</b> aprobadas · <b>${regulares}</b> regulares
        </div>
      </div>

      <!-- Card Título Intermedio -->
      <div class="cs-card cs-ring-card" style="border-color:rgba(96,165,250,.3);">
        <div style="font-size:0.75rem;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.25rem;">Título Intermedio</div>
        <div style="font-size:1rem;font-weight:900;color:var(--text);margin-bottom:0.75rem;text-align:center;">Analista de Sistemas Informáticos</div>
        
        <svg width="150" height="150" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="${R}" fill="none" stroke="var(--border)" stroke-width="12"/>
          <circle cx="80" cy="80" r="${R}" fill="none" stroke="rgba(96,165,250,.35)" stroke-width="12"
            stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pctAnalistaProyectado/100)).toFixed(1)}"
            stroke-linecap="round" transform="rotate(-90 80 80)" style="transition:stroke-dashoffset .8s ease;"/>
          <circle cx="80" cy="80" r="${R}" fill="none" stroke="#60a5fa" stroke-width="12"
            stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pctAnalistaActual/100)).toFixed(1)}"
            stroke-linecap="round" transform="rotate(-90 80 80)" style="transition:stroke-dashoffset .8s ease;"/>
          <text x="80" y="72" text-anchor="middle" fill="var(--text)" font-size="24" font-weight="900">${pctAnalistaActual}%</text>
          <text x="80" y="88" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="700">Actual (1º-3º año)</text>
          <text x="80" y="100" text-anchor="middle" fill="#93c5fd" font-size="8.5">Proy: ${pctAnalistaProyectado}%</text>
        </svg>
        <div style="font-size:0.75rem;color:var(--text2);text-align:center;margin-top:0.5rem;">
          <b>${analistaAprobadas} / ${analistaTotal}</b> materias aprobadas
        </div>
      </div>

      <!-- Mini Grid de Estadísticas -->
      <div class="cs-mini-grid" style="grid-column: 1 / -1;">
        ${(()=>{
          const isL = THEMES[S.profile?.theme||'dark']?.isLight;
          const c = isL 
            ? ['#16a34a','#7c3aed','#2563eb','#d97706','#7c3aed','#059669','#4f46e5','var(--text2)']
            : ['#4ade80','#a78bfa','#60a5fa','#fbbf24','#c4b5fd','#34d399','var(--primary)','var(--text2)'];
          return [
            ['Aprobadas Total',  aprobadas,   c[0]],
            ['Regulares Pend.',  regulares,   c[1]],
            ['Cursando',         cursandoN,   c[2]],
            ['Disponibles',      disponible,  c[3]],
            ['Promedio General', avg,         c[4]],
            ['Prom. Aprobadas',  avgPass,     c[5]],
            ['Créditos Aprob.',  approvedCred,c[6]],
            ['Créditos Total',   totalCred,   c[7]],
          ].map(([lbl,val,col])=>`
            <div class="cs-mini-card">
              <div class="cs-mini-val" style="color:${col};">${val}</div>
              <div class="cs-mini-lbl">${lbl}</div>
            </div>`).join('');
        })()}
      </div>

      ${allGrades.length >= 2 ? `
      <div class="cs-card cs-histo-card">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text2);margin-bottom:14px;">Distribución de Notas (Exámenes Finales)</div>
        <div style="display:flex;align-items:flex-end;gap:5px;height:90px;">
          ${bins.map((count,i) => {
            const h = count ? Math.max(8,Math.round(count/maxBin*78)) : 2;
            const c = i>=4 ? '#4ade80' : '#f87171';
            return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
              <div style="font-size:9px;color:var(--text2);min-height:12px;">${count||''}</div>
              <div style="height:${h}px;width:100%;background:${c};border-radius:3px 3px 0 0;opacity:${count?1:.15};transition:height .4s ease;"></div>
              <div style="font-size:9px;color:var(--text2);">${i}</div>
            </div>`;
          }).join('')}
        </div>
      </div>` : ''}
    </div>`;
}

// ═══════════════════════════════════════════════════════════
//  PANEL DE DETALLE DE MATERIA
// ═══════════════════════════════════════════════════════════
function openCareerSubDetail(id) {
  let s = S.career.subjects.find(x => x.id === id);
  let isElective = false;
  if (!s && S.career.electives) {
    s = S.career.electives.find(x => x.id === id);
    isElective = true;
  }
  if (!s) return;
  const cs  = isElective ? s.status : getComputedStatus(s);
  const cfg = CAREER_STATUS_CFG[cs] || CAREER_STATUS_CFG.pendiente;
  const all = S.career.subjects;

  const corrItem = dep => {
    if (!dep) return '';
    const dcs = getComputedStatus(dep), dc = CAREER_STATUS_CFG[dcs];
    return `<div class="career-corr-row">
      <span class="career-status-badge" style="background:${dc.bg};color:${dc.color};border:1px solid ${dc.border};">${dc.label}</span>
      <span style="font-size:12px;">${dep.name}</span>
    </div>`;
  };

  const correlatives = s.correlatives || {toCurse:[], toPass:[]};
  const needsHtml = (correlatives.toCurse||[]).map(cid=>corrItem(all.find(x=>x.id===cid))).join('')
    || '<div style="font-size:11px;color:var(--text2);">Sin correlativas</div>';
  const unlocksHtml = all.filter(x=>(x.correlatives&&x.correlatives.toCurse||[]).includes(id))
    .map(x=>corrItem(x)).join('')
    || '<div style="font-size:11px;color:var(--text2);">—</div>';

  const statusOpts = ['pendiente','cursando','regular','aprobada'].map(st =>
    `<option value="${st}" ${s.status===st?'selected':''}>${CAREER_STATUS_CFG[st].label}</option>`
  ).join('');

  document.getElementById('career-detail-title').textContent = s.name;
  document.getElementById('career-detail-meta').textContent  = isElective 
      ? `Categoría: ${s.category} · ${s.credits} créditos`
      : `${s.year}° Año · ${s.semester}° Semestre · ${s.credits} créditos`;
  document.getElementById('career-detail-body').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <span class="career-status-badge" style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.border};font-size:12px;padding:.3rem .75rem;align-self:flex-start;">${cfg.label}</span>
      <div>
        <label class="f-label">Estado</label>
        <select class="f-input" id="cd-status" onchange="csSetStatus('${id}',this.value)">${statusOpts}</select>
      </div>
      <div id="cd-grade-row" style="${s.status==='aprobada'?'':'display:none;'}">
        <label class="f-label">Nota final (0 – 10)</label>
        <input type="number" class="f-input" id="cd-grade" min="0" max="10" step="0.5"
          value="${s.grade!==null?s.grade:''}" placeholder="Ej: 8"
          style="font-size:20px;font-weight:800;text-align:center;"
          oninput="var v=parseFloat(this.value);this.style.color=isNaN(v)?'var(--text)':v>=4?'#4ade80':'#f87171';csSetGrade('${id}',this.value)">
      </div>
      <div>
        <div class="f-label" style="margin-bottom:6px;">Para cursar (necesitás regular)</div>
        ${needsHtml}
      </div>
      <div>
        <div class="f-label" style="margin-bottom:6px;">Desbloquea</div>
        ${unlocksHtml}
      </div>
    </div>`;

  const panel = document.getElementById('career-detail-panel');
  panel.style.display = 'flex';
  requestAnimationFrame(() => panel.classList.add('open'));
}

function closeCareerDetail() {
  const panel = document.getElementById('career-detail-panel');
  panel.classList.remove('open');
  setTimeout(() => { panel.style.display='none'; }, 280);
  clearCmHighlight();
}

function csSetStatus(id, status) {
  let s = S.career.subjects.find(x => x.id === id);
  let isElective = false;
  if (!s && S.career.electives) {
    s = S.career.electives.find(x => x.id === id);
    isElective = true;
  }
  if (!s) return;
  
  s.status = status;
  if (status !== 'aprobada') s.grade = null;
  if (window.api) window.api.syncSubjectProgress(s.id, isElective ? 'elective' : 'subject', s.status, s.grade, s.regDate, s.expDate).catch(console.error);

  if (status === 'regular') {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const expDateObj = new Date(now.getFullYear() + 1, now.getMonth() + 6, now.getDate());
    const expStr = `${expDateObj.getFullYear()}-${String(expDateObj.getMonth()+1).padStart(2,'0')}-${String(expDateObj.getDate()).padStart(2,'0')}`;
    if (!s.regDate) s.regDate = todayStr;
    if (!s.expDate) s.expDate = expStr;
  }

  const orig = S.subjects.find(x => x.id === id || (x.code && x.code === s.code) || x.name.toLowerCase() === s.name.toLowerCase());
  if (orig) {
    orig.status = status;
  }

  const gr = document.getElementById('cd-grade-row');
  if (gr) gr.style.display = status==='aprobada' ? '' : 'none';
  if (!isElective) syncSubjectsAndCareer();
  save();
  renderView(currentView);
}

function csSetGrade(id, val) {
  let s = S.career.subjects.find(x => x.id === id);
  let isElective = false;
  if (!s && S.career.electives) {
    s = S.career.electives.find(x => x.id === id);
    isElective = true;
  }
  if (!s) return;
  const v = parseFloat(val);
  s.grade = isNaN(v) ? null : Math.min(10, Math.max(0, v));
  if (s.grade !== null && s.grade >= 4 && s.status !== 'aprobada') {
    s.status = 'aprobada';
  }
  if (!isElective) syncSubjectsAndCareer();
  save();
  renderView(currentView);
}

// ═══════════════════════════════════════════════════════════
//  VIEW: CONFIGURACIÓN & PERFIL & TEMAS & BACKUP (CSV / JSON)
// ═══════════════════════════════════════════════════════════
function renderSettings() {
  // Inject scaffold if not yet in the DOM
  const view = document.getElementById('view-settings');
  if (view && !document.getElementById('theme-presets-grid')) {
    view.innerHTML = `
      <div style="max-width:700px;margin:0 auto;">
        <div class="view-title" style="margin-bottom:1.5rem;">Configuración & Perfil</div>

        <div style="background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1.25rem;margin-bottom:1.25rem;">
          <div style="font-weight:700;margin-bottom:1rem;color:var(--text);">Perfil</div>
          <div style="display:flex;flex-direction:column;gap:0.75rem;">
            <div>
              <label class="f-label">Nombre</label>
              <input class="f-input" id="setting-user-name" type="text" placeholder="Tu nombre">
            </div>
            <div>
              <label class="f-label">Carrera</label>
              <input class="f-input" id="setting-user-career" type="text" placeholder="Tu carrera">
            </div>
            <button class="btn btn-primary" onclick="saveProfileSettings()">Guardar perfil</button>
          </div>
        </div>

        <div style="background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1.25rem;margin-bottom:1.25rem;">
          <div style="font-weight:700;margin-bottom:1rem;color:var(--text);">Tema de color</div>
          <div id="theme-presets-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:0.5rem;"></div>
        </div>

        <div style="background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1.25rem;margin-bottom:1.25rem;">
          <div style="font-weight:700;margin-bottom:0.5rem;color:var(--text);">Datos</div>
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
            <button class="btn btn-ghost" onclick="exportBackup()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Exportar backup JSON
            </button>
            <label class="btn btn-ghost" style="cursor:pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Importar archivo
              <input type="file" accept=".json,.csv" style="display:none;" onchange="handleFileImport(event)">
            </label>
          </div>
        </div>

        <div style="background:var(--card);border:1px solid var(--border);border-radius:0.75rem;padding:1.25rem;">
          <div style="font-weight:700;margin-bottom:0.5rem;color:var(--text);">Cuenta</div>
          <button class="btn btn-ghost" onclick="window.handleLogout && window.handleLogout()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Cerrar sesión
          </button>
        </div>
      </div>
    `;
  }

  const elName   = document.getElementById('setting-user-name');
  const elCareer = document.getElementById('setting-user-career');
  if (elName   && S.profile) elName.value   = S.profile.name   || 'Fran Giraudo';
  if (elCareer && S.profile) elCareer.value = S.profile.career || 'Ingeniería en Informática — IUA';

  const grid = document.getElementById('theme-presets-grid');
  if (!grid) return;

  const currentTheme = S.profile ? (S.profile.theme || 'dark') : 'dark';

  grid.innerHTML = Object.entries(THEMES).map(([key, t]) => {
    const isSel = key === currentTheme;
    const textColor = t.isLight ? '#0f172a' : '#eeeeff';
    const cardBorder = isSel ? t.primary : (t.isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)');
    return `
      <div onclick="setTheme('${key}')" style="cursor:pointer;background:${t.bg};border:2px solid ${cardBorder};border-radius:0.5rem;padding:0.625rem;display:flex;align-items:center;justify-content:space-between;gap:0.5rem;box-shadow:${isSel?'0 0 10px '+t.primary+'44':'none'};">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <div style="width:14px;height:14px;border-radius:50%;background:${t.primary};flex-shrink:0;box-shadow:0 0 4px ${t.primary};"></div>
          <span style="font-size:0.75rem;font-weight:700;color:${textColor};">${t.name}</span>
        </div>
        ${isSel ? `<span style="font-size:0.65rem;font-weight:800;color:${t.primary};">Activo</span>` : ''}
      </div>`;
  }).join('');
}

function setTheme(themeKey) {
  if (!S.profile) S.profile = {};
  S.profile.theme = themeKey;
  applyTheme(themeKey);
  save();
  renderSettings();
}

function showToast(msg, type='success') {
  let t = document.getElementById('app-toast');
  if(!t) {
    t = document.createElement('div');
    t.id = 'app-toast';
    document.body.appendChild(t);
  }
  const bg = type==='success'?'var(--primary)':'#ef4444';
  t.style.cssText = `position:fixed;bottom:20px;right:20px;background:${bg};color:#fff;padding:12px 24px;border-radius:8px;font-weight:700;font-size:0.875rem;box-shadow:0 10px 25px rgba(0,0,0,0.2);transform:translateY(100px);opacity:0;transition:all 0.3s cubic-bezier(0.175,0.885,0.32,1.275);z-index:9999;`;
  t.textContent = msg;
  // trigger reflow
  void t.offsetWidth;
  t.style.transform = 'translateY(0)';
  t.style.opacity = '1';
  setTimeout(() => {
    t.style.transform = 'translateY(100px)';
    t.style.opacity = '0';
  }, 3000);
}

function saveProfileSettings() {
  const elName = document.getElementById('setting-user-name');
  const elCareer = document.getElementById('setting-user-career');
  if (!S.profile) S.profile = {};
  if (elName) S.profile.name = elName.value.trim();
  if (elCareer) S.profile.career = elCareer.value.trim();
  save();
  if (window.api) window.api.syncProfile(S.profile).catch(console.error);
  showToast('¡Perfil actualizado con éxito!');
}

function exportCSV() {
  const subs = S.career ? S.career.subjects : [];
  let csv = "ID,Codigo,Materia,Año,Semestre,Creditos,Estado,Nota,FechaRegularidad,FechaVencimiento,Profesor,Aula\n";
  subs.forEach(s => {
    const orig = S.subjects.find(x => x.id === s.id) || {};
    const row = [
      `"${s.id}"`,
      `"${s.code || ''}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      s.year,
      s.semester,
      s.credits,
      `"${s.status}"`,
      s.grade !== null && s.grade !== undefined ? s.grade : '',
      `"${s.regDate || ''}"`,
      `"${s.expDate || ''}"`,
      `"${(orig.professor || '').replace(/"/g, '""')}"`,
      `"${(orig.room || '').replace(/"/g, '""')}"`
    ];
    csv += row.join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `plan_estudios_horario_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const content = evt.target.result;
    if (file.name.endsWith('.json')) {
      try {
        const data = JSON.parse(content);
        if (data.subjects || data.career) {
          S = data;
          save();
          loadState();
          renderView(currentView);
          if (window.api && window.api.syncEntireStateToCloud) {
            window.api.syncEntireStateToCloud(S).then(() => {
              alert('¡Backup JSON importado y sincronizado en la nube!');
            }).catch(err => {
              console.warn('Sync cloud warning:', err);
              alert('Backup importado localmente. (Nota sobre la nube: ' + err.message + ')');
            });
          } else {
            alert('¡Backup JSON importado con éxito!');
          }
        } else {
          alert('El archivo JSON no contiene una estructura válida de UniSchedule.');
        }
      } catch (err) {
        alert('Error al procesar el archivo JSON: ' + err.message);
      }
    } else if (file.name.endsWith('.csv')) {
      try {
        parseAndImportCSV(content);
        // Re-apply theme in case something disrupted CSS vars
        if (S.profile && S.profile.theme) applyTheme(S.profile.theme);
        else applyTheme('dark');
        renderView(currentView);
        if (window.api && window.api.syncEntireStateToCloud) {
          window.api.syncEntireStateToCloud(S).then(() => {
            alert('¡Materias del CSV importadas y subidas a la nube con éxito!');
          }).catch(err => {
            console.warn('Sync cloud warning:', err);
            alert('Materias del CSV importadas con éxito. (Nube: ' + err.message + ')');
          });
        } else {
          alert('¡Materias del CSV importadas con éxito!');
        }
      } catch (err) {
        console.error('CSV import error:', err);
        // Always re-apply theme even on error
        applyTheme((S && S.profile && S.profile.theme) || 'dark');
        alert('Error al importar el archivo CSV: ' + err.message);
      }
    }
  };
  reader.readAsText(file);
}

// ─── Parsea CSV respetando campos entre comillas con comas internas ───
function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // Double-quote escape inside quoted field
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

function parseAndImportCSV(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return;

  // Ensure S.career is fully initialized from DEF_CAREER
  ensureCareerLoaded();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 3) continue;
    const [id, code, name, year, semester, credits, status, grade, regDate, expDate, professor, room] = cols;
    if (!name) continue;

    // Normalize status to valid values
    const validStatuses = ['aprobada','aprobado','regular','cursando','pendiente','libre','promocionada','promocionado'];
    const normStatus = validStatuses.includes(status) ? status : 'pendiente';

    let cs = S.career.subjects.find(x =>
      x.id === id ||
      (code && x.code === code) ||
      x.name.toLowerCase() === name.toLowerCase()
    );

    if (cs) {
      cs.status = normStatus;
      cs.grade  = (grade && !isNaN(parseFloat(grade))) ? parseFloat(grade) : (cs.grade || null);
      if (regDate && regDate.trim()) cs.regDate = regDate.trim();
      if (expDate && expDate.trim()) cs.expDate = expDate.trim();
      if (professor && professor.trim()) cs.professor = professor.trim();
      if (room && room.trim()) cs.room = room.trim();
    } else {
      S.career.subjects.push({
        id: id || gid(),
        code: code || '',
        name,
        year: parseInt(year) || 1,
        semester: parseInt(semester) || 1,
        credits: parseInt(credits) || 6,
        status: normStatus,
        grade: (grade && !isNaN(parseFloat(grade))) ? parseFloat(grade) : null,
        regDate: (regDate && regDate.trim()) ? regDate.trim() : null,
        expDate: (expDate && expDate.trim()) ? expDate.trim() : null,
        professor: (professor && professor.trim()) ? professor.trim() : '',
        room: (room && room.trim()) ? room.trim() : '',
        correlatives: { toCurse: [], toPass: [] }
      });
    }
  }

  save();
  syncSubjectsAndCareer();
}
