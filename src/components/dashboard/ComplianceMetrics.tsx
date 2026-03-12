/**
 * ComplianceMetrics Component - Dashboard Compliance Overview
 * Sprint 37 UI Fixes: Redesigned with 4 key metrics + tooltips
 *
 * Displays 4 key compliance metrics with 7th-grade explanations:
 * 1. Compliance Score (%) - "Following the Rules"
 * 2. Total Open Action Items - "Problems to Fix"
 * 3. Critical Violations - "Urgent Issues"
 * 4. At-Risk Facilities - "Facilities Needing Help"
 *
 * Features:
 * - Card-based layout (4 columns)
 * - Color-coded badges (green/yellow/red)
 * - Tooltip help text (click ? icon)
 * - Responsive design
 */

import React, { useState } from 'react';
import { Card, Badge, Typography } from '../ui';
import type { DashboardMetrics, Facility } from '../../types/audit';

export interface ComplianceMetricsProps {
  /**
   * Dashboard metrics data
   */
  metrics: DashboardMetrics;

  /**
   * Facilities data (for calculating derived metrics)
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
 * Tooltip Component for Help Text
 */
const MetricTooltip: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ml-2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs font-bold transition-colors"
        aria-label={`Help for ${title}`}
      >
        ?
      </button>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          {/* Tooltip */}
          <div className="absolute left-0 top-8 z-50 w-80 p-4 bg-white rounded-lg shadow-xl border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <Typography variant="title3" className="font-semibold">
                {title}
              </Typography>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-700 space-y-2">{children}</div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * ComplianceMetrics Component
 */
export const ComplianceMetrics: React.FC<ComplianceMetricsProps> = ({
  metrics,
  facilities,
  isLoading = false,
  className = '',
}) => {
  // Calculate derived metrics
  const overallCompliance = metrics.current_compliance || 0;
  const totalOpenItems = metrics.pending_action_items;
  const criticalCount = facilities.filter((f) => f.total_critical_items > 0).length;
  const atRiskCount = facilities.filter((f) => {
    const hasCritical = f.total_critical_items > 0;
    const lowCompliance = (f.compliance_score || 0) < 75;
    return hasCritical || lowCompliance;
  }).length;

  // Determine compliance status color
  const getComplianceColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="elevated" className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {/* Metric 1: Compliance Score - "Following the Rules" */}
      <Card variant="elevated" className="hover:shadow-lg transition-shadow">
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">✅</span>
            <Typography variant="caption1" color="secondary">
              Following the Rules
            </Typography>
            <MetricTooltip title="What does this mean?">
              <p className="mb-2">
                <strong>Out of every 100 patients who need to be checked, {Math.round(overallCompliance)} are
                following the rules correctly.</strong>
              </p>
              <p className="mb-2">
                We only count patients who actually need each check. For example, in a medication audit, we only look
                at patients who are taking that medication - not your whole building.
              </p>
              <p>
                <strong>What's a good score?</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>90%+ = Great! (Green)</li>
                <li>75-89% = OK, but needs work (Yellow)</li>
                <li>Below 75% = Needs immediate attention (Red)</li>
              </ul>
            </MetricTooltip>
          </div>
          <div className="flex items-baseline gap-2">
            <Typography
              variant="title1"
              className={`${getComplianceColor(overallCompliance)} tabular-nums`}
            >
              {Math.round(overallCompliance)}%
            </Typography>
            {metrics.compliance_trend !== 0 && (
              <Typography variant="caption2" color="secondary" className="flex items-center gap-1">
                <span>{metrics.compliance_trend > 0 ? '↑' : '↓'}</span>
                {Math.abs(metrics.compliance_trend)}%
              </Typography>
            )}
          </div>
          <Typography variant="caption2" color="secondary" className="mt-1">
            System Average
          </Typography>
        </div>
      </Card>

      {/* Metric 2: Total Open Items - "Problems to Fix" */}
      <Card variant="elevated" className="hover:shadow-lg transition-shadow">
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">📋</span>
            <Typography variant="caption1" color="secondary">
              Problems to Fix
            </Typography>
            <MetricTooltip title="What are action items?">
              <p className="mb-2">
                <strong>There are {totalOpenItems} things that need to be fixed across all your facilities.</strong>
              </p>
              <p className="mb-2">
                Every time an audit finds something wrong, we create an "action item" - like a to-do list task. This
                number is your total to-do list.
              </p>
              <p className="mb-2">
                <strong>Example:</strong> If a patient needs medication monitoring but doesn't have it, that's 1 action
                item.
              </p>
              <p>
                <strong>Good news:</strong> When you fix something, it automatically comes off the list during the next
                audit!
              </p>
            </MetricTooltip>
          </div>
          <div className="flex items-baseline gap-2">
            <Typography variant="title1" className="text-blue-600 tabular-nums">
              {totalOpenItems}
            </Typography>
          </div>
          <Typography variant="caption2" color="secondary" className="mt-1">
            Total Open Items
          </Typography>
        </div>
      </Card>

      {/* Metric 3: Critical Violations - "Urgent Issues" */}
      <Card variant="elevated" className="hover:shadow-lg transition-shadow">
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">⚠️</span>
            <Typography variant="caption1" color="secondary">
              Urgent Issues
            </Typography>
            <MetricTooltip title="Why are some problems critical?">
              <p className="mb-2">
                <strong>There are {criticalCount} facilities with serious problems right now.</strong>
              </p>
              <p className="mb-2">Critical means it's either:</p>
              <ul className="list-disc list-inside space-y-1 mb-2">
                <li>A serious safety risk for residents</li>
                <li>Something a state inspector would write up immediately</li>
                <li>Missing required documentation for a major event</li>
              </ul>
              <p className="font-bold">
                This number should always be ZERO. If you see any critical issues, fix those first before anything
                else.
              </p>
            </MetricTooltip>
          </div>
          <div className="flex items-baseline gap-2">
            <Typography variant="title1" className="text-red-600 tabular-nums">
              {criticalCount}
            </Typography>
            <Badge variant="danger" size="sm" className="ml-1">
              Critical
            </Badge>
          </div>
          <Typography variant="caption2" color="secondary" className="mt-1">
            Facilities with Critical Items
          </Typography>
        </div>
      </Card>

      {/* Metric 4: At-Risk Facilities - "Facilities Needing Help" */}
      <Card variant="elevated" className="hover:shadow-lg transition-shadow">
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">🏥</span>
            <Typography variant="caption1" color="secondary">
              Facilities Needing Help
            </Typography>
            <MetricTooltip title="When is a facility at risk?">
              <p className="mb-2">
                <strong>{atRiskCount} of your facilities need attention right now.</strong>
              </p>
              <p className="mb-2">A facility shows up here if EITHER:</p>
              <ul className="list-disc list-inside space-y-1 mb-2">
                <li>It has any critical (urgent) violations, OR</li>
                <li>Its compliance score is below 75%</li>
              </ul>
              <p>
                <strong>Click to see the list</strong> of which facilities need help, and what problems they have.
              </p>
            </MetricTooltip>
          </div>
          <div className="flex items-baseline gap-2">
            <Typography variant="title1" className="text-orange-600 tabular-nums">
              {atRiskCount}
            </Typography>
          </div>
          <Typography variant="caption2" color="secondary" className="mt-1">
            Sites Below 75% or Critical
          </Typography>
        </div>
      </Card>
    </div>
  );
};
