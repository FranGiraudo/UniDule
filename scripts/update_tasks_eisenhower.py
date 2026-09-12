import re

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

# 3. Modify renderTask to accept an optional 'compact' param and remove map from filtered
render_task_start = """  const renderTask = (t: Task, compact = false) => {"""
content = content.replace(
    "          {filtered.map((t) => {",
    "          {filtered.map((t) => renderTask(t))}"
)

# Wait, `filtered.map` had a huge block inside it! I need to extract it into a separate function.
# Let's see the current render logic. 
