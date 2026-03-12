/**
 * AdmissionFilter Component - Admission Date Filter Selection
 * Feature: Audit Admission Date Filtering (January 2026)
 *
 * Design Philosophy (Apple UX):
 * - VISUAL CLARITY: Color-coded pills with icons for quick recognition
 * - DIRECT MANIPULATION: Single tap to change filter (like iOS segmented control)
 * - MINIMAL TEXT: Icons + concise labels reduce cognitive load
 * - SMART DEFAULTS: "Last 7 Days" pre-selected per Misty's primary use case
 * - TACTILE FEEDBACK: Pills "pop" with ring + shadow when selected
 *
 * Filter Options:
 * - Last 7 Days (🕐 Clock icon, blue)
 * - Last 30 Days (📅 Calendar icon, purple)
 * - All Current (👥 Users icon, gray)
 *
 * Features:
 * - Single-selection pills (radio-style behavior)
 * - Color-coded by recency (blue=recent, purple=month, gray=all)
 * - Descriptive tooltips on hover
 * - Keyboard accessible (Tab, Arrow keys, Enter/Space)
 * - Responsive layout
 *
 * Usage:
 * ```tsx
 * <AdmissionFilter
 *   value={admissionFilter}
 *   onChange={setAdmissionFilter}
 * />
 * ```
 */

import React from 'react';
import { clsx } from 'clsx';

/**
 * Admission Filter Type
 */
export type AdmissionFilterValue = '7_days' | '30_days' | 'all';

export interface AdmissionFilterProps {
  /**
   * Currently selected filter
   */
  value: AdmissionFilterValue;

  /**
   * Callback when filter changes
   */
  onChange: (value: AdmissionFilterValue) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Filter Option Definition
 */
interface FilterOption {
  value: AdmissionFilterValue;
  label: string;
  description: string;
  icon: string; // Emoji
}

/**
 * Available Filter Options
 */
const FILTER_OPTIONS: FilterOption[] = [
  {
    value: '7_days',
    label: 'Last 7 Days',
    description: 'Recently admitted patients',
    icon: '🕐',
  },
  {
    value: '30_days',
    label: 'Last 30 Days',
    description: 'Patients admitted this month',
    icon: '📅',
  },
  {
    value: 'all',
    label: 'All Current',
    description: 'No date restriction',
    icon: '👥',
  },
];

/**
 * Filter Option Color Schemes (Apple-Inspired)
 */
const FILTER_STYLES: Record<AdmissionFilterValue, string> = {
  '7_days':
    'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 data-[selected]:bg-blue-100 data-[selected]:border-blue-500 data-[selected]:ring-2 data-[selected]:ring-blue-500 data-[selected]:ring-offset-2 data-[selected]:shadow-md',
  '30_days':
    'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100 data-[selected]:bg-purple-100 data-[selected]:border-purple-500 data-[selected]:ring-2 data-[selected]:ring-purple-500 data-[selected]:ring-offset-2 data-[selected]:shadow-md',
  all: 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 data-[selected]:bg-gray-100 data-[selected]:border-gray-500 data-[selected]:ring-2 data-[selected]:ring-gray-500 data-[selected]:ring-offset-2 data-[selected]:shadow-md',
};

/**
 * AdmissionFilter Component
 */
export const AdmissionFilter: React.FC<AdmissionFilterProps> = ({
  value,
  onChange,
  className,
}) => {
  /**
   * Handle pill click
   */
  const handleFilterSelect = (filterValue: AdmissionFilterValue) => {
    onChange(filterValue);
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    filterValue: AdmissionFilterValue
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFilterSelect(filterValue);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentIndex = FILTER_OPTIONS.findIndex((opt) => opt.value === filterValue);
      const nextIndex = (currentIndex + 1) % FILTER_OPTIONS.length;
      const nextButton = document.querySelector<HTMLButtonElement>(
        `[data-filter-value="${FILTER_OPTIONS[nextIndex].value}"]`
      );
      nextButton?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const currentIndex = FILTER_OPTIONS.findIndex((opt) => opt.value === filterValue);
      const prevIndex = (currentIndex - 1 + FILTER_OPTIONS.length) % FILTER_OPTIONS.length;
      const prevButton = document.querySelector<HTMLButtonElement>(
        `[data-filter-value="${FILTER_OPTIONS[prevIndex].value}"]`
      );
      prevButton?.focus();
    }
  };

  return (
    <div className={clsx('space-y-3', className)}>
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-700">Admission Date Filter</h3>
        <div className="h-1 flex-1 bg-gray-100 rounded" />
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-3">
        {FILTER_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              data-filter-value={option.value}
              data-selected={isSelected ? 'true' : undefined}
              onClick={() => handleFilterSelect(option.value)}
              onKeyDown={(e) => handleKeyDown(e, option.value)}
              className={clsx(
                'group relative flex items-center gap-3 px-4 py-3 border-2 rounded-xl',
                'transition-all duration-200 cursor-pointer',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                FILTER_STYLES[option.value]
              )}
              title={option.description}
              aria-pressed={isSelected}
            >
              {/* Icon */}
              <span className="text-2xl" aria-hidden="true">
                {option.icon}
              </span>

              {/* Label and Description */}
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-semibold leading-tight">{option.label}</span>
                <span className="text-xs opacity-75 leading-tight">{option.description}</span>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-current rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        Filter controls which patients are included in the audit based on their admission date.
      </p>
    </div>
  );
};
