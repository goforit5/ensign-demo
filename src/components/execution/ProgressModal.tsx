/**
 * ProgressModal Component - Apple-Style Centered Progress Modal
 * Sprint 31 UX Improvement: Phase 4 + Scalability Enhancements
 *
 * Design Philosophy (Apple UX):
 * - CENTER-SCREEN: Modal appears at center (no scrolling needed)
 * - VISUAL PROMINENCE: Gradient header, large progress display
 * - GROUPED VIEW: Audits grouped by facility (collapsible)
 * - PROGRESSIVE DISCLOSURE: Hide completed audits by default
 * - SCALABLE: Handles 150+ concurrent audits gracefully
 *
 * Features:
 * - Centered modal overlay with backdrop
 * - Animated progress bar with gradient
 * - Stats grid showing completed/failed/remaining
 * - Grouped by facility (collapsible sections)
 * - Toggle to show/hide completed audits
 * - Compact single-line audit display
 *
 * Usage:
 * ```tsx
 * {isExecuting && batchId && (
 *   <ProgressModal
 *     batchStatus={batchStatus}
 *     isLoading={false}
 *     error={error}
 *     onComplete={handleComplete}
 *   />
 * )}
 * ```
 */

import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/solid';
import type { BatchStatus } from './ProgressTracker';

interface ProgressModalProps {
  /**
   * Current batch status (from API)
   */
  batchStatus: BatchStatus | null;

  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Error message
   */
  error: string | null;

  /**
   * Callback when all runs complete
   */
  onComplete: (finalStatus: BatchStatus) => void;

  /**
   * Optional minimize callback (future enhancement)
   */
  onMinimize?: () => void;
}

interface AuditRun {
  id: string;
  facilityId: number;
  facilityName: string;
  auditType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  actionItemsCreated?: number;
  errorMessage?: string;
}

interface GroupedAudits {
  facilityId: number;
  facilityName: string;
  audits: AuditRun[];
  completed: number;
  failed: number;
  inProgress: number;
  pending: number;
}

/**
 * Progress Modal Component
 */
