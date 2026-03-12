/**
 * RecentAuditsTimeline Component - Recent Audit History
 * Sprint 37: Dashboard Redesign
 *
 * Displays the last 10 audit runs in chronological order (newest first):
 * - Audit type badge
 * - Facility name
 * - Compliance score
 * - Time ago
 * - One-click export button
 *
 * Features:
 * - Compact timeline layout
 * - Color-coded audit type badges
 * - Quick export per audit
 * - "View All Reports" link → Reports page
 *
 * Usage:
 * ```tsx
 * <RecentAuditsTimeline audits={recentAudits} onExport={handleExport} />
 * ```
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Typography } from '../ui';
import type { AuditRun } from '../../types/audit';
import { formatRelativeDate } from '../../utils/dateHelpers';

export interface RecentAuditsTimelineProps {
  /**
   * Recent audit runs (last 10)
   */
  audits: AuditRun[];

  /**
   * Export handler
   */
  onExport: (auditId: number) => Promise<void>;

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
 * Get audit type badge variant
 */
const getAuditTypeBadgeVariant = (
  auditType: string
): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    psychotropic: 'info',
    catheter: 'info',
    skin_wound: 'success',
    falls: 'warning',
    admissions: 'danger',
  };
  return variants[auditType] || 'default';
};

/**
 * Get compliance score color
 */
const getComplianceColor = (score: number): string => {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * RecentAuditsTimeline Component
 */
export const RecentAuditsTimeline: React.FC<RecentAuditsTimelineProps> = ({
  audits,
  onExport,
  isLoading = false,
  className = '',
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card variant="default" className={`animate-pulse ${className}`}>
        <div className="h-64 bg-gray-200 rounded"></div>
      </Card>
    );
  }

  if (audits.length === 0) {
    return (
      <Card variant="default" className={className}>
        <div className="text-center py-12">
          <Typography variant="body" color="secondary">
            No recent audits. Run your first audit to see results here.
          </Typography>
          <Button
            variant="primary"
            size="md"
            className="mt-4"
            onClick={() => navigate('/run-audits')}
          >
            Run Audit Now →
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography variant="title2" className="mb-1">
            🕐 Recent Audits
          </Typography>
          <Typography variant="caption1" color="secondary">
            Last {audits.length} audit runs
          </Typography>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
          View All Reports →
        </Button>
      </div>

      {/* Audit Timeline */}
      <div className="space-y-3">
        {audits.map((audit, index) => (
          <div
            key={audit.id}
            className={`
              flex items-center justify-between p-4 border border-gray-200 rounded-apple
              hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200
              ${index === 0 ? 'border-primary-300 bg-primary-50' : ''}
            `}
          >
            {/* Left: Audit Info */}
            <div className="flex-1 flex items-center gap-4">
              {/* Audit Type Badge */}
              <Badge
                variant={getAuditTypeBadgeVariant(audit.audit_type)}
                size="sm"
                className="flex-shrink-0"
              >
                {audit.audit_type}
              </Badge>

              {/* Facility Name */}
              <Typography variant="body" className="font-medium flex-shrink-0">
                {audit.facility_name}
              </Typography>

              {/* Compliance Score */}
              {audit.compliance_score !== undefined && (
                <div className="flex items-center gap-1">
                  <Typography
                    variant="body"
                    className={`${getComplianceColor(audit.compliance_score)} font-semibold tabular-nums`}
                  >
                    {Math.round(audit.compliance_score)}%
                  </Typography>
                  <Typography variant="caption2" color="secondary">
                    compliant
                  </Typography>
                </div>
              )}

              {/* Action Items Count */}
              <Typography variant="caption1" color="secondary">
                {audit.action_items_count} action items
              </Typography>

              {/* Time Ago */}
              <Typography variant="caption1" color="secondary" className="flex-shrink-0">
                {formatRelativeDate(new Date(audit.created_at))}
              </Typography>
            </div>

            {/* Right: Export Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(audit.id)}
              aria-label={`Export ${audit.audit_type} audit for ${audit.facility_name}`}
            >
              Export
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentAuditsTimeline;
