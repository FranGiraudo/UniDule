import { supabase } from './supabase.js';

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function registerUser(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function logoutUser() {
  await supabase.auth.signOut();
}

export async function fetchFullState() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const uid = user.id;

  const results = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', uid).single(),
    supabase.from('user_active_subjects').select('*').eq('user_id', uid),
    supabase.from('user_tasks').select('*').eq('user_id', uid),
    supabase.from('user_grades').select('*').eq('user_id', uid),
    supabase.from('user_seminars').select('*').eq('user_id', uid),
    supabase.from('global_subjects').select('*').order('year').order('semester'),
    supabase.from('global_electives').select('*'),
    supabase.from('user_progress').select('*').eq('user_id', uid)
  ]);

  results.forEach((r, i) => {
    if (r.error) console.error(`Supabase fetch error on query ${i}:`, r.error);
  });

  const [
    { data: profileData },
    { data: activeSubsData },
    { data: tasksData },
    { data: gradesData },
    { data: seminarsData },
    { data: globalSubsData },
    { data: globalElecsData },
    { data: progressData }
  ] = results;

  const profile = profileData || { name: user.email.split('@')[0], career: 'Ingeniería en Informática', theme: 'dark' };

  const activeSubs = (activeSubsData || []).map(s => {
    return {
      id: s.id,
      code: s.code,
      name: s.name,
      color: s.color,
      professor: s.professor,
      room: s.room,
      email: s.email,
      maxAbsences: s.max_absences,
      absences: s.absences,
      status: s.status,
      allowsPromotion: s.allows_promotion,
      schedules: s.schedule || [],
      grades: (gradesData || []).filter(g => g.active_subject_id === s.id).map(g => ({
        id: g.id,
        type: g.title,
        score: g.grade,
        date: g.date,
        weight: g.weight
      }))
    };
  });

  const careerSubs = (globalSubsData || []).map(g => {
    // user_progress.global_id stores the code (e.g. 'cs-info1'), not the UUID
    const prog = (progressData || []).find(p => p.global_id === g.code && p.type === 'subject');
    return {
      ...g,
      id: g.code,  // frontend uses code as the logical id (matches DEF_CAREER)
      correlatives: g.correlatives || { toCurse: [], toPass: [] },
      status: prog ? prog.status : 'pendiente',
      grade: prog ? parseFloat(prog.grade) : null,
      regDate: prog ? prog.reg_date : null,
      expDate: prog ? prog.exp_date : null
    };
  });

  const careerElecs = (globalElecsData || []).map(g => {
    const prog = (progressData || []).find(p => p.global_id === g.code && p.type === 'elective');
    return {
      ...g,
      id: g.code,
      status: prog ? prog.status : 'pendiente',
      grade: prog ? parseFloat(prog.grade) : null
    };
  });

  return {
    profile: { name: profile.name, career: profile.career, theme: profile.theme },
    subjects: activeSubs,
    tasks: (tasksData || []).map(t => ({
      id: t.id,
      title: t.title,
      subjectId: t.subject_id,
      type: t.type,
      dueDate: t.due_date,
      notes: t.notes,
      done: t.done,
      gradeId: t.grade_id
    })),
    career: {
      subjects: careerSubs,
      electives: careerElecs,
      seminars: (seminarsData || [])
    }
  };
}

export async function syncProfile(profile) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('user_profiles').upsert({
    id: user.id,
    name: profile.name,
    career: profile.career,
    theme: profile.theme
  });
}

export async function syncSubjectProgress(globalId, type, status, grade, regDate, expDate) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('user_progress').upsert({
    user_id: user.id,
    global_id: globalId,
    type,
    status,
    grade: grade || null,
    reg_date: regDate || null,
    exp_date: expDate || null
  }, { onConflict: 'user_id,global_id' });
}

export async function saveActiveSubject(sub) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  const { error } = await supabase.from('user_active_subjects').upsert({
    id: sub.id,
    user_id: user.id,
    code: sub.code || '',
    name: sub.name,
    color: sub.color,
    professor: sub.professor || '',
    room: sub.room || '',
    email: sub.email || '',
    max_absences: sub.maxAbsences || 6,
    absences: sub.absences || 0,
    status: sub.status || 'cursando',
    allows_promotion: sub.allowsPromotion || false,
    schedule: sub.schedules || []
  });
  if (error) throw error;
}

