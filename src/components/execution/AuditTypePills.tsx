/**
 * AuditTypePills Component - Color-Coded Audit Type Selection
 * Sprint 31 Task 2.2: Run Audits View
 *
 * Design Philosophy (Apple UX):
 * - VISUAL HIERARCHY: Color-coded pills instantly communicate audit type
 * - DIRECT MANIPULATION: Tap pill → instantly selected (like Apple Music genres)
 * - MINIMAL TEXT: Icons + colors reduce cognitive load
 * - PROGRESSIVE DISCLOSURE: Action item counts appear only when relevant
 * - TACTILE FEEDBACK: Pills "pop" with ring + shadow when selected
 *
 * Features:
 * - Clickable pills with integrated checkboxes
 * - Color-coded by audit type (purple=psychotropic, blue=catheter, etc.)
 * - Show action item counts per audit type
 * - Keyboard accessible (Tab, Space to toggle)
 * - Responsive grid layout
 * - Select all toggle
 *
 * Usage:
 * ```tsx
 * <AuditTypePills
 *   selectedAuditTypes={selectedAuditTypes}
 *   onSelectionChange={setSelectedAuditTypes}
 * />
 * ```
 */

import React, { useCallback } from 'react';
import { clsx } from 'clsx';
import { CheckIcon } from '@heroicons/react/24/solid';

/**
 * Audit Type Definition
 */
export type AuditType = 'psychotropic' | 'catheter' | 'skin_wound' | 'falls' | 'admissions';

export interface AuditTypeInfo {
  id: AuditType;
  label: string;
  description: string;
  icon: string; // Emoji for simplicity
  openItemsCount: number;
  criticalCount: number;
}

export interface AuditTypePillsProps {
  /**
   * Currently selected audit types
   */
  selectedAuditTypes: AuditType[];

  /**
   * Callback when selection changes
   */
  onSelectionChange: (auditTypes: AuditType[]) => void;

  /**
   * Audit type data with counts (REQUIRED - from API)
   */
  auditTypes: AuditTypeInfo[];

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Error message
   */
  error?: string | null;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Audit Type Color Schemes (Apple-Inspired)
 */
const AUDIT_TYPE_STYLES: Record<AuditType, string> = {
  psychotropic: 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100 data-[selected]:bg-purple-100 data-[selected]:border-purple-500 data-[selected]:ring-2 data-[selected]:ring-purple-500 data-[selected]:ring-offset-2 data-[selected]:shadow-md',
  catheter: 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 data-[selected]:bg-blue-100 data-[selected]:border-blue-500 data-[selected]:ring-2 data-[selected]:ring-blue-500 data-[selected]:ring-offset-2 data-[selected]:shadow-md',
  'skin_wound': 'bg-pink-50 border-pink-300 text-pink-700 hover:bg-pink-100 data-[selected]:bg-pink-100 data-[selected]:border-pink-500 data-[selected]:ring-2 data-[selected]:ring-pink-500 data-[selected]:ring-offset-2 data-[selected]:shadow-md',
  falls: 'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100 data-[selected]:bg-orange-100 data-[selected]:border-orange-500 data-[selected]:ring-2 data-[selected]:ring-orange-500 data-[selected]:ring-offset-2 data-[selected]:shadow-md',
  admissions: 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 data-[selected]:bg-green-100 data-[selected]:border-green-500 data-[selected]:ring-2 data-[selected]:ring-green-500 data-[selected]:ring-offset-2 data-[selected]:shadow-md',
};

/**
 * Audit Type Pills Component
 */
export const AuditTypePills: React.FC<AuditTypePillsProps> = ({
  selectedAuditTypes,
  onSelectionChange,
  auditTypes,
  isLoading = false,
  error = null,
  className,
}) => {
  /**
   * Loading State
   */
  if (isLoading) {
    return (
      <div className={clsx('space-y-4', className)}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading audit types...</p>
        </div>
      </div>
    );
  }

  /**
   * Error State
   */
  if (error) {
    return (
      <div className={clsx('space-y-4', className)}>
        <div className="text-center py-12">
          <p className="text-red-600">Error loading audit types: {error}</p>
        </div>
      </div>
    );
  }
  /**
   * Toggle Audit Type Selection
   */
  const handleToggleAuditType = useCallback(
    (auditType: AuditType) => {
      if (selectedAuditTypes.includes(auditType)) {
        onSelectionChange(selectedAuditTypes.filter((type) => type !== auditType));
      } else {
        onSelectionChange([...selectedAuditTypes, auditType]);
      }
    },
    [selectedAuditTypes, onSelectionChange]
  );

  /**
   * Select All / Clear All Toggle
   */
  const handleToggleAll = useCallback(() => {
    if (selectedAuditTypes.length === auditTypes.length) {
      // All selected → Clear all
      onSelectionChange([]);
    } else {
      // Some selected → Select all
      onSelectionChange(auditTypes.map((a) => a.id));
    }
  }, [selectedAuditTypes.length, auditTypes, onSelectionChange]);

  const allSelected = selectedAuditTypes.length === auditTypes.length;

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Select Audit Types
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {selectedAuditTypes.length} of {auditTypes.length} selected
          </p>
        </div>

        {/* Select All Toggle */}
        <button
          onClick={handleToggleAll}
          className={clsx(
            'px-3 py-1.5 text-sm font-medium rounded-apple border-2 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            allSelected
              ? 'bg-primary-500 border-primary-500 text-white hover:bg-primary-600'
              : 'bg-white border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-700'
          )}
        >
          {allSelected ? 'Clear All' : 'Select All'}
        </button>
      </div>

      {/* Audit Type Pills Grid */}
      <div className="grid grid-cols-1 gap-3">
        {auditTypes.map((auditType) => {
          const isSelected = selectedAuditTypes.includes(auditType.id);

          return (
            <button
              key={auditType.id}
              onClick={() => handleToggleAuditType(auditType.id)}
              data-selected={isSelected || undefined}
              className={clsx(
                'flex items-center gap-3 px-4 py-4 rounded-apple border-2 transition-all duration-200 text-left',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                AUDIT_TYPE_STYLES[auditType.id]
              )}
              role="checkbox"
              aria-checked={isSelected}
              aria-label={`${auditType.label} audit type`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleToggleAuditType(auditType.id);
                }
              }}
            >
              {/* Checkbox */}
              <div
                className={clsx(
                  'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200',
                  isSelected
                    ? 'bg-current border-current opacity-100'
                    : 'bg-white border-current opacity-50'
                )}
              >
                {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
              </div>

              {/* Icon */}
              <div className="flex-shrink-0 text-2xl" aria-hidden="true">
                {auditType.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-base font-semibold">
                    {auditType.label}
                  </h4>
                  {auditType.openItemsCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">
                        {auditType.openItemsCount} open
                      </span>
                      {auditType.criticalCount > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
                          {auditType.criticalCount} critical
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm opacity-80 mt-0.5">
                  {auditType.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Helper Text */}
      <div className="text-xs text-gray-500 text-center">
        <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Tab</kbd> to navigate •{' '}
        <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Space</kbd> to select
      </div>
    </div>
  );
};

export default AuditTypePills;
