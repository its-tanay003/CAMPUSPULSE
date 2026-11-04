import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rectangular' 
}) => {
  const baseClasses = 'animate-pulse bg-white/[0.06] border border-white/5';
  
  const variantClasses = {
    text: 'h-4 rounded-md',
    rectangular: 'rounded-2xl',
    circular: 'rounded-full'
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
};

export const EventCardSkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-3xl p-4 border border-white/10 space-y-4">
      <Skeleton className="w-full h-48 rounded-2xl" />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="w-20 h-5 rounded-full" />
          <Skeleton className="w-16 h-4" />
        </div>
        <Skeleton className="w-3/4 h-6 rounded-lg" />
        <Skeleton className="w-full h-4 rounded-md" />
      </div>
      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-20 h-8 rounded-xl" />
      </div>
    </div>
  );
};

