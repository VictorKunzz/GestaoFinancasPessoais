import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full bg-bg-input border border-border-default rounded-xl
              px-4 py-2.5 text-sm text-text-primary
              placeholder:text-text-muted
              focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet/30
              transition-all duration-200
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-accent-rose focus:border-accent-rose focus:ring-accent-rose/30' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-accent-rose">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
