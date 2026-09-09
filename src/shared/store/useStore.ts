import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { Career, Note, ScheduleEvent, SupabaseProfile, Task, ThemeType, UserEvent } from '../types';

interface AppState {
  session: Session | null;
  profile: SupabaseProfile | null;
  career: Career | null;
  schedule: ScheduleEvent[];
  tasks: Task[];
  notes: Note[];
  userEvents: UserEvent[];
  eventCompletions: any[];
  studySessions: any[];
  theme: ThemeType;
  pomodoro: {
    timeLeft: number;
    isRunning: boolean;
    mode: 'pomodoro' | 'shortBreak' | 'longBreak';
    subjectId?: string;
    taskId?: string;
  };

  // Actions
  setSession: (session: Session | null) => void;
  setProfile: (profile: SupabaseProfile | null) => void;
  setCareer: (career: Career | null) => void;
  setSchedule: (schedule: ScheduleEvent[]) => void;
  setTasks: (tasks: Task[]) => void;
  setNotes: (notes: Note[]) => void;
  setUserEvents: (userEvents: UserEvent[]) => void;
  setEventCompletions: (eventCompletions: any[]) => void;
  setStudySessions: (sessions: any[]) => void;
  setTheme: (theme: ThemeType) => void;
  setPomodoro: (state: Partial<AppState['pomodoro']>) => void;
}

export const useStore = create<AppState>((set) => ({
  session: null,
  profile: null,
  career: null,
  schedule: [],
  tasks: [],
  notes: [],
  userEvents: [],
  eventCompletions: [],
  studySessions: [],
  theme: 'keychron_ps1',
  pomodoro: { timeLeft: 25 * 60, isRunning: false, mode: 'pomodoro' },

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setCareer: (career) => set({ career }),
  setSchedule: (schedule) => set({ schedule }),
  setTasks: (tasks) => set({ tasks }),
  setNotes: (notes) => set({ notes }),
  setUserEvents: (userEvents) => set({ userEvents }),
  setEventCompletions: (eventCompletions) => set({ eventCompletions }),
  setStudySessions: (studySessions) => set({ studySessions }),
  setTheme: (theme) => set({ theme }),
  setPomodoro: (pomoState) => set((state) => ({ pomodoro: { ...state.pomodoro, ...pomoState } })),
}));
