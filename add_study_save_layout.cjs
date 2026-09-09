const fs = require('fs');
let content = fs.readFileSync('src/shared/components/layout/MainLayout.tsx', 'utf8');

// Add import
content = content.replace(
  "import { playNotificationSound } from '../../lib/utils';",
  "import { playNotificationSound } from '../../lib/utils';\nimport { saveStudySession } from '../../../features/events/lib/api';"
);

// Add saving logic
content = content.replace(
  "          setPomodoro({ isRunning: false });",
  `          setPomodoro({ isRunning: false });
          // Save study session if it was a pomodoro
          const state = useStore.getState();
          const p = state.pomodoro;
          if (p.mode === 'pomodoro' && p.subjectId && state.session) {
            saveStudySession(state.session.user.id, p.subjectId, p.taskId, 25).then(newSession => {
              state.setStudySessions([...state.studySessions, newSession]);
            });
          }`
);

fs.writeFileSync('src/shared/components/layout/MainLayout.tsx', content);
