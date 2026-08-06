import { S, save, syncSubjectsAndCareer, selColor, setSelColor, slots, setSlots, gradesWork, setGradesWork, gradesSubId, setGradesSubId, currentView } from '../core/state.js';
import { DEF_SUBJECTS, COLORS, SUBJECT_STATUS, GRADE_TYPES, DAYS, EXAM_TYPES } from '../core/constants.js';
import { gid, confirmDel, showToast, isMobile, closeM } from '../core/utils.js';
import { SVG_ICONS } from '../core/icons.js';
import { renderView } from '../core/router.js';
import { getComputedStatus } from './career.js';

export function renderSubs() {
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

export function openSubModal(id) {
  const isEdit=!!id;
  document.getElementById('sub-modal-title').textContent=isEdit?'Editar Materia':'Nueva Materia';
  setSelColor('#6366f1'); setSlots([]);

  const careerSel = document.getElementById('career-subjects-list');
  if (careerSel && S.career && S.career.subjects) {
    let availableSubs = S.career.subjects;
    if (!isEdit) {
      availableSubs = availableSubs.filter(s => getComputedStatus(s) === 'disponible');
    } else {
      // Si estamos editando, mostrar solo la materia actual o las disponibles
      availableSubs = availableSubs.filter(s => s.id === id || getComputedStatus(s) === 'disponible');
    }
    const sorted = [...availableSubs].sort((a,b) => (a.year - b.year) || (a.semester - b.semester) || a.name.localeCompare(b.name));
    careerSel.innerHTML = sorted.map(cs => `<option value="${cs.name}">${cs.year}° Año ${cs.semester}° Sem (${cs.code||'Sin cód'})</option>`).join('');
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
    setSelColor(s.color||'#6366f1');
    document.getElementById('sub-color-custom').value=selColor;
    setSlots(s.schedules.map(x=>({...x})));
  } else {
    ['sub-edit-id','sub-name','sub-code','sub-room','sub-prof','sub-email'].forEach(i=>document.getElementById(i).value='');
    document.getElementById('sub-maxabs').value=6;
    const subStatusEl = document.getElementById('sub-status');
    if (subStatusEl) subStatusEl.value = 'cursando';
    document.getElementById('sub-color-custom').value=selColor;
  }
  renderSwatches(); renderSlots();
  document.getElementById('modal-sub').style.display='flex';
}

export function onCareerSubSelect(val) {
  if (!val) {
    document.getElementById('sub-edit-id').value = '';
    return;
  }
  const cs = S.career && S.career.subjects ? S.career.subjects.find(x => x.name.toLowerCase() === val.toLowerCase() || x.id === val) : null;
  if (!cs) {
    document.getElementById('sub-edit-id').value = '';
    return;
  }
  document.getElementById('sub-edit-id').value = cs.id;
  document.getElementById('sub-code').value = cs.code || '';
}

export function renderSwatches() {
  document.getElementById('color-swatches').innerHTML=COLORS.map(c=>
    `<div class="color-dot ${c===selColor?'sel':''}" style="background:${c};" onclick="pickColor('${c}')" title="${c}"></div>`).join('');
}

export function pickColor(c) {
  setSelColor(c);
  document.querySelectorAll('.color-dot').forEach(d=>d.classList.toggle('sel',d.title===c));
  document.getElementById('sub-color-custom').value=c;
}

document.getElementById('sub-color-custom').addEventListener('input',function(){
  setSelColor(this.value);
  document.querySelectorAll('.color-dot').forEach(d=>d.classList.remove('sel'));
});

export function renderSlots() {
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

export function addSlot()        { slots.push({id:gid(),day:'Lunes',startTime:'08:00',endTime:'10:00',type:'Teórico'}); renderSlots(); }
export function rmSlot(i)        { slots.splice(i,1); renderSlots(); }
export function updSlot(i,f,v)   { slots[i][f]=v; }

export async function saveSub() {
  const name=document.getElementById('sub-name').value.trim();
  if (!name){alert('Nombre requerido.');return;}
  const eid=document.getElementById('sub-edit-id').value;
  const existing=S.subjects.find(s=>s.id===eid);
  
  if (!existing && !eid) {
    alert('Debes seleccionar una materia disponible del plan.');
    return;
  }
  
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

  let careerMatch = null;
  let isElective = false;
  if (S.career) {
    if (S.career.subjects) {
      careerMatch = S.career.subjects.find(cs => cs.id === sub.id || (cs.code && cs.code === sub.code) || cs.name.toLowerCase() === sub.name.toLowerCase());
    }
    if (!careerMatch && S.career.electives) {
      careerMatch = S.career.electives.find(ce => ce.id === sub.id || (ce.code && ce.code === sub.code) || ce.name.toLowerCase() === sub.name.toLowerCase());
      if (careerMatch) isElective = true;
    }
    if (careerMatch) {
      careerMatch.id = sub.id;
      careerMatch.status = (statusVal === 'aprobado' || statusVal === 'promocionado') ? 'aprobada' : statusVal;
    }
  }

  syncSubjectsAndCareer();
  save();
  if (window.api) {
    try {
      const saved = await window.api.saveActiveSubject(sub);
      if (saved && saved.id && sub.id !== saved.id) {
        sub.id = saved.id;
        if (careerMatch) careerMatch.id = saved.id;
        save();
      }
      if (careerMatch) await window.api.syncSubjectProgress(careerMatch.id, isElective ? 'elective' : 'subject', careerMatch.status, careerMatch.grade, careerMatch.regDate, careerMatch.expDate);
    } catch(e) {
      console.error(e);
      alert('Error al guardar en la nube: ' + e.message);
    }
  }
  closeM('modal-sub'); renderView(currentView);
}

export function openGradesModal(subId) {
  let s = S.subjects.find(x => x.id === subId || (x.code && subId && (x.code === subId || x.code.slice(-3) === subId.slice(-3))));
  if (!s && S.career && S.career.subjects) {
    const cs = S.career.subjects.find(x => x.id === subId || (x.code && subId && (x.code === subId || x.code.slice(-3) === subId.slice(-3))));
    if (cs) {
      s = {
        id: cs.id, name: cs.name, code: cs.code || '',
        color: '#6366f1', professor: '', room: '', email: '',
        maxAbsences: 6, absences: 0, grades: [],
        status: cs.status || 'cursando', allowsPromotion: false, schedules: []
      };
      S.subjects.push(s);
    }
  }
  if (!s) return;
  setGradesSubId(s.id);
  setGradesWork((s.grades || []).map(g => ({...g})));
  document.getElementById('grades-modal-sub').textContent = s.name;
  document.getElementById('grades-sub-id').value = s.id;
  document.getElementById('grades-status').value = s.status || 'cursando';
  document.getElementById('grades-promotion').checked = !!s.allowsPromotion;
  renderGradesInModal();
  document.getElementById('modal-grades').style.display = 'flex';
}

export function renderGradesInModal() {
  const c = document.getElementById('grades-container');
  if (!gradesWork.length) {
    c.innerHTML = '<div style="font-size:11px;color:var(--text2);padding:10px 0;text-align:center;">Sin evaluaciones — hacé clic en "+ Agregar"</div>';
    return;
  }
  c.innerHTML = gradesWork.map((g, i) => {
    let displayType = g.type;
    if (displayType === 'Parcial') displayType = 'Parcial 1';
    
    const sc = g.score !== '' && g.score !== null ? parseFloat(g.score) : null;
    const scoreColor = sc !== null ? (sc >= 4 ? '#4ade80' : '#f87171') : 'var(--text)';
    
    let optionsHTML = GRADE_TYPES.map(t => `<option ${displayType===t?'selected':''}>${t}</option>`).join('');
    if (!GRADE_TYPES.includes(displayType)) {
      optionsHTML += `<option selected>${displayType}</option>`;
    }

    return `<div class="grade-row">
      <select class="f-input" style="font-size:12px;" onchange="updGrade(${i},'type',this.value)">
        ${optionsHTML}
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

export function addGrade()      { gradesWork.push({id:gid(),type:'Parcial 1',score:'',date:''}); renderGradesInModal(); }
export function rmGrade(i)      { gradesWork.splice(i,1); renderGradesInModal(); }
export function updGrade(i,f,v) { gradesWork[i][f] = f==='score'?(v===''?'':parseFloat(v)):v; }

export async function saveGrades() {
  const s = S.subjects.find(x => x.id === gradesSubId);
  if (!s) return;

  const newGrades = gradesWork.map(g => ({...g}));

  newGrades.forEach(g => {
    if (g.score !== '' && g.score !== null) return;
    const existing = S.tasks.find(t => t.gradeId === g.id);
    if (!existing) {
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
      existing.dueDate = g.date || null;
    }
  });

  const newIds = new Set(newGrades.map(g => g.id));
  S.tasks = S.tasks.filter(t => !t.gradeId || newIds.has(t.gradeId));

  s.grades = newGrades;
  const newStatus = document.getElementById('grades-status').value;
  s.status = newStatus;
  s.allowsPromotion = document.getElementById('grades-promotion').checked;

  let careerMatch = null;
  let isElective = false;
  if (S.career) {
    if (S.career.subjects) {
      careerMatch = S.career.subjects.find(cs => cs.id === s.id || (cs.code && cs.code === s.code) || cs.name.toLowerCase() === s.name.toLowerCase());
    }
    if (!careerMatch && S.career.electives) {
      careerMatch = S.career.electives.find(ce => ce.id === s.id || (ce.code && ce.code === s.code) || ce.name.toLowerCase() === s.name.toLowerCase());
      if (careerMatch) isElective = true;
    }
    if (careerMatch) {
      careerMatch.status = (newStatus === 'aprobado' || newStatus === 'promocionado') ? 'aprobada' : newStatus;
    }
  }

  syncSubjectsAndCareer();
  save();
  if (window.api) {
    try {
      await window.api.saveActiveSubject(s);
      await window.api.syncGrades(s.id, s.grades);
      if (careerMatch) await window.api.syncSubjectProgress(careerMatch.id, isElective ? 'elective' : 'subject', careerMatch.status, careerMatch.grade, careerMatch.regDate, careerMatch.expDate);
    } catch(e) { console.error(e); }
  }
  closeM('modal-grades');
  renderView(currentView);
}

export function delSubject(id) {
  const s = S.subjects.find(x => x.id === id);
  if (!s) return;
  S.subjects = S.subjects.filter(x => x.id !== id);
  S.tasks = S.tasks.filter(t => t.subjectId !== id);
  
  if (S.career && S.career.subjects) {
    const cs = S.career.subjects.find(c => c.id === id || (c.code && c.code === s.code));
    if (cs) {
      cs.status = 'disponible';
      if (window.api) window.api.syncSubjectProgress(cs.id, 'subject', 'disponible', null, null, null).catch(console.error);
    }
  }
  syncSubjectsAndCareer();
  save();
  if (window.api) window.api.deleteActiveSubject(id).catch(console.error);
  renderView(currentView);
  showToast('Materia eliminada');
}

window.renderSubs = renderSubs;
window.openSubModal = openSubModal;
window.onCareerSubSelect = onCareerSubSelect;
window.pickColor = pickColor;
window.addSlot = addSlot;
window.rmSlot = rmSlot;
window.updSlot = updSlot;
window.saveSub = saveSub;
window.delSubject = delSubject;
window.openGradesModal = openGradesModal;
window.addGrade = addGrade;
window.rmGrade = rmGrade;
window.updGrade = updGrade;
window.saveGrades = saveGrades;

// --- NOTES (Phase 1) ---
export function switchSubjectsTab(tab) {
  const tMat = document.getElementById('tab-mis-materias');
  const tNot = document.getElementById('tab-mis-notas');
  const cMat = document.getElementById('subjects-grid');
  const cNot = document.getElementById('notes-container');
  const bAddS = document.getElementById('btn-add-subject');
  const bAddN = document.getElementById('btn-add-note');

  if (tab === 'materias') {
    tMat.classList.add('active'); tNot.classList.remove('active');
    cMat.style.display = 'grid'; cNot.style.display = 'none';
    bAddS.style.display = 'block'; bAddN.style.display = 'none';
  } else {
    tNot.classList.add('active'); tMat.classList.remove('active');
    cNot.style.display = 'block'; cMat.style.display = 'none';
    bAddN.style.display = 'block'; bAddS.style.display = 'none';
    renderNotes();
  }
}

function parseMd(md) {
  if (!md) return '';
  let html = md
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:color-mix(in srgb, var(--text) 10%, transparent);padding:2px 4px;border-radius:4px;font-size:0.9em;">$1</code>')
    .replace(/^- (.*)$/gm, '<li>$1</li>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

export function renderNotes() {
  const query = (document.getElementById('notes-search').value || '').toLowerCase();
  const grid = document.getElementById('notes-grid');
  let notes = S.notes || [];
  
  if (query) {
    notes = notes.filter(n => 
      n.title.toLowerCase().includes(query) || 
      (n.content && n.content.toLowerCase().includes(query))
    );
  }
  
  if (!notes.length) {
    grid.innerHTML = `<div class="empty-st" style="grid-column:1/-1;"><div style="display:inline-flex;padding:0.75rem;border-radius:50%;background:color-mix(in srgb, var(--primary) 15%, transparent);color:var(--primary);margin-bottom:0.5rem;">${SVG_ICONS.book}</div><div style="font-weight:700;">No hay notas guardadas</div></div>`;
    return;
  }

  grid.innerHTML = notes.map(n => {
    const sub = S.subjects.find(s => s.id === n.subject_id);
    const subName = sub ? sub.name : 'Materia Desconocida';
    const subColor = sub ? sub.color : 'var(--primary)';
    
    return `<div class="sub-card" style="cursor:pointer;" onclick="window.openNoteModal('${n.id}')">
      <div class="sub-card-accent" style="background:${subColor};"></div>
      <div class="sub-card-body" style="display:flex;flex-direction:column;height:100%;">
        <div style="font-size:10px;font-weight:700;color:${subColor};margin-bottom:4px;text-transform:uppercase;">${subName}</div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <div style="font-size:15px;font-weight:800;line-height:1.2;">${n.title}</div>
          <div style="font-size:11px;color:var(--text2);font-weight:600;white-space:nowrap;margin-left:8px;">${n.note_date}</div>
        </div>
        <div style="font-size:13px;color:var(--text2);line-height:1.5;flex:1;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;">
          ${parseMd(n.content)}
        </div>
      </div>
    </div>`;
  }).join('');
}

export function openNoteModal(id = null) {
  const isEdit = !!id;
  document.getElementById('note-modal-title').textContent = isEdit ? 'Editar Nota' : 'Nueva Nota';
  
  const sel = document.getElementById('note-subject');
  sel.innerHTML = S.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  
  if (isEdit) {
    const n = (S.notes || []).find(x => x.id === id);
    if (!n) return;
    document.getElementById('note-edit-id').value = n.id;
    sel.value = n.subject_id;
    document.getElementById('note-title').value = n.title;
    document.getElementById('note-date').value = n.note_date;
    document.getElementById('note-content').value = n.content || '';
    document.getElementById('note-delete-btn').style.display = 'block';
  } else {
    document.getElementById('note-edit-id').value = '';
    document.getElementById('note-title').value = '';
    const now = new Date();
    document.getElementById('note-date').value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    document.getElementById('note-content').value = '';
    document.getElementById('note-delete-btn').style.display = 'none';
  }
  
  document.getElementById('modal-note').style.display = 'flex';
}

export async function saveNoteData() {
  const id = document.getElementById('note-edit-id').value;
  const subjId = document.getElementById('note-subject').value;
  const title = document.getElementById('note-title').value.trim();
  const date = document.getElementById('note-date').value;
  const content = document.getElementById('note-content').value.trim();

  if (!title || !subjId || !date) {
    showToast('Faltan campos obligatorios');
    return;
  }

  S.notes = S.notes || [];
  let noteObj = null;

  if (id) {
    noteObj = S.notes.find(n => n.id === id);
    if (noteObj) {
      noteObj.subject_id = subjId;
      noteObj.title = title;
      noteObj.note_date = date;
      noteObj.content = content;
    }
  } else {
    const tempId = 'local-' + Date.now();
    noteObj = { id: tempId, subject_id: subjId, title, note_date: date, content };
    S.notes.push(noteObj);
  }

  save();
  renderNotes();
  closeM('modal-note');
  showToast('Nota guardada', 'success');

  if (window.api) {
    try {
      const saved = await window.api.saveNote(noteObj);
      if (!id && saved && saved.id) {
        // Swap local id for real UUID
        const n = S.notes.find(x => x.id === noteObj.id);
        if (n) n.id = saved.id;
        save();
        renderNotes();
      }
    } catch(e) { console.error('Error saving note to cloud', e); }
  }
}

export async function deleteNoteFromModal() {
  const id = document.getElementById('note-edit-id').value;
  if (!id) return;
  if (!confirm('¿Eliminar nota?')) return;
  
  S.notes = (S.notes || []).filter(n => n.id !== id);
  save();
  renderNotes();
  closeM('modal-note');
  showToast('Nota eliminada', 'success');
  
  if (window.api && !id.startsWith('local-')) {
    try { await window.api.deleteNote(id); }
    catch(e) { console.error('Error deleting note from cloud', e); }
  }
}

window.switchSubjectsTab = switchSubjectsTab;
window.renderNotes = renderNotes;
window.openNoteModal = openNoteModal;
window.saveNoteData = saveNoteData;
window.deleteNoteFromModal = deleteNoteFromModal;
