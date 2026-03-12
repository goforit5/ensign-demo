/**
 * AtRiskFacilities Component - Critical Violations Sidebar
 * Sprint 37: Dashboard Redesign
 *
 * Displays top 5 facilities with critical violations:
 * - Facility name
 * - Critical item count (red badge)
 * - "View Details" link → Action Items page (filtered)
 *
 * Features:
 * - Compact sidebar layout
 * - Sorted by critical count (descending)
 * - Quick navigation to action items
 * - Empty state handling
 *
 * Usage:
 * ```tsx
 * <AtRiskFacilities facilities={facilities} />
 * ```
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Typography } from '../ui';
import type { Facility } from '../../types/audit';

export interface AtRiskFacilitiesProps {
  /**
   * All facilities data
   */
  facilities: Facility[];

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * AtRiskFacilities Component
 */
export const AtRiskFacilities: React.FC<AtRiskFacilitiesProps> = ({
  facilities,
  isLoading = false,
  className = '',
}) => {
  const navigate = useNavigate();

  // Get top 5 facilities with critical violations (sorted descending)
  const atRiskFacilities = facilities
    .filter((f) => f.total_critical_items > 0)
    .sort((a, b) => b.total_critical_items - a.total_critical_items)
    .slice(0, 5);

  /**
   * Handle View Details (Navigate to Action Items page with facility filter)
   */
  const handleViewDetails = (facilityId: number) => {
    navigate(`/action-items?facility_id=${facilityId}&severity=critical`);
  };

  if (isLoading) {
    return (
      <Card variant="elevated" className={`animate-pulse ${className}`}>
        <div className="h-64 bg-gray-200 rounded"></div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className={className}>
      {/* Header */}
      <div className="mb-6">
        <Typography variant="title3" className="mb-1">
          🚨 At-Risk Facilities
        </Typography>
        <Typography variant="caption1" color="secondary">
          Top facilities with critical violations
        </Typography>
      </div>

      {/* Facilities List */}
      {atRiskFacilities.length > 0 ? (
        <div className="space-y-3">
          {atRiskFacilities.map((facility, index) => (
            <div
              key={facility.id}
              className="flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-apple hover:bg-red-100 transition-colors duration-200"
            >
              {/* Left: Facility Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>

                  {/* Facility Name */}
                  <span className="font-medium truncate text-base" title={facility.name}>
                    {facility.name}
                  </span>
                </div>

                {/* Critical Count Badge */}
                <div className="ml-8">
                  <Badge variant="severity" severity="critical" size="sm">
                    {facility.total_critical_items} Critical
                  </Badge>
                </div>
              </div>

              {/* Right: View Details Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewDetails(facility.id)}
                className="flex-shrink-0 ml-2"
              >
                View →
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎉</div>
          <Typography variant="body" color="secondary">
            No critical violations!
          </Typography>
          <Typography variant="caption1" color="secondary" className="mt-1">
            All facilities are performing well
          </Typography>
        </div>
      )}

      {/* View All Link */}
      {atRiskFacilities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => navigate('/action-items?severity=critical')}
          >
            View All Critical Items →
          </Button>
        </div>
      )}
    </Card>
  );
};

export default AtRiskFacilities;
