import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';

export function useAgentActivity(filters?: {
  agent_name?: string;
  facility_id?: number;
  result?: string;
  days?: number;
}) {
  return useQuery({
    queryKey: ['agentActivity', filters],
    queryFn: () => apiClient.getAgentActivity(filters),
    refetchInterval: 45000,
  });
}
