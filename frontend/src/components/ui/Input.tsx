import type { ReactNode } from 'react';

interface InputProps {
  label?: string;
  name?: string;
  type?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  hint?: string;
}

export function Input({
  label, name, type = 'text', value, defaultValue, onChange,
  placeholder, error, required, disabled, icon, hint,
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 ${disabled ? 'bg-neutral-100 cursor-not-allowed text-neutral-500' : ''} ${icon ? 'pl-10' : ''} ${error ? 'border-error-500 focus:ring-error-500/20 focus:border-error-600' : 'border-neutral-300'}`}
        />
      </div>
      {hint && !error && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-error-600 font-medium">{error}</p>}
    </div>
  );
}

interface TextAreaProps {
  label?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  rows?: number;
  hint?: string;
}

export function TextArea({
  label, name, value, defaultValue, onChange,
  placeholder, error, required, rows = 6, hint,
}: TextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 resize-y ${error ? 'border-error-500 focus:ring-error-500/20 focus:border-error-600' : 'border-neutral-300'}`}
      />
      {hint && !error && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-error-600 font-medium">{error}</p>}
    </div>
  );
}

interface SelectProps {
  label?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  required?: boolean;
}

export function Select({ label, name, value, onChange, children, required }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}{required && <span className="text-error-600 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
      >
        {children}
      </select>
    </div>
  );
}
