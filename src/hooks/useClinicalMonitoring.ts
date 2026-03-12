import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { ALL_AUDIT_TYPES } from '../types/audit';

export function useClinicalMonitoring() {
  const exceptions = useQuery({
    queryKey: ['exceptions'],
    queryFn: () => apiClient.getExceptions(),
    refetchInterval: 45000,
  });

  const highRisk = useQuery({
    queryKey: ['highRiskResidents'],
    queryFn: () => apiClient.getHighRiskResidents(),
  });

  const facilities = useQuery({
    queryKey: ['facilities'],
    queryFn: () => apiClient.getFacilities(),
  });

  const auditTypeStats = ALL_AUDIT_TYPES.map((type) => {
    const typeExceptions = exceptions.data?.filter((e) => e.audit_type === type) || [];
    const pending = typeExceptions.filter((e) => e.pcc_sync_status === 'pending').length;
    const total = typeExceptions.length;
    const complianceRate = total > 0 ? Math.round(((total - pending) / total) * 100) : 100;

    return {
      type,
      findingsCount: total,
      pendingCount: pending,
      complianceRate,
      lastScan: facilities.data
        ?.map((f) => f.last_agent_scan)
        .sort()
        .reverse()[0] || new Date().toISOString(),
    };
  });

  return {
    auditTypeStats,
    highRiskResidents: highRisk.data || [],
    isLoading: exceptions.isLoading || highRisk.isLoading,
  };
}
