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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md border border-indigo-600 hover:-translate-y-0.5',
    gradient: 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold shadow-sm hover:shadow-md border border-indigo-600 hover:-translate-y-0.5',
    secondary: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm hover:border-slate-300 hover:-translate-y-0.5',
    outline: 'bg-transparent hover:bg-indigo-50 text-indigo-600 border border-indigo-300 hover:border-indigo-600 hover:-translate-y-0.5',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-rose-600 hover:-translate-y-0.5',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900'
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
