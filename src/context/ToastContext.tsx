import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast: Toast = { id, type, title, message, duration };
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map(toast => {
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
          let border = 'border-emerald-200 dark:border-emerald-800/60';
          let bg = 'bg-white dark:bg-slate-900';

          if (toast.type === 'error') {
            icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
            border = 'border-rose-200 dark:border-rose-800/60';
          } else if (toast.type === 'warning') {
            icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
            border = 'border-amber-200 dark:border-amber-800/60';
          } else if (toast.type === 'info') {
            icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;
            border = 'border-blue-200 dark:border-blue-800/60';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border ${border} ${bg} text-slate-800 dark:text-slate-100 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2`}
            >
              {icon}
              <div className="flex-1 text-sm">
                <p className="font-semibold text-slate-900 dark:text-white leading-tight">{toast.title}</p>
                {toast.message && <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
