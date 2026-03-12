/**
 * QuickRunAudits Component - Fast Audit Execution Widget
 * Sprint 37: Dashboard Redesign
 *
 * Provides one-click audit execution with smart defaults:
 * - Pre-selects "never audited" facilities
 * - All 5 audit types pre-selected
 * - Live calculation: X facilities × Y types = Z runs
 * - Prominent "Run Audits Now" CTA button
 *
 * Features:
 * - Compact facility/type selection
 * - Live calculation display
 * - Smart defaults for frictionless execution
 * - Redirects to /run-audits with pre-selected values
 *
 * Usage:
 * ```tsx
 * <QuickRunAudits facilities={facilities} />
 * ```
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography } from '../ui';
import type { Facility } from '../../types/audit';

export interface QuickRunAuditsProps {
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
 * QuickRunAudits Component
 */
export const QuickRunAudits: React.FC<QuickRunAuditsProps> = ({
  facilities,
  isLoading = false,
  className = '',
}) => {
  const navigate = useNavigate();

  // Smart defaults: All facilities, all audit types
  const [selectedFacilities, setSelectedFacilities] = useState<number[]>(
    facilities.map((f) => f.id)
  );
  const [selectedAuditTypes, setSelectedAuditTypes] = useState<string[]>([
    'psychotropic',
    'catheter',
    'skin_wound',
    'falls',
    'admissions',
  ]);

  // Update selected facilities when facilities data changes
  useEffect(() => {
    if (selectedFacilities.length === 0 && facilities.length > 0) {
      setSelectedFacilities(facilities.map((f) => f.id));
    }
  }, [facilities, selectedFacilities.length]);

  // Calculate total runs
  const totalRuns = selectedFacilities.length * selectedAuditTypes.length;
  const estimatedMinutes = Math.ceil(totalRuns * 0.08); // ~5 seconds per audit run

  /**
   * Handle Quick Run (Navigate to Run Audits page with selections)
   */
  const handleQuickRun = () => {
    // Navigate to /run-audits with pre-selected facilities and types as URL params
    const facilityParam = selectedFacilities.join(',');
    const typeParam = selectedAuditTypes.join(',');
    navigate(`/run-audits?facilities=${facilityParam}&types=${typeParam}`);
  };

  /**
   * Handle Facility Selection Toggle
   */
  const handleFacilityToggle = (preset: 'all' | 'critical') => {
    switch (preset) {
      case 'all': {
        setSelectedFacilities(facilities.map((f) => f.id));
        break;
      }
      case 'critical': {
        const criticalFacilities = facilities.filter(
          (f) => f.total_critical_items > 0
        );
        setSelectedFacilities(criticalFacilities.map((f) => f.id));
        break;
      }
    }
  };

  /**
   * Handle Audit Type Toggle
   */
  const handleAuditTypeToggle = (auditType: string) => {
    setSelectedAuditTypes((prev) =>
      prev.includes(auditType)
        ? prev.filter((t) => t !== auditType)
        : [...prev, auditType]
    );
  };

  if (isLoading) {
    return (
      <Card variant="elevated" className={`animate-pulse ${className}`}>
        <div className="h-40 bg-gray-200 rounded"></div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className={className}>
      {/* Header */}
      <div className="mb-6">
        <Typography variant="title2" className="mb-2">
          ⚡ Quick Run Audits
        </Typography>
        <Typography variant="body" color="secondary">
          Execute audits across multiple facilities with one click
        </Typography>
      </div>

      {/* Facility Selection Presets */}
      <div className="mb-4">
        <Typography variant="body" className="mb-2 font-medium">
          Select Facilities:
        </Typography>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedFacilities.length === facilities.length ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFacilityToggle('all')}
          >
            All Facilities
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFacilityToggle('critical')}
          >
            Critical Only
          </Button>
        </div>
        <Typography variant="caption2" color="secondary" className="mt-2">
          {selectedFacilities.length} facilities selected
        </Typography>
      </div>

      {/* Audit Type Selection */}
      <div className="mb-4">
        <Typography variant="body" className="mb-2 font-medium">
          Audit Types:
        </Typography>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedAuditTypes.includes('psychotropic') ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleAuditTypeToggle('psychotropic')}
          >
            💊 Psychotropic
          </Button>
          <Button
            variant={selectedAuditTypes.includes('catheter') ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleAuditTypeToggle('catheter')}
          >
            🩺 Catheter
          </Button>
          <Button
            variant={selectedAuditTypes.includes('skin_wound') ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleAuditTypeToggle('skin_wound')}
          >
            🏥 Skin & Wound
          </Button>
          <Button
            variant={selectedAuditTypes.includes('falls') ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleAuditTypeToggle('falls')}
          >
            ⚠️ Falls
          </Button>
          <Button
            variant={selectedAuditTypes.includes('admissions') ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleAuditTypeToggle('admissions')}
          >
            📋 Admissions
          </Button>
        </div>
        <Typography variant="caption2" color="secondary" className="mt-2">
          {selectedAuditTypes.length === 5
            ? 'All 5 audit types selected (pre-configured)'
            : `${selectedAuditTypes.length} audit type${selectedAuditTypes.length === 1 ? '' : 's'} selected`}
        </Typography>
      </div>

      {/* Calculation Display */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-apple">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="body" className="font-semibold text-blue-900">
              {selectedFacilities.length} facilities × {selectedAuditTypes.length} types = {totalRuns} runs
            </Typography>
            <Typography variant="caption1" color="secondary">
              Estimated time: ~{estimatedMinutes} {estimatedMinutes === 1 ? 'minute' : 'minutes'}
            </Typography>
          </div>
        </div>
      </div>

      {/* Run Audits Button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleQuickRun}
        disabled={selectedFacilities.length === 0 || selectedAuditTypes.length === 0}
      >
        Run Audits Now →
      </Button>
    </Card>
  );
};

export default QuickRunAudits;
