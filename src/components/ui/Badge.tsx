import React from 'react';
import { clsx } from 'clsx';
import type { AuditType } from '../../types/audit';
import { STATUS_STYLES, SEVERITY_STYLES } from '../../constants/statuses';

export type BadgeSeverity = 'low' | 'medium' | 'high' | 'critical' | 'info' | 'compliant';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'audit-type' | 'severity' | 'status' | 'default' | 'success' | 'danger' | 'warning' | 'info';
  auditType?: AuditType;
  severity?: BadgeSeverity;
  status?: 'open' | 'in_progress' | 'resolved' | 'dismissed' | 'pending' | 'running' | 'completed' | 'failed';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const baseStyles = 'inline-flex items-center font-medium rounded-full border';

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-sm',
};

// Legacy badge class names for audit types (kept for CSS compatibility)
const auditTypeStyles: Record<AuditType, string> = {
  psychotropic: 'badge-psychotropic',
  catheter: 'badge-catheter',
  'skin_wound': 'badge-skinwound',
  falls: 'bg-orange-50 text-orange-700 border-orange-200',
  admissions: 'bg-green-50 text-green-700 border-green-200',
};

const defaultStyles = 'bg-gray-50 text-gray-700 border-gray-200';

// New compliance status styles
const complianceStyles = {
  success: 'bg-green-50 text-green-700 border-green-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
};

export function Badge({ 
  children, 
  variant = 'default',
  auditType,
  severity,
  status,
  size = 'md',
  className 
}: BadgeProps) {
  let variantStyles = defaultStyles;
  
  if (variant === 'audit-type' && auditType) {
    variantStyles = auditTypeStyles[auditType];
  } else if (variant === 'severity' && severity) {
    const severityMap: Record<string, string> = {
      ...SEVERITY_STYLES,
      compliant: 'bg-green-50 text-green-700 border-green-200',
    };
    variantStyles = severityMap[severity] || defaultStyles;
  } else if (variant === 'status' && status) {
    variantStyles = STATUS_STYLES[status];
  } else if (variant && variant in complianceStyles) {
    variantStyles = complianceStyles[variant as keyof typeof complianceStyles];
  }

  const badgeStyles = clsx(
    baseStyles,
    sizeStyles[size],
    variantStyles,
    className
  );

  return (
    <span className={badgeStyles}>
      {children}
    </span>
  );
}