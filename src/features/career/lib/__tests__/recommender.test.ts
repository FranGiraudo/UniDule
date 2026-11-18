import { describe, it, expect } from 'vitest';
import type { Subject } from '../../../../shared/types';
import {
  getCriticalPath,
  getTransitiveDependents,
  getRecommendedCourses,
  getRecommendedFinals,
  getNextSemesterRecommendations,
  getTargetNextPeriod,
} from '../recommender';

describe('recommender logic', () => {
  const mockSubjects: Subject[] = [
    {
      id: 'sub-1',
      name: 'Matemática 1',
      year: 1,
      period: 1,
      correlatives: [],
      status: 'aprobada',
    },
    {
      id: 'sub-2',
      name: 'Matemática 2',
      year: 1,
      period: 2,
      correlatives: ['sub-1'],
      status: 'regular',
      expDate: '2026-12-31',
    },
    {
      id: 'sub-3',
      name: 'Matemática 3',
      year: 2,
      period: 1,
      correlatives: ['sub-2'],
      status: 'pendiente',
    },
    {
      id: 'sub-bd1',
      name: 'Base de Datos 1',
      year: 2,
      period: 1,
      correlatives: [],
      status: 'cursando',
    },
    {
      id: 'sub-bd2',
      name: 'Base de Datos 2',
      year: 3,
      period: 1,
      correlatives: ['sub-bd1'],
      status: 'pendiente',
    },
    {
      id: 'sub-opt',
      name: 'Optativa Libre',
      year: 4,
      period: 2,
      correlatives: [],
      status: 'pendiente',
    },
  ];

  it('calculates critical path correctly in a dependency graph', () => {
    const cp = getCriticalPath(mockSubjects);
    // sub-1 -> sub-2 -> sub-3 is length 3
    // sub-bd1 -> sub-bd2 is length 2
    // sub-opt is length 1
    expect(cp.has('sub-1')).toBe(true);
    expect(cp.has('sub-2')).toBe(true);
    expect(cp.has('sub-3')).toBe(true);
  });

  it('calculates transitive dependents correctly', () => {
    const dependentsOf1 = getTransitiveDependents('sub-1', mockSubjects);
    expect(dependentsOf1).toContain('sub-2');
    expect(dependentsOf1).toContain('sub-3');
    expect(dependentsOf1).not.toContain('sub-bd1');
  });

  it('never recommends a subject that is currently in cursando status', () => {
    const recs = getRecommendedCourses(mockSubjects);
    const recIds = recs.map((r) => r.subject.id);
    expect(recIds).not.toContain('sub-bd1');
  });

  it('does NOT consider a subject available if its prerequisite is only cursando', () => {
    // sub-bd2 depends on sub-bd1 which is 'cursando' (not regular or aprobada)
    const recs = getRecommendedCourses(mockSubjects);
    const recIds = recs.map((r) => r.subject.id);
    expect(recIds).not.toContain('sub-bd2');
  });

  it('recommends available subjects prioritizing critical path and earlier years', () => {
    const recs = getRecommendedCourses(mockSubjects);
    const recIds = recs.map((r) => r.subject.id);
    // sub-3 has sub-2 regular, so sub-3 is eligible
    expect(recIds).toContain('sub-3');
    expect(recIds).toContain('sub-opt');

    // sub-3 (year 2, on critical path) should be ranked higher than sub-opt (year 4)
    expect(recs[0].subject.id).toBe('sub-3');
    expect(recs[0].isCriticalPath).toBe(true);
  });

  it('prioritizes finals based on canRendir and expiration urgency', () => {
    const finals = getRecommendedFinals(mockSubjects);
    expect(finals.length).toBe(1);
    expect(finals[0].subject.id).toBe('sub-2');
    expect(finals[0].canRendir).toBe(true); // sub-1 is aprobada
  });

  it('determines next semester bundle correctly based on target period', () => {
    // sub-bd1 is cursando in period 1, so next semester target is period 2
    const nextPeriod = getTargetNextPeriod(mockSubjects);
    expect(nextPeriod).toBe(2);

    const nextSem = getNextSemesterRecommendations(mockSubjects, 5);
    const nextIds = nextSem.map((r) => r.subject.id);
    // sub-opt is period 2 and eligible
    expect(nextIds).toContain('sub-opt');
    // sub-bd1 is cursando so it must never be included
    expect(nextIds).not.toContain('sub-bd1');
    // sub-bd2 has prerequisite in cursando so it must not be included
    expect(nextIds).not.toContain('sub-bd2');
  });
});
