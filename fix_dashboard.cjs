const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Replace old todayClasses loop with new getBlocksForDay
content = content.replace(
  /const todayClasses: { s: Subject; sc: ScheduleEvent }\[\] = \[\];[\s\S]*?todayClasses\.sort\(\(a, b\) => t2m\(a\.sc\.startTime\) - t2m\(b\.sc\.startTime\)\);/,
  `const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const getBlocksForDay = (day: string) => {
    const blocks: { s: any; sc: any }[] = [];
    subjects.forEach((s) => {
      s.schedules?.filter((sc) => sc.day === day).forEach((sc) => blocks.push({ s, sc }));
    });

    const dayIndex = DAYS.indexOf(day);
    const myDayIndex = dayIndex === 0 ? 7 : dayIndex;
    const userEvents = useStore.getState().userEvents;
    
    userEvents.forEach((e) => {
      let shouldShow = false;
      if (e.isRecurring) {
        if (e.dayOfWeek === myDayIndex) shouldShow = true;
      } else if (e.date) {
        const parts = e.date.split('-');
        if (parts.length === 3) {
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          let jsDay = d.getDay();
          let myDay = jsDay === 0 ? 7 : jsDay;
          if (myDay === myDayIndex) shouldShow = true;
        }
      }
      if (shouldShow) {
        blocks.push({
          s: { name: e.title, color: e.color || '#a855f7', room: '' },
          sc: { 
            id: e.id,
            isEvent: true,
            startTime: e.startTime, 
            endTime: e.endTime, 
            type: e.category.charAt(0).toUpperCase() + e.category.slice(1) 
          }
        });
      }
    });
    return blocks.sort((a, b) => t2m(a.sc.startTime) - t2m(b.sc.startTime));
  };

  const todayClasses = td ? getBlocksForDay(td) : [];`
);

// Replace getNextClass logic
content = content.replace(
  /const getNextClass = \(\) => {[\s\S]*?return null;\n  };/,
  `const getNextClass = () => {
    const today = td;
    const nowM = Math.floor(nowSec / 60);
    const secs = nowSec % 60;

    if (today) {
      const todays = getBlocksForDay(today);
      for (const { s, sc } of todays) {
        const st = t2m(sc.startTime);
        const en = t2m(sc.endTime);
        if (nowM >= st && nowM < en)
          return { s, sc, status: 'inProgress', sec: (en - nowM) * 60 - secs };
        if (nowM < st) return { s, sc, status: 'upcoming', sec: (st - nowM) * 60 - secs };
      }
    }

    if (!today) return null;

    for (let off = 1; off <= 7; off++) {
      const nd = DAYS[(DAYS.indexOf(today) + off) % DAYS.length];
      const nb = getBlocksForDay(nd);
      if (!nb.length) continue;
      const { s, sc } = nb[0];
      return {
        s,
        sc,
        status: 'nextDay',
        sec: (off * 1440 + t2m(sc.startTime) - Math.floor(nowSec / 60)) * 60 - (nowSec % 60),
        nextDay: nd,
      };
    }
    return null;
  };`
);

// Remove todayC
content = content.replace(
  /const todayC = td[\s\S]*?: 0;/,
  ''
);
content = content.replace(/{todayC}/g, '{todayClasses.length}');

fs.writeFileSync('src/pages/Dashboard.tsx', content);
