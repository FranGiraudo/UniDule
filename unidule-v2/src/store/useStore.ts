import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { Career, ScheduleEvent, SupabaseProfile, ThemeType } from '../types';

export interface Task {
  id: string;
  subjectId: string;
  title: string;
  type: string;
  dueDate: string | null;
  done: boolean;
}

interface AppState {
  session: Session | null;
  profile: SupabaseProfile | null;
  career: Career | null;
  schedule: ScheduleEvent[];
  tasks: Task[];
  theme: ThemeType;
  
  // Actions
  setSession: (session: Session | null) => void;
  setProfile: (profile: SupabaseProfile | null) => void;
  setCareer: (career: Career | null) => void;
  setSchedule: (schedule: ScheduleEvent[]) => void;
  setTasks: (tasks: Task[]) => void;
  setTheme: (theme: ThemeType) => void;
}

export const useStore = create<AppState>((set) => ({
  session: null,
  profile: null,
  career: null,
  schedule: [],
  tasks: [],
  theme: 'keychron_ps1',
  
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setCareer: (career) => set({ career }),
  setSchedule: (schedule) => set({ schedule }),
  setTasks: (tasks) => set({ tasks }),
  setTheme: (theme) => set({ theme }),
}));
