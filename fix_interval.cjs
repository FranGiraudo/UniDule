const fs = require('fs');
let content = fs.readFileSync('src/shared/components/layout/MainLayout.tsx', 'utf8');

content = content.replace(
  "    if (pomodoro.isRunning) {\n      timer = window.setInterval(() => {",
  "    timer = window.setInterval(() => {"
);
content = content.replace(
  "        const currentLeft = state.pomodoro.timeLeft;\n        if (currentLeft > 0) {",
  "        if (!state.pomodoro.isRunning) return;\n        const currentLeft = state.pomodoro.timeLeft;\n        if (currentLeft > 0) {"
);

// We need to move the pomodoro logic check INSIDE the interval, but after the reminder logic
const newLogic = `
        const state = useStore.getState();
        
        // Check for upcoming classes to send a notification (15 mins before)
        const d = new Date();
        const nowM = d.getHours() * 60 + d.getMinutes();
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

        if (!state.pomodoro.isRunning) return;
        const currentLeft = state.pomodoro.timeLeft;
        if (currentLeft > 0) {
`;

// Oh wait, I can just replace the whole useEffect to be safe.
