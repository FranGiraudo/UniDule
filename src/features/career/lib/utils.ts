import type { Subject } from '../../../shared/types';
import { EQUIVALENCIES, PLAN_2026_CORRELATIVES } from './equivalencies';

export function getComputedStatus(sub: Subject, allSubjects: Subject[]): string {
  if (sub.status !== 'pendiente') return sub.status || 'pendiente';

  const met = (sub.correlatives || []).every((id) => {
    const dep = allSubjects.find((x) => x.id === id);
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

export const CAREER_STATUS_CFG: Record<
  string,
  { bg: string; color: string; border: string; label: string }
> = {
  aprobada: {
    bg: 'rgba(74,222,128,.15)',
    color: '#4ade80',
    border: 'rgba(74,222,128,.3)',
    label: 'Aprobada',
  },
  libre: {
    bg: 'rgba(239,68,68,.15)',
    color: '#f87171',
    border: 'rgba(239,68,68,.3)',
    label: 'Libre',
  },
  regular: {
    bg: 'rgba(167,139,250,.15)',
    color: '#a78bfa',
    border: 'rgba(167,139,250,.3)',
    label: 'Regular',
  },
  cursando: {
    bg: 'rgba(96,165,250,.15)',
    color: '#60a5fa',
    border: 'rgba(96,165,250,.3)',
    label: 'Cursando',
  },
  disponible: {
    bg: 'rgba(251,191,36,.15)',
    color: '#fbbf24',
    border: 'rgba(251,191,36,.3)',
    label: 'Disponible',
  },
  bloqueada: {
    bg: 'rgba(255,255,255,.05)',
    color: '#94a3b8',
    border: 'rgba(255,255,255,.1)',
    label: 'Bloqueada',
  },
  pendiente: {
    bg: 'rgba(255,255,255,.05)',
    color: '#94a3b8',
    border: 'rgba(255,255,255,.1)',
    label: 'Pendiente',
  },
};

export interface EquivalencyResult {
  name: string;
  status: string;
  derived: string;
}

export interface RiskResult {
  name: string;
  reason: string;
}

export function simulatePlanMigration(subjects: Subject[]): {
  appliedEquivalences: EquivalencyResult[];
  riskSubjects: RiskResult[];
} {
  const appliedEquivalences: EquivalencyResult[] = [];
  const riskSubjects: RiskResult[] = [];

  const mappedStatus = new Map<string, string>();

  for (const eq of EQUIVALENCIES) {
    const reqSubjs = eq.requiredSubjects.map((reqName) =>
      subjects.find((s) => s.name === reqName)
    );

    const validReqs = reqSubjs.filter(
      (s) => s && (s.status === 'aprobada' || s.status === 'regular' || s.status === 'cursando')
    );

    if (validReqs.length > 0 && validReqs.length === eq.requiredSubjects.length) {
      const allApproved = validReqs.every((s) => s?.status === 'aprobada');
      const anyCursando = validReqs.some((s) => s?.status === 'cursando');
      
      const newStatus = allApproved ? 'APROBADA' : anyCursando ? 'CURSANDO' : 'REGULAR';
      
      mappedStatus.set(eq.targetSubject, newStatus);
      
      appliedEquivalences.push({
        name: eq.targetSubject,
        status: newStatus,
        derived: eq.requiredSubjects.join(' + '),
      });
    }
  }

  for (const eq of appliedEquivalences) {
    if (eq.status === 'REGULAR') {
      const correlatives = PLAN_2026_CORRELATIVES[eq.name] || [];
      for (const corr of correlatives) {
        const corrStatus = mappedStatus.get(corr);
        if (!corrStatus || (corrStatus !== 'REGULAR' && corrStatus !== 'APROBADA')) {
          riskSubjects.push({
            name: eq.name,
            reason: `falta regularizar o aprobar ${corr}`,
          });
          break;
        }
      }
    }
  }

  return { appliedEquivalences, riskSubjects };
}

