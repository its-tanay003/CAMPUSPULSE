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
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 tracking-tight">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? errorId : helperText ? helperId : undefined
        }
        className={`w-full text-xs sm:text-sm p-3.5 bg-white border rounded-2xl text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 shadow-sm ${
          error
            ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
            : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 hover:border-slate-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-[11px] text-rose-600 font-medium">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="text-[11px] text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
