import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';

export function useCommandCenter() {
  return useQuery({
    queryKey: ['commandCenter'],
    queryFn: () => apiClient.getCommandCenterMetrics(),
    refetchInterval: 30000,
  });
}

export function useFacilities() {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: () => apiClient.getFacilities(),
  });
}
