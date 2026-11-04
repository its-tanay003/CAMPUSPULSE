import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const variants = {
    primary: 'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-lg shadow-[#6366F1]/25 hover:shadow-indigo-500/40 border border-indigo-400/30',
    gradient: 'bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white shadow-lg shadow-indigo-500/25 border border-white/20',
    secondary: 'bg-[#0D1326]/80 hover:bg-[#151D38] text-[#F8FAFC] border border-white/10 hover:border-white/20 shadow-sm backdrop-blur-md',
    outline: 'bg-transparent hover:bg-white/[0.04] text-[#06B6D4] border border-[#06B6D4]/40 hover:border-[#06B6D4] hover:shadow-sm hover:shadow-cyan-500/20',
    danger: 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-md shadow-rose-900/30 border border-rose-500/30',
    ghost: 'bg-transparent hover:bg-white/[0.06] text-[#94A3B8] hover:text-[#F8FAFC]'
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 min-h-[36px] gap-1.5 tracking-tight',
    md: 'text-xs sm:text-sm px-4.5 py-2.5 min-h-[44px] gap-2 tracking-tight',
    lg: 'text-sm sm:text-base px-6 py-3 min-h-[48px] gap-2.5 font-bold tracking-tight'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && (
        <span 
          aria-hidden="true" 
          className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" 
        />
      )}
      {children}
    </button>
  );
};

