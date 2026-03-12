import React from 'react';
import { clsx } from 'clsx';
import type { AuditType } from '../../types/audit';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'audit-type';
  size?: 'sm' | 'md' | 'lg';
  auditType?: AuditType;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const variantStyles = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm focus:ring-primary-500',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500',
  outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-primary-500',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
  'audit-type': '', // Dynamic based on auditType
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-apple',
  lg: 'px-6 py-3 text-base rounded-apple',
};

const auditTypeStyles: Record<AuditType, string> = {
  psychotropic: 'bg-psychotropic-500 hover:bg-psychotropic-600 text-white focus:ring-psychotropic-500',
  catheter: 'bg-catheter-500 hover:bg-catheter-600 text-white focus:ring-catheter-500',
  'skin_wound': 'bg-skinwound-500 hover:bg-skinwound-600 text-white focus:ring-skinwound-500',
  falls: 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500',
  admissions: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500',
};

export function Button({ 
  children, 
  className,
  variant = 'primary',
  size = 'md',
  auditType,
  isLoading = false,
  fullWidth = false,
  disabled,
  ...props 
}: ButtonProps) {
  const buttonStyles = clsx(
    baseStyles,
    variant === 'audit-type' && auditType ? auditTypeStyles[auditType] : variantStyles[variant],
    sizeStyles[size],
    fullWidth && 'w-full',
    className
  );

  return (
    <button 
      className={buttonStyles} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}