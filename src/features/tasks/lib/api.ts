import { supabase } from '../../../shared/lib/supabase';
import { useStore } from '../../../shared/store/useStore';
import type { Task } from '../../../shared/types';

export async function saveTask(task: Task) {
  const session = useStore.getState().session;
  if (!session) throw new Error('No session');

  const payload = {
    id: task.id,
    user_id: session.user.id,
    title: task.title,
    subject_id: task.subjectId || null,
    type: task.type,
    due_date: task.dueDate || null,
    notes: task.notes || '',
    done: task.done || false,
    grade_id: task.gradeId || null,
  };

  const { error } = await supabase.from('user_tasks').upsert(payload);
  if (error) {
    console.error('Error saving task:', error);
    throw error;
  }

  const tasks = useStore.getState().tasks;
  const exists = tasks.find((t) => t.id === task.id);
  useStore
    .getState()
    .setTasks(exists ? tasks.map((t) => (t.id === task.id ? task : t)) : [...tasks, task]);
}

export async function deleteTask(id: string) {
  const session = useStore.getState().session;
  if (!session) throw new Error('No session');
  const { error } = await supabase
    .from('user_tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);
  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
  useStore.getState().setTasks(useStore.getState().tasks.filter((t) => t.id !== id));
}
