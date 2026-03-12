import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FacilityMultiSelect, type Facility as FacilityMultiSelectType } from '../components/execution/FacilityMultiSelect';
import { AuditTypePills, type AuditType, type AuditTypeInfo } from '../components/execution/AuditTypePills';
import { AdmissionFilter, type AdmissionFilterValue } from '../components/execution/AdmissionFilter';
import { CensusSummaryPanel } from '../components/execution/CensusSummaryPanel';
import { BatchExecutionPanel } from '../components/execution/BatchExecutionPanel';
import { ProgressModal } from '../components/execution/ProgressModal';
import { type BatchStatus } from '../components/execution/ProgressTracker';
import { useBatchExecution } from '../hooks/useBatchExecution';
import { apiClient } from '../services/api';

export const RunAuditsView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [facilities, setFacilities] = useState<FacilityMultiSelectType[]>([]);
  const [auditTypes, setAuditTypes] = useState<AuditTypeInfo[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [selectedFacilities, setSelectedFacilities] = useState<number[]>([]);
  const [selectedAuditTypes, setSelectedAuditTypes] = useState<AuditType[]>([
    'psychotropic', 'catheter', 'skin_wound', 'falls', 'admissions',
  ]);
  const [admissionFilter, setAdmissionFilter] = useState<AdmissionFilterValue>('7_days');
  const [isExporting, setIsExporting] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(true);
  const [censusSummary, setCensusSummary] = useState<import('../types/audit').CensusSummary | null>(null);

  const {
    batchId, batchStatus, isExecuting, error, isComplete, executeBatch, reset,
  } = useBatchExecution();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        setDataError(null);

        const [facilitiesData, metricsData] = await Promise.all([
          apiClient.getFacilities(),
          apiClient.getDashboardMetrics(),
        ]);

        const mappedFacilities: FacilityMultiSelectType[] = facilitiesData.map((f): FacilityMultiSelectType => ({
          id: f.id,
          name: f.name,
          overall_status: f.overall_status as 'critical' | 'due_soon' | 'up_to_date',
          total_open_items: f.total_open_items,
          critical_count: f.total_critical_items || 0,
          last_audit_date: f.last_audit_date || null,
        }));

        setFacilities(mappedFacilities);

        const auditTypeInfo: AuditTypeInfo[] = [
          { id: 'psychotropic', label: 'Psychotropic', description: 'Medication monitoring (F-Tag 758)', icon: '💊', openItemsCount: metricsData.audit_types.psychotropic?.action_items || 0, criticalCount: 0 },
          { id: 'catheter', label: 'Catheter', description: 'Indwelling catheter management (F-Tag 315)', icon: '🩺', openItemsCount: metricsData.audit_types.catheter?.action_items || 0, criticalCount: 0 },
          { id: 'skin_wound', label: 'Skin & Wound', description: 'Pressure injury prevention (F-Tag 686)', icon: '🏥', openItemsCount: metricsData.audit_types['skin-wound']?.action_items || 0, criticalCount: 0 },
          { id: 'falls', label: 'Falls', description: 'Fall prevention & documentation (F-Tag 689)', icon: '⚠️', openItemsCount: metricsData.audit_types.falls?.action_items || 0, criticalCount: 0 },
          { id: 'admissions', label: 'Admissions', description: 'Admission assessment compliance', icon: '📋', openItemsCount: metricsData.audit_types.admissions?.action_items || 0, criticalCount: 0 },
        ];

        setAuditTypes(auditTypeInfo);
      } catch (err) {
        setDataError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isLoadingData || facilities.length === 0) return;

    const facilitiesParam = searchParams.get('facilities');
    const typesParam = searchParams.get('types');

    if (facilitiesParam) {
      const facilityIds = facilitiesParam.split(',').map((id) => parseInt(id.trim(), 10)).filter((id) => !isNaN(id));
      if (facilityIds.length > 0) setSelectedFacilities(facilityIds);
    }

    if (typesParam) {
      const types = typesParam.split(',').map((t) => t.trim() as AuditType).filter((t) => ['psychotropic', 'catheter', 'skin_wound', 'falls', 'admissions'].includes(t));
      if (types.length > 0) setSelectedAuditTypes(types);
    }
  }, [isLoadingData, facilities, searchParams]);

  const handleExecute = useCallback(async () => {
    if (selectedFacilities.length === 0 || selectedAuditTypes.length === 0) return;
    setShowProgressModal(true);
    await executeBatch(selectedFacilities, selectedAuditTypes, admissionFilter);
  }, [selectedFacilities, selectedAuditTypes, admissionFilter, executeBatch]);

  const handleComplete = useCallback((_finalStatus: BatchStatus) => {
    setShowProgressModal(false);
    setTimeout(() => {
      const el = document.getElementById('results-section');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleResetExecution = useCallback(() => reset(), [reset]);

  const handleExportAllResults = useCallback(async () => {
    if (!batchStatus?.auditRunIds || batchStatus.auditRunIds.length === 0) return;
    setIsExporting(true);
    try {
      await apiClient.exportBatchAudits(batchStatus.auditRunIds);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [batchStatus]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Run Audits</h1>
              <p className="text-base text-gray-500 mt-1">Execute audits across multiple facilities simultaneously</p>
            </div>
            {isComplete && (
              <button onClick={handleResetExecution} className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-300 rounded-apple hover:bg-primary-100 transition-colors duration-200">
                New Batch Execution
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <AdmissionFilter value={admissionFilter} onChange={setAdmissionFilter} />
        </div>

        <CensusSummaryPanel selectedFacilityIds={selectedFacilities} admissionFilter={admissionFilter} onFilterChange={setAdmissionFilter} onCensusSummaryChange={setCensusSummary} />

        <div className="grid grid-cols-5 gap-6 mb-24">
          <div className="col-span-3">
            <FacilityMultiSelect selectedFacilities={selectedFacilities} onSelectionChange={setSelectedFacilities} facilities={facilities} isLoading={isLoadingData} error={dataError} />
          </div>
          <div className="col-span-2">
            <AuditTypePills selectedAuditTypes={selectedAuditTypes} onSelectionChange={setSelectedAuditTypes} auditTypes={auditTypes} isLoading={isLoadingData} error={dataError} />
          </div>
        </div>

        {showProgressModal && batchStatus && batchId && (
          <ProgressModal batchStatus={batchStatus} isLoading={false} error={error} onComplete={handleComplete} />
        )}

        {isComplete && batchStatus && (
          <>
            <div id="results-section" className="rounded-apple bg-white border border-gray-200 shadow-lg p-6 mb-4 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Execution Summary</h3>
                {batchStatus.auditRunIds && batchStatus.auditRunIds.length > 0 && (
                  <button onClick={handleExportAllResults} disabled={isExporting} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-apple hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50">
                    {isExporting ? 'Exporting...' : 'Export All Results'}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-green-600 tabular-nums">{batchStatus.completed}</div>
                  <div className="text-sm text-gray-500 mt-1">Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600 tabular-nums">{batchStatus.failed}</div>
                  <div className="text-sm text-gray-500 mt-1">Failed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 tabular-nums">{batchStatus.totalRuns}</div>
                  <div className="text-sm text-gray-500 mt-1">Total Runs</div>
                </div>
              </div>
            </div>

            <div className="rounded-apple bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 shadow-md p-6 mb-8 animate-fade-in">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">Audits completed successfully!</h3>
                  <p className="text-sm text-primary-700 mb-3">Review detailed audit reports, action items, and compliance metrics</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/reports')} className="px-6 py-3 text-base font-semibold text-white bg-primary-600 rounded-apple hover:bg-primary-700 transition-all duration-200 shadow-sm">
                      View Reports
                    </button>
                    <button onClick={() => navigate('/action-items')} className="px-6 py-3 text-base font-medium text-primary-700 bg-white border border-primary-300 rounded-apple hover:bg-primary-50 transition-colors duration-200">
                      View Action Items
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {!isExecuting && (
        <BatchExecutionPanel
          facilityCount={selectedFacilities.length}
          auditTypeCount={selectedAuditTypes.length}
          onExecute={handleExecute}
          isExecuting={isExecuting}
          hasNoPatients={(() => {
            if (!censusSummary) return false;
            if (admissionFilter === '7_days') return censusSummary.totals.admitted_7d === 0;
            if (admissionFilter === '30_days') return censusSummary.totals.admitted_30d === 0;
            return censusSummary.totals.total_current === 0;
          })()}
        />
      )}
    </div>
  );
};

export default RunAuditsView;
