import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { Career, Note, ScheduleEvent, SupabaseProfile, Task, ThemeType } from '../types';

interface AppState {
  session: Session | null;
  profile: SupabaseProfile | null;
  career: Career | null;
  schedule: ScheduleEvent[];
  tasks: Task[];
  notes: Note[];
  theme: ThemeType;

  // Actions
  setSession: (session: Session | null) => void;
  setProfile: (profile: SupabaseProfile | null) => void;
  setCareer: (career: Career | null) => void;
  setSchedule: (schedule: ScheduleEvent[]) => void;
  setTasks: (tasks: Task[]) => void;
  setNotes: (notes: Note[]) => void;
  setTheme: (theme: ThemeType) => void;
}

export const useStore = create<AppState>((set) => ({
  session: null,
  profile: null,
  career: null,
  schedule: [],
  tasks: [],
  notes: [],
  theme: 'keychron_ps1',

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setCareer: (career) => set({ career }),
  setSchedule: (schedule) => set({ schedule }),
  setTasks: (tasks) => set({ tasks }),
  setNotes: (notes) => set({ notes }),
  setTheme: (theme) => set({ theme }),
}));
