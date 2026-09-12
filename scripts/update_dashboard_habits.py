import re

with open('src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Separate todayClasses
text = text.replace(
    "const todayClasses = td ? getBlocksForDay(td) : [];",
    "const todayClasses = td ? getBlocksForDay(td) : [];\n  const academicClasses = todayClasses.filter(b => !b.s.isEvent);\n  const dailyHabits = todayClasses.filter(b => b.s.isEvent);"
)

# Update "Clases de Hoy" mapping
# Find the map call for todayClasses
text = text.replace(
    "{todayClasses.map(({ s, sc }, i) => {",
    "{academicClasses.map(({ s, sc }, i) => {"
)

# Insert Hábitos card before Próximas Entregas
# Find "Próximas Entregas" card
prox_entregas_marker = """          {/* Próximas Entregas */}
          <div
            className="card\""""

habits_card = """          {/* Hábitos Diarios */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="section-header">
              <h3 className="section-title-sm">
                Hábitos y Rutinas
              </h3>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                flex: 1,
                overflowY: 'auto',
              }}
            >
              {dailyHabits.length === 0 ? (
                <div style={{ color: 'var(--text2)', fontSize: '11px', textAlign: 'center', marginTop: '16px' }}>
                  No tienes rutinas para hoy.
                </div>
              ) : (
                dailyHabits.map(({ s, sc }, i) => {
                  const isCompleted = eventCompletions.some(c => c.event_id === sc.id && c.date_str === getTodayStr());
                  return (
                    <div
                      key={i}
                      className="today-row"
                      style={{
                        opacity: isCompleted ? 0.5 : 1,
                        borderLeft: `3px solid ${s.color || 'var(--primary)'}`,
                        cursor: 'pointer',
                        padding: '10px 12px',
                        background: 'var(--bg)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onClick={() => handleToggleEvent(sc.id, isCompleted)}
                    >
                      <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                        {isCompleted ? <CheckCircle2 size={18} color="var(--primary)" /> : <Circle size={18} color="var(--text2)" />}
                      </div>
                      <div style={{ flex: 1, textDecoration: isCompleted ? 'line-through' : 'none' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{s.name}</div>
                        {sc.startTime && sc.endTime && (
                          <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '2px' }}>
                            {sc.startTime}–{sc.endTime} · {sc.type}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

"""

text = text.replace(prox_entregas_marker, habits_card + prox_entregas_marker)

# We need to make sure dash-bottom-grid handles 3 columns nicely or they wrap nicely.
# We can just leave it to wrap. But let's check how many cards there are. 
# There's Clases de Hoy, Próximas Entregas. We added Hábitos. That's 3 cards. 
# In a `1.5fr 1fr` grid, the third card takes the whole next row. 
# It would look better if dash-bottom-grid was `repeat(auto-fit, minmax(300px, 1fr))`

with open('src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
