import { Play, Pause, RotateCcw, BookOpen, CheckSquare } from 'lucide-react';
import { useStore } from '../shared/store/useStore';

export function Study() {

  const { pomodoro, setPomodoro, career, tasks } = useStore();
  const { timeLeft, isRunning, mode, subjectId, taskId } = pomodoro;
  const subjects = career?.subjects || [];
  const activeSubjects = subjects.filter(s => s.status === 'cursando');
  const subjectTasks = tasks.filter(t => t.subjectId === subjectId && !t.done);


  const modes = {
    pomodoro: { label: 'Pomodoro', duration: 25 * 60, color: 'var(--primary)' },
    shortBreak: { label: 'Descanso Corto', duration: 5 * 60, color: '#10b981' },
    longBreak: { label: 'Descanso Largo', duration: 15 * 60, color: '#3b82f6' },
  };

  const handleModeChange = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setPomodoro({
      mode: newMode,
      timeLeft: modes[newMode].duration,
      isRunning: false
    });
  };

  const toggleTimer = () => {
    if (!isRunning && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setPomodoro({ isRunning: !isRunning });
  };

  const resetTimer = () => {
    setPomodoro({
      isRunning: false,
      timeLeft: modes[mode].duration
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="view-content fade-in" style={{ animation: 'fadeUp 0.3s ease' }}>
      <header className="view-header">
        <div>
          <h2 className="view-title">Sesión de Estudio</h2>
          <p className="view-sub">Temporizador Pomodoro para enfocarte</p>
        </div>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>

      <div style={{ maxWidth: '600px', margin: '0 auto 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Subject Selector */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <BookOpen size={20} style={{ position: 'absolute', left: '16px', color: 'var(--text2)', pointerEvents: 'none' }} />
          <select 
            className="f-input" 
            value={subjectId || ''} 
            onChange={(e) => setPomodoro({ subjectId: e.target.value, taskId: '' })}
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
        
        {/* Task Selector (Only if subject is selected) */}
        {subjectId && (
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
              <option value="">¿Alguna tarea en específico? (Opcional)</option>
              {subjectTasks.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.type})</option>
              ))}
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
    </div>
  );
}
