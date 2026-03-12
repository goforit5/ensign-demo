import { useState, useCallback, useEffect, useRef } from 'react';
import type { BatchStatus } from '../components/execution/ProgressTracker';
import { apiClient } from '../services/api';
import { facilities } from '../data/facilities';

interface UseBatchExecutionReturn {
  batchId: string | null;
  batchStatus: BatchStatus | null;
  isExecuting: boolean;
  progress: { completed: number; total: number; percentage: number };
  error: string | null;
  isComplete: boolean;
  executeBatch: (facilityIds: number[], auditTypes: string[], admissionDaysFilter?: string) => Promise<void>;
  cancelExecution: () => void;
  reset: () => void;
}

export function useBatchExecution(): UseBatchExecutionReturn {
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<BatchStatus | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const executeBatch = useCallback(
    async (facilityIds: number[], auditTypes: string[], _admissionDaysFilter: string = '7_days') => {
      if (facilityIds.length === 0 || auditTypes.length === 0) {
        setError('Please select at least one facility and one audit type');
        return;
      }

      try {
        setIsExecuting(true);
        setError(null);
        setIsComplete(false);
        cancelledRef.current = false;

        const id = `batch-${Date.now()}`;
        setBatchId(id);

        // Build list of runs
        const runs: Array<{
          facilityId: number;
          facilityName: string;
          auditType: string;
          status: 'pending' | 'in_progress' | 'completed' | 'failed';
          actionItemsCreated?: number;
          auditRunId?: number;
        }> = [];

        facilityIds.forEach((fId) => {
          const fac = facilities.find((f) => f.id === fId);
          auditTypes.forEach((at) => {
            runs.push({
              facilityId: fId,
              facilityName: fac?.name || 'Unknown',
              auditType: at,
              status: 'pending',
            });
          });
        });

        const totalRuns = runs.length;
        const auditRunIds: number[] = [];
        let currentIndex = 0;

        // Initial status
        setBatchStatus({
          batchId: id,
          totalRuns,
          completed: 0,
          inProgress: 0,
          failed: 0,
          runs: runs.map((r, i) => ({
            id: `run-${i}`,
            facilityId: r.facilityId,
            facilityName: r.facilityName,
            auditType: r.auditType,
            status: 'pending',
          })),
          auditRunIds: [],
        });

        // Simulate runs one at a time with interval
        intervalRef.current = window.setInterval(async () => {
          if (cancelledRef.current) {
            stopSimulation();
            return;
          }

          if (currentIndex >= totalRuns) {
            stopSimulation();
            return;
          }

          const run = runs[currentIndex];
          run.status = 'in_progress';

          // Update to show in_progress
          const completedSoFar = runs.filter((r) => r.status === 'completed').length;
          const failedSoFar = runs.filter((r) => r.status === 'failed').length;

          setBatchStatus({
            batchId: id,
            totalRuns,
            completed: completedSoFar,
            inProgress: 1,
            failed: failedSoFar,
            runs: runs.map((r, i) => ({
              id: `run-${i}`,
              facilityId: r.facilityId,
              facilityName: r.facilityName,
              auditType: r.auditType,
              status: r.status,
              actionItemsCreated: r.actionItemsCreated,
            })),
            auditRunIds: [...auditRunIds],
          });

          // Execute audit
          try {
            const result = await apiClient.runAudit(
              run.auditType,
              run.facilityId
            );
            run.status = 'completed';
            run.auditRunId = result.audit_run_id;
            auditRunIds.push(result.audit_run_id);

            // Get action items count from the new run
            const actionItems = await apiClient.getAuditActionItems(result.audit_run_id);
            run.actionItemsCreated = actionItems.length;
          } catch {
            run.status = 'failed';
          }

          currentIndex++;

          const newCompleted = runs.filter((r) => r.status === 'completed').length;
          const newFailed = runs.filter((r) => r.status === 'failed').length;
          const allDone = newCompleted + newFailed === totalRuns;

          setBatchStatus({
            batchId: id,
            totalRuns,
            completed: newCompleted,
            inProgress: allDone ? 0 : 1,
            failed: newFailed,
            runs: runs.map((r, i) => ({
              id: `run-${i}`,
              facilityId: r.facilityId,
              facilityName: r.facilityName,
              auditType: r.auditType,
              status: r.status,
              actionItemsCreated: r.actionItemsCreated,
            })),
            auditRunIds: [...auditRunIds],
          });

          if (allDone) {
            setIsComplete(true);
            setIsExecuting(false);
            stopSimulation();
          }
        }, 800);
      } catch (err) {
        console.error('Batch execution failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to execute batch');
        setIsExecuting(false);
      }
    },
    [stopSimulation]
  );

  const cancelExecution = useCallback(() => {
    cancelledRef.current = true;
    stopSimulation();
    setIsExecuting(false);
    setError('Execution cancelled by user');
  }, [stopSimulation]);

  const reset = useCallback(() => {
    setBatchId(null);
    setBatchStatus(null);
    setIsExecuting(false);
    setError(null);
    setIsComplete(false);
    stopSimulation();
  }, [stopSimulation]);

  useEffect(() => {
    return () => stopSimulation();
  }, [stopSimulation]);

  const progress = {
    completed: batchStatus?.completed ?? 0,
    total: batchStatus?.totalRuns ?? 0,
    percentage:
      batchStatus && batchStatus.totalRuns > 0
        ? Math.round(
            ((batchStatus.completed + batchStatus.failed) /
              batchStatus.totalRuns) *
              100
          )
        : 0,
  };

  return {
    batchId,
    batchStatus,
    isExecuting,
    progress,
    error,
    isComplete,
    executeBatch,
    cancelExecution,
    reset,
  };
}

export default useBatchExecution;
