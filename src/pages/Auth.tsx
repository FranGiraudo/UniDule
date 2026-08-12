import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import { supabase } from '../shared/lib/supabase';
import { useStore } from '../shared/store/useStore';

export function Auth() {
  const session = useStore(state => state.session);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [planId, setPlanId] = useState('2026');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setFeedback({ text: 'Por favor, completá los datos', isError: true });

    setLoading(true);
    setFeedback(null);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setFeedback({ text: 'Registro exitoso. Iniciando sesión...', isError: false });

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        if (signInData.session) {
          await supabase.from('user_profiles').update({ plan_id: planId }).eq('id', signInData.session.user.id);
        }
      }
    } catch (error: any) {
      setFeedback({ text: `Error: ${error.message}`, isError: true });
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      background: 'radial-gradient(circle at top right, var(--bg2), var(--bg))',
    }}>
      <div style={{
        background: 'var(--card2)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        padding: '2.5rem 2rem', borderRadius: '24px', boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
        width: '100%', maxWidth: '420px', textAlign: 'center', border: '1px solid var(--border2)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px',
          borderRadius: '24px', marginBottom: '1rem', boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
          background: 'linear-gradient(270deg, var(--primary), var(--text2), var(--primary))',
          backgroundSize: '200% 200%', animation: 'gradFlow 3s ease infinite', color: 'var(--bg)',
        }}>
          <GraduationCap size={40} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem', color: 'var(--text)' }}>UniDule</h1>
        <p style={{ color: 'var(--text2)', marginBottom: '2rem', fontSize: '0.95rem', fontWeight: 500 }}>Tu gestor académico personal</p>

        <div style={{
          position: 'relative', display: 'flex', background: 'var(--card)', borderRadius: '12px', padding: '4px',
          marginBottom: '1.5rem', border: '1px solid var(--border)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            position: 'absolute', top: '4px', bottom: '4px', left: '4px', width: 'calc(50% - 4px)',
            background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: mode === 'register' ? 'translateX(100%)' : 'translateX(0)', zIndex: 0,
          }} />
          <button type="button" onClick={() => setMode('login')} style={{
            flex: 1, position: 'relative', zIndex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: 600,
            background: 'transparent', color: mode === 'login' ? 'var(--text)' : 'var(--text2)', border: 'none',
            cursor: 'pointer', transition: 'color 0.3s',
          }}>Iniciar Sesión</button>
          <button type="button" onClick={() => setMode('register')} style={{
            flex: 1, position: 'relative', zIndex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: 600,
            background: 'transparent', color: mode === 'register' ? 'var(--text)' : 'var(--text2)', border: 'none',
            cursor: 'pointer', transition: 'color 0.3s',
          }}>Crear Cuenta</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <label className="f-label" style={{ fontSize: '0.85rem', textTransform: 'none', letterSpacing: 'normal' }}>Correo Electrónico</label>
            <input
              type="email" className="f-input" placeholder="alumno@iua.edu.ar"
              style={{ padding: '0.875rem 1rem', borderRadius: '12px', fontSize: '1rem' }}
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>

          <div style={{ textAlign: 'left', marginBottom: mode === 'register' ? '1rem' : '1.5rem', position: 'relative' }}>
            <label className="f-label" style={{ fontSize: '0.85rem', textTransform: 'none', letterSpacing: 'normal' }}>Contraseña</label>
            <input
              type={showPassword ? 'text' : 'password'} className="f-input" placeholder="••••••••"
              style={{ padding: '0.875rem 2.5rem 0.875rem 1rem', borderRadius: '12px', fontSize: '1rem' }}
              value={password} onChange={e => setPassword(e.target.value)} required
            />
            <button
              type="button" onClick={() => setShowPassword(v => !v)}
              style={{ position: 'absolute', right: '12px', top: '34px', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: '4px', display: 'flex' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {mode === 'register' && (
            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <label className="f-label" style={{ fontSize: '0.85rem', textTransform: 'none', letterSpacing: 'normal' }}>Plan de Estudio</label>
              <select className="f-input" style={{ padding: '0.875rem 1rem', borderRadius: '12px', fontSize: '1rem' }} value={planId} onChange={e => setPlanId(e.target.value)}>
                <option value="2026">Plan 2026 (Ing. Informática IUA)</option>
                <option value="2016">Plan 2016 (Ing. Informática IUA)</option>
                <option value="unc-derecho">Plan 2000 (Abogacía UNC)</option>
              </select>
            </div>
          )}

          {feedback && (
            <div style={{
              color: feedback.isError ? '#ef4444' : '#3b82f6', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center',
              fontWeight: 600, background: feedback.isError ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)', padding: '0.75rem', borderRadius: '8px',
            }}>
              {feedback.text}
            </div>
          )}

          <button
            type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
