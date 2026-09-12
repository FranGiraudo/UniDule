import { useState } from 'react';
import { useDialogs } from '../../store/useDialogs';

export function GlobalDialogs() {
  const toast = useDialogs((s) => s.toast);
  const confirmDialog = useDialogs((s) => s.confirmDialog);
  const promptDialog = useDialogs((s) => s.promptDialog);
  const [promptValue, setPromptValue] = useState('');

  return (
    <>
            {toast && (
        <div className={`toast toast-${toast.type} fade-in`}>
          {toast.text}
        </div>
      )}
      
      
            {promptDialog && (
        <div className="modal-bd fade-in">
          <div className="modal-box modal-sm" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text)' }}>{promptDialog.title}</h3>
            <input 
              type="text" 
              value={promptValue} 
              onChange={e => setPromptValue(e.target.value)} 
              style={{ width: '100%', marginBottom: '1.5rem', padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px' }} 
              autoFocus
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => { setPromptValue(''); promptDialog.onCancel(); }}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => { promptDialog.onConfirm(promptValue); setPromptValue(''); }}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="modal-bd fade-in">
          <div className="modal-box modal-sm" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text)' }}>Confirmar</h3>
            <p style={{ margin: '1rem 0', color: 'var(--text2)' }}>{confirmDialog.title}</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={confirmDialog.onCancel}>Cancelar</button>
              <button className="btn btn-primary" style={{ background: '#ef4444' }} onClick={confirmDialog.onConfirm}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
