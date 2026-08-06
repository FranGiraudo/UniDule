import { gid } from './utils.js';

export const STORAGE_KEY = 'unischedule-v3';
export const DAYS   = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
export const DSHORT = ['Lun','Mar','Mié','Jue','Vie'];
export const DAY_JS = [null,'Lunes','Martes','Miércoles','Jueves','Viernes'];
export const GRID_START = '07:30', GRID_END = '22:30', PPM = 1.55;
export const COLORS = [
  '#6366f1','#8b5cf6','#a855f7','#ec4899','#f43f5e','#ef4444',
  '#f97316','#f59e0b','#84cc16','#22c55e','#10b981','#14b8a6',
  '#06b6d4','#0ea5e9','#3b82f6','#64748b'
];
export const TYPE_ICON = { 'Tarea':'','Trabajo Práctico':'','Parcial':'','Final':'','Proyecto':'','Laboratorio':'','Otro':'' };
export const TYPE_BG   = { 'Tarea':'color-mix(in srgb, var(--primary) 15%, transparent)','Trabajo Práctico':'rgba(16,185,129,.15)','Parcial':'rgba(239,68,68,.17)','Final':'rgba(239,68,68,.24)','Proyecto':'rgba(236,72,153,.15)','Laboratorio':'rgba(245,158,11,.15)','Otro':'rgba(255,255,255,.08)' };
export const TYPE_FG   = { 'Tarea':'var(--primary)','Trabajo Práctico':'#6ee7b7','Parcial':'#f87171','Final':'#f87171','Proyecto':'#f9a8d4','Laboratorio':'#fcd34d','Otro':'var(--text2)' };

export const SUBJECT_STATUS = {
  cursando:    { label:'Cursando',     color:'var(--primary)', bg:'color-mix(in srgb, var(--primary) 12%, transparent)'  },
  regular:     { label:'Regular',      color:'#60a5fa', bg:'rgba(59,130,246,.12)'  },
  aprobado:    { label:'Aprobada',     color:'#4ade80', bg:'rgba(34,197,94,.12)'   },
  aprobada:    { label:'Aprobada',     color:'#4ade80', bg:'rgba(34,197,94,.12)'   },
  libre:       { label:'Libre',        color:'#f87171', bg:'rgba(239,68,68,.12)'   },
  promocionado:{ label:'Promocionada', color:'#fbbf24', bg:'rgba(245,158,11,.12)'  },
  promocionada:{ label:'Promocionada', color:'#fbbf24', bg:'rgba(245,158,11,.12)'  },
  pendiente:   { label:'Pendiente',    color:'var(--text2)', bg:'rgba(255,255,255,.05)' }
};
export const GRADE_TYPES = ['Parcial 1','Parcial 2','Parcial 3','Recuperatorio','Final','TP','Lab','Otro'];
export const EXAM_TYPES  = new Set(['Parcial 1','Parcial 2','Parcial 3','Recuperatorio','Final']);


export const DEF_SUBJECTS = [];

export const DEF_TASKS = [];

// Patches: subjects cuyos datos cambiaron después del primer guardado en localStorage
export const PATCHES = {
  gestion2: {
    code:'496', professor:'Vanden, Guillermo', room:'Aula Híbrida 33',
    schedules:[{id:'g1',day:'Lunes',startTime:'11:25',endTime:'13:00',type:'Teórico'}]
  }
};


export const CAREER_STATUS_CFG = {
  pendiente:  { label:'Pendiente',  color:'#64748b', bg:'rgba(100,116,139,.12)', border:'rgba(100,116,139,.3)'  },
  bloqueada:  { label:'Bloqueada',  color:'#374151', bg:'rgba(55,65,81,.1)',     border:'rgba(55,65,81,.25)'    },
  disponible: { label:'Disponible', color:'#fbbf24', bg:'rgba(251,191,36,.12)',  border:'rgba(251,191,36,.4)'   },
  cursando:   { label:'Cursando',   color:'#60a5fa', bg:'rgba(96,165,250,.12)',  border:'rgba(96,165,250,.4)'   },
  regular:    { label:'Regular',    color:'#a78bfa', bg:'rgba(167,139,250,.12)', border:'rgba(167,139,250,.4)'  },
  aprobada:   { label:'Aprobada',   color:'#4ade80', bg:'rgba(74,222,128,.12)',  border:'rgba(74,222,128,.4)'   },
};

