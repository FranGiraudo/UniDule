export const TASK_TYPES = ['Tarea', 'Trabajo Práctico', 'Parcial', 'Final', 'Proyecto', 'Laboratorio', 'Otro'];

export function inferGradeType(task: { type: string; title: string }): string {
  if (task.type === 'Trabajo Práctico') return 'TP';
  if (task.type === 'Laboratorio') return 'Lab';
  if (task.type === 'Parcial') {
    const t = (task.title || '').toLowerCase();
    if (t.includes('2') || t.includes('segund')) return 'Parcial 2';
    if (t.includes('3') || t.includes('tercer')) return 'Parcial 3';
    return 'Parcial 1';
  }
  if (task.type === 'Tarea' || task.type === 'Proyecto') return 'TP';
  return task.type;
}

export const TYPE_BG: Record<string, string> = {
  'Tarea': 'color-mix(in srgb, var(--primary) 15%, transparent)',
  'Trabajo Práctico': 'rgba(16,185,129,.15)',
  'Parcial': 'rgba(239,68,68,.17)',
  'Final': 'rgba(239,68,68,.24)',
  'Proyecto': 'rgba(236,72,153,.15)',
  'Laboratorio': 'rgba(245,158,11,.15)',
  'Otro': 'rgba(255,255,255,.08)'
};
export const TYPE_FG: Record<string, string> = {
  'Tarea': 'var(--primary)',
  'Trabajo Práctico': '#6ee7b7',
  'Parcial': '#f87171',
  'Final': '#f87171',
  'Proyecto': '#f9a8d4',
  'Laboratorio': '#fcd34d',
  'Otro': 'var(--text2)'
};
