import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';

export function useSurveyReadiness() {
  return useQuery({
    queryKey: ['surveyReadiness'],
    queryFn: () => apiClient.getSurveyReadiness(),
  });
}
