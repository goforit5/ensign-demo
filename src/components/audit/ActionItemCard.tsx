/**
 * ActionItemCard - Apple-style card component for action items
 * Sprint 37: Action Items Page Redesign
 *
 * Design Philosophy:
 * - Color-coded severity indicator (left border gradient)
 * - 3-layer information hierarchy (glance → scan → detail)
 * - Hover effects with depth (shadow, lift, quick actions)
 * - Touch-friendly sizing (16px padding, large targets)
 *
 * Visual Structure:
 * ┌─[🔴]────────────────────────────────────────────┐
 * │ CRITICAL • Missing Fall IDT Review              │ ← Layer 1: Glance
 * │ Psychotropic (F-758) • MRN 33618 • 2 days ago  │ ← Layer 2: Scan
 * │ [In Progress ▼]              Assigned: QA       │ ← Layer 3: Action
 * └─────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { Badge, Select } from '../ui';
import { formatDistanceToNow } from 'date-fns';
import type { ActionItem } from '../../types/audit';
import { useUpdateActionItem } from '../../hooks/api/useActionItemsManagement';
import {
  ClockIcon,
  UserIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ActionItemCardProps {
  item: ActionItem;
  onClick: (item: ActionItem) => void;
  onUpdate?: () => void;
}

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    critical: 'bg-gradient-to-br from-red-600 to-red-500',
    high: 'bg-gradient-to-br from-orange-600 to-orange-500',
    medium: 'bg-gradient-to-br from-yellow-600 to-yellow-500',
    low: 'bg-gradient-to-br from-green-600 to-green-500',
  };
  return colors[severity] || colors.low;
};

const getSeverityDot = (severity: string): string => {
  const dots: Record<string, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  };
  return dots[severity] || '⚪';
};

export function ActionItemCard({ item, onClick, onUpdate }: ActionItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [localStatus, setLocalStatus] = useState(item.status);
  const updateActionItem = useUpdateActionItem();

  // Sync local status when item.status changes from parent (but not during our own update)
  useEffect(() => {
    if (!isUpdating) {
      setLocalStatus(item.status);
    }
  }, [item.status, isUpdating]);

  const handleStatusChange = async (newStatus: string) => {
    // Optimistic update (Apple-style instant feedback)
    setLocalStatus(newStatus as ActionItem['status']);
    setIsUpdating(true);

    try {
      await updateActionItem.mutateAsync({
        itemId: item.id,
        status: newStatus,
      });

      // Success animation (Apple-style checkmark flash)
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);

      onUpdate?.();
    } catch (error) {
      // Revert on error (Apple-style error handling)
      console.error('Failed to update action item status:', error);
      setLocalStatus(item.status); // Revert to original
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on select dropdown
    if ((e.target as HTMLElement).closest('select, button')) {
      return;
    }
    onClick(item);
  };

  const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });

  return (
    <div
      className={`
        relative bg-white rounded-apple overflow-hidden cursor-pointer
        transition-all duration-300 ease-out
        ${isHovered ? 'shadow-apple-hover -translate-y-1' : 'shadow-apple'}
        ${isUpdating ? 'opacity-75 ring-2 ring-blue-200' : ''}
        ${showSuccess ? 'ring-2 ring-green-400' : ''}
        border border-gray-100
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Severity Indicator - Left Border Gradient */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getSeverityColor(item.severity)}`} />

      {/* Card Content */}
      <div className="pl-6 pr-4 py-4">
        {/* Layer 1: Glance - Severity & Title */}
        <div className="flex items-start space-x-2 mb-2">
          <span className="text-lg leading-none">{getSeverityDot(item.severity)}</span>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Badge variant="severity" severity={item.severity} size="sm">
                {item.severity.toUpperCase()}
              </Badge>
              {item.auto_resolved && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Auto-resolved</span>
                </div>
              )}
            </div>
            <h3 className="text-base font-semibold text-gray-900 leading-snug">
              {item.title || 'No action specified'}
            </h3>
          </div>
        </div>

        {/* Layer 2: Scan - Metadata */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3 ml-7">
          <Badge variant="audit-type" auditType={item.audit_type} size="sm">
            {item.audit_type.replace('_', ' ')}
          </Badge>
          <span>•</span>
          <span className="font-mono text-xs">{item.mrn || 'N/A'}</span>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-3.5 h-3.5" />
            <span className="text-xs">{timeAgo}</span>
          </div>
        </div>

        {/* Layer 3: Actions - Status & Assignment */}
        <div className="flex items-center justify-between ml-7">
          <div className="flex items-center space-x-3">
            {/* Status Dropdown with optimistic update */}
            <div className="min-w-[140px] relative" onClick={(e) => e.stopPropagation()}>
              <Select
                options={statusOptions}
                value={localStatus}
                onChange={handleStatusChange}
                size="sm"
                disabled={isUpdating}
              />
              {/* Success checkmark animation */}
              {showSuccess && (
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 animate-ping">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>

            {/* Assignment Badge */}
            {item.assigned_to && (
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <UserIcon className="w-3.5 h-3.5" />
                <span>{item.assigned_to.replace('_', ' ')}</span>
              </div>
            )}
          </div>

          {/* Facility Name (right-aligned) */}
          <div className="text-xs text-gray-500 truncate max-w-[200px]">
            {item.facility_name}
          </div>
        </div>

        {/* Hover State: Quick Actions (future enhancement) */}
        {isHovered && (
          <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Reserved for quick action buttons */}
          </div>
        )}
      </div>
    </div>
  );
}
