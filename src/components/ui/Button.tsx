import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
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
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[#7C5CFC] hover:bg-[#6B46E5] text-white shadow-md hover:shadow-lg active:scale-[0.98]',
    secondary: 'bg-[#151C2F] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#334155] shadow-sm',
    outline: 'bg-transparent hover:bg-[#151C2F] text-[#38BDF8] border border-[#38BDF8]/40 hover:border-[#38BDF8]',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-[#151C2F] text-[#94A3B8] hover:text-[#F8FAFC]'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2.5 gap-2',
    lg: 'text-sm px-6 py-3.5 gap-2.5'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      )}
      {children}
    </button>
  );
};
