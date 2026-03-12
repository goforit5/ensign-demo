/**
 * EmptyState - Reusable empty state component (Apple-style)
 * Sprint 37: Action Items Page Redesign
 *
 * Design Philosophy:
 * - Clear visual hierarchy (icon → title → description → action)
 * - SF Symbols-style iconography
 * - Friendly, helpful tone (not cold/technical)
 * - Actionable guidance (what to do next)
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   icon={<CheckCircleIcon />}
 *   title="All Clear!"
 *   description="No action items need attention right now."
 *   actionLabel="Run New Audit"
 *   onAction={() => navigate('/run-audits')}
 * />
 * ```
 */

import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  emoji?: string; // Apple-style emoji (instead of icon)
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  emoji = '📋',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon or Emoji */}
      <div className="mb-6">
        {icon ? (
          <div className="w-16 h-16 text-gray-300">{icon}</div>
        ) : (
          <div className="text-6xl mb-2">{emoji}</div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 max-w-md mb-6">{description}</p>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
