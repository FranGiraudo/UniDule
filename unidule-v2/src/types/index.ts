export type ThemeType = 'light' | 'dark' | 'retro' | 'keychron_ps1';

export type SubjectStatus = 'pendiente' | 'aprobada' | 'promocionado' | 'regular' | 'cursando';

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
  subjectId: string;
  title: string;
  type: string;
  dueDate: string;
  done: boolean;
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
