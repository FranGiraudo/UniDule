import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { Career, Note, ScheduleEvent, SupabaseProfile, Task, ThemeType, UserEvent } from '../types';

interface PomodoroState {
  timeLeft: number;
  isRunning: boolean;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
  subjectId?: string;
  taskId?: string;
  examId?: string;
  endTime?: number | null;
}

const getInitialPomodoro = (): PomodoroState => {
  const defaultState: PomodoroState = {
    timeLeft: 25 * 60,
    isRunning: false,
    mode: 'pomodoro',
    endTime: null,
  };
  try {
    const saved = localStorage.getItem('unidule_pomodoro');
    if (!saved) return defaultState;
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return defaultState;

    if (parsed.isRunning && parsed.endTime) {
      const remaining = Math.max(0, Math.ceil((parsed.endTime - Date.now()) / 1000));
      if (remaining > 0) {
        return {
          ...parsed,
          timeLeft: remaining,
          isRunning: true,
        };
      } else {
        return {
          ...parsed,
          timeLeft: 0,
          isRunning: false,
          endTime: null,
        };
      }
    }
    return {
      ...defaultState,
      ...parsed,
      isRunning: false,
      endTime: null,
    };
  } catch {
    return defaultState;
  }
};

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
  settings: {
    pomodoroTime: number;
    shortBreakTime: number;
    longBreakTime: number;
    ambientSound: string;
    dndMode: boolean;
  };
  pomodoro: PomodoroState;

  // Actions
  setSettings: (settings: Partial<AppState['settings']>) => void;
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
  settings: {
    pomodoroTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    ambientSound: 'none',
    dndMode: false,
  },
  pomodoro: getInitialPomodoro(),

  setSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
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
  setPomodoro: (pomoState) =>
    set((state) => {
      const updated = { ...state.pomodoro, ...pomoState };
      try {
        localStorage.setItem('unidule_pomodoro', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return { pomodoro: updated };
    }),
}));
