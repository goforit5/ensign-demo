import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api';
import { STALE_TIMES } from '../../constants/config';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => apiClient.getDashboardMetrics(),
    staleTime: STALE_TIMES.DASHBOARD_METRICS,
    refetchOnWindowFocus: false,
  });
}

export function useFacilities() {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: () => apiClient.getFacilities(),
    staleTime: STALE_TIMES.FACILITIES,
    refetchOnWindowFocus: false,
  });
}

export function useRecentAudits(limit: number = 10) {
  return useQuery({
    queryKey: ['audits', 'recent', limit],
    queryFn: () => apiClient.getRecentAudits(limit),
    staleTime: STALE_TIMES.RECENT_AUDITS,
    refetchOnWindowFocus: false,
  });
}

export function useActionItems(facilityId?: number) {
  return useQuery({
    queryKey: ['actionItems', facilityId],
    queryFn: () => apiClient.getActionItems(facilityId),
    staleTime: STALE_TIMES.ACTION_ITEMS,
    refetchOnWindowFocus: false,
    enabled: !!facilityId,
  });
}

export function useActivityEvents() {
  return useQuery({
    queryKey: ['activity', 'events'],
    queryFn: () => apiClient.getActivityEvents(),
    staleTime: STALE_TIMES.ACTIVITY_EVENTS,
    refetchOnWindowFocus: false,
  });
}
