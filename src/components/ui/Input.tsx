import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const generatedId = React.useId();
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300 tracking-tight">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? errorId : helperText ? helperId : undefined
        }
        className={`w-full text-xs sm:text-sm p-3.5 bg-[#0A0F1E]/90 border rounded-2xl text-slate-100 placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 backdrop-blur-md shadow-inner ${
          error
            ? 'border-rose-500/80 focus:ring-rose-500/50 bg-rose-950/10'
            : 'border-white/10 focus:border-indigo-500/80 focus:ring-indigo-500/30 hover:border-white/20'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-[11px] text-rose-400 font-medium">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="text-[11px] text-[#94A3B8]">
          {helperText}
        </p>
      )}
    </div>
  );
};

