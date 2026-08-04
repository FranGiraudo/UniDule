import { S, save, taskFilter, setTaskFilter } from '../core/state.js';
import { TYPE_BG, TYPE_FG, TYPE_ICON } from '../core/constants.js';
import { gid, daysUntil, urgColor, formatDate, confirmDel, showToast, closeM } from '../core/utils.js';
import { SVG_ICONS } from '../core/icons.js';
export function setFilter(f,el) {
  setTaskFilter(f);
  document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderTasks();
}

export function syncTaskWithGrade(task) {
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

export function renderTasks() {
  let tasks=[...S.tasks];
  if (taskFilter === 'pending')         tasks=tasks.filter(t=>!t.done);
  else if (taskFilter === 'done')       tasks=tasks.filter(t=>t.done);
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

export function toggleTask(id) {
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

export function promptGradeFromTask(task) {
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

export function saveGradeFromModal() {
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

export function openTaskModal(id) {
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
export function saveTask() {
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


window.setFilter = setFilter;
window.renderTasks = renderTasks;
window.toggleTask = toggleTask;
window.promptGradeFromTask = promptGradeFromTask;
window.saveGradeFromModal = saveGradeFromModal;
window.openTaskModal = openTaskModal;
window.saveTask = saveTask;
