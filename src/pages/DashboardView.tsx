import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Typography } from '../components/ui';
import { ComplianceMetrics } from '../components/dashboard/ComplianceMetrics';
import { RecentAuditsTimeline } from '../components/dashboard/RecentAuditsTimeline';
import { AtRiskFacilities } from '../components/dashboard/AtRiskFacilities';
import { apiClient } from '../services/api';

export const DashboardView: React.FC = () => {
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => apiClient.getDashboardMetrics(),
    staleTime: 30000,
  });

  const { data: facilities = [], isLoading: loadingFacilities } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => apiClient.getFacilities(),
    staleTime: 60000,
  });

  const { data: recentAudits = [], isLoading: loadingAudits } = useQuery({
    queryKey: ['recent-audits'],
    queryFn: () => apiClient.getRecentAudits(10),
    staleTime: 30000,
  });

  const handleExportAudit = async (auditRunId: number) => {
    try {
      await apiClient.exportAuditResults(auditRunId);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const isLoading = loadingMetrics || loadingFacilities || loadingAudits;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Typography variant="title1" className="mb-2">
            Audit Dashboard
          </Typography>
          <Typography variant="body" color="secondary">
            Compliance overview and audit execution
          </Typography>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <section className="mb-8">
          {metrics && (
            <ComplianceMetrics
              metrics={metrics}
              facilities={facilities}
              isLoading={isLoading}
            />
          )}
        </section>

        <section className="mb-8">
          <AtRiskFacilities facilities={facilities} isLoading={loadingFacilities} />
        </section>

        <section>
          <RecentAuditsTimeline
            audits={recentAudits}
            isLoading={loadingAudits}
            onExport={handleExportAudit}
          />
        </section>
      </div>
    </div>
  );
};

export default DashboardView;
