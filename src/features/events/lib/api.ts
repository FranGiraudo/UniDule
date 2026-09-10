import { supabase } from '../../../shared/lib/supabase';
import { useStore } from '../../../shared/store/useStore';
import type { UserEvent } from '../../../shared/types';

export async function toggleEventCompletion(userId: string, eventId: string, dateStr: string, isCompleted: boolean) {
  if (isCompleted) {
    const { data, error } = await supabase
      .from('event_completions')
      .insert({ user_id: userId, event_id: eventId, date_str: dateStr })
      .select('*')
      .single();
    if (error) {
      console.warn('Failed to insert completion, table might not exist:', error);
      return { id: crypto.randomUUID(), user_id: userId, event_id: eventId, date_str: dateStr };
    }
    return data;
  } else {
    const { error } = await supabase
      .from('event_completions')
      .delete()
      .match({ user_id: userId, event_id: eventId, date_str: dateStr });
    if (error) {
      console.warn('Failed to delete completion:', error);
    }
    return null;
  }
}

export async function saveStudySession(userId: string, subjectId: string, taskId: string | undefined, durationMinutes: number) {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert({ user_id: userId, subject_id: subjectId, task_id: taskId || null, duration_minutes: durationMinutes })
    .select('*')
    .single();
    
  if (error) {
    console.warn('Failed to insert study session, table might not exist:', error);
    return { id: crypto.randomUUID(), user_id: userId, subject_id: subjectId, task_id: taskId || null, duration_minutes: durationMinutes, completed_at: new Date().toISOString() };
  }
  return data;
}

export async function saveUserEvents(eventsToSave: UserEvent[]) {
  const session = useStore.getState().session;
  if (!session) throw new Error('No active session');
  const mapped = eventsToSave.map((e) => ({
    id: e.id,
    user_id: session.user.id,
    title: e.title,
    category: e.category,
    start_time: e.startTime,
    end_time: e.endTime,
    is_recurring: e.isRecurring,
    date: e.date,
    day_of_week: e.dayOfWeek,
    color: e.color,
  }));
  const { data, error } = await supabase.from('user_events').upsert(mapped).select();
  if (error) throw error;
  return data;
}
export async function saveUserEvent(event: UserEvent) {
  return saveUserEvents([event]);
}
export async function deleteUserEvent(id: string) {
  const { error } = await supabase.from('user_events').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteStudySession(id: string) {
  const { error } = await supabase.from('study_sessions').delete().eq('id', id);
  if (error) throw error;
}
