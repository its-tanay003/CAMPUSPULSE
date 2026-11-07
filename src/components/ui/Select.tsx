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
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 tracking-tight">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full text-xs sm:text-sm p-3.5 bg-white border rounded-2xl text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 cursor-pointer shadow-sm ${
          error
            ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
            : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 hover:border-slate-300'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white text-slate-900 py-1">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} role="alert" className="text-[11px] text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};
