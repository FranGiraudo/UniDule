import type { Subject } from '../../../shared/types';
import { getDaysToExpiration } from './utils';

export interface CourseRecommendation {
  subject: Subject;
  score: number;
  reasons: string[];
  isCriticalPath: boolean;
  unlocksCount: number;
}

export interface FinalRecommendation {
  subject: Subject;
  score: number;
  reasons: string[];
  canRendir: boolean;
  daysToExpiration: number | null;
  unlocksCount: number;
  missingFinals: Subject[];
}

/**
 * Builds adjacency list for course dependencies.
 * A -> B means B has A in its correlatives (B depends on A).
 */
function buildGraph(subjects: Subject[]) {
  const outgoing: Record<string, string[]> = {};
  const incoming: Record<string, string[]> = {};

  subjects.forEach((s) => {
    if (!outgoing[s.id]) outgoing[s.id] = [];
    if (!incoming[s.id]) incoming[s.id] = [];
  });

  subjects.forEach((s) => {
    (s.correlatives || []).forEach((reqId) => {
      if (outgoing[reqId]) {
        outgoing[reqId].push(s.id);
      }
      if (incoming[s.id]) {
        incoming[s.id].push(reqId);
      }
    });
  });

  return { outgoing, incoming };
}

/**
 * Computes all subjects that transitively depend on the given subject.
 */
export function getTransitiveDependents(subjectId: string, allSubjects: Subject[]): string[] {
  const { outgoing } = buildGraph(allSubjects);
  const visited = new Set<string>();
  const queue = [...(outgoing[subjectId] || [])];

  while (queue.length > 0) {
    const next = queue.shift()!;
    if (!visited.has(next)) {
      visited.add(next);
      const nextChildren = outgoing[next] || [];
      nextChildren.forEach((child) => {
        if (!visited.has(child)) queue.push(child);
      });
    }
  }

  return Array.from(visited);
}

/**
 * Computes the set of subject IDs on the Critical Path(s) of the curriculum DAG.
 * Uses CPM: pathLen(v) = distFromStart(v) + distToEnd(v) - 1.
 * Nodes with maximal pathLen belong to the longest prerequisite chains.
 */
export function getCriticalPath(subjects: Subject[]): Set<string> {
  if (!subjects.length) return new Set();

  const { outgoing, incoming } = buildGraph(subjects);
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // Memoized longest path to end (memoEnd) with cycle protection
  const memoEnd = new Map<string, number>();
  const visitingEnd = new Set<string>();

  function getDistToEnd(id: string): number {
    if (memoEnd.has(id)) return memoEnd.get(id)!;
    if (visitingEnd.has(id)) return 1; // cycle fallback
    visitingEnd.add(id);

    const children = outgoing[id] || [];
    let maxChild = 0;
    for (const ch of children) {
      if (subjectMap.has(ch)) {
        maxChild = Math.max(maxChild, getDistToEnd(ch));
      }
    }

    visitingEnd.delete(id);
    const dist = 1 + maxChild;
    memoEnd.set(id, dist);
    return dist;
  }

  // Memoized longest path from start (memoStart)
  const memoStart = new Map<string, number>();
  const visitingStart = new Set<string>();

  function getDistFromStart(id: string): number {
    if (memoStart.has(id)) return memoStart.get(id)!;
    if (visitingStart.has(id)) return 1; // cycle fallback
    visitingStart.add(id);

    const parents = incoming[id] || [];
    let maxParent = 0;
    for (const p of parents) {
      if (subjectMap.has(p)) {
        maxParent = Math.max(maxParent, getDistFromStart(p));
      }
    }

    visitingStart.delete(id);
    const dist = 1 + maxParent;
    memoStart.set(id, dist);
    return dist;
  }

  let maxTotalDist = 0;
  const pathLengths = new Map<string, number>();

  for (const s of subjects) {
    const end = getDistToEnd(s.id);
    const start = getDistFromStart(s.id);
    const total = start + end - 1;
    pathLengths.set(s.id, total);
    if (total > maxTotalDist) {
      maxTotalDist = total;
    }
  }

  // A subject is on the critical path if its total path length is equal to maxTotalDist
  // (or within 1 hop if the chain is long enough >= 5)
  const criticalPathSet = new Set<string>();
  const threshold = Math.max(1, maxTotalDist);

  for (const [id, len] of pathLengths.entries()) {
    if (len >= threshold) {
      criticalPathSet.add(id);
    }
  }

  return criticalPathSet;
}

