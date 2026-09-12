const fs = require('fs');
let code = fs.readFileSync('src/pages/Tasks.tsx', 'utf-8');

// Update Filter type
code = code.replace(
  "type Filter = 'all' | 'pending' | 'done' | `type-${string}`;",
  "type Filter = 'all' | 'pending' | 'matrix' | 'done' | `type-${string}`;"
);

// Add 'Matriz' tab
const matrixTab = `
        <div
          className={\`filter-tab \${filter === 'matrix' ? 'active' : ''}\`}
          onClick={() => setFilter('matrix')}
        >
          Matriz
        </div>`;
code = code.replace(
  "Todas\n        </div>",
  "Todas\n        </div>" + matrixTab
);

// Extract the inline map body to a renderTask function
const mapStartIdx = code.indexOf('{filtered.map((t) => {');
const endOfMapIdx = code.indexOf('          })}\n        </div>\n      )}');

if (mapStartIdx !== -1 && endOfMapIdx !== -1) {
  const mapBody = code.slice(mapStartIdx + '{filtered.map((t) => {'.length, endOfMapIdx);
  
  // We need to inject `const renderTask = (t: Task) => {` before `return (`
  const renderTaskFn = `\n  const renderTask = (t: Task, compact: boolean = false) => {\n` + mapBody + `  };\n`;
  
  // Insert renderTask before `return (`
  const returnIdx = code.indexOf('  return (\n    <div className="view-content fade-in">');
  code = code.slice(0, returnIdx) + renderTaskFn + code.slice(returnIdx);
  
  // Replace the original map with a call to renderTask
  const newCode = code.slice(0, code.indexOf('{filtered.map((t) => {')) + 
                  '{filtered.map((t) => renderTask(t))}' + 
                  code.slice(endOfMapIdx + '          })}'.length);
  code = newCode;
}

// Now insert renderMatrix before `return (`
const renderMatrixCode = `
  const renderMatrix = () => {
    const pendingTasks = tasks.filter((t) => !t.done);
    const qDo: Task[] = [];
    const qSchedule: Task[] = [];
    const qDelegate: Task[] = [];
    const qEliminate: Task[] = [];

    pendingTasks.forEach((t) => {
      const isExam = EXAM_TYPES.has(t.type) || /parcial|final|examen/.test((t.type || '').toLowerCase());
      const important = isExam || t.type === 'Proyecto';
      const d = daysUntil(t.dueDate);
      const urgent = d !== null && d <= 7;

      if (important && urgent) qDo.push(t);
      else if (important && !urgent) qSchedule.push(t);
      else if (!important && urgent) qDelegate.push(t);
      else qEliminate.push(t);
    });

    const sortFn = (a: Task, b: Task) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate < b.dueDate ? -1 : 1;
    };

    qDo.sort(sortFn);
    qSchedule.sort(sortFn);
    qDelegate.sort(sortFn);
    qEliminate.sort(sortFn);

    const renderQ = (title: string, desc: string, list: Task[], color: string, bg: string) => (
      <div style={{ background: bg, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: \`1px solid \${color}33\` }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
          <p style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 600 }}>{desc}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
          {list.length === 0 ? (
             <div style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text2)', background: 'var(--bg)', borderRadius: '8px', opacity: 0.7 }}>Vacío</div>
          ) : list.map((t) => renderTask(t, true))}
        </div>
      </div>
    );

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {renderQ('¡Hacer YA!', 'Urgente e Importante (<= 7 días)', qDo, '#ef4444', 'rgba(239,68,68,0.05)')}
        {renderQ('Planificar', 'Importante, No Urgente (> 7 días)', qSchedule, '#3b82f6', 'rgba(59,130,246,0.05)')}
        {renderQ('Resolver rápido', 'Urgente, No Importante (<= 7 días)', qDelegate, '#f59e0b', 'rgba(245,158,11,0.05)')}
        {renderQ('Para después', 'Ni Urgente ni Importante (> 7 días)', qEliminate, '#8b5cf6', 'rgba(139,92,246,0.05)')}
      </div>
    );
  };
`;

const returnIdx2 = code.indexOf('  return (\n    <div className="view-content fade-in">');
code = code.slice(0, returnIdx2) + renderMatrixCode + code.slice(returnIdx2);

// Use renderMatrix if filter === 'matrix'
code = code.replace(
  "{filtered.length === 0 ? (",
  "{(filter === 'matrix') ? renderMatrix() : filtered.length === 0 ? ("
);

// We need to apply compact styling in renderTask.
// Let's replace `const d = daysUntil(t.dueDate);` with handling compact mode.
code = code.replace(
  "              <div key={t.id} className={`task-card ${t.done ? 'done' : ''}`} style={cardStyle}>",
  "              <div key={t.id} className={`task-card ${t.done ? 'done' : ''}`} style={{ ...cardStyle, padding: compact ? '12px' : '16px' }}>"
);
code = code.replace(
  "                      <div\n                        style={{\n                          fontSize: '13px',\n",
  "                      <div\n                        style={{\n                          fontSize: compact ? '12px' : '13px',\n"
);
code = code.replace(
  "                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '5px' }}>",
  "                  <div style={{ display: compact ? 'none' : 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '5px' }}>"
);


fs.writeFileSync('src/pages/Tasks.tsx', code);
