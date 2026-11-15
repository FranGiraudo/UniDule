import { Play, Pause, RotateCcw, BookOpen, CheckSquare, Settings2, BellOff, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../shared/store/useStore';
import { ambientAudio } from '../shared/lib/audioGenerator';
import { formatDate } from '../shared/lib/utils';

const SOUNDS = [
  { id: 'none', label: 'Sin sonido' },
  { id: 'rain', label: 'Lluvia Suave' },
  { id: 'white', label: 'Ruido Blanco' }
];

export function Study() {

  const { pomodoro, setPomodoro, career, tasks, settings, setSettings } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const { timeLeft, isRunning, mode, subjectId, taskId } = pomodoro;
  const subjects = career?.subjects || [];
  const activeSubjects = subjects.filter(s => s.status === 'cursando' || s.status === 'regular');
  const subjectTasks = tasks.filter(t => t.subjectId === subjectId && !t.done);
  const activeSubject = subjects.find(s => s.id === subjectId);
  const isExam = (t: { type: string; title: string }) =>
    t.type === 'Parcial' ||
    t.type === 'Final' ||
    t.title.toLowerCase().includes('parcial') ||
    t.title.toLowerCase().includes('final');
  const examTasks = subjectTasks.filter(isExam);
  const regularTasks = subjectTasks.filter(t => !isExam(t));
  const unlinkedGrades = (activeSubject?.grades || []).filter(
    (g) =>
      (g.type.toLowerCase().includes('parcial') || g.type.toLowerCase().includes('final')) &&
      !tasks.some((t) => t.gradeId === g.id || (t.subjectId === subjectId && t.title.toLowerCase() === g.type.toLowerCase()))
  );


  const modes = {
    pomodoro: { label: 'Pomodoro', duration: settings.pomodoroTime * 60, color: 'var(--primary)' },
    shortBreak: { label: 'Descanso Corto', duration: settings.shortBreakTime * 60, color: '#10b981' },
    longBreak: { label: 'Descanso Largo', duration: settings.longBreakTime * 60, color: '#3b82f6' },
  };

  
  useEffect(() => {
    if (isRunning && settings.ambientSound !== 'none') {
      ambientAudio.play(settings.ambientSound as any);
    } else {
      ambientAudio.stop();
    }
    return () => ambientAudio.stop();
  }, [isRunning, settings.ambientSound]);

  
  useEffect(() => {
    if (settings.dndMode && isRunning) {
      document.body.classList.add('dnd-active');
    } else {
      document.body.classList.remove('dnd-active');
    }
    return () => document.body.classList.remove('dnd-active');
  }, [settings.dndMode, isRunning]);

  const handleModeChange = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setPomodoro({
      mode: newMode,
      timeLeft: modes[newMode].duration,
      isRunning: false,
      endTime: null,
    });
  };

  const toggleTimer = () => {
    if (!isRunning) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      ambientAudio.unlock();
      const duration = timeLeft > 0 ? timeLeft : modes[mode].duration;
      setPomodoro({
        isRunning: true,
        timeLeft: duration,
        endTime: Date.now() + duration * 1000,
      });
    } else {
      const targetEnd = pomodoro.endTime || Date.now() + timeLeft * 1000;
      const remaining = Math.max(0, Math.ceil((targetEnd - Date.now()) / 1000));
      setPomodoro({
        isRunning: false,
        timeLeft: remaining,
        endTime: null,
      });
    }
  };

  const resetTimer = () => {
    setPomodoro({
      isRunning: false,
      timeLeft: modes[mode].duration,
      endTime: null,
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="view-content fade-in" style={{ animation: 'fadeUp 0.3s ease' }}>
      <header className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>

      <div style={{ maxWidth: '600px', margin: '0 auto 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Subject Selector */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <BookOpen size={20} style={{ position: 'absolute', left: '16px', color: 'var(--text2)', pointerEvents: 'none' }} />
          <select 
            className="f-input" 
            value={subjectId || ''} 
            onChange={(e) => setPomodoro({ subjectId: e.target.value, taskId: '', examId: undefined })}
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
            <option value="">¿Qué vas a estudiar hoy? (Materia)</option>
            {activeSubjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        
        {/* Unified Task & Exam Selector */}
        {subjectId && (subjectTasks.length > 0 || unlinkedGrades.length > 0) && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', animation: 'fadeUp 0.2s ease' }}>
            <CheckSquare size={20} style={{ position: 'absolute', left: '16px', color: 'var(--text2)', pointerEvents: 'none' }} />
            <select 
              className="f-input" 
              value={taskId || ''} 
              onChange={(e) => setPomodoro({ taskId: e.target.value })}
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
              <option value="">¿Algún examen o tarea específica? (Opcional)</option>
              {(examTasks.length > 0 || unlinkedGrades.length > 0) && (
                <optgroup label="Exámenes y Parciales">
                  {examTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} {t.dueDate ? `— ${formatDate(t.dueDate)}` : ''}
                    </option>
                  ))}
                  {unlinkedGrades.map((g) => (
                    <option key={`grade:${g.id}`} value={`grade:${g.id}`}>
                      {g.type} {g.date ? `— ${formatDate(g.date)}` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
              {regularTasks.length > 0 && (
                <optgroup label="Tareas y Trabajos Prácticos">
                  {regularTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} {t.dueDate ? `— ${formatDate(t.dueDate)}` : `(${t.type})`}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        )}
      </div>

        {/* Selector de Modo */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '32px',
            background: 'var(--card2)',
            padding: '8px',
            borderRadius: '16px',
            flexWrap: 'wrap'
          }}
        >
          {(Object.keys(modes) as Array<keyof typeof modes>).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              style={{
                flex: 1,
                minWidth: '100px',
                padding: '10px 16px',
                border: 'none',
                borderRadius: '10px',
                background: mode === m ? modes[m].color + '22' : 'transparent',
                color: mode === m ? modes[m].color : 'var(--text2)',
                fontWeight: mode === m ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {modes[m].label}
            </button>
          ))}
        </div>

        {/* Círculo del Timer */}
        <div
          style={{
            position: 'relative',
            width: '280px',
            height: '280px',
            margin: '0 auto 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'var(--card2)',
            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.1)',
            border: `4px solid ${modes[mode].color}33`,
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 900,
              fontVariantNumeric: 'tabular-nums',
              color: modes[mode].color,
              letterSpacing: '-2px',
            }}
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Controles */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button
            onClick={toggleTimer}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isRunning ? 'var(--card2)' : modes[mode].color,
              color: isRunning ? 'var(--text)' : '#fff',
              border: isRunning ? '2px solid var(--border)' : 'none',
              cursor: 'pointer'
            }}
          >
            {isRunning ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: '4px' }} />}
          </button>
          <button
            onClick={resetTimer}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--card2)',
              color: 'var(--text2)',
              border: '2px solid var(--border)',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={28} />
          </button>
        </div>
      </div>

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

    </div>
  );
}
