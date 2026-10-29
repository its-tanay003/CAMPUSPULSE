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
      bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-950/90 border-amber-500/50 text-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
    },
    error: {
      bg: 'bg-rose-950/90 border-rose-500/50 text-rose-200',
      icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
    }
  };

  const current = configs[type];

  return (
    <aside
      aria-label="Notification alert"
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2.5 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-semibold ${current.bg} animate-slideUp`}
    >
      {current.icon}
      <span>{message}</span>
      <button onClick={onClose} aria-label="Dismiss toast" className="ml-2 text-white/60 hover:text-white">
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};

