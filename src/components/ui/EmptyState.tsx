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
    <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-12 text-center shadow-lg max-w-lg mx-auto">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0B1020] border border-[#334155] flex items-center justify-center text-[#38BDF8] mb-4 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-[#F8FAFC]">{title}</h3>
      <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mt-2 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
