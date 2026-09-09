const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Add imports
content = content.replace(
  "import { Book, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';",
  "import { Book, CheckCircle2, Clock, AlertTriangle, Circle } from 'lucide-react';\nimport { toggleEventCompletion } from '../features/events/lib/api';"
);

// Add state hooks
content = content.replace(
  "  const { career, tasks } = useStore();",
  `  const { career, tasks, session, eventCompletions, setEventCompletions } = useStore();
  const getTodayStr = () => {
    const d = new Date();
    return \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;
  };

  const handleToggleEvent = async (eventId: string, currentCompleted: boolean) => {
    if (!session?.user?.id) return;
    const dateStr = getTodayStr();
    
    if (currentCompleted) {
      setEventCompletions(eventCompletions.filter(c => !(c.event_id === eventId && c.date_str === dateStr)));
    } else {
      setEventCompletions([...eventCompletions, { id: 'temp', user_id: session.user.id, event_id: eventId, date_str: dateStr }]);
    }
    await toggleEventCompletion(session.user.id, eventId, dateStr, !currentCompleted);
  };`
);

// Modify UI rendering for timeline
content = content.replace(
  /\{todayClasses\.map\(\(\{ s, sc \}, i\) => \{[\s\S]*?className="today-row"[\s\S]*?style=\{\{[\s\S]*?\}\}[\s\S]*?>[\s\S]*?<div style=\{\{ flex: 1 \}\}>[\s\S]*?<div style=\{\{ fontWeight: 700, fontSize: '13px' \}\}>\{s\.name\}<\/div>[\s\S]*?<div style=\{\{ fontSize: '11px', color: 'var\(--text2\)', marginTop: '2px' \}\}>[\s\S]*?\{sc\.startTime\}–\{sc\.endTime\} · \{sc\.type\} · \{s\.room\}[\s\S]*?<\/div>[\s\S]*?<\/div>/,
  `{todayClasses.map(({ s, sc }, i) => {
                const past = Math.floor(nowSec / 60) > t2m(sc.endTime);
                const inPrg =
                  Math.floor(nowSec / 60) >= t2m(sc.startTime) &&
                  Math.floor(nowSec / 60) < t2m(sc.endTime);
                
                const isEvent = sc.isEvent;
                const isCompleted = isEvent && eventCompletions.some(c => c.event_id === sc.id && c.date_str === getTodayStr());

                return (
                  <div
                    key={i}
                    className="today-row"
                    style={{
                      opacity: past || isCompleted ? 0.5 : 1,
                      borderLeft: \`3px solid \${s.color || 'var(--primary)'}\`,
                      cursor: isEvent ? 'pointer' : 'default'
                    }}
                    onClick={() => isEvent && handleToggleEvent(sc.id, isCompleted)}
                  >
                    {isEvent && (
                      <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                        {isCompleted ? <CheckCircle2 size={18} color="var(--primary)" /> : <Circle size={18} color="var(--text2)" />}
                      </div>
                    )}
                    <div style={{ flex: 1, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px' }}>
                        {sc.startTime}–{sc.endTime} · {sc.type} {s.room ? \`· \${s.room}\` : ''}
                      </div>
                    </div>`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
