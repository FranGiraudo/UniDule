import re

def update_study(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Imports
    content = content.replace(
        "import { Play, Pause, RotateCcw, BookOpen, CheckSquare } from 'lucide-react';",
        "import { Play, Pause, RotateCcw, BookOpen, CheckSquare, Settings2, Volume2, BellOff, GraduationCap, X } from 'lucide-react';\nimport { useState, useEffect, useRef } from 'react';"
    )

    # 2. Add useStore deps
    content = content.replace(
        "const { pomodoro, setPomodoro, career, tasks } = useStore();",
        "const { pomodoro, setPomodoro, career, tasks, settings, setSettings } = useStore();\n  const [showSettings, setShowSettings] = useState(false);\n  const audioRef = useRef<HTMLAudioElement>(null);"
    )
    content = content.replace(
        "const { timeLeft, isRunning, mode, subjectId, taskId } = pomodoro;",
        "const { timeLeft, isRunning, mode, subjectId, taskId, examId } = pomodoro;"
    )

    # 3. Add activeSubject and Exams
    content = content.replace(
        "const subjectTasks = tasks.filter(t => t.subjectId === subjectId && !t.done);",
        "const subjectTasks = tasks.filter(t => t.subjectId === subjectId && !t.done);\n  const activeSubject = subjects.find(s => s.id === subjectId);\n  const subjectExams = activeSubject?.grades?.filter(g => g.type.toLowerCase().includes('parcial') || g.type.toLowerCase().includes('final')) || [];"
    )

    # 4. Use settings for modes
    content = content.replace(
        "duration: 25 * 60", "duration: settings.pomodoroTime * 60"
    ).replace(
        "duration: 5 * 60", "duration: settings.shortBreakTime * 60"
    ).replace(
        "duration: 15 * 60", "duration: settings.longBreakTime * 60"
    )

    # 5. Handle Audio Play/Pause based on isRunning & ambientSound
    audio_effect = """
  useEffect(() => {
    if (audioRef.current) {
      if (isRunning && settings.ambientSound !== 'none') {
        audioRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isRunning, settings.ambientSound]);
"""
    content = content.replace("const handleModeChange", audio_effect + "\n  const handleModeChange")

    # 6. DND Mode support
    # We add a class to body when isRunning && dndMode
    dnd_effect = """
  useEffect(() => {
    if (settings.dndMode && isRunning) {
      document.body.classList.add('dnd-active');
    } else {
      document.body.classList.remove('dnd-active');
    }
    return () => document.body.classList.remove('dnd-active');
  }, [settings.dndMode, isRunning]);
"""
    content = content.replace("const handleModeChange", dnd_effect + "\n  const handleModeChange")

    # 7. Add Exam selector right below Task selector
    task_sel = """{subjectTasks.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.type})</option>
              ))}
            </select>
          </div>
        )}"""
    
    exam_sel = """{subjectTasks.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.type})</option>
              ))}
            </select>
          </div>
        )}

        {/* Exam Selector */}
        {subjectId && subjectExams.length > 0 && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', animation: 'fadeUp 0.2s ease', marginTop: '16px' }}>
            <GraduationCap size={20} style={{ position: 'absolute', left: '16px', color: 'var(--text2)', pointerEvents: 'none' }} />
            <select 
              className="f-input" 
              value={examId || ''} 
              onChange={(e) => setPomodoro({ examId: e.target.value })}
              disabled={isRunning}
              style={{ 
                width: '100%', 
                cursor: isRunning ? 'not-allowed' : 'pointer', 
                paddingLeft: '48px',
                paddingTop: '12px',
                paddingBottom: '12px',
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: '12px',
                opacity: isRunning ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <option value="">¿Estudiando para algún examen? (Opcional)</option>
              {subjectExams.map(g => (
                <option key={g.id} value={g.id}>{g.type} - {g.date || 'Sin fecha'}</option>
              ))}
            </select>
          </div>
        )}"""
    content = content.replace(task_sel, exam_sel)

    # 8. Add Settings Button to Header & Settings Modal
    header_old = """      <header className="view-header">
        <div>
          <h2 className="view-title">Sesión de Estudio</h2>
          <p className="view-sub">Temporizador Pomodoro para enfocarte</p>
        </div>
      </header>"""

    header_new = """      <header className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="view-title">Sesión de Estudio</h2>
          <p className="view-sub">Temporizador Pomodoro para enfocarte</p>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="btn" 
          style={{ padding: '8px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text2)' }}
        >
          <Settings2 size={20} />
        </button>
      </header>"""
    content = content.replace(header_old, header_new)

    # Sound map
    sound_map = "const SOUNDS = [{ id: 'none', label: 'Sin sonido' }, { id: 'rain', label: 'Lluvia', url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=heavy-rain-nature-sounds-8186.mp3' }, { id: 'white', label: 'Ruido Blanco', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2fc27a419c.mp3?filename=white-noise-8117.mp3' }];\n"
    
    settings_modal = """
      {/* Settings Modal */}
      {showSettings && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '400px', padding: '24px', background: 'var(--bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Ajustes del Pomodoro</h3>
              <button onClick={() => setShowSettings(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text2)' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text2)', marginBottom: '8px' }}>POMODORO (min)</label>
                <input type="number" className="f-input" value={settings.pomodoroTime} onChange={(e) => setSettings({ pomodoroTime: Number(e.target.value) })} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text2)', marginBottom: '8px' }}>DESCANSO CORTO</label>
                  <input type="number" className="f-input" value={settings.shortBreakTime} onChange={(e) => setSettings({ shortBreakTime: Number(e.target.value) })} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text2)', marginBottom: '8px' }}>DESCANSO LARGO</label>
                  <input type="number" className="f-input" value={settings.longBreakTime} onChange={(e) => setSettings({ longBreakTime: Number(e.target.value) })} />
                </div>
              </div>
              
              <div style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text2)', marginBottom: '8px' }}>SONIDO AMBIENTE</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {SOUNDS.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => setSettings({ ambientSound: s.id })}
                      style={{ 
                        padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: '1px solid var(--border)',
                        background: settings.ambientSound === s.id ? 'var(--primary)' : 'var(--bg2)',
                        color: settings.ambientSound === s.id ? '#fff' : 'var(--text)'
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BellOff size={16} /> Modo "Do Not Disturb"
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Ocultar menú durante el enfoque</div>
                </div>
                <button 
                  onClick={() => setSettings({ dndMode: !settings.dndMode })}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px', background: settings.dndMode ? 'var(--primary)' : 'var(--border)',
                    position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ 
                    position: 'absolute', top: '2px', left: settings.dndMode ? '22px' : '2px', 
                    width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'all 0.2s' 
                  }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <audio 
        ref={audioRef} 
        src={SOUNDS.find(s => s.id === settings.ambientSound)?.url || ''} 
        loop 
        preload="auto"
      />
    </div>
  );
}"""
    content = content.replace("export function Study() {", sound_map + "\nexport function Study() {")
    content = content.replace("    </div>\n  );\n}", settings_modal)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_study('/home/frangiraudo/Proyectos/UniDule/src/pages/Study.tsx')
