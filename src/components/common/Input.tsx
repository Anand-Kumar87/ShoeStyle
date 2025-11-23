import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-neutral-900"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`
              block w-full rounded-lg border transition-colors
              ${leftIcon ? 'pl-10' : 'pl-3'}
              ${rightIcon || error ? 'pr-10' : 'pr-3'}
              py-2.5 text-sm
              ${
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900'
              }
              focus:outline-none focus:ring-2
              disabled:cursor-not-allowed disabled:bg-neutral-50
              ${className}
            `}
            {...props}
          />
          
          {(rightIcon || error) && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              {error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p
            className={`mt-1.5 text-sm ${
              error ? 'text-red-600' : 'text-neutral-600'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;