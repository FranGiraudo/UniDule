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
        <div className={`toast toast-${toast.type}`}>
          {toast.text}
        </div>
      )}
      
      
      {promptDialog && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '300px', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text)' }}>{promptDialog.title}</h3>
            <input 
              type="text" 
              value={promptValue} 
              onChange={e => setPromptValue(e.target.value)} 
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }} 
              autoFocus
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => { setPromptValue(''); promptDialog.onCancel(); }}>Cancelar</button>
              <button className="btn-primary" onClick={() => { promptDialog.onConfirm(promptValue); setPromptValue(''); }}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '300px', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text)' }}>Confirmar</h3>
            <p style={{ margin: '1rem 0', color: 'var(--text2)' }}>{confirmDialog.title}</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={confirmDialog.onCancel}>Cancelar</button>
              <button className="btn-primary" onClick={confirmDialog.onConfirm}>Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