export const DEF_CAREER = [
  // ── Año 1, Semestre 1 ─────────────────────────────────────────────────
  {id:'cs-info1',    code:'000450', name:'Informática 1',                 year:1,semester:1,credits:6,status:'aprobada',grade:7,correlatives:{toCurse:[], toPass:[]}},
  {id:'cs-teccomp',  code:'000451', name:'Tecnología en Computadoras',    year:1,semester:1,credits:6,status:'regular',grade:null,regDate:'2025-06-17',expDate:'2027-02-19',correlatives:{toCurse:[], toPass:[]}},
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
  {id:'cs-ia',       code:'000762', name:'Inteligencia Artificial',       year:5,semester:2,credits:6,status:'pendiente',grade:null,correlatives:{toCurse:['cs-modsim'], toPass:['cs-modsim']}},
];


export const DEF_SEMINARS = [
  { id: 'sem-linux', code: '001835', name: 'Fundamentos de Linux', category: 'Seminario Técnico', hours: 40, status: 'aprobada', date: '15/05/2024', notes: 'Acreditado (IUA)' },
  { id: 'sem-labview', code: '001636', name: 'Adquisición Electrónica de Datos y Programación en Lenguaje LABVIEW', category: 'Seminario Técnico', hours: 0, status: 'pendiente', date: '', notes: 'Optativa compartida' },
  { id: 'sem-1', code: '001836', name: 'Seminario I: Ciberseguridad & Hacking Ético', category: 'Seminario Especializado', hours: 30, status: 'cursando', date: '', notes: 'Formación continua' },
  { id: 'sem-2', code: '001837', name: 'Seminario II: Ética Profesional & Responsabilidad Social', category: 'Seminario Institucional', hours: 20, status: 'aprobada', date: '10/11/2025', notes: 'Acreditado' },
  { id: 'sem-3', code: '001838', name: 'Seminario III: Innovación Tecnológica & Emprendedurismo', category: 'Seminario Técnico', hours: 30, status: 'pendiente', date: '', notes: 'Requisito de carrera' },
  { id: 'sem-4', code: '001839', name: 'Seminario IV: Inteligencia Artificial & Aprendizaje Automático', category: 'Seminario Avanzado', hours: 40, status: 'pendiente', date: '', notes: 'Requisito de carrera' },
  { id: 'sem-5', code: '001840', name: 'Taller de Metodología de la Investigación / TFG', category: 'Taller de Grado', hours: 60, status: 'pendiente', date: '', notes: 'Requisito para proyecto final' }
];

export const DEF_ELECTIVES = [
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

// ============================================================================
// PLAN 2026 Y MOTOR DE EQUIVALENCIAS (FASE 1)
// ============================================================================

// El nuevo plan 2026 (Placeholder hasta que el usuario pase los datos)
export const DEF_CAREER_2026 = [
  // Ejemplos ficticios para estructura
  {id:'cs26-info1',    code:'260450', name:'Informática 1 (2026)', year:1,semester:1,credits:6,status:'pendiente',correlatives:{toCurse:[], toPass:[]}},
  {id:'cs26-math',     code:'260452', name:'Matemática Avanzada', year:1,semester:1,credits:6,status:'pendiente',correlatives:{toCurse:[], toPass:[]}},
  {id:'cs26-arq',      code:'260468', name:'Arquitectura Integrada', year:2,semester:1,credits:8,status:'pendiente',correlatives:{toCurse:['260450'], toPass:['260450']}}
];

// Reglas de equivalencia (Placeholder)
export const EQUIVALENCIES_2016_TO_2026 = {
  // 'CodigoMateria2026': { regla... }
  '260450': { type: 'one_to_one', oldCode: '000450' }, // Info 1 -> Info 1 (2026)
  '260452': { type: 'extra', oldCode: '000452', extraDetails: 'Requiere examen extra de Python' }, // AM1A -> Mat Avanzada + Examen
  '260468': { type: 'many_to_one', oldCodes: ['000468', '000473'] } // Arq 1 + Arq 2 -> Arq Integrada
};
