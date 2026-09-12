import re

def main():
    with open('src/pages/Tasks.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Filter type
    content = content.replace(
        "type Filter = 'all' | 'pending' | 'done' | `type-${string}`;",
        "type Filter = 'all' | 'pending' | 'matrix' | 'done' | `type-${string}`;"
    )

    # 2. Add 'Matriz' tab
    matrix_tab = """        <div
          className={`filter-tab ${filter === 'matrix' ? 'active' : ''}`}
          onClick={() => setFilter('matrix')}
        >
          Matriz
        </div>"""
    content = content.replace(
        "Todas\n        </div>",
        f"Todas\n        </div>\n{matrix_tab}"
    )

    # 3. Extract the inner block of filtered.map((t) => { ... })
    pattern = re.compile(r'\{filtered\.map\(\(t\) => \{(.*?)\s*\}\)\}', re.DOTALL)
    match = pattern.search(content)
    if not match:
        print("Could not find filtered.map block")
        return
        
    map_body = match.group(1)
    
    # modify map_body to support compact mode
    map_body = map_body.replace(
        "className={`task-card ${t.done ? 'done' : ''}`} style={cardStyle}",
        "className={`task-card ${t.done ? 'done' : ''}`} style={{ ...cardStyle, padding: compact ? '12px' : '16px' }}"
    )
    map_body = map_body.replace(
        "style={{\n                        fontSize: '13px',",
        "style={{\n                        fontSize: compact ? '12px' : '13px',"
    )
    map_body = map_body.replace(
        "style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '5px' }}",
        "style={{ display: compact ? 'none' : 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '5px' }}"
    )
    
    render_task_fn = f"\n  const renderTask = (t: Task, compact: boolean = false) => {{{map_body}\n  }};\n"
    
    # insert renderTask before `return (`
    return_idx = content.find('  return (\n    <div className="view-content fade-in">')
    content = content[:return_idx] + render_task_fn + content[return_idx:]
    
    # replace the original map with call to renderTask
    content = content[:match.start()] + "{filtered.map((t) => renderTask(t))}" + content[match.end():]

    # 4. Add renderMatrix function
    matrix_code = """
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
      <div style={{ background: bg, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: `1px solid ${color}33` }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {renderQ('¡Hacer YA!', 'Urgente e Importante (<= 7 días)', qDo, '#ef4444', 'rgba(239,68,68,0.05)')}
        {renderQ('Planificar', 'Importante, No Urgente (> 7 días)', qSchedule, '#3b82f6', 'rgba(59,130,246,0.05)')}
        {renderQ('Resolver rápido', 'Urgente, No Importante (<= 7 días)', qDelegate, '#f59e0b', 'rgba(245,158,11,0.05)')}
        {renderQ('Para después', 'Ni Urgente ni Importante (> 7 días o sin fecha)', qEliminate, '#8b5cf6', 'rgba(139,92,246,0.05)')}
      </div>
    );
  };
"""
    return_idx2 = content.find('  return (\n    <div className="view-content fade-in">')
    content = content[:return_idx2] + matrix_code + content[return_idx2:]
    
    # 5. Inject renderMatrix in UI
    content = content.replace(
        "{filtered.length === 0 ? (",
        "{filter === 'matrix' ? renderMatrix() : filtered.length === 0 ? ("
    )

    with open('src/pages/Tasks.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Done")

if __name__ == '__main__':
    main()
