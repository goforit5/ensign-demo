import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';

export function useFacilityDetail(facilityId: number) {
  const facility = useQuery({
    queryKey: ['facility', facilityId],
    queryFn: () => apiClient.getFacility(facilityId),
  });

  const exceptions = useQuery({
    queryKey: ['exceptions', { facility_id: facilityId }],
    queryFn: () => apiClient.getExceptions({ facility_id: facilityId }),
  });

  const activity = useQuery({
    queryKey: ['agentActivity', { facility_id: facilityId }],
    queryFn: () => apiClient.getAgentActivity({ facility_id: facilityId }),
  });

  const residents = useQuery({
    queryKey: ['highRiskResidents', facilityId],
    queryFn: () => apiClient.getHighRiskResidents(facilityId),
  });

  return {
    facility: facility.data,
    exceptions: exceptions.data || [],
    activity: activity.data || [],
    highRiskResidents: residents.data || [],
    isLoading: facility.isLoading,
  };
}