export async function deleteActiveSubject(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  // First delete associated tasks and grades to prevent 409 FK violation
  await supabase.from('user_tasks').delete().eq('subject_id', id).eq('user_id', user.id);
  await supabase.from('user_grades').delete().eq('active_subject_id', id).eq('user_id', user.id);
  await supabase.from('user_active_subjects').delete().eq('id', id).eq('user_id', user.id);
}

export async function saveTask(task) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  const { error } = await supabase.from('user_tasks').upsert({
    id: task.id,
    user_id: user.id,
    title: task.title,
    subject_id: task.subjectId || null,
    type: task.type,
    due_date: task.dueDate || null,
    notes: task.notes || '',
    done: task.done || false,
    grade_id: task.gradeId || null
  });
  if (error) throw error;
}

export async function saveSeminar(sem) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  await supabase.from('user_seminars').upsert({
    id: sem.id,
    user_id: user.id,
    code: sem.code,
    name: sem.name,
    category: sem.category,
    hours: sem.hours,
    status: sem.status,
    date: sem.date || null,
    notes: sem.notes || ''
  });
}

export async function deleteTask(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('user_tasks').delete().eq('id', id).eq('user_id', user.id);
}

export async function syncGrades(activeSubjectId, gradesArray) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase.from('user_grades').select('id').eq('active_subject_id', activeSubjectId).eq('user_id', user.id);
  const existingIds = new Set(existing ? existing.map(g => g.id) : []);
  const incomingIds = new Set(gradesArray ? gradesArray.map(g => g.id) : []);

  for (const id of existingIds) {
    if (!incomingIds.has(id)) {
      await supabase.from('user_grades').delete().eq('id', id).eq('user_id', user.id);
    }
  }

  if (gradesArray && gradesArray.length > 0) {
    const toUpsert = gradesArray.map(g => ({
      id: g.id,
      user_id: user.id,
      active_subject_id: activeSubjectId,
      title: g.title || g.type || 'Nota',
      grade: g.score || g.grade || 0,
      date: g.date || null,
      weight: g.weight || null
    }));
    const { error } = await supabase.from('user_grades').upsert(toUpsert);
    if (error) throw error;
  }
}

export async function deleteGrade(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('user_grades').delete().eq('id', id).eq('user_id', user.id);
}

export async function syncEntireStateToCloud(state) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 1. Profile
  if (state.profile) {
    await syncProfile(state.profile);
  }

  // 2. Active Subjects & Grades
  if (state.subjects && state.subjects.length > 0) {
    for (const sub of state.subjects) {
      await saveActiveSubject(sub);
      if (sub.grades && sub.grades.length > 0) {
        await syncGrades(sub.id, sub.grades);
      }
    }
  }

  // 3. Tasks
  if (state.tasks && state.tasks.length > 0) {
    for (const task of state.tasks) {
      await saveTask(task);
    }
  }

  // 4. Seminars
  if (state.career && state.career.seminars && state.career.seminars.length > 0) {
    for (const sem of state.career.seminars) {
      await saveSeminar(sem);
    }
  }

  // 5. Career Progress
  if (state.career && state.career.subjects) {
    const toInsert = state.career.subjects
      .filter(s => s.status && s.status !== 'pendiente')
      .map(s => ({
        user_id: user.id,
        global_id: String(s.id),
        type: 'subject',
        status: s.status,
        grade: (s.grade !== null && s.grade !== undefined && s.grade !== '') ? parseFloat(s.grade) : null,
        reg_date: (s.regDate && String(s.regDate).trim() !== '') ? s.regDate : null,
        exp_date: (s.expDate && String(s.expDate).trim() !== '') ? s.expDate : null
      }));
    if (toInsert.length > 0) {
      await supabase.from('user_progress').upsert(toInsert, { onConflict: 'user_id, global_id' });
    }
  }
}
