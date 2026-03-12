import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';

export function useExceptions(filters?: {
  audit_type?: string;
  facility_id?: number;
  status?: string;
  severity?: string;
}) {
  return useQuery({
    queryKey: ['exceptions', filters],
    queryFn: () => apiClient.getExceptions(filters),
  });
}

export function useApproveException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.approveException(id),
    onSuccess: () => {
      // Invalidate after sync delay
      setTimeout(() => qc.invalidateQueries({ queryKey: ['exceptions'] }), 1700);
      qc.invalidateQueries({ queryKey: ['exceptions'] });
      qc.invalidateQueries({ queryKey: ['commandCenter'] });
    },
  });
}

export function useBatchApproveExceptions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => apiClient.batchApproveExceptions(ids),
    onSuccess: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ['exceptions'] }), 1700);
      qc.invalidateQueries({ queryKey: ['exceptions'] });
      qc.invalidateQueries({ queryKey: ['commandCenter'] });
    },
  });
}

export function useHoldException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.holdException(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exceptions'] });
    },
  });
}

export function useDismissException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.dismissException(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exceptions'] });
    },
  });
}
