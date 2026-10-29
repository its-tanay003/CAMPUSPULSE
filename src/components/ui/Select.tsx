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
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-[#94A3B8]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full text-xs p-3 bg-[#0B1020] border rounded-xl text-[#F8FAFC] transition duration-150 focus:outline-none focus:ring-2 cursor-pointer ${
          error
            ? 'border-rose-500 focus:ring-rose-500'
            : 'border-[#334155] focus:ring-[#7C5CFC] hover:border-[#38BDF8]/50'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#151C2F] text-[#F8FAFC]">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
};

