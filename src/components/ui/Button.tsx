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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7F36B] disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.97] cursor-pointer';

  const variants = {
    primary: 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 border border-indigo-400/40 hover:-translate-y-0.5',
    gradient: 'bg-gradient-to-r from-indigo-500 via-purple-600 to-[#C7F36B] hover:opacity-95 text-slate-950 font-black shadow-lg shadow-indigo-600/25 border border-white/20 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(199,243,107,0.4)]',
    secondary: 'bg-[#11182B]/90 hover:bg-[#18223C] text-[#F8FAFC] border border-white/10 hover:border-white/25 shadow-sm backdrop-blur-md hover:-translate-y-0.5',
    outline: 'bg-transparent hover:bg-white/[0.04] text-[#C7F36B] border border-[#C7F36B]/40 hover:border-[#C7F36B] hover:shadow-sm hover:shadow-[#C7F36B]/25 hover:-translate-y-0.5',
    danger: 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-md shadow-rose-900/40 border border-rose-500/30 hover:-translate-y-0.5',
    ghost: 'bg-transparent hover:bg-white/[0.08] text-slate-400 hover:text-white'
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
