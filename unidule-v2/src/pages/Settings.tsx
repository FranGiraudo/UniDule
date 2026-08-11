import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { THEMES } from '../providers/ThemeProvider';
import type { ThemeType } from '../types';
import { User, BookOpen, Share2, Database, Shield, LogOut, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import { PlanSimulationModal } from '../components/career/PlanSimulationModal';

export function Settings() {
  const { session, profile, theme, setTheme, career, tasks, schedule_classes } = useStore();
  const [showSim, setShowSim] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleThemeChange = async (newTheme: ThemeType) => {
    setTheme(newTheme);
    if (session && profile) {
      await supabase
        .from('user_profiles')
        .update({ theme: newTheme })
        .eq('id', session.user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        showToast('Datos importados correctamente.');
      } catch (err) {
        showToast('El archivo no es un JSON válido.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportData = () => {
    const dataToExport = { career, tasks, schedule_classes };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unidule_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateCode = async () => {
    const dataToExport = { career, tasks, schedule_classes };
    const jsonStr = JSON.stringify(dataToExport);
    try {
      const code = btoa(encodeURIComponent(jsonStr));
      await navigator.clipboard.writeText(code);
      showToast('¡Código generado y copiado al portapapeles!');
    } catch (e) {
      showToast('Error generando el código.', 'error');
    }
  };

  const handleInputCode = () => {
    const code = prompt('Pegá el código que te compartieron aquí:');
    if (!code) return;
    try {
      const decodedStr = decodeURIComponent(atob(code));
      const data = JSON.parse(decodedStr);
      showToast('¡Código leído correctamente!');
    } catch (e) {
      showToast('El código ingresado no es válido.', 'error');
    }
  };

  return (
    <div className="view-content fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="view-header">
        <div>
          <h2>Configuración & Perfil</h2>
          <p className="subtitle">Administra tus datos, preferencias y planes de estudio</p>
        </div>
      </header>

      <div style={{ maxWidth: '700px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
        
        {/* PERFIL */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} style={{ color: 'var(--primary)' }} /> Perfil
          </h3>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>Nombre</label>
              <div className="f-input" style={{ padding: '0.75rem', background: 'var(--bg)', borderRadius: '8px', color: 'var(--text)' }}>
                {profile?.name || 'Estudiante'}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>Carrera</label>
              <div className="f-input" style={{ padding: '0.75rem', background: 'var(--bg)', borderRadius: '8px', color: 'var(--text)' }}>
                {profile?.career || 'Ingeniería en Informática — IUA'}
              </div>
            </div>
          </div>
        </div>

        {/* PLAN DE ESTUDIO */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} style={{ color: 'var(--primary)' }} /> Plan de Estudio
          </h3>
          
          <div className="card" style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', padding: '1rem', marginBottom: '1.25rem', borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)' }}>
            <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>Plan {profile?.plan_id || '2016'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>Este es tu plan de estudios activo actualmente.</div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Simular Cambio de Plan</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '1rem' }}>
              Comprueba qué materias te tomarían como equivalencias si decidís pasarte al nuevo Plan 2026.
            </p>
            <button className="btn btn-ghost" onClick={() => setShowSim(true)}>Simular Cambio</button>
          </div>
        </div>

        {/* APARIENCIA */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
            Apariencia (Tema)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '1rem' }}>El tema cambiará instantáneamente y se guardará en tu cuenta.</p>
          <select
            value={theme}
            onChange={(e) => handleThemeChange(e.target.value as ThemeType)}
            className="f-input"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}
          >
            {Object.entries(THEMES).map(([key, t]) => (
              <option key={key} value={key}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* COMPARTIR */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={20} style={{ color: 'var(--primary)' }} /> Compartir Horario
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '1rem' }}>
            Compartí tu grilla de horarios con compañeros, o pegá un código que te hayan pasado para no cargar todo a mano.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleGenerateCode}>Generar Código</button>
            <button className="btn btn-ghost" onClick={handleInputCode}>Ingresar Código</button>
          </div>
        </div>

        {/* DATOS Y CUENTA */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} style={{ color: 'var(--primary)' }} /> Datos y Respaldo
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '1rem' }}>
            Sincronización en la nube activa.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
            <button className="btn btn-ghost" onClick={handleExportData}>Exportar mis datos (JSON)</button>
            <input type="file" accept=".json" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
            <button className="btn btn-ghost" onClick={handleImportClick}>
              <Upload size={16} style={{ marginRight: '6px' }} /> Importar desde JSON
            </button>
          </div>
          
          <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <Shield size={20} style={{ color: 'var(--primary)' }} /> Cuenta
          </h3>
          <button className="btn btn-ghost" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={handleLogout}>
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>

      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#ef4444' : 'var(--primary)',
          color: toast.type === 'error' ? '#fff' : 'var(--bg)',
          padding: '0.75rem 1.25rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 9999, animation: 'fadeUp 0.3s ease'
        }}>
          {toast.text}
        </div>
      )}

      {showSim && <PlanSimulationModal onClose={() => setShowSim(false)} />}
    </div>
  );
}
