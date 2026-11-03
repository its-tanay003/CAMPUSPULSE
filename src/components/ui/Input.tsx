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
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#94A3B8]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? errorId : helperText ? helperId : undefined
        }
        className={`w-full text-xs p-3 bg-[#0B1020] border rounded-xl text-[#F8FAFC] placeholder-[#94A3B8] transition duration-150 focus:outline-none focus:ring-2 ${
          error
            ? 'border-rose-500 focus:ring-rose-500'
            : 'border-[#334155] focus:ring-[#7C5CFC] hover:border-[#38BDF8]/50'
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

