import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Badge } from '../ui';
import { Disclosure } from '@headlessui/react';
import { useFacilities } from '../../hooks/api/useAuditData';
import type { AuditType } from '../../types/audit';
import {
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export interface ActionItemFilters {
  facility_id?: number;
  audit_type?: AuditType | 'all';
  status?: string;
  severity?: string;
  search?: string;
}

interface ActionItemsFiltersProps {
  filters: ActionItemFilters;
  onFiltersChange: (filters: ActionItemFilters) => void;
  activeFilterCount: number;
}

const auditTypeOptions = [
  { value: 'all', label: 'All Audit Types' },
  { value: 'psychotropic', label: 'Psychotropic' },
  { value: 'catheter', label: 'Catheter' },
  { value: 'skin_wound', label: 'Skin & Wound' },
  { value: 'falls', label: 'Falls' },
  { value: 'admissions', label: 'Admissions' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

const severityOptions = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function ActionItemsFilters({
  filters,
  onFiltersChange,
  activeFilterCount
}: ActionItemsFiltersProps) {
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();

  // Local state for immediate UI updates (debounced search)
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const facilityOptions = [
    { value: 'all', label: 'All Facilities' },
    ...(facilities?.map(facility => ({
      value: facility.id.toString(),
      label: facility.name
    })) || [])
  ];

  const handleFilterChange = (key: keyof ActionItemFilters, value: string) => {
    const newFilters = { ...filters };

    if (value === 'all' || value === '') {
      delete newFilters[key];
    } else {
      if (key === 'facility_id') {
        newFilters[key] = parseInt(value);
      } else {
        newFilters[key] = value as any;
      }
    }

    onFiltersChange(newFilters);
  };

  // Debounced search handler (300ms delay for performance with 6000+ items)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange('search', searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value); // Update UI immediately
    // Actual filter update happens after 300ms debounce
  };

  const clearAllFilters = () => {
    setSearchInput(''); // Clear local search state
    onFiltersChange({});
  };

  return (
    <Card variant="elevated">
      <Disclosure defaultOpen={false}>
        {({ open }: { open: boolean }) => (
          <div className="space-y-4">
            {/* Header - Always Visible */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <FunnelIcon className="w-5 h-5 text-gray-500" />
                <Disclosure.Button className="flex items-center space-x-2 text-lg font-medium text-gray-900 hover:text-gray-700">
                  <span>Filters</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-300 ${
                      open ? 'transform rotate-180' : ''
                    }`}
                  />
                </Disclosure.Button>
                {activeFilterCount > 0 && (
                  <Badge variant="default" size="sm">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Search Bar - Always Visible */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search descriptions, codes, MRNs..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-apple text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Collapsible Filter Options */}
            <Disclosure.Panel>
              <div className="pt-2 space-y-4 transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Facility Filter */}
                  <div>
                    <Select
                      label="Facility"
                      options={facilityOptions}
                      value={filters.facility_id?.toString() || 'all'}
                      onChange={(value) => handleFilterChange('facility_id', value)}
                      disabled={facilitiesLoading}
                      size="sm"
                    />
                  </div>

                  {/* Audit Type Filter */}
                  <div>
                    <Select
                      label="Audit Type"
                      options={auditTypeOptions}
                      value={filters.audit_type || 'all'}
                      onChange={(value) => handleFilterChange('audit_type', value)}
                      size="sm"
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <Select
                      label="Status"
                      options={statusOptions}
                      value={filters.status || 'all'}
                      onChange={(value) => handleFilterChange('status', value)}
                      size="sm"
                    />
                  </div>

                  {/* Severity Filter */}
                  <div>
                    <Select
                      label="Severity"
                      options={severityOptions}
                      value={filters.severity || 'all'}
                      onChange={(value) => handleFilterChange('severity', value)}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </Card>
  );
}
