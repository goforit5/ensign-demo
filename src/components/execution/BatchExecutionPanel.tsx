/**
 * BatchExecutionPanel Component - Live Calculation & Execution Trigger
 * Sprint 31 Task 2.3: Run Audits View
 *
 * Design Philosophy (Apple UX):
 * - INSTANT FEEDBACK: Calculation updates in real-time as selections change
 * - PROGRESSIVE DISCLOSURE: Estimated time appears only when execution is possible
 * - VISUAL PROMINENCE: Large, bold calculation mimics Apple Calculator
 * - STICKY POSITIONING: Always visible at bottom (like Apple Music mini-player)
 * - SINGLE ACTION: One "Run Audits" button (no confirm dialogs)
 *
 * Features:
 * - Live calculation display (e.g., "3 facilities × 2 audits = 6 runs")
 * - Estimated time calculation (e.g., "~30 seconds")
 * - Large primary "Run Audits" button
 * - Disabled state when no selections
 * - Keyboard shortcut (Cmd+R)
 * - Sticky bottom positioning with shadow
 *
 * Usage:
 * ```tsx
 * <BatchExecutionPanel
 *   facilityCount={selectedFacilities.length}
 *   auditTypeCount={selectedAuditTypes.length}
 *   onExecute={handleExecute}
 *   isExecuting={isExecuting}
 * />
 * ```
 */

import React, { useMemo } from 'react';
import { clsx } from 'clsx';
import { PlayIcon } from '@heroicons/react/24/solid';

export interface BatchExecutionPanelProps {
  /**
   * Number of selected facilities
   */
  facilityCount: number;

  /**
   * Number of selected audit types
   */
  auditTypeCount: number;

  /**
   * Callback when "Run Audits" button clicked
   */
  onExecute: () => void;

  /**
   * Whether batch execution is currently running
   */
  isExecuting?: boolean;

  /**
   * Whether there are no patients matching the selected filter
   */
  hasNoPatients?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Estimate execution time based on total runs
 * Assumption: Each audit run takes ~5 seconds
 */
function estimateExecutionTime(totalRuns: number): string {
  const SECONDS_PER_RUN = 5;
  const totalSeconds = totalRuns * SECONDS_PER_RUN;

  if (totalSeconds < 60) {
    return `~${totalSeconds} seconds`;
  } else if (totalSeconds < 3600) {
    const minutes = Math.ceil(totalSeconds / 60);
    return `~${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.ceil((totalSeconds % 3600) / 60);
    return `~${hours} hour${hours !== 1 ? 's' : ''} ${minutes} min`;
  }
}

/**
 * Batch Execution Panel Component
 */
export const BatchExecutionPanel: React.FC<BatchExecutionPanelProps> = ({
  facilityCount,
  auditTypeCount,
  onExecute,
  isExecuting = false,
  hasNoPatients = false,
  className,
}) => {
  /**
   * Total Runs Calculation
   */
  const totalRuns = useMemo(() => {
    return facilityCount * auditTypeCount;
  }, [facilityCount, auditTypeCount]);

  /**
   * Estimated Time
   */
  const estimatedTime = useMemo(() => {
    return estimateExecutionTime(totalRuns);
  }, [totalRuns]);

  /**
   * Button Disabled State
   */
  const isDisabled = totalRuns === 0 || isExecuting || hasNoPatients;

  /**
   * Keyboard Shortcut (Cmd+R)
   */
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+R: Run Audits (prevent browser refresh)
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        if (!isDisabled) {
          onExecute();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDisabled, onExecute]);

  return (
    <div
      className={clsx(
        'sticky bottom-0 left-0 right-0 z-10',
        'bg-white border-t border-gray-200 shadow-xl',
        'px-6 py-4',
        'transition-all duration-300',
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Calculation Display */}
          <div className="flex-1">
            {/* Large Calculation (Apple Calculator Style) */}
            <div className="flex items-center gap-2 text-gray-900">
              <span className="text-3xl font-bold tabular-nums">
                {facilityCount}
              </span>
              <span className="text-xl text-gray-400">×</span>
              <span className="text-3xl font-bold tabular-nums">
                {auditTypeCount}
              </span>
              <span className="text-xl text-gray-400">=</span>
              <span className="text-4xl font-bold text-primary-600 tabular-nums">
                {totalRuns}
              </span>
              <span className="text-lg text-gray-600 ml-2">
                {totalRuns === 1 ? 'run' : 'runs'}
              </span>
            </div>

            {/* Estimated Time (Progressive Disclosure) */}
            {totalRuns > 0 && (
              <p className="text-sm text-gray-500 mt-1 animate-fade-in">
                Estimated completion time: {estimatedTime}
              </p>
            )}
          </div>

          {/* Right: Run Button */}
          <button
            onClick={onExecute}
            disabled={isDisabled}
            className={clsx(
              'inline-flex items-center gap-2 px-8 py-4 rounded-apple text-base font-semibold',
              'transition-all duration-200',
              'focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-offset-2',
              isDisabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-lg hover:shadow-xl active:shadow-md hover:-translate-y-0.5 active:translate-y-0'
            )}
            title={
              hasNoPatients
                ? 'Cannot run audits - no patients match the selected filter'
                : isDisabled
                ? 'Select facilities and audit types to run'
                : 'Cmd+R'
            }
          >
            {isExecuting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
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
                Executing...
              </>
            ) : (
              <>
                <PlayIcon className="w-5 h-5" />
                Run Audits
              </>
            )}
          </button>
        </div>

        {/* Warning when no patients match filter */}
        {hasNoPatients && !isExecuting && (
          <div className="text-sm text-yellow-700 mt-2 text-center animate-fade-in">
            ⚠️ Cannot run audits - no patients match the selected filter
          </div>
        )}

        {/* Keyboard Shortcut Hint (Only show when not executing) */}
        {!isExecuting && totalRuns > 0 && !hasNoPatients && (
          <div className="text-xs text-gray-500 text-right mt-2 animate-fade-in">
            Press{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-mono">
              Cmd+R
            </kbd>{' '}
            to execute
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchExecutionPanel;
