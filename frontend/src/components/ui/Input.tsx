import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  className,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2 border border-gray-300 rounded-md transition-colors placeholder:text-gray-400',
          // Normal State: Hover turns to Soft Emerald
          'hover:border-primary-400',
          // Focus State: Deep Emerald Ring & Border
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          // Error State: Red overrides styling
          error && 'border-red-300 focus:ring-red-500 focus:border-red-500 hover:border-red-400',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';