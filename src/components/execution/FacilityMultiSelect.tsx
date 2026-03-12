/**
 * FacilityMultiSelect Component - Apple-Inspired Facility Selection
 * Sprint 31 Task 2.1: Run Audits View
 *
 * Design Philosophy (Apple UX):
 * - MINIMAL COGNITIVE LOAD: Pre-selected smart filters ("Never Audited")
 * - DIRECT MANIPULATION: Click facility card → instantly selected (no confirm dialog)
 * - PROGRESSIVE DISCLOSURE: Search/filter controls appear only when needed
 * - VISUAL FEEDBACK: Selected facilities highlighted with Apple-blue accent
 * - KEYBOARD-FIRST: Cmd+A (select all), Cmd+Shift+N (never audited), Esc (clear)
 *
 * Features:
 * - Checkbox selection for 40 facilities
 * - "Select All" button
 * - "Select Never Audited" smart filter (selects 39 facilities)
 * - Real-time fuzzy search
 * - Sort by name/status/open items
 * - Live selection count
 * - Accessible (ARIA, keyboard nav)
 *
 * Usage:
 * ```tsx
 * <FacilityMultiSelect
 *   selectedFacilities={selectedFacilities}
 *   onSelectionChange={setSelectedFacilities}
 * />
 * ```
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

/**
 * Facility Interface
 */
export interface Facility {
  id: number;
  name: string;
  overall_status: 'critical' | 'due_soon' | 'up_to_date';
  total_open_items: number;
  critical_count: number;
  last_audit_date: string | null;
}

export interface FacilityMultiSelectProps {
  /**
   * Currently selected facility IDs
   */
  selectedFacilities: number[];

  /**
   * Callback when selection changes
   */
  onSelectionChange: (facilityIds: number[]) => void;

  /**
   * Available facilities (REQUIRED - must be fetched from API)
   */
  facilities: Facility[];

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Error state
   */
  error?: string | null;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Sort Options
 */
type SortBy = 'name' | 'status' | 'open_items';

/**
 * Fuzzy Search Utility
 */
function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let queryIndex = 0;

  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === lowerQuery.length;
}

/**
 * Facility Multi-Select Component
 */
export const FacilityMultiSelect: React.FC<FacilityMultiSelectProps> = ({
  selectedFacilities,
  onSelectionChange,
  facilities,
  isLoading = false,
  error = null,
  className,
}) => {
  const [searchInput, setSearchInput] = useState(''); // Local state for immediate UI updates
  const [searchQuery, setSearchQuery] = useState(''); // Debounced search query
  const [sortBy, setSortBy] = useState<SortBy>('name');

  // Debounced search handler (300ms delay for consistency)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /**
   * Filtered and sorted facilities
   */
  const filteredFacilities = useMemo(() => {
    let results = facilities;

    // Apply search filter
    if (searchQuery.trim()) {
      results = results.filter((facility) =>
        fuzzyMatch(facility.name, searchQuery)
      );
    }

    // Apply sorting
    results = [...results].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'status') {
        const statusOrder = { critical: 0, due_soon: 1, never_audited: 2, up_to_date: 3 };
        return statusOrder[a.overall_status] - statusOrder[b.overall_status];
      } else {
        return b.total_open_items - a.total_open_items;
      }
    });

    return results;
  }, [facilities, searchQuery, sortBy]);

  /**
   * Selection Handlers
   */
  const handleToggleFacility = useCallback(
    (facilityId: number) => {
      if (selectedFacilities.includes(facilityId)) {
        onSelectionChange(selectedFacilities.filter((id) => id !== facilityId));
      } else {
        onSelectionChange([...selectedFacilities, facilityId]);
      }
    },
    [selectedFacilities, onSelectionChange]
  );

  const handleSelectAll = useCallback(() => {
    onSelectionChange(filteredFacilities.map((f) => f.id));
  }, [filteredFacilities, onSelectionChange]);

  const handleClearSelection = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  /**
   * Keyboard Shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+A: Select All
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && e.target instanceof HTMLInputElement === false) {
        e.preventDefault();
        handleSelectAll();
      }
      // Esc: Clear Selection
      if (e.key === 'Escape' && selectedFacilities.length > 0) {
        e.preventDefault();
        handleClearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectAll, handleClearSelection, selectedFacilities.length]);

  /**
   * Status Badge Colors
   */
  const getStatusColor = (status: Facility['overall_status']) => {
    switch (status) {
      case 'critical':
        return 'bg-severity-critical-100 text-severity-critical-700 border-severity-critical-300';
      case 'due_soon':
        return 'bg-severity-medium-100 text-severity-medium-700 border-severity-medium-300';
      default:
        return 'bg-severity-compliant-100 text-severity-compliant-700 border-severity-compliant-300';
    }
  };

  const getStatusLabel = (status: Facility['overall_status']) => {
    switch (status) {
      case 'critical':
        return 'Critical';
      case 'due_soon':
        return 'Due Soon';
      default:
        return 'Up to Date';
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className={clsx('space-y-4', className)}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading facilities...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={clsx('space-y-4', className)}>
        <div className="text-center py-12">
          <p className="text-red-600">Error loading facilities: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header with Selection Count */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Select Facilities
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {selectedFacilities.length} of {facilities.length} selected
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-300 rounded-apple hover:bg-primary-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            title="Cmd+A"
          >
            Select All
          </button>
          {selectedFacilities.length > 0 && (
            <button
              onClick={handleClearSelection}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-apple hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              title="Esc"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search facilities..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-apple text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow duration-200"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-3 py-2 border border-gray-300 rounded-apple text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow duration-200"
        >
          <option value="name">Sort by Name</option>
          <option value="status">Sort by Status</option>
          <option value="open_items">Sort by Open Items</option>
        </select>
      </div>

      {/* Facility List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredFacilities.map((facility) => {
          const isSelected = selectedFacilities.includes(facility.id);

          return (
            <button
              key={facility.id}
              onClick={() => handleToggleFacility(facility.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-apple border-2 transition-all duration-200 text-left',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                isSelected
                  ? 'bg-primary-50 border-primary-500 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              )}
              role="checkbox"
              aria-checked={isSelected}
            >
              {/* Checkbox */}
              <div
                className={clsx(
                  'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200',
                  isSelected
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-300'
                )}
              >
                {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
              </div>

              {/* Facility Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {facility.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={clsx(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                      getStatusColor(facility.overall_status)
                    )}
                  >
                    {getStatusLabel(facility.overall_status)}
                  </span>
                  {facility.total_open_items > 0 && (
                    <span className="text-xs text-gray-500">
                      {facility.total_open_items} open{' '}
                      {facility.critical_count > 0 && (
                        <span className="text-severity-critical-600 font-medium">
                          • {facility.critical_count} critical
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFacilities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No facilities found matching "{searchInput}"</p>
          <button
            onClick={() => setSearchInput('')}
            className="mt-2 text-sm text-primary-600 hover:text-primary-700 focus:outline-none"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
};

export default FacilityMultiSelect;
