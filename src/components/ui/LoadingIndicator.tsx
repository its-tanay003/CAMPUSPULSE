import React from 'react';

export interface LoadingIndicatorProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  label = 'Loading campus records...',
  size = 'md'
}) => {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2.5',
    lg: 'w-12 h-12 border-3'
  };

  return (
    <div 
      role="status" 
      aria-live="polite" 
      className="flex flex-col items-center justify-center p-12 gap-4 text-slate-400"
    >
      <div className="relative">
        <div
          className={`${sizeMap[size]} border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin`}
          aria-hidden="true"
        />
        <div 
          className="absolute inset-0 rounded-full blur-md bg-indigo-500/20 animate-pulse pointer-events-none"
          aria-hidden="true"
        />
      </div>
      {label && <p className="text-xs sm:text-sm font-medium text-slate-300 tracking-tight">{label}</p>}
      <span className="sr-only">{label}</span>
    </div>
  );
};

