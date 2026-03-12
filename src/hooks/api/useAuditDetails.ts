import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api';

export function useAuditRun(auditRunId: string | number) {
  const auditRunIdNum = typeof auditRunId === 'string' ? parseInt(auditRunId, 10) : auditRunId;

  return useQuery({
    queryKey: ['auditRun', auditRunIdNum],
    queryFn: () => apiClient.getAuditRunById(auditRunIdNum),
    enabled: !!auditRunId && !isNaN(auditRunIdNum),
    staleTime: 300000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useAuditFindings(auditRunId: string | number) {
  const auditRunIdNum = typeof auditRunId === 'string' ? parseInt(auditRunId, 10) : auditRunId;

  return useQuery({
    queryKey: ['auditFindings', auditRunIdNum],
    queryFn: () => apiClient.getAuditFindings(auditRunIdNum),
    enabled: !!auditRunId && !isNaN(auditRunIdNum),
    staleTime: 600000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useAuditActionItems(auditRunId: string | number) {
  const auditRunIdNum = typeof auditRunId === 'string' ? parseInt(auditRunId, 10) : auditRunId;

  return useQuery({
    queryKey: ['auditActionItems', auditRunIdNum],
    queryFn: () => apiClient.getAuditActionItems(auditRunIdNum),
    enabled: !!auditRunId && !isNaN(auditRunIdNum),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useComprehensiveAuditResults(auditRunId: string | number) {
  const auditRunIdNum = typeof auditRunId === 'string' ? parseInt(auditRunId, 10) : auditRunId;

  return useQuery({
    queryKey: ['comprehensiveAuditResults', auditRunIdNum],
    queryFn: () => apiClient.getComprehensiveAuditResults(auditRunIdNum),
    enabled: !!auditRunId && !isNaN(auditRunIdNum),
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
