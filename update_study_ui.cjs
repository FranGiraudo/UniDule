const fs = require('fs');
let content = fs.readFileSync('src/pages/Study.tsx', 'utf8');

// Replace top logic
const newLogic = `
  const { pomodoro, setPomodoro, career, tasks } = useStore();
  const { timeLeft, isRunning, mode, subjectId, taskId } = pomodoro;
  const subjects = career?.subjects || [];
  const activeSubjects = subjects.filter(s => s.status === 'cursando');
  const subjectTasks = tasks.filter(t => t.subjectId === subjectId && !t.done);
`;
content = content.replace(
  "  const { pomodoro, setPomodoro } = useStore();\n  const { timeLeft, isRunning, mode } = pomodoro;",
  newLogic
);

// Add dropdowns after the header and before modes
const dropdowns = `
      <div style={{ maxWidth: '600px', margin: '0 auto 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <select 
          className="f-input" 
          value={subjectId || ''} 
          onChange={(e) => setPomodoro({ subjectId: e.target.value, taskId: '' })}
          disabled={isRunning}
          style={{ width: '100%', cursor: isRunning ? 'not-allowed' : 'pointer', background: 'var(--card2)', color: 'var(--text)' }}
        >
          <option value="">-- Seleccionar Materia a Estudiar (Opcional) --</option>
          {activeSubjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        
        {subjectId && (
          <select 
            className="f-input" 
            value={taskId || ''} 
            onChange={(e) => setPomodoro({ taskId: e.target.value })}
            disabled={isRunning}
            style={{ width: '100%', cursor: isRunning ? 'not-allowed' : 'pointer', background: 'var(--card2)', color: 'var(--text)' }}
          >
            <option value="">-- Seleccionar Tarea / Examen (Opcional) --</option>
            {subjectTasks.map(t => (
              <option key={t.id} value={t.id}>{t.title} ({t.type})</option>
            ))}
          </select>
        )}
      </div>
`;
content = content.replace(
  "      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>",
  "      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>\n" + dropdowns
);

fs.writeFileSync('src/pages/Study.tsx', content);
