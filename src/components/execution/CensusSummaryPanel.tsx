import { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import type { CensusSummary } from '../../types/audit';

export type AdmissionFilterValue = 'all' | '7_days' | '30_days';

interface CensusSummaryPanelProps {
  selectedFacilityIds: number[];
  admissionFilter: AdmissionFilterValue;
  onFilterChange: (filter: AdmissionFilterValue) => void;
  onCensusSummaryChange?: (summary: CensusSummary | null) => void;
}

export const CensusSummaryPanel: React.FC<CensusSummaryPanelProps> = ({
  selectedFacilityIds,
  admissionFilter,
  onFilterChange,
  onCensusSummaryChange,
}) => {
  const [censusSummary, setCensusSummary] = useState<CensusSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (selectedFacilityIds.length === 0) {
      setCensusSummary(null);
      onCensusSummaryChange?.(null);
      return;
    }

    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.getCensusSummary(selectedFacilityIds, admissionFilter);
        setCensusSummary(response);
        onCensusSummaryChange?.(response);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch census summary');
        onCensusSummaryChange?.(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [selectedFacilityIds, admissionFilter, onCensusSummaryChange]);

  if (selectedFacilityIds.length === 0) return null;

  const getAffectedCount = () => {
    if (!censusSummary) return 0;
    if (admissionFilter === '7_days') return censusSummary.totals.admitted_7d;
    if (admissionFilter === '30_days') return censusSummary.totals.admitted_30d;
    return censusSummary.totals.total_current;
  };

  const affectedCount = getAffectedCount();
  const hasNoPatients = affectedCount === 0;

  const getFilterLabel = (filter: AdmissionFilterValue) => {
    switch (filter) {
      case '7_days': return 'Last 7 Days';
      case '30_days': return 'Last 30 Days';
      case 'all': return 'All Current';
      default: return filter;
    }
  };

  const getFacilityPatientCount = (facility: any) => {
    if (admissionFilter === '7_days') return facility.admitted_7d;
    if (admissionFilter === '30_days') return facility.admitted_30d;
    return facility.total_current;
  };

  const facilitiesWithNoPatients = censusSummary?.facilities.filter((f) => getFacilityPatientCount(f) === 0) || [];
  const facilitiesWithPatients = censusSummary?.facilities.filter((f) => getFacilityPatientCount(f) > 0) || [];

  return (
    <div className="bg-white rounded-apple border border-gray-200 shadow-md p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Census Summary</h3>
          {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading census data...</div>
          ) : censusSummary ? (
            <div className="grid grid-cols-4 gap-6">
              <div><div className="text-sm text-gray-500 mb-1">Facilities</div><div className="text-2xl font-bold text-gray-900">{selectedFacilityIds.length}</div></div>
              <div><div className="text-sm text-gray-500 mb-1">Active Patients</div><div className="text-2xl font-bold text-gray-900">{censusSummary.totals.total_current}</div></div>
              <div><div className="text-sm text-gray-500 mb-1">Admitted (Last 7 Days)</div><div className="text-2xl font-bold text-blue-600">{censusSummary.totals.admitted_7d}</div></div>
              <div><div className="text-sm text-gray-500 mb-1">Admitted (Last 30 Days)</div><div className="text-2xl font-bold text-blue-600">{censusSummary.totals.admitted_30d}</div></div>
            </div>
          ) : null}

          {!isLoading && censusSummary && facilitiesWithNoPatients.length > 0 && !hasNoPatients && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{facilitiesWithNoPatients.length} {facilitiesWithNoPatients.length === 1 ? 'facility has' : 'facilities have'} 0 patients in "{getFilterLabel(admissionFilter)}" filter</span>
                <button onClick={() => setShowDetails(!showDetails)} className="text-sm font-medium text-primary-600 hover:text-primary-700">{showDetails ? 'Hide Details' : 'Show Details'}</button>
              </div>
              {showDetails && (
                <div className="mt-3 border border-gray-200 rounded-apple max-h-64 overflow-y-auto">
                  {facilitiesWithPatients.map((f) => (
                    <div key={f.facility_id} className="flex items-center justify-between px-4 py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                      <span className="text-sm text-gray-900">{f.facility_name}</span>
                      <span className="text-sm font-medium text-gray-900">{getFacilityPatientCount(f)} patients</span>
                    </div>
                  ))}
                  {facilitiesWithNoPatients.map((f) => (
                    <div key={f.facility_id} className="flex items-center justify-between px-4 py-2 border-b border-gray-100 last:border-b-0 bg-yellow-50">
                      <span className="text-sm text-gray-900">{f.facility_name}</span>
                      <span className="text-sm font-medium text-yellow-700">0 patients (will be skipped)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isLoading && hasNoPatients && censusSummary && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-apple p-4">
              <div className="text-sm font-semibold text-yellow-900 mb-1">No Patients Match Filter</div>
              <div className="text-sm text-yellow-700 mb-3">The selected "{getFilterLabel(admissionFilter)}" filter has 0 patients.</div>
              <button onClick={() => onFilterChange('all')} className="text-sm font-medium text-yellow-900 bg-yellow-100 px-3 py-1 rounded-apple hover:bg-yellow-200">
                Change to "All Current" ({censusSummary.totals.total_current} patients)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
