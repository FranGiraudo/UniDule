import { supabase } from '../../../shared/lib/supabase';
import { useStore } from '../../../shared/store/useStore';
import type { Grade, Note, ScheduleEvent } from '../../../shared/types';

function updateSubjectInCareer(id: string, patch: Record<string, unknown>) {
  const career = useStore.getState().career;
  if (!career) return;
  useStore.getState().setCareer({
    ...career,
    subjects: career.subjects.map(s => (s.id === id ? { ...s, ...patch } : s)),
  });
}

export interface ActiveSubjectInput {
  id: string; // global subject code — doubles as the active-subject row id
  name: string;
  color: string;
  professor?: string;
  room?: string;
  email?: string;
  maxAbsences?: number;
  absences?: number;
  status?: string;
  allowsPromotion?: boolean;
  schedules?: ScheduleEvent[];
}

export async function saveActiveSubject(sub: ActiveSubjectInput) {
  const session = useStore.getState().session;
  if (!session) throw new Error('No session');

  const payload = {
    id: sub.id,
    user_id: session.user.id,
    code: sub.id,
    name: sub.name,
    color: sub.color,
    professor: sub.professor || '',
    room: sub.room || '',
    email: sub.email || '',
    max_absences: sub.maxAbsences ?? 6,
    absences: sub.absences ?? 0,
    status: sub.status || 'cursando',
    allows_promotion: sub.allowsPromotion || false,
    schedule: sub.schedules || [],
  };

  const { error } = await supabase.from('user_active_subjects').upsert(payload);
  if (error) {
    console.error('Error saving active subject:', error);
    throw error;
  }

  updateSubjectInCareer(sub.id, {
    activeId: sub.id,
    code: sub.id,
    color: sub.color,
    professor: payload.professor,
    room: payload.room,
    email: payload.email,
    maxAbsences: payload.max_absences,
    absences: payload.absences,
    allowsPromotion: payload.allows_promotion,
    schedules: payload.schedule,
  });
}

export async function deleteActiveSubject(id: string) {
  const session = useStore.getState().session;
  if (!session) throw new Error('No session');
  const uid = session.user.id;

  await supabase.from('user_tasks').delete().eq('subject_id', id).eq('user_id', uid);
  await supabase.from('user_grades').delete().eq('active_subject_id', id).eq('user_id', uid);
  const { error } = await supabase.from('user_active_subjects').delete().eq('id', id).eq('user_id', uid);
  if (error) {
    console.error('Error deleting active subject:', error);
    throw error;
  }

  updateSubjectInCareer(id, {
    activeId: undefined,
    professor: undefined,
    email: undefined,
    absences: undefined,
    maxAbsences: undefined,
    allowsPromotion: undefined,
    grades: undefined,
    color: '#D8D2BE',
    room: '',
    schedules: [],
  });
  useStore.getState().setTasks(useStore.getState().tasks.filter(t => t.subjectId !== id));
}

export async function syncGrades(activeSubjectId: string, grades: Grade[]) {
  const session = useStore.getState().session;
  if (!session) throw new Error('No session');
  const uid = session.user.id;

  const { data: existing } = await supabase
    .from('user_grades')
    .select('id')
    .eq('active_subject_id', activeSubjectId)
    .eq('user_id', uid);
  const existingIds = new Set((existing || []).map((g: any) => g.id));
  const incomingIds = new Set(grades.map(g => g.id));

  for (const id of existingIds) {
    if (!incomingIds.has(id)) {
      await supabase.from('user_grades').delete().eq('id', id).eq('user_id', uid);
    }
  }

  if (grades.length > 0) {
    const toUpsert = grades.map(g => ({
      id: g.id,
      user_id: uid,
      active_subject_id: activeSubjectId,
      title: g.type,
      grade: g.score !== '' && g.score !== null ? g.score : null,
      date: g.date || null,
      weight: g.weight ?? null,
    }));
    const { error } = await supabase.from('user_grades').upsert(toUpsert);
    if (error) {
      console.error('Error syncing grades:', error);
      throw error;
    }
  }

  updateSubjectInCareer(activeSubjectId, { grades });
}

export async function saveNote(note: Note) {
  const session = useStore.getState().session;
  if (!session) throw new Error('No session');

  const payload = {
    id: note.id,
    user_id: session.user.id,
    subject_id: note.subject_id,
    title: note.title,
    content: note.content,
    note_date: note.note_date,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('user_notes').upsert(payload);
  if (error) {
    console.error('Error saving note:', error);
    throw error;
  }

  const notes = useStore.getState().notes;
  const exists = notes.find(n => n.id === note.id);
  useStore.getState().setNotes(exists ? notes.map(n => (n.id === note.id ? note : n)) : [...notes, note]);
}

export async function deleteNote(id: string) {
  const session = useStore.getState().session;
  if (!session) throw new Error('No session');
  const { error } = await supabase.from('user_notes').delete().eq('id', id).eq('user_id', session.user.id);
  if (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
  useStore.getState().setNotes(useStore.getState().notes.filter(n => n.id !== id));
}
