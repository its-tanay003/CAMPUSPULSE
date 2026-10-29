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
  const baseStyles = 'inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded-full border';

  const variants = {
    primary: 'bg-[#7C5CFC]/20 text-[#38BDF8] border-[#7C5CFC]/30',
    secondary: 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    neutral: 'bg-[#0B1020] text-[#94A3B8] border-[#334155]'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