/**
 * Returns algorithmically recommended courses to enroll in,
 * EXCLUDING subjects that are already in 'cursando', 'regular', 'aprobada', or 'promocionado'.
 * Also verifies that every prerequisite is satisfied by being 'aprobada' or 'regular'.
 * (A prerequisite in 'cursando' does NOT unlock downstream courses yet).
 */
export function getRecommendedCourses(
  subjects: Subject[],
  options?: { limit?: number; period?: number }
): CourseRecommendation[] {
  const criticalPathSet = getCriticalPath(subjects);

  // Filter truly eligible courses
  const eligible = subjects.filter((s) => {
    // 1. Exclude if already in course or passed
    if (
      s.status === 'aprobada' ||
      s.status === 'regular' ||
      s.status === 'cursando' ||
      s.status === 'promocionado'
    ) {
      return false;
    }

    // 2. All prerequisites must be satisfied (strictly 'regular' or 'aprobada')
    const correlatives = s.correlatives || [];
    const prerequisitesMet = correlatives.every((reqId) => {
      const req = subjects.find((x) => x.id === reqId);
      return req && (req.status === 'aprobada' || req.status === 'regular');
    });

    return prerequisitesMet;
  });

  const recommendations: CourseRecommendation[] = eligible.map((s) => {
    let score = 50;
    const reasons: string[] = [];

    // Check critical path
    const isCritical = criticalPathSet.has(s.id);
    if (isCritical) {
      score += 35;
      reasons.push('Camino Crítico');
    }

    // Transitive unlocks
    const dependents = getTransitiveDependents(s.id, subjects);
    const unlocksCount = dependents.length;
    if (unlocksCount > 0) {
      score += Math.min(30, unlocksCount * 5);
      reasons.push(`Desbloquea ${unlocksCount} ${unlocksCount === 1 ? 'materia' : 'materias'}`);
    }

    // Year prioritization (earlier years first)
    const year = s.year || 1;
    const yearPoints = Math.max(0, (5 - year) * 8);
    score += yearPoints;
    if (year <= 2) {
      reasons.push(`${year}° Año Troncal`);
    }

    // Intermediate title bonus (Years 1 to 3)
    if (year <= 3) {
      score += 15;
      reasons.push('Requisito Analista');
    }

    // Period match
    if (options?.period !== undefined && s.period === options.period) {
      score += 10;
      reasons.push(`${s.period}° Semestre`);
    }

    return {
      subject: s,
      score,
      reasons,
      isCriticalPath: isCritical,
      unlocksCount,
    };
  });

  // Sort by score descending, then by year ascending
  recommendations.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.subject.year !== b.subject.year) return a.subject.year - b.subject.year;
    return (a.subject.period || 0) - (b.subject.period || 0);
  });

  if (options?.limit && options.limit > 0) {
    return recommendations.slice(0, options.limit);
  }

  return recommendations;
}

/**
 * Returns algorithmically prioritized final exams for subjects in 'regular' status.
 */
