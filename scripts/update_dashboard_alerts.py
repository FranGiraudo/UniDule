import re

with open('src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Insert expiringSubs definition after warnSubs
warn_subs_block = "  const warn = warnSubs.length;"
expiring_subs_block = """  const warn = warnSubs.length;

  const expiringSubs = subjects.filter((s) => {
    if (s.status !== 'regular' || !s.expDate) return false;
    const d = daysUntil(s.expDate);
    return d !== null && d >= 0 && d <= 90;
  });
  const warnExpiring = expiringSubs.length;"""

text = text.replace(warn_subs_block, expiring_subs_block)

# Insert UI for expiringSubs in the Alertas card
# Find the warnSubs.map block
warn_subs_ui = """                  {warnSubs.map((s) => (
                    <div key={s.id} style={{ fontSize: '10px', marginTop: '2px' }}>
                      • <strong>{s.name}</strong> ({s.absences}/{s.maxAbsences} faltas)
                    </div>
                  ))}"""

expiring_subs_ui = warn_subs_ui + """
                  
                  {warnExpiring > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '11px',
                          marginBottom: '4px',
                          color: '#f87171',
                        }}
                      >
                        Vencimientos (próximos 90 días):
                      </div>
                      {expiringSubs.map((s) => (
                        <div key={s.id} style={{ fontSize: '10px', marginTop: '2px' }}>
                          • <strong>{s.name}</strong> (vence en {daysUntil(s.expDate)}d)
                        </div>
                      ))}
                    </div>
                  )}"""

text = text.replace(warn_subs_ui, expiring_subs_ui)

# Update the "Sin alertas" text to check both
sin_alertas_old = """              ) : (
                <div style={{ fontWeight: 700, fontSize: '10px', color: '#4ade80' }}>
                  Sin alertas de ausencias
                </div>
              )}"""

# We need to wrap the whole condition in `warn > 0 || warnExpiring > 0`
# Let's see the context
#                 {warn > 0 ? (
#                   <>
# ...
#                   </>
#                 ) : (

text = text.replace("{warn > 0 ? (", "{(warn > 0 || warnExpiring > 0) ? (")

sin_alertas_new = """              ) : (
                <div style={{ fontWeight: 700, fontSize: '10px', color: '#4ade80' }}>
                  Sin alertas pendientes
                </div>
              )}"""

text = text.replace(sin_alertas_old, sin_alertas_new)

with open('src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
