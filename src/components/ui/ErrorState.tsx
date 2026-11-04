import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Failed to retrieve requested campus data. Please check connection and try again.',
  onRetry
}) => {
  return (
    <div className="glass-card bg-rose-950/20 border-rose-500/30 rounded-3xl p-8 sm:p-10 text-center max-w-lg mx-auto shadow-2xl shadow-rose-950/40">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-rose-200 tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-rose-300/80 mt-2 leading-relaxed">{message}</p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="danger" size="md" onClick={onRetry} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Retry Action
          </Button>
        </div>
      )}
    </div>
  );
};

