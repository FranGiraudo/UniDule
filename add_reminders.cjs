const fs = require('fs');
let content = fs.readFileSync('src/shared/components/layout/MainLayout.tsx', 'utf8');

// Add to the useEffect interval
const reminderLogic = `
        // Check for upcoming classes to send a notification (15 mins before)
        const d = new Date();
        const nowM = d.getHours() * 60 + d.getMinutes();
        const state = useStore.getState();
        const todayStr = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d.getDay()];
        
        state.career?.subjects.forEach(s => {
          s.schedules?.filter(sc => sc.day === todayStr).forEach(sc => {
            const parts = sc.startTime.split(':');
            const stM = parseInt(parts[0]) * 60 + parseInt(parts[1]);
            // If exactly 15 mins before
            if (stM - nowM === 15 && d.getSeconds() === 0) {
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

        const currentLeft = state.pomodoro.timeLeft;
`;

content = content.replace(
  "        const currentLeft = useStore.getState().pomodoro.timeLeft;",
  reminderLogic
);

fs.writeFileSync('src/shared/components/layout/MainLayout.tsx', content);
