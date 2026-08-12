import type { Subject } from '../../../shared/types';

export function getComputedStatus(sub: Subject, allSubjects: Subject[]): string {
  if (sub.status !== 'pendiente') return sub.status || 'pendiente';
  
  const met = (sub.correlatives || []).every(id => {
    const dep = allSubjects.find(x => x.id === id);
    return dep && (dep.status === 'regular' || dep.status === 'aprobada');
  });
  
  return met ? 'disponible' : 'bloqueada';
}

export function getDaysToExpiration(expDateStr: string | null | undefined): number | null {
  if (!expDateStr) return null;
  const parts = expDateStr.split('-');
  if (parts.length < 3) return null;
  const exp = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = exp.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const CAREER_STATUS_CFG: Record<string, { bg: string, color: string, border: string, label: string }> = {
  aprobada:   { bg: 'rgba(74,222,128,.15)',   color: '#4ade80', border: 'rgba(74,222,128,.3)',   label: 'Aprobada' },
  regular:    { bg: 'rgba(167,139,250,.15)',  color: '#a78bfa', border: 'rgba(167,139,250,.3)',  label: 'Regular' },
  cursando:   { bg: 'rgba(96,165,250,.15)',   color: '#60a5fa', border: 'rgba(96,165,250,.3)',   label: 'Cursando' },
  disponible: { bg: 'rgba(251,191,36,.15)',   color: '#fbbf24', border: 'rgba(251,191,36,.3)',   label: 'Disponible' },
  bloqueada:  { bg: 'rgba(255,255,255,.05)',  color: '#94a3b8', border: 'rgba(255,255,255,.1)',  label: 'Bloqueada' },
  pendiente:  { bg: 'rgba(255,255,255,.05)',  color: '#94a3b8', border: 'rgba(255,255,255,.1)',  label: 'Pendiente' }
};
