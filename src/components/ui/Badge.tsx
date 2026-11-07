import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider rounded-full border backdrop-blur-md transition-all duration-200';

  const variants = {
    primary: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 shadow-sm shadow-indigo-950/40',
    secondary: 'bg-[#C7F36B]/15 text-[#C7F36B] border-[#C7F36B]/30 shadow-sm shadow-[#C7F36B]/20',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-950/40',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-950/40',
    danger: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-950/40',
    neutral: 'bg-slate-800/60 text-slate-300 border-white/10'
  };

  const sizes = {
    sm: 'text-[10px] px-2.5 py-0.5 font-mono',
    md: 'text-xs px-3 py-1 font-medium'
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
