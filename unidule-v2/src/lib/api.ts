import { supabase } from './supabase';
import { useStore } from '../store/useStore';
import type { Seminar } from '../types';

export async function updateSubjectProgress(
  globalId: string,
  type: 'subject' | 'elective',
  status: string,
  grade: number | null,
  regDate: string | null,
  expDate: string | null
) {
  const session = useStore.getState().session;
  if (!session) throw new Error('No session');

  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: session.user.id,
      global_id: globalId,
      type,
      status,
      grade,
      reg_date: regDate || null,
      exp_date: expDate || null,
    }, { onConflict: 'user_id,global_id' });

  if (error) {
    console.error('Error updating progress:', error);
    throw error;
  }

  // Update local store for immediate UI update
  const career = useStore.getState().career;
  if (career) {
    const newCareer = { ...career };
    if (type === 'subject') {
      newCareer.subjects = newCareer.subjects.map(s => 
        (s.id === globalId || (s as any).code === globalId) 
          ? { ...s, status: status as any, grade, regDate, expDate } 
          : s
      );
    } else {
      newCareer.electives = newCareer.electives.map(e => 
        (e.id === globalId || e.code === globalId) 
          ? { ...e, status, grade, regDate, expDate } 
          : e
      );
    }
    useStore.getState().setCareer(newCareer);
  }
}

export async function saveSeminar(seminar: Seminar) {
  const session = useStore.getState().session;
  if (!session) throw new Error('No session');

  const { error } = await supabase
    .from('user_seminars')
    .upsert({
      id: seminar.id,
      user_id: session.user.id,
      code: seminar.code,
      name: seminar.name,
      category: seminar.category,
      hours: seminar.hours,
      status: seminar.status,
      date: seminar.date || null,
      notes: seminar.notes || null,
    });

  if (error) {
    console.error('Error saving seminar:', error);
    throw error;
  }

  // Update local store
  const career = useStore.getState().career;
  if (career) {
    const newCareer = { ...career };
    const exists = newCareer.seminars.find(s => s.id === seminar.id);
    if (exists) {
      newCareer.seminars = newCareer.seminars.map(s => s.id === seminar.id ? seminar : s);
    } else {
      newCareer.seminars = [...newCareer.seminars, seminar];
    }
    useStore.getState().setCareer(newCareer);
  }
}
