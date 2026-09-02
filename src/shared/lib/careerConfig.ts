export interface CareerConfig {
  id: string;
  name: string;
  institution: string;
  shortInstitution: string;
  defaultSemester: string;
  intermediateTitle?: {
    name: string;
    maxYear: number;
  };
}

export const CAREER_PLANS: Record<string, CareerConfig> = {
  '2026': {
    id: '2026',
    name: 'Ingeniería en Informática',
    institution: 'Ingeniería en Informática — IUA',
    shortInstitution: 'IUA',
    defaultSemester: '2do Sem 2026',
    intermediateTitle: {
      name: 'Analista de Sistemas Informáticos',
      maxYear: 3,
    },
  },
  '2016': {
    id: '2016',
    name: 'Ingeniería en Informática',
    institution: 'Ingeniería en Informática — IUA',
    shortInstitution: 'IUA',
    defaultSemester: '2do Sem 2026',
    intermediateTitle: {
      name: 'Analista de Sistemas Informáticos',
      maxYear: 3,
    },
  },
  'unc-derecho': {
    id: 'unc-derecho',
    name: 'Abogacía',
    institution: 'Abogacía — UNC',
    shortInstitution: 'UNC',
    defaultSemester: '2do Sem 2026',
  },
};

export const DEFAULT_PLAN_ID = '2026';

export function getCareerConfig(planId?: string | null): CareerConfig {
  return CAREER_PLANS[planId || DEFAULT_PLAN_ID] || CAREER_PLANS[DEFAULT_PLAN_ID];
}
