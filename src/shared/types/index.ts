import type { THEMES } from '../lib/themes';

export type ThemeType = keyof typeof THEMES;

export type SubjectStatus = 'pendiente' | 'aprobada' | 'promocionado' | 'regular' | 'cursando';

export interface Grade {
  id: string;
  type: string;
  score: number | '' | null;
  date: string | null;
  weight?: number | null;
}

export interface Subject {
  id: string;
  name: string;
  year: number;
  period: number | null;
  credits?: number;
  correlatives: string[];
  status?: SubjectStatus;
  grade?: number | null;
  regDate?: string | null;
  expDate?: string | null;
  color?: string;
  room?: string;
  layout_row?: number;
  schedules?: ScheduleEvent[];

  // Present only when the student has an active-subject record (tracked term)
  activeId?: string;
  code?: string;
  professor?: string;
  email?: string;
  absences?: number;
  maxAbsences?: number;
  allowsPromotion?: boolean;
  grades?: Grade[];
}

export interface Seminar {
  id: string;
  code: string;
  name: string;
  category: string;
  hours: number;
  status: string;
  date: string | null;
  notes: string | null;
}

export interface Elective {
  id: string;
  code: string;
  name: string;
  category: string;
  credits: number;
  status?: string;
  grade?: number | null;
  regDate?: string | null;
  expDate?: string | null;
}

export interface Career {
  id: string;
  name: string;
  subjects: Subject[];
  seminars: Seminar[];
  electives: Elective[];
}

export interface ScheduleEvent {
  id: string;
  subject_id: string;
  type: string;
  day: number | string;
  startTime: string;
  endTime: string;
  room?: string;
  name?: string; // Denormalized for easy rendering
}

export interface Task {
  id: string;
  subjectId: string | null;
  title: string;
  type: string;
  dueDate: string | null;
  notes?: string;
  gradeId?: string | null;
  done: boolean;
}

export interface Note {
  id: string;
  subject_id: string;
  title: string;
  content: string;
  note_date: string;
}

export interface UserState {
  theme: ThemeType;
  career_id: string | null;
}

export interface SupabaseProfile {
  id: string;
  name: string | null;
  career: string | null;
  theme: ThemeType;
  plan_id: string | null;
}
