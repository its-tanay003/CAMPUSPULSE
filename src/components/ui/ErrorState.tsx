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
    <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-md">
      <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-200">{title}</h3>
      <p className="text-xs text-rose-300/80 mt-1.5 leading-relaxed">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="danger" size="sm" onClick={onRetry} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Action
          </Button>
        </div>
      )}
    </div>
  );
};
