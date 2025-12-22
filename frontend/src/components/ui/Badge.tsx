import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
  };
  
  const variants = {
    // Default: Neutral Gray (No Change)
    default: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500',
    
    // Success: Green (Standard Semantic)
    success: 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500',
    
    // Warning: Mapped to Gold (Secondary)
    warning: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500',
    
    // Error: Red (Standard Semantic)
    error: 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500',
    
    // Info: Mapped to Emerald (Primary) for Brand Identity
    info: 'bg-primary-100 text-primary-900 hover:bg-primary-200 focus:ring-primary-500',
    
    // Outline: Emerald Border
    outline: 'border border-primary-200 text-primary-700 bg-transparent hover:bg-primary-50 focus:ring-primary-500',
    
    // Secondary: Solid Gold High Contrast
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
  };

  return (
    <span
      className={cn(baseClasses, sizeClasses[size], variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};