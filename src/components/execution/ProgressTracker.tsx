/**
 * ProgressTracker Component - Real-Time Batch Execution Monitor
 * Sprint 31 Task 2.4: Run Audits View
 *
 * Design Philosophy (Apple UX):
 * - IMMEDIATE FEEDBACK: Progress bar animates smoothly (Apple Music download style)
 * - VISUAL CLARITY: Green checkmark ✓, red X ✗, blue spinner ⏳ - universal symbols
 * - MINIMAL INTERRUPTION: Non-modal, inline progress (not a blocking dialog)
 * - TACTILE PROGRESS: Haptic-like animation when each run completes
 * - PERSISTENT STATE: Results remain visible after completion (user can review)
 *
 * Features:
 * - Animated progress bar (e.g., "2/6 complete - 33%")
 * - Individual run statuses with icons (✓ success, ✗ failure, ⏳ in progress)
 * - Elapsed time display
 * - Real-time updates (polls every 500ms)
 * - Auto-scroll to latest run
 * - Success/error summary
 *
 * Usage:
 * ```tsx
 * {isExecuting && (
 *   <ProgressTracker
 *     batchId={batchId}
 *     totalRuns={totalRuns}
 *     onComplete={handleComplete}
 *   />
 * )}
 * ```
 */

import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

/**
 * Run Status
 */
export type RunStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * Individual Run Info
 */
export interface AuditRun {
  id: string;
  facilityId: number;
  facilityName: string;
  auditType: string;
  status: RunStatus;
  actionItemsCreated?: number;
  errorMessage?: string;
  completedAt?: string;
}

/**
 * Batch Status
 */
export interface BatchStatus {
  batchId: string;
  totalRuns: number;
  completed: number;
  inProgress: number;
  failed: number;
  runs: AuditRun[];
  estimatedCompletion?: string;
  auditRunIds?: number[];  // For export functionality
}

export interface ProgressTrackerProps {
  /**
   * Current batch status (from API)
   */
  batchStatus: BatchStatus | null;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Error message
   */
  error?: string | null;

  /**
   * Callback when all runs complete
   */
  onComplete?: (batchStatus: BatchStatus) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Format elapsed time
 */
function formatElapsedTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  } else {
    return `${minutes}m ${remainingSeconds}s`;
  }
}

/**
 * Progress Tracker Component
 */
export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  batchStatus: propBatchStatus,
  isLoading = false,
  error = null,
  onComplete,
  className,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const runsListRef = useRef<HTMLDivElement>(null);

  /**
   * Elapsed Time Counter
   */
  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isComplete]);

  /**
   * Check for Completion
   */
  useEffect(() => {
    if (propBatchStatus && propBatchStatus.completed + propBatchStatus.failed === propBatchStatus.totalRuns) {
      setIsComplete(true);
      onComplete?.(propBatchStatus);
    }
  }, [propBatchStatus, onComplete]);

  /**
   * Auto-scroll to Latest Run
   */
  useEffect(() => {
    if (runsListRef.current) {
      runsListRef.current.scrollTop = runsListRef.current.scrollHeight;
    }
  }, [propBatchStatus?.runs.length]);

  /**
   * Loading State
   */
  if (isLoading) {
    return (
      <div className={clsx('rounded-apple bg-white border border-gray-200 p-6', className)}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Initializing batch execution...</p>
        </div>
      </div>
    );
  }

  /**
   * Error State
   */
  if (error) {
    return (
      <div className={clsx('rounded-apple bg-white border border-gray-200 p-6', className)}>
        <div className="text-center py-12">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  /**
   * No Status Yet
   */
  if (!propBatchStatus) {
    return (
      <div className={clsx('rounded-apple bg-white border border-gray-200 p-6', className)}>
        <p className="text-gray-500">Waiting for batch status...</p>
      </div>
    );
  }

  const progressPercentage = Math.round(
    ((propBatchStatus.completed + propBatchStatus.failed) / propBatchStatus.totalRuns) * 100
  );

  return (
    <div
      className={clsx(
        'rounded-apple bg-white border border-gray-200 shadow-lg overflow-hidden',
        'animate-slide-in-up',
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isComplete ? 'Batch Execution Complete' : 'Batch Execution in Progress'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {propBatchStatus.completed + propBatchStatus.failed} of {propBatchStatus.totalRuns} runs completed •{' '}
              {formatElapsedTime(elapsedSeconds)} elapsed
            </p>
          </div>

          {/* Status Icon */}
          {isComplete && (
            <div>
              {propBatchStatus.failed > 0 ? (
                <XCircleIcon className="w-8 h-8 text-red-500" />
              ) : (
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full transition-all duration-500 ease-out',
                propBatchStatus.failed > 0 ? 'bg-red-500' : 'bg-primary-500'
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-900 tabular-nums min-w-[3rem] text-right">
            {progressPercentage}%
          </span>
        </div>
      </div>

      {/* Run Results List */}
      <div
        ref={runsListRef}
        className="max-h-[400px] overflow-y-auto custom-scrollbar"
      >
        <div className="divide-y divide-gray-100">
          {propBatchStatus.runs.map((run) => (
            <div
              key={run.id}
              className={clsx(
                'px-6 py-3 flex items-center gap-3',
                run.status === 'in_progress' && 'bg-blue-50 animate-pulse',
                run.status === 'completed' && 'bg-white',
                run.status === 'failed' && 'bg-red-50'
              )}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {run.status === 'pending' && (
                  <div className="w-5 h-5 rounded-full bg-gray-300" />
                )}
                {run.status === 'in_progress' && (
                  <svg
                    className="animate-spin w-5 h-5 text-blue-500"
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
                {run.status === 'completed' && (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                )}
                {run.status === 'failed' && (
                  <XCircleIcon className="w-5 h-5 text-red-500" />
                )}
              </div>

              {/* Run Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {run.facilityName} • {run.auditType}
                </p>
                {run.status === 'completed' && run.actionItemsCreated !== undefined && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {run.actionItemsCreated} action item{run.actionItemsCreated !== 1 ? 's' : ''} created
                  </p>
                )}
                {run.status === 'failed' && run.errorMessage && (
                  <p className="text-xs text-red-600 mt-0.5">{run.errorMessage}</p>
                )}
              </div>

              {/* Timestamp (for completed runs) */}
              {run.completedAt && (
                <div className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-500">
                  <ClockIcon className="w-3 h-3" />
                  {new Date(run.completedAt).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Footer (Only show when complete) */}
      {isComplete && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-green-700 font-medium">{propBatchStatus.completed} succeeded</span>
              </div>
              {propBatchStatus.failed > 0 && (
                <div className="flex items-center gap-1">
                  <XCircleIcon className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 font-medium">{propBatchStatus.failed} failed</span>
                </div>
              )}
            </div>
            <span className="text-gray-500">
              Total time: {formatElapsedTime(elapsedSeconds)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