export const ProgressModal: React.FC<ProgressModalProps> = ({
  batchStatus,
  isLoading,
  error,
  onComplete,
  onMinimize,
}) => {
  // CRITICAL: ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  // State for collapsible facility groups
  const [expandedFacilities, setExpandedFacilities] = useState<Set<number>>(new Set());

  // State for show/hide completed audits
  const [showCompleted, setShowCompleted] = useState(false);

  // Group audits by facility (MUST be before early returns)
  const groupedAudits = useMemo(() => {
    try {
      // Handle null/undefined batchStatus
      if (!batchStatus?.runs || batchStatus.runs.length === 0) {
        console.log('[ProgressModal] No runs to group');
        return [];
      }

      console.log('[ProgressModal] Grouping', batchStatus.runs.length, 'audits');
      console.log('[ProgressModal] Audit statuses:', batchStatus.runs.map((a) => ({ type: a.auditType, status: a.status })));

      const groups = new Map<number, GroupedAudits>();

      batchStatus.runs.forEach((audit, idx) => {
        // Skip audits with missing facility data (defensive programming)
        if (!audit || typeof audit.facilityId !== 'number') {
          console.warn(`[ProgressModal] Skipping audit ${idx} with invalid facilityId:`, audit);
          return;
        }

        const facilityId = audit.facilityId;
        const facilityName = audit.facilityName || 'Unknown Facility';

        if (!groups.has(facilityId)) {
          groups.set(facilityId, {
            facilityId,
            facilityName,
            audits: [],
            completed: 0,
            failed: 0,
            inProgress: 0,
            pending: 0,
          });
        }

        const group = groups.get(facilityId)!;
        group.audits.push(audit);

        // Count statuses
        if (audit.status === 'completed') group.completed++;
        else if (audit.status === 'failed') group.failed++;
        else if (audit.status === 'in_progress') group.inProgress++;
        else if (audit.status === 'pending') group.pending++;
      });

      const result = Array.from(groups.values());
      console.log('[ProgressModal] Created', result.length, 'facility groups');
      return result;
    } catch (err) {
      console.error('[ProgressModal] Error grouping audits:', err);
      return [];
    }
  }, [batchStatus?.runs]);

  // Toggle facility expansion
  const toggleFacility = (facilityId: number) => {
    setExpandedFacilities((prev) => {
      const next = new Set(prev);
      if (next.has(facilityId)) {
        next.delete(facilityId);
      } else {
        next.add(facilityId);
      }
      return next;
    });
  };

  // Expand all non-complete facilities by default
  React.useEffect(() => {
    const nonCompleteFacilities = groupedAudits
      .filter((group) => group.inProgress > 0 || group.pending > 0 || group.failed > 0)
      .map((group) => group.facilityId);
    setExpandedFacilities(new Set(nonCompleteFacilities));
  }, [groupedAudits]);

  // No auto-dismiss - user clicks "Close" button when ready

  // Debug: Log progress updates (MUST be before early returns)
  React.useEffect(() => {
    if (batchStatus) {
      const progressPercentage = batchStatus.totalRuns > 0
        ? ((batchStatus.completed + batchStatus.failed) / batchStatus.totalRuns) * 100
        : 0;
      const remaining = batchStatus.totalRuns - batchStatus.completed - batchStatus.failed;
      const isComplete = (batchStatus.completed + batchStatus.failed) >= batchStatus.totalRuns;

      console.log('[ProgressModal] Progress update:', {
        completed: batchStatus.completed,
        failed: batchStatus.failed,
        remaining,
        total: batchStatus.totalRuns,
        percentage: progressPercentage.toFixed(1) + '%',
        isComplete,
      });
    }
  }, [batchStatus?.completed, batchStatus?.failed, batchStatus?.totalRuns]);

  // NOW safe to do early returns (after all hooks)
  // Defensive: Early return if no batch status
  if (!batchStatus) {
    console.warn('[ProgressModal] No batchStatus provided');
    return null;
  }

  // Defensive: Validate batchStatus structure
  if (typeof batchStatus.totalRuns !== 'number' ||
      typeof batchStatus.completed !== 'number' ||
      typeof batchStatus.failed !== 'number') {
    console.error('[ProgressModal] Invalid batchStatus structure:', batchStatus);
    return null;
  }

  // Calculate progress percentage
  const progressPercentage = batchStatus.totalRuns > 0
    ? ((batchStatus.completed + batchStatus.failed) / batchStatus.totalRuns) * 100
    : 0;

  // Check if complete
  const isComplete = (batchStatus.completed + batchStatus.failed) >= batchStatus.totalRuns;

  // Calculate remaining
  const remaining = batchStatus.totalRuns - batchStatus.completed - batchStatus.failed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-apple shadow-2xl max-w-3xl w-full mx-4 max-h-[85vh] overflow-hidden animate-slide-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              {isComplete ? 'Audits Complete' : 'Running Audits'}
            </h3>
            {isComplete ? (
              <button
                onClick={() => onComplete(batchStatus)}
                className="text-white hover:text-gray-200 transition-colors font-medium"
                aria-label="Close and view results"
              >
                Close ✕
              </button>
            ) : (
              onMinimize && (
                <button
                  onClick={onMinimize}
                  className="text-white hover:text-gray-200 transition-colors"
                  aria-label="Minimize"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )
            )}
          </div>
        </div>

        {/* Progress Content */}
        <div className="p-6">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm text-gray-500">
                {batchStatus.completed + batchStatus.failed} of{' '}
                {batchStatus.totalRuns} complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={clsx(
                  'h-3 rounded-full transition-all duration-300',
                  isComplete && batchStatus.failed === 0
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-primary-600 to-blue-600'
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Stats grid - 4 columns now (added Remaining) */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {batchStatus.completed}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className={clsx(
                "text-3xl font-bold",
                batchStatus.failed > 0 ? "text-red-600" : "text-gray-400"
              )}>
                {batchStatus.failed}
              </div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {remaining}
              </div>
              <div className="text-sm text-gray-500">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {batchStatus.totalRuns}
              </div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>

          {/* Toggle: Show/Hide Completed */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-700">
              {groupedAudits.length} {groupedAudits.length === 1 ? 'Facility' : 'Facilities'}
            </div>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
            >
              {showCompleted ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
              <span>{showCompleted ? 'Hide' : 'Show'} Completed</span>
            </button>
          </div>

          {/* Grouped audits by facility (scrollable) */}
          <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-apple">
            {groupedAudits.length > 0 ? (
              groupedAudits.map((group) => {
                const isExpanded = expandedFacilities.has(group.facilityId);
                const allComplete = group.completed === group.audits.length;

                // Filter audits based on showCompleted toggle
                // CRITICAL: Filter out null/undefined audits first to prevent white screen
                const validAudits = group.audits.filter((a) => a != null);
                const visibleAudits = showCompleted
                  ? validAudits
                  : validAudits.filter((a) => a.status !== 'completed');

                // Skip facility if all complete and not showing completed
                if (!showCompleted && allComplete) return null;

                // Skip if no visible audits
                if (visibleAudits.length === 0) return null;

                return (
                  <div key={group.facilityId} className="border-b border-gray-200 last:border-b-0">
                    {/* Facility header (collapsible) */}
                    <button
                      onClick={() => toggleFacility(group.facilityId)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {isExpanded ? (
                          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        )}
                        <div className="text-left">
                          <div className="text-sm font-semibold text-gray-900">
                            {group.facilityName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {group.audits.length} {group.audits.length === 1 ? 'audit' : 'audits'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {group.completed > 0 && (
                          <span className="text-xs text-green-600 font-medium">
                            {group.completed} ✓
                          </span>
                        )}
                        {group.failed > 0 && (
                          <span className="text-xs text-red-600 font-medium">
                            {group.failed} ✗
                          </span>
                        )}
                        {(group.inProgress > 0 || group.pending > 0) && (
                          <span className="text-xs text-blue-600 font-medium">
                            {group.inProgress + group.pending} ⟳
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Audit list (expandable) */}
                    {isExpanded && visibleAudits.length > 0 && (
                      <div className="bg-gray-50">
                        {visibleAudits.map((audit, idx) => (
                          <div
                            key={audit?.id || idx}
                            className={clsx(
                              'flex items-center justify-between px-4 py-2 pl-12 border-t border-gray-200',
                              'transition-colors duration-200',
                              audit?.status === 'completed' && 'bg-green-50',
                              audit?.status === 'failed' && 'bg-red-50'
                            )}
                          >
                            <div className="flex items-center space-x-3">
                              {audit?.status === 'completed' && (
                                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                              )}
                              {audit?.status === 'failed' && (
                                <XCircleIcon className="w-4 h-4 text-red-600" />
                              )}
                              {(audit?.status === 'in_progress' || audit?.status === 'pending') && (
                                <ClockIcon className="w-4 h-4 text-blue-600 animate-pulse" />
                              )}
                              <div className="text-xs text-gray-700 font-medium">
                                {audit?.auditType || 'Unknown Audit'}
                              </div>
                            </div>
                            <span
                              className={clsx(
                                'text-xs font-medium',
                                audit?.status === 'completed' && 'text-green-600',
                                audit?.status === 'failed' && 'text-red-600',
                                (audit?.status === 'in_progress' || audit?.status === 'pending') &&
                                  'text-blue-600'
                              )}
                            >
                              {audit?.status === 'completed' && '✓'}
                              {audit?.status === 'failed' && '✗'}
                              {audit?.status === 'in_progress' && '⟳'}
                              {audit?.status === 'pending' && '⏳'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                No audit runs to display
              </div>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-apple p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                <svg
                  className="animate-spin h-4 w-4"
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
                <span>Loading status...</span>
              </div>
            </div>
          )}

          {/* Completion Section - Apple-Style (ALWAYS VISIBLE when complete) */}
          {isComplete && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="mb-4">
                  {batchStatus.failed === 0 ? (
                    <span className="text-lg text-green-600 font-semibold">✓ All audits completed successfully</span>
                  ) : (
                    <span className="text-lg text-yellow-600 font-semibold">
                      ⚠ {batchStatus.completed} completed, {batchStatus.failed} failed
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onComplete(batchStatus)}
                  className="px-6 py-3 bg-primary-600 text-white font-medium rounded-apple hover:bg-primary-700 transition-colors shadow-sm"
                >
                  View Reports ↓
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;
