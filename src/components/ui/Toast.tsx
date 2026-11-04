import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  type?: 'success' | 'warning' | 'error';
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'success',
  message,
  onClose
}) => {
  const configs = {
    success: {
      bg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
    },
    warning: {
      bg: 'bg-amber-950/80 border-amber-500/40 text-amber-200 shadow-amber-950/50',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
    },
    error: {
      bg: 'bg-rose-950/80 border-rose-500/40 text-rose-200 shadow-rose-950/50',
      icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
    }
  };

  const current = configs[type];

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl text-xs sm:text-sm font-medium ${current.bg} animate-slideUp max-w-[90vw]`}
    >
      {current.icon}
      <span>{message}</span>
      <button 
        onClick={onClose} 
        aria-label="Dismiss toast" 
        className="ml-2 p-1 min-w-[32px] min-h-[32px] flex items-center justify-center text-white/60 hover:text-white rounded-lg transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

