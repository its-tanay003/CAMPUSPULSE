import React from 'react';
import { LucideIcon, Search } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Search,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="glass-card rounded-3xl p-10 sm:p-14 text-center max-w-lg mx-auto glow-indigo">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 mb-5 shadow-lg shadow-indigo-950/50">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-extrabold text-white tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-7">
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

