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
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-[#94A3B8]">
      <div
        className={`${sizeMap[size]} border-[#7C5CFC] border-t-transparent rounded-full animate-spin`}
      />
      {label && <p className="text-xs font-semibold">{label}</p>}
    </div>
  );
};

