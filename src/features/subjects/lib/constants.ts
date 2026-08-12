export const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const SLOT_TYPES = [
  'Teórico',
  'Práctico',
  'Teórico-Lab',
  'Práctico-Lab',
  'Lab',
  'Clases',
  'Otro',
];

export const COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#f43f5e',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#64748b',
];

export const ACTIVE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  cursando: {
    label: 'Cursando',
    color: 'var(--primary)',
    bg: 'color-mix(in srgb, var(--primary) 12%, transparent)',
  },
  regular: { label: 'Regular', color: '#60a5fa', bg: 'rgba(59,130,246,.12)' },
  aprobado: { label: 'Aprobada', color: '#4ade80', bg: 'rgba(34,197,94,.12)' },
  aprobada: { label: 'Aprobada', color: '#4ade80', bg: 'rgba(34,197,94,.12)' },
  libre: { label: 'Libre', color: '#f87171', bg: 'rgba(239,68,68,.12)' },
  promocionado: { label: 'Promocionada', color: '#fbbf24', bg: 'rgba(245,158,11,.12)' },
  promocionada: { label: 'Promocionada', color: '#fbbf24', bg: 'rgba(245,158,11,.12)' },
  pendiente: { label: 'Pendiente', color: 'var(--text2)', bg: 'rgba(255,255,255,.05)' },
};

export const GRADE_TYPES = [
  'Parcial 1',
  'Parcial 2',
  'Parcial 3',
  'Recuperatorio',
  'Final',
  'TP',
  'Lab',
  'Otro',
];
export const EXAM_TYPES = new Set([
  'Parcial 1',
  'Parcial 2',
  'Parcial 3',
  'Recuperatorio',
  'Final',
]);
