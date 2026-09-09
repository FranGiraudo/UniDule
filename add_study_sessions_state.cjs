const fs = require('fs');

// 1. Update useStore.ts
let store = fs.readFileSync('src/shared/store/useStore.ts', 'utf8');
store = store.replace(
  "  eventCompletions: any[];",
  "  eventCompletions: any[];\n  studySessions: any[];"
);
store = store.replace(
  "  setEventCompletions: (eventCompletions: any[]) => void;",
  "  setEventCompletions: (eventCompletions: any[]) => void;\n  setStudySessions: (sessions: any[]) => void;"
);
store = store.replace(
  "  eventCompletions: [],",
  "  eventCompletions: [],\n  studySessions: [],"
);
store = store.replace(
  "  setEventCompletions: (eventCompletions) => set({ eventCompletions }),",
  "  setEventCompletions: (eventCompletions) => set({ eventCompletions }),\n  setStudySessions: (studySessions) => set({ studySessions }),"
);

// Pomodoro needs to hold selected subject and task
store = store.replace(
  "    mode: 'pomodoro' | 'shortBreak' | 'longBreak';",
  "    mode: 'pomodoro' | 'shortBreak' | 'longBreak';\n    subjectId?: string;\n    taskId?: string;"
);

fs.writeFileSync('src/shared/store/useStore.ts', store);

// 2. Update useDataSync.ts
let sync = fs.readFileSync('src/shared/hooks/useDataSync.ts', 'utf8');
sync = sync.replace(
  "const setEventCompletions = useStore.getState().setEventCompletions;",
  "const setEventCompletions = useStore.getState().setEventCompletions;\n      const setStudySessions = useStore.getState().setStudySessions;"
);
sync = sync.replace(
  "        { data: completionsData },\n      ] = await Promise.all([",
  "        { data: completionsData },\n        { data: studySessionsData },\n      ] = await Promise.all(["
);
sync = sync.replace(
  "        supabase.from('event_completions').select('*').eq('user_id', uid),\n      ]);",
  "        supabase.from('event_completions').select('*').eq('user_id', uid),\n        supabase.from('study_sessions').select('*').eq('user_id', uid),\n      ]);"
);
sync = sync.replace(
  "      if (completionsData) {\n        setEventCompletions(completionsData);\n      }",
  "      if (completionsData) {\n        setEventCompletions(completionsData);\n      }\n      if (studySessionsData) {\n        setStudySessions(studySessionsData);\n      }"
);
fs.writeFileSync('src/shared/hooks/useDataSync.ts', sync);