export function getRecommendedFinals(
  subjects: Subject[],
  options?: { limit?: number }
): FinalRecommendation[] {
  const regularSubs = subjects.filter((s) => s.status === 'regular');

  const recommendations: FinalRecommendation[] = regularSubs.map((s) => {
    const missingFinals = (s.correlatives || [])
      .map((id) => subjects.find((x) => x.id === id))
      .filter((dep): dep is Subject => !dep || dep.status !== 'aprobada');

    const canRendir = missingFinals.length === 0;
    const daysExp = getDaysToExpiration(s.expDate);
    const dependents = getTransitiveDependents(s.id, subjects);
    const unlocksCount = dependents.length;

    let score = 40;
    const reasons: string[] = [];

    // Readiness
    if (canRendir) {
      score += 40;
      reasons.push('Listo para rendir');
    } else {
      score -= 20;
      const missingNames = missingFinals.map((m) => m?.name || 'correlativa').slice(0, 2);
      reasons.push(`Requiere final de ${missingNames.join(', ')}`);
    }

    // Expiration urgency
    if (daysExp !== null) {
      if (daysExp < 0) {
        score -= 40;
        reasons.push('Regularidad vencida');
      } else if (daysExp <= 60) {
        score += 50;
        reasons.push(`Vence en ${daysExp}d`);
      } else if (daysExp <= 120) {
        score += 30;
        reasons.push(`Vence en ${daysExp}d`);
      } else if (daysExp <= 240) {
        score += 15;
        reasons.push(`Vence en ${daysExp}d`);
      }
    }

    // Unlocks impact
    if (unlocksCount > 0) {
      score += Math.min(25, unlocksCount * 4);
      reasons.push(`Destraba ${unlocksCount} ${unlocksCount === 1 ? 'materia' : 'materias'}`);
    }

    // Year prioritization (earlier years first)
    const year = s.year || 1;
    score += Math.max(0, (5 - year) * 6);
    if (year === 1) {
      reasons.push('Pendiente de 1° Año');
    }

    return {
      subject: s,
      score,
      reasons,
      canRendir,
      daysToExpiration: daysExp,
      unlocksCount,
      missingFinals,
    };
  });

  // Sort by score descending, then by canRendir, then by daysToExpiration
  recommendations.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.canRendir !== b.canRendir) return a.canRendir ? -1 : 1;
    if (a.daysToExpiration !== null && b.daysToExpiration !== null) {
      return a.daysToExpiration - b.daysToExpiration;
    }
    return (a.subject.year || 0) - (b.subject.year || 0);
  });

  if (options?.limit && options.limit > 0) {
    return recommendations.slice(0, options.limit);
  }

  return recommendations;
}

/**
 * Determines the target next semester period (1 or 2) based on current cursando subjects
 * or the calendar month.
 */
export function getTargetNextPeriod(subjects: Subject[]): number {
  const cursando = subjects.filter((s) => s.status === 'cursando');
  if (cursando.length > 0) {
    const period2Count = cursando.filter((s) => s.period === 2).length;
    const period1Count = cursando.filter((s) => s.period === 1).length;
    if (period2Count >= period1Count) return 1;
    return 2;
  }
  const month = new Date().getMonth();
  return month >= 6 ? 1 : 2;
}

/**
 * Returns the recommended subjects bundle for the student's next semester.
 * Returns up to `limit` subjects, prioritizing matching period (or annual),
 * earlier academic years, and high prerequisite unlocks.
 */
export function getNextSemesterRecommendations(
  subjects: Subject[],
  limit: number = 6
): CourseRecommendation[] {
  const targetPeriod = getTargetNextPeriod(subjects);

  // Get all eligible courses to enroll in
  const allEligible = getRecommendedCourses(subjects);

  // Filter matching period or annual
  const periodMatches = allEligible.filter(
    (r) => r.subject.period === targetPeriod || r.subject.period === 0 || !r.subject.period
  );
  const otherPeriod = allEligible.filter(
    (r) => r.subject.period !== targetPeriod && r.subject.period !== 0 && !!r.subject.period
  );

  // Combine, preferring period matches, then filling up to limit with other available subjects
  const combined = [...periodMatches, ...otherPeriod];
  return combined.slice(0, limit);
}
