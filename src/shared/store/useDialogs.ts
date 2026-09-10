import { create } from 'zustand';

type DialogState = {
  toast: { text: string; type: 'success' | 'error' | 'info' } | null;
  confirmDialog: { title: string; onConfirm: () => void; onCancel: () => void } | null;
  promptDialog: { title: string; onConfirm: (val: string) => void; onCancel: () => void } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  showConfirm: (title: string) => Promise<boolean>;
  showPrompt: (title: string) => Promise<string | null>;
};

export const useDialogs = create<DialogState>((set) => ({
  toast: null,
  confirmDialog: null,
  promptDialog: null,
  showToast: (text, type = 'success') => {
    set({ toast: { text, type } });
    setTimeout(() => set({ toast: null }), 3500);
  },
  
  showPrompt: (title) => {
    return new Promise((resolve) => {
      set({
        promptDialog: {
          title,
          onConfirm: (val) => {
            set({ promptDialog: null });
            resolve(val);
          },
          onCancel: () => {
            set({ promptDialog: null });
            resolve(null);
          }
        }
      });
    });
  },
  showConfirm: (title) => {
    return new Promise((resolve) => {
      set({
        confirmDialog: {
          title,
          onConfirm: () => {
            set({ confirmDialog: null });
            resolve(true);
          },
          onCancel: () => {
            set({ confirmDialog: null });
            resolve(false);
          }
        }
      });
    });
  }
}));
