import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1020]/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        className="w-full max-w-lg bg-[#151C2F] border border-[#334155] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 animate-scaleUp"
      >
        <div className="flex items-start justify-between border-b border-[#334155] pb-3">
          <div>
            <h2 id="dialog-title" className="text-lg font-bold text-[#F8FAFC]">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-[#94A3B8] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-[#F8FAFC]">{children}</div>
      </div>
    </div>
  );
};
