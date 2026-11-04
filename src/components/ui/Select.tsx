import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  id,
  className = '',
  ...props
}) => {
  const generatedId = React.useId();
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);
  const errorId = `${selectId}-error`;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-300 tracking-tight">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full text-xs sm:text-sm p-3.5 bg-[#0A0F1E]/90 border rounded-2xl text-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 cursor-pointer backdrop-blur-md shadow-inner ${
          error
            ? 'border-rose-500/80 focus:ring-rose-500/50 bg-rose-950/10'
            : 'border-white/10 focus:border-indigo-500/80 focus:ring-indigo-500/30 hover:border-white/20'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0D1326] text-slate-100 py-1">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} role="alert" className="text-[11px] text-rose-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

