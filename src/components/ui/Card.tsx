import React from 'react';
import { clsx } from 'clsx';
import type { AuditType } from '../../types/audit';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  auditType?: AuditType;
  variant?: 'default' | 'glass' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const auditTypeStyles: Record<AuditType, string> = {
  psychotropic: 'border-l-4 border-l-psychotropic-500 hover:shadow-psychotropic-100',
  catheter: 'border-l-4 border-l-catheter-500 hover:shadow-catheter-100',
  'skin_wound': 'border-l-4 border-l-skinwound-500 hover:shadow-skinwound-100',
  falls: 'border-l-4 border-l-orange-500 hover:shadow-orange-100',
  admissions: 'border-l-4 border-l-green-500 hover:shadow-green-100',
};

const variantStyles = {
  default: 'bg-white border border-gray-200',
  glass: 'glass-effect',
  elevated: 'bg-white shadow-apple hover:shadow-apple-hover',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ 
  children, 
  className, 
  auditType, 
  variant = 'default',
  padding = 'md',
  onClick 
}: CardProps) {
  const baseStyles = 'rounded-apple transition-all duration-200';
  
  const cardStyles = clsx(
    baseStyles,
    variantStyles[variant],
    paddingStyles[padding],
    auditType && auditTypeStyles[auditType],
    onClick && 'cursor-pointer hover:scale-[1.02]',
    className
  );

  return (
    <div className={cardStyles} onClick={onClick}>
      {children}
    </div>
  );
}