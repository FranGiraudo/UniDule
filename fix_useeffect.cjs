const fs = require('fs');
let content = fs.readFileSync('src/shared/components/layout/MainLayout.tsx', 'utf8');

const effectMatch = content.match(/useEffect\(\(\) => \{[\s\S]*?clearInterval\(timer\);\n  \}, \[pomodoro\.isRunning, setPomodoro\]\);/);

if (effectMatch) {
  const newEffect = `useEffect(() => {
    const timer = window.setInterval(() => {
      const state = useStore.getState();
      
      // Check for upcoming classes to send a notification (15 mins before)
      const d = new Date();
      if (d.getSeconds() === 0) {
        const nowM = d.getHours() * 60 + d.getMinutes();
        const todayStr = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d.getDay()];
        
        state.career?.subjects.forEach(s => {
          s.schedules?.filter(sc => sc.day === todayStr).forEach(sc => {
            const parts = sc.startTime.split(':');
            const stM = parseInt(parts[0]) * 60 + parseInt(parts[1]);
            // If exactly 15 mins before
            if (stM - nowM === 15) {
              if (Notification.permission === 'granted') {
                new Notification('¡Clase en 15 minutos!', {
                  body: \`\${s.name} (\${sc.type}) a las \${sc.startTime} en \${s.room || 'Aula sin asignar'}\`,
                  icon: '/icon-192x192.png'
                });
                playNotificationSound();
              }
            }
          });
        });
      }

      // Pomodoro logic
      if (state.pomodoro.isRunning) {
        const currentLeft = state.pomodoro.timeLeft;
        if (currentLeft > 0) {
          state.setPomodoro({ timeLeft: currentLeft - 1 });
        } else {
          state.setPomodoro({ isRunning: false });
          playNotificationSound();
          if (Notification.permission === 'granted') {
            new Notification('¡Tiempo cumplido!', {
              body: 'Tu sesión de estudio ha terminado.',
            });
          }
          
          // Save study session if it was a pomodoro
          const p = state.pomodoro;
          if (p.mode === 'pomodoro' && p.subjectId && state.session) {
            saveStudySession(state.session.user.id, p.subjectId, p.taskId, 25).then(newSession => {
              state.setStudySessions([...state.studySessions, newSession]);
            });
          }
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);`;
  
  content = content.replace(effectMatch[0], newEffect);
  fs.writeFileSync('src/shared/components/layout/MainLayout.tsx', content);
} else {
  console.log("Could not find useEffect");
}
