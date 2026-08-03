/* ══════════════════════════════════════════════
   UniSchedule — app.js  v2 (mobile + PDF)
══════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════
const STORAGE_KEY = 'unischedule-v3';
const DAYS   = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const DSHORT = ['Lun','Mar','Mié','Jue','Vie','Sáb'];
const DAY_JS = [null,'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const GRID_START = '07:30', GRID_END = '22:30', PPM = 1.55;
const COLORS = [
  '#6366f1','#8b5cf6','#a855f7','#ec4899','#f43f5e','#ef4444',
  '#f97316','#f59e0b','#84cc16','#22c55e','#10b981','#14b8a6',
  '#06b6d4','#0ea5e9','#3b82f6','#64748b'
];
const TYPE_ICON = { 'Tarea':'📝','Trabajo Práctico':'🔧','Parcial':'📋','Final':'🎯','Proyecto':'💻','Laboratorio':'🔬','Otro':'📌' };
const TYPE_BG   = { 'Tarea':'rgba(99,102,241,.15)','Trabajo Práctico':'rgba(16,185,129,.15)','Parcial':'rgba(239,68,68,.17)','Final':'rgba(239,68,68,.24)','Proyecto':'rgba(236,72,153,.15)','Laboratorio':'rgba(245,158,11,.15)','Otro':'rgba(255,255,255,.08)' };
const TYPE_FG   = { 'Tarea':'#a5b4fc','Trabajo Práctico':'#6ee7b7','Parcial':'#f87171','Final':'#f87171','Proyecto':'#f9a8d4','Laboratorio':'#fcd34d','Otro':'var(--text2)' };

// ═══════════════════════════════════════════════════════════
//  DEFAULT DATA (extraído de los PDFs)
// ═══════════════════════════════════════════════════════════
function gid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

const DEF_SUBJECTS = [
  { id:'auditoria', name:'Auditoría', code:'478', color:'#6366f1',
    professor:'Tapia, C. / Casanovas, J.I.', room:'Aula 14', email:'', maxAbsences:6, absences:0,
    schedules:[
      {id:'a1',day:'Martes',startTime:'10:35',endTime:'12:10',type:'Práctico'},
      {id:'a2',day:'Jueves',startTime:'14:45',endTime:'16:20',type:'Teórico'}
    ]},
  { id:'fisica2', name:'Física II', code:'2157', color:'#f59e0b',
    professor:'A confirmar', room:'A confirmar', email:'', maxAbsences:6, absences:0, schedules:[] },
  { id:'gestion2', name:'Gestión de Empresas II', code:'496', color:'#10b981',
    professor:'Vanden, Guillermo', room:'Aula Híbrida 33', email:'', maxAbsences:6, absences:0,
    schedules:[
      {id:'g1',day:'Lunes',startTime:'11:25',endTime:'13:00',type:'Teórico'}
    ]},
  { id:'ingweb3', name:'Ingeniería Web III', code:'806', color:'#ec4899',
    professor:'García Mattio, M. / Silvestre, A.', room:'Aula 26', email:'', maxAbsences:6, absences:0,
    schedules:[
      {id:'b1',day:'Martes',startTime:'13:55',endTime:'15:30',type:'Teórico-Lab'},
      {id:'b2',day:'Jueves',startTime:'19:00',endTime:'20:35',type:'Práctico-Lab'}
    ]},
  { id:'metodos', name:'Métodos Numéricos', code:'', color:'#a855f7',
    professor:'A confirmar', room:'A confirmar', email:'', maxAbsences:6, absences:0, schedules:[] },
  { id:'probest', name:'Probabilidad y Estadística', code:'2208', color:'#14b8a6',
    professor:'Luczywo, Nadia', room:'Aula 28', email:'', maxAbsences:6, absences:0,
    schedules:[
      {id:'c1',day:'Martes',startTime:'10:15',endTime:'12:15',type:'Clases'}
    ]},
  { id:'redes1', name:'Redes I', code:'471', color:'#f97316',
    professor:'Giovanardi, E. / Ávila Mattar, C.', room:'Lab Redes', email:'', maxAbsences:6, absences:0,
    schedules:[
      {id:'d1',day:'Jueves',startTime:'09:45',endTime:'12:10',type:'Teórico-Lab'},
      {id:'d2',day:'Viernes',startTime:'08:00',endTime:'09:30',type:'Práctico-Lab'}
    ]},
  { id:'progfunc', name:'Prog. Funcional y Scripting', code:'813', color:'#f43f5e',
    professor:'Montes, M. / García Mattio, M.', room:'Aula 14', email:'', maxAbsences:6, absences:0,
    schedules:[
      {id:'e1',day:'Lunes',startTime:'14:45',endTime:'16:20',type:'Teórico'},
      {id:'e2',day:'Martes',startTime:'13:55',endTime:'15:30',type:'Práctico-Lab'}
    ]},
  { id:'bd1', name:'Bases de Datos I', code:'2115', color:'#0ea5e9',
    professor:'Boggio, A. / Perez, S.', room:'Aula 28', email:'', maxAbsences:6, absences:0,
    schedules:[
      {id:'f1',day:'Lunes',startTime:'08:00',endTime:'10:15',type:'Clases'},
      {id:'f2',day:'Viernes',startTime:'11:45',endTime:'13:45',type:'Clases'}
    ]}
];

const DEF_TASKS = [
  {id:gid(),title:'1er Parcial',subjectId:'auditoria',type:'Parcial',dueDate:'2026-09-20',notes:'',done:false},
  {id:gid(),title:'TP Obligatorio — App Web',subjectId:'ingweb3',type:'Trabajo Práctico',dueDate:'2026-10-05',notes:'Proyecto web completo',done:false},
  {id:gid(),title:'1er Parcial',subjectId:'redes1',type:'Parcial',dueDate:'2026-09-18',notes:'',done:false},
  {id:gid(),title:'1er Parcial',subjectId:'probest',type:'Parcial',dueDate:'2026-09-25',notes:'',done:false},
  {id:gid(),title:'Lab Final',subjectId:'bd1',type:'Laboratorio',dueDate:'2026-11-01',notes:'',done:false},
  {id:gid(),title:'1er Parcial',subjectId:'progfunc',type:'Parcial',dueDate:'2026-09-22',notes:'',done:false},
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
let S = { subjects:[], tasks:[] };
let currentView = 'dashboard';
let taskFilter  = 'all';
let selColor    = '#6366f1';
let slots       = [];
let sbOpen      = true;
let activeDay   = null;   // día activo en schedule (mobile day-picker)

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      S = JSON.parse(raw);
      // Asegurar campos mínimos
      S.subjects = S.subjects.map(s => ({
        absences:0, maxAbsences:6, schedules:[], email:'', code:'', ...s
      }));
      S.tasks = S.tasks.map(t => ({
        done:false, notes:'', subjectId:null, dueDate:null, ...t
      }));
      // ── MIGRACIÓN: parchear subjects que tenían datos desactualizados ──
      let patched = false;
      S.subjects = S.subjects.map(s => {
        const p = PATCHES[s.id];
        if (p && s.schedules.length === 0) {
          patched = true;
          return { ...s, ...p };
        }
        // También actualizar campos de texto si code/room siguen siendo 'A confirmar'
        if (s.id === 'gestion2' && s.room === 'A confirmar') {
          patched = true;
          return { ...s, code:'496', professor:'Vanden, Guillermo', room:'Aula Híbrida 33',
            schedules: s.schedules.length ? s.schedules : PATCHES.gestion2.schedules };
        }
        return s;
      });
      if (patched) save();
    } else {
      S = { subjects: DEF_SUBJECTS.map(s=>({...s})), tasks: DEF_TASKS.map(t=>({...t})) };
      save();
    }
  } catch(e) {
    S = { subjects: DEF_SUBJECTS.map(s=>({...s})), tasks: DEF_TASKS.map(t=>({...t})) };
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
const TITLES    = {dashboard:'Dashboard',schedule:'Horario Semanal',subjects:'Materias',tasks:'Tareas & Exámenes',attendance:'Asistencia'};
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
  const ab = document.getElementById('topbar-add-btn');
  ab.style.display = ADD_VIEWS[v] ? '' : 'none';
  if (ADD_VIEWS[v]) document.getElementById('topbar-add-lbl').textContent = ADD_LBL[v];
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
  document.getElementById('sb-icon').textContent = sbOpen ? '‹' : '›';
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
    tasks:renderTasks, attendance:renderAtt}[v] || (()=>{}))();
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
      <div style="font-size:28px;margin-bottom:5px;">🎉</div>
      <div style="font-weight:700;">Sin clases programadas</div>
      <div style="font-size:11px;color:var(--text2);margin-top:2px;">Agrega horarios para ver el countdown.</div>
    </div>`;
    return;
  }
  const {s,sc,status,sec,nextDay}=nc;
  const h=Math.floor(Math.max(0,sec)/3600), m=Math.floor((Math.max(0,sec)%3600)/60), ss=Math.floor(Math.max(0,sec)%60);
  const pad=n=>String(n).padStart(2,'0');
  const statusTxt = status==='inProgress'?'● EN CURSO AHORA':status==='upcoming'?'⏰ PRÓXIMA CLASE HOY':`📅 PRÓXIMA — ${(nextDay||'').toUpperCase()}`;
  const cdLabel   = status==='inProgress'?'Finaliza en':'Empieza en';
  const key=s.id+status;
  if (key!==_lastNcKey) {
    _lastNcKey=key;
    el.innerHTML=`
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div style="flex:1;min-width:160px;">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(165,180,252,.7);margin-bottom:6px;">${statusTxt}</div>
          <div style="font-size:20px;font-weight:900;letter-spacing:-.03em;color:${s.color};margin-bottom:4px;">${s.name}</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:11px;color:var(--text2);">
            <span>📍 ${s.room}</span>
            <span>🕐 ${sc.startTime}–${sc.endTime}</span>
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
  _lastNcKey=''; renderNC(); updateDate();
  const td=todayDay(), now=nowMin();
  const pending=S.tasks.filter(t=>!t.done).length;
  const todayC=td?S.subjects.reduce((a,s)=>a+s.schedules.filter(sc=>sc.day===td).length,0):0;
  const warn=S.subjects.filter(s=>s.absences>=s.maxAbsences*.75).length;

  document.getElementById('stats-grid').innerHTML=`
    <div class="stat-card"><div class="stat-icon" style="background:rgba(99,102,241,.15);">📚</div><div class="stat-value gradient-text">${S.subjects.length}</div><div class="stat-label">Materias</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(245,158,11,.15);">✅</div><div class="stat-value" style="color:#fbbf24;">${pending}</div><div class="stat-label">Pendientes</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(34,197,94,.15);">🕐</div><div class="stat-value" style="color:#34d399;">${todayC}</div><div class="stat-label">Hoy</div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(239,68,68,.15);">⚠️</div><div class="stat-value" style="color:${warn?'#f87171':'#34d399'};">${warn}</div><div class="stat-label">Alertas</div></div>`;

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
          ${past?`<span style="font-size:10px;color:var(--text2);">✓</span>`:''}
        </div>`;}).join('')
    : `<div class="empty-st" style="padding:24px 16px;"><div class="empty-icon">😎</div><div style="font-weight:600;">Sin clases hoy</div></div>`;

  const ups=[...S.tasks].filter(t=>!t.done).sort((a,b)=>(a.dueDate||'9999')<(b.dueDate||'9999')?-1:1).slice(0,5);
  document.getElementById('upcoming-list').innerHTML=ups.length
    ? ups.map(t=>{
        const sub=S.subjects.find(s=>s.id===t.subjectId), d=daysUntil(t.dueDate);
        return `<div class="upcoming-item">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:8px;">
            <div><div style="font-size:13px;font-weight:700;">${t.title}</div>
            ${sub?`<div style="margin-top:4px;"><span class="badge" style="background:${sub.color}18;color:${sub.color};">${sub.name}</span></div>`:``}
            </div>
            <div style="text-align:right;flex-shrink:0;">
              <div style="font-size:11px;font-weight:700;color:${urgColor(d)};">${d===null?'—':d<0?'Vencida':d===0?'Hoy':`${d}d`}</div>
              <div style="font-size:10px;color:var(--text2);">${formatDate(t.dueDate)}</div>
            </div>
          </div></div>`;}).join('')
    : `<div class="empty-st" style="padding:24px 16px;"><div class="empty-icon">🎉</div><div style="font-weight:600;">Sin pendientes</div></div>`;
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
          <div class="empty-icon">🗓️</div>
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
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;color:var(--text2);">
            <div>🕐 <strong style="color:var(--text);">${sc.startTime} – ${sc.endTime}</strong></div>
            <div>⏱ ${durationMin} min</div>
            <div>📍 ${s.room}</div>
            <div>📋 ${sc.type}</div>
            <div style="grid-column:1/-1;">👨‍🏫 ${s.professor}</div>
            ${s.code?`<div>🔖 Cod. ${s.code}</div>`:''}
            ${s.email?`<div><a href="mailto:${s.email}" style="color:#a5b4fc;">✉️ Email</a></div>`:''}
          </div>
          <div style="margin-top:10px;display:flex;gap:6px;">
            <button class="btn btn-ghost btn-sm" onclick="openSubModal('${s.id}')" style="font-size:11px;">Editar</button>
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
        color:${d===td?'#a5b4fc':'var(--text2)'};background:${d===td?'rgba(99,102,241,.04)':'transparent'};">
        <div>${DSHORT[i]}</div>
        ${d===td?`<div style="width:5px;height:5px;background:#6366f1;border-radius:50%;margin:4px auto 0;box-shadow:0 0 6px #6366f1;"></div>`:''}
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
    <div style="font-size:14px;font-weight:800;margin-bottom:8px;color:${s.color};">${s.name}</div>
    <div style="font-size:11px;color:var(--text2);display:flex;flex-direction:column;gap:5px;">
      <div>📅 ${sc.day} · ${sc.startTime}–${sc.endTime}</div>
      <div>📋 ${sc.type} &nbsp;|&nbsp; 📍 ${s.room}</div>
      <div>👨‍🏫 ${s.professor}</div>
      ${s.code?`<div>🔖 Cód. ${s.code}</div>`:''}
      ${s.email?`<div>✉️ <a href="mailto:${s.email}" style="color:#a5b4fc;">${s.email}</a></div>`:''}
    </div>
    <div style="margin-top:10px;display:flex;gap:6px;">
      <button class="btn btn-ghost btn-sm" style="font-size:11px;"
        onclick="document.getElementById('class-popup').style.display='none';openSubModal('${s.id}')">Editar</button>
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
    const urg=d===null?'':d<0?'⚠️ VENCIDA':d===0?'🔴 HOY':d<=7?'🟠':'🟢';
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
            <div style="font-size:11px;color:#555;margin-top:3px;">🕐 ${c.startTime}–${c.endTime}</div>
            <div style="font-size:10px;color:#777;">${c.type} · ${c.room}</div>
          </div>`).join('')
      : `<div style="color:#bbb;font-size:11px;text-align:center;padding:16px 0;">Libre</div>`;
    return `<td style="vertical-align:top;padding:6px;border-right:1px solid #eee;min-width:110px;">
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#555;margin-bottom:8px;">${day}</div>
      ${cells}
    </td>`;
  }).join('');

  const now=new Date().toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'});

  win.document.write(`<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Horario UTN — Ingeniería en Informática</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; padding: 32px 28px; }
      h1   { font-size: 22px; font-weight: 900; color: #1a1a2e; letter-spacing: -.02em; }
      .sub { font-size: 12px; color: #666; margin-top: 3px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #6366f1; padding-bottom: 16px; }
      .badge-utn { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; }
      .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: #6366f1; margin: 24px 0 12px; border-left: 3px solid #6366f1; padding-left: 10px; }
      table.sched { width: 100%; border-collapse: collapse; }
      table.sched td { vertical-align: top; }
      table.tasks { width: 100%; border-collapse: collapse; font-size: 12px; }
      table.tasks th { background: #f5f5ff; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #6366f1; border-bottom: 2px solid #6366f1; }
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
        <h1>📅 Horario Universitario</h1>
        <div class="sub">Ingeniería en Informática · UTN · 2do Semestre 2026</div>
        <div class="sub">Generado el ${now}</div>
      </div>
      <div>
        <div class="badge-utn">UniSchedule</div>
        <div style="margin-top:8px;text-align:right;">
          <button class="no-print" onclick="window.print()" style="background:#6366f1;color:#fff;border:none;padding:7px 16px;border-radius:7px;cursor:pointer;font-weight:700;font-size:12px;">🖨️ Imprimir / Guardar PDF</button>
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
      <span>UniSchedule · UTN Ingeniería en Informática</span>
      <span>${now}</span>
    </div>
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(()=>win.print(), 600);
}

// ═══════════════════════════════════════════════════════════
//  SUBJECTS VIEW
// ═══════════════════════════════════════════════════════════
function renderSubs() {
  const n=S.subjects.length;
  document.getElementById('sub-count-lbl').textContent=`${n} materia${n!==1?'s':''} registrada${n!==1?'s':''}`;
  if (!n) {
    document.getElementById('subjects-grid').innerHTML=`<div class="empty-st" style="grid-column:1/-1;"><div class="empty-icon">📚</div><div style="font-weight:700;">No hay materias todavía</div></div>`;
    return;
  }
  document.getElementById('subjects-grid').innerHTML=S.subjects.map(s=>{
    const pct=s.absences/s.maxAbsences;
    const bc=pct>=1?'#ef4444':pct>=.75?'#f97316':'#22c55e';
    const chips=s.schedules.length
      ?s.schedules.map(sc=>`<div class="sched-chip"><span style="color:${s.color};font-size:9px;">●</span>${sc.day.slice(0,3)} ${sc.startTime}–${sc.endTime} <span style="opacity:.6;">${sc.type}</span></div>`).join('')
      :`<span style="font-size:11px;color:var(--text2);font-style:italic;">Sin horario asignado</span>`;
    return `<div class="sub-card">
      <div class="sub-card-accent" style="background:${s.color};"></div>
      <div class="sub-card-body">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:10px;">
          <div style="flex:1;"><div style="font-size:15px;font-weight:800;line-height:1.2;margin-bottom:3px;">${s.name}</div>
          ${s.code?`<span style="padding:2px 7px;border-radius:5px;font-size:10px;font-weight:700;background:${s.color}18;color:${s.color};">Cód. ${s.code}</span>`:''}</div>
          <div style="display:flex;gap:5px;">
            <button class="btn-xs" onclick="openSubModal('${s.id}')" title="Editar">✏️</button>
            <button class="btn-xs" onclick="confirmDel('subject','${s.id}')" title="Eliminar" style="color:#f87171;">🗑️</button>
          </div>
        </div>
        <div style="font-size:11px;color:var(--text2);display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">
          <div>👨‍🏫 ${s.professor}</div><div>📍 ${s.room}</div>
          ${s.email?`<div>✉️ <a href="mailto:${s.email}" style="color:#a5b4fc;">${s.email}</a></div>`:''}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px;">${chips}</div>
        <div style="border-top:1px solid var(--border);padding-top:10px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
            <span style="font-size:10px;font-weight:700;color:var(--text2);">ASISTENCIA</span>
            <span style="font-size:11px;font-weight:700;color:${bc};">${s.absences}/${s.maxAbsences}</span>
          </div>
          <div class="abs-bar-bg"><div class="abs-bar-fill" style="width:${Math.min(100,pct*100)}%;background:${bc};"></div></div>
          ${pct>=.75?`<div style="margin-top:5px;font-size:10px;font-weight:700;color:${bc};">⚠️ ${pct>=1?'LÍMITE ALCANZADO':'Cerca del límite'}</div>`:''}
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
    document.getElementById('tasks-list').innerHTML=`<div class="empty-st"><div class="empty-icon">✅</div><div style="font-weight:700;">No hay tareas aquí</div></div>`;
    return;
  }
  document.getElementById('tasks-list').innerHTML=tasks.map(t=>{
    const sub=S.subjects.find(s=>s.id===t.subjectId), d=daysUntil(t.dueDate);
    const dt=d===null?'—':d<0?`Vencida`:d===0?'Hoy':`${d}d`;
    return `<div class="task-card ${t.done?'done':''}">
      <div class="t-check ${t.done?'done':''}" onclick="toggleTask('${t.id}')">${t.done?'✓':''}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <div style="font-size:13px;font-weight:700;${t.done?'text-decoration:line-through;':''}">${t.title}</div>
          <div style="display:flex;gap:6px;flex-shrink:0;align-items:center;">
            <span style="padding:2px 7px;border-radius:6px;font-size:10px;font-weight:700;background:${TYPE_BG[t.type]||'rgba(255,255,255,.08)'};color:${TYPE_FG[t.type]||'var(--text2)'};">${TYPE_ICON[t.type]||'📌'} ${t.type}</span>
            ${!t.done&&d!==null?`<span style="font-size:11px;font-weight:700;color:${urgColor(d)};">${dt}</span>`:''}
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:5px;">
          ${sub?`<span class="badge" style="background:${sub.color}18;color:${sub.color};">${sub.name}</span>`:''}
          ${t.dueDate?`<span style="font-size:10px;color:var(--text2);">📅 ${formatDate(t.dueDate)}</span>`:''}
          ${t.notes?`<span style="font-size:10px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:150px;" title="${t.notes}">📝 ${t.notes}</span>`:''}
        </div>
      </div>
      <div style="display:flex;gap:5px;flex-shrink:0;">
        <button class="btn-xs" onclick="openTaskModal('${t.id}')" title="Editar">✏️</button>
        <button class="btn-xs" onclick="confirmDel('task','${t.id}')" title="Eliminar" style="color:#f87171;">🗑️</button>
      </div>
    </div>`;
  }).join('');
}
function toggleTask(id) { const t=S.tasks.find(x=>x.id===id); if(t){t.done=!t.done;save();renderTasks();} }

// ═══════════════════════════════════════════════════════════
//  ATTENDANCE VIEW
// ═══════════════════════════════════════════════════════════
function renderAtt() {
  const grid=document.getElementById('att-grid');
  if (!S.subjects.length) { grid.innerHTML=`<div class="empty-st" style="grid-column:1/-1;"><div class="empty-icon">📊</div><div>Sin materias.</div></div>`; return; }
  grid.innerHTML=S.subjects.map(s=>{
    const pct=s.maxAbsences>0?s.absences/s.maxAbsences:0;
    const bc=pct>=1?'#ef4444':pct>=.75?'#f97316':pct>=.5?'#f59e0b':'#22c55e';
    const rem=Math.max(0,s.maxAbsences-s.absences);
    const pipW=Math.max(6,Math.min(24,Math.floor(192/s.maxAbsences)));
    const pips=Array.from({length:s.maxAbsences},(_,i)=>`<div class="pip" style="width:${pipW}px;background:${i<s.absences?bc:'rgba(255,255,255,.08)'};"></div>`).join('');
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
        <span style="font-size:11px;color:${bc};font-weight:600;">${pct>=1?'⛔ LÍMITE':pct>=.75?`⚠️ Quedan ${rem}`:`✅ ${rem} disponibles`}</span>
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
function chgAbs(id,d){ const s=S.subjects.find(x=>x.id===id); if(s){s.absences=Math.max(0,Math.min(s.maxAbsences,s.absences+d));save();renderAtt();} }

// ═══════════════════════════════════════════════════════════
//  SUBJECT MODAL
// ═══════════════════════════════════════════════════════════
function openSubModal(id) {
  const isEdit=!!id;
  document.getElementById('sub-modal-title').textContent=isEdit?'Editar Materia':'Nueva Materia';
  selColor='#6366f1'; slots=[];
  if (isEdit) {
    const s=S.subjects.find(x=>x.id===id); if(!s) return;
    document.getElementById('sub-edit-id').value=s.id;
    document.getElementById('sub-name').value=s.name;
    document.getElementById('sub-code').value=s.code||'';
    document.getElementById('sub-room').value=s.room||'';
    document.getElementById('sub-prof').value=s.professor||'';
    document.getElementById('sub-email').value=s.email||'';
    document.getElementById('sub-maxabs').value=s.maxAbsences||6;
    selColor=s.color||'#6366f1';
    document.getElementById('sub-color-custom').value=selColor;
    slots=s.schedules.map(x=>({...x}));
  } else {
    ['sub-edit-id','sub-name','sub-code','sub-room','sub-prof','sub-email'].forEach(i=>document.getElementById(i).value='');
    document.getElementById('sub-maxabs').value=6;
    document.getElementById('sub-color-custom').value=selColor;
  }
  renderSwatches(); renderSlots();
  document.getElementById('modal-sub').style.display='flex';
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
  const sub={
    id:eid||gid(), name, code:document.getElementById('sub-code').value.trim(),
    color:selColor, professor:document.getElementById('sub-prof').value.trim(),
    room:document.getElementById('sub-room').value.trim(),
    email:document.getElementById('sub-email').value.trim(),
    maxAbsences:parseInt(document.getElementById('sub-maxabs').value)||6,
    absences:existing?existing.absences:0,
    schedules:slots.map(s=>({...s}))
  };
  if (existing) Object.assign(existing,sub); else S.subjects.push(sub);
  save(); closeM('modal-sub'); renderView(currentView);
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
  if (!title){alert('Título requerido.');return;}
  const eid=document.getElementById('task-edit-id').value;
  const existing=S.tasks.find(t=>t.id===eid);
  const task={
    id:eid||gid(), title,
    subjectId:document.getElementById('task-sub').value||null,
    type:document.getElementById('task-type').value,
    dueDate:document.getElementById('task-date').value||null,
    notes:document.getElementById('task-notes').value.trim(),
    done:existing?existing.done:false
  };
  if (existing) Object.assign(existing,task); else S.tasks.push(task);
  save(); closeM('modal-task'); renderView(currentView);
}

// ═══════════════════════════════════════════════════════════
//  CONFIRM DELETE
// ═══════════════════════════════════════════════════════════
function confirmDel(type,id) {
  const lbl=type==='subject'?'materia':'tarea';
  document.getElementById('confirm-title').textContent=`¿Eliminar ${lbl}?`;
  document.getElementById('confirm-msg').textContent=`La ${lbl} se eliminará de forma permanente.`;
  document.getElementById('confirm-ok').onclick=()=>{
    if (type==='subject'){S.subjects=S.subjects.filter(s=>s.id!==id);S.tasks=S.tasks.map(t=>t.subjectId===id?{...t,subjectId:null}:t);}
    else{S.tasks=S.tasks.filter(t=>t.id!==id);}
    save(); closeM('modal-confirm'); renderView(currentView);
  };
  document.getElementById('modal-confirm').style.display='flex';
}

// ═══════════════════════════════════════════════════════════
//  MODAL UTILS
// ═══════════════════════════════════════════════════════════
function closeM(id)     { document.getElementById(id).style.display='none'; }
function closeBD(e,id)  { if(e.target.id===id) closeM(id); }
document.addEventListener('keydown',e=>{ if(e.key==='Escape') ['modal-sub','modal-task','modal-confirm'].forEach(id=>closeM(id)); });

// Re-render schedule on resize (desktop ↔ mobile)
let _resizeTimer;
window.addEventListener('resize',()=>{
  clearTimeout(_resizeTimer);
  _resizeTimer=setTimeout(()=>{ if(currentView==='schedule') renderSched(); },150);
});

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
}

init();
