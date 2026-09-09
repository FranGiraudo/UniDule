import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ title, message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--bg)',
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              padding: '10px',
              borderRadius: '50%',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{title}</h3>
        </div>
        
        <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button 
            className="btn" 
            style={{ background: '#ef4444', color: '#fff', border: 'none' }}
            onClick={onConfirm}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
