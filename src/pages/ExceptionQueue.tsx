import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Zap,
  Pause,
  XCircle,
} from 'lucide-react';
import {
  PageHeader,
  AgentHumanSplit,
  PriorityBadge,
  ConfidenceBar,
  ActionButton,
  AgentBadge,
} from '../components/ui/Widgets';
import {
  useExceptions,
  useApproveException,
  useBatchApproveExceptions,
  useHoldException,
  useDismissException,
} from '../hooks/useExceptions';
import { ALL_AUDIT_TYPES, AUDIT_TYPE_CONFIG } from '../types/audit';
import type { Exception } from '../types/audit';
import { formatDistanceToNow } from 'date-fns';

// ── Exception Card with Progressive Disclosure ──

function ExceptionCard({
  exc,
  onApprove,
  onHold,
  onDismiss,
}: {
  exc: Exception;
  onApprove: (id: string) => void;
  onHold: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const isPending = exc.pcc_sync_status === 'pending';
  const isSyncing = exc.pcc_sync_status === 'syncing';
  const isSynced = exc.pcc_sync_status === 'synced';
  const isFailed = exc.pcc_sync_status === 'failed';
  const isHeld = exc.pcc_sync_status === 'held';
  const isDismissed = exc.pcc_sync_status === 'dismissed';
  const isDone = isSynced || isDismissed;

  const config = AUDIT_TYPE_CONFIG[exc.audit_type];

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border transition-all ${
        isDone
          ? 'border-gray-100 opacity-50'
          : isFailed
          ? 'border-red-200'
          : isHeld
          ? 'border-purple-200'
          : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      {/* Collapsed state — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <PriorityBadge severity={exc.severity} />
              <AgentBadge agent={exc.agent_name} />
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bgColor} ${config.color}`}>
                {config.ftag}
              </span>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(exc.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-sm font-semibold text-gray-900">{exc.resident_name}</span>
              <span className="text-xs text-gray-400 font-mono">{exc.mrn}</span>
            </div>
            <p className="text-sm text-gray-600 truncate">{exc.title}</p>
            <div className="mt-1.5 w-32">
              <ConfidenceBar value={exc.confidence} />
            </div>
          </div>
          <div className="flex-shrink-0 mt-1">
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded state — AI recommendation + evidence */}
      {expanded && (
        <div className="px-4 pb-3 space-y-3 border-t border-gray-50 pt-3">
          {/* AI Recommendation */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs font-semibold text-blue-700 mb-1">AI Recommendation</div>
            <p className="text-sm text-blue-900">{exc.ai_recommendation}</p>
          </div>

          {/* Evidence Chain */}
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1.5">Evidence Chain</div>
            <ol className="space-y-1.5">
              {exc.evidence_chain.map((ev, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <span className="text-gray-700">{ev}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Finding code + facility */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Finding: <span className="font-mono">{exc.finding_code}</span></span>
            <span>Facility: {exc.facility_name.replace('Ensign ', '')}</span>
          </div>
        </div>
      )}

      {/* Action buttons — ALWAYS visible */}
      <div className="px-4 py-2.5 border-t border-gray-50 flex items-center justify-between">
        {/* Sync status indicator */}
        <div className="text-xs">
          {isSyncing && (
            <span className="flex items-center gap-1.5 text-blue-600 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Syncing to PCC...
            </span>
          )}
          {isSynced && (
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Synced
            </span>
          )}
          {isFailed && (
            <span className="flex items-center gap-1.5 text-red-600 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              Sync Failed
            </span>
          )}
          {isHeld && (
            <span className="flex items-center gap-1.5 text-purple-600 font-medium">
              <Pause className="w-3.5 h-3.5" />
              On Hold
            </span>
          )}
          {isDismissed && (
            <span className="flex items-center gap-1.5 text-gray-500 font-medium">
              <XCircle className="w-3.5 h-3.5" />
              Dismissed
            </span>
          )}
        </div>

        {/* Action buttons */}
        {isPending && (
          <div className="flex items-center gap-1.5">
            <ActionButton
              variant="success"
              size="xs"
              onClick={() => onApprove(exc.id)}
            >
              Approve
            </ActionButton>
            <ActionButton
              variant="secondary"
              size="xs"
              onClick={() => onHold(exc.id)}
            >
              Hold
            </ActionButton>
            <ActionButton
              variant="ghost"
              size="xs"
              onClick={() => onDismiss(exc.id)}
            >
              Dismiss
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ──

export default function ExceptionQueue() {
  const [activeTab, setActiveTab] = useState<string>('all');

  const filters = activeTab !== 'all' ? { audit_type: activeTab } : undefined;
  const { data: exceptions, isLoading } = useExceptions(filters);
  const { data: allExceptions } = useExceptions(); // for tab counts

  const approveMutation = useApproveException();
  const batchApproveMutation = useBatchApproveExceptions();
  const holdMutation = useHoldException();
  const dismissMutation = useDismissException();

  // Compute counts for dynamic tabs
  const pendingByType = ALL_AUDIT_TYPES.reduce<Record<string, number>>((acc, type) => {
    const count = allExceptions?.filter(
      (e) => e.audit_type === type && e.pcc_sync_status === 'pending'
    ).length || 0;
    if (count > 0) acc[type] = count;
    return acc;
  }, {});

  const totalPending = allExceptions?.filter((e) => e.pcc_sync_status === 'pending').length || 0;

  // Build tabs dynamically — only show types with pending exceptions
  const tabs = [
    { value: 'all', label: 'All', count: totalPending },
    ...Object.entries(pendingByType).map(([type, count]) => ({
      value: type,
      label: AUDIT_TYPE_CONFIG[type as keyof typeof AUDIT_TYPE_CONFIG].shortLabel,
      count,
    })),
  ];

  // Batch approve targets
  const pendingExceptions = exceptions?.filter((e) => e.pcc_sync_status === 'pending') || [];
  const highConfidenceIds = pendingExceptions
    .filter((e) => e.confidence >= 95)
    .map((e) => e.id);

  // Sort: pending first, then by severity
  const sortedExceptions = [...(exceptions || [])].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      pending: 0, syncing: 1, failed: 2, held: 3, synced: 4, dismissed: 5, approved: 4,
    };
    const statusDiff = (statusOrder[a.pcc_sync_status] ?? 9) - (statusOrder[b.pcc_sync_status] ?? 9);
    if (statusDiff !== 0) return statusDiff;
    const sev: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return (sev[b.severity] || 0) - (sev[a.severity] || 0);
  });

  const agentCount = exceptions?.length || 0;
  const humanCount = exceptions?.filter((e) =>
    ['approved', 'synced', 'syncing'].includes(e.pcc_sync_status)
  ).length || 0;

  return (
    <div className="space-y-5">
      {/* Header with batch approve */}
      <PageHeader
        title="Exception Queue"
        subtitle="AI-prepared corrections awaiting your one-tap approval"
        actions={
          highConfidenceIds.length > 0 ? (
            <ActionButton
              variant="success"
              size="md"
              onClick={() => batchApproveMutation.mutate(highConfidenceIds)}
              loading={batchApproveMutation.isPending}
            >
              <Zap className="w-4 h-4" />
              Batch Approve {highConfidenceIds.length} ({'\u2265'}95%)
            </ActionButton>
          ) : undefined
        }
      />

      {/* Agent/Human split */}
      <AgentHumanSplit agentCount={agentCount} humanCount={humanCount} />

      {/* Filter tabs with count badges */}
      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Exception list */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading exceptions...
        </div>
      ) : sortedExceptions.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No exceptions for this filter. All clear.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedExceptions.map((exc) => (
            <ExceptionCard
              key={exc.id}
              exc={exc}
              onApprove={(id) => approveMutation.mutate(id)}
              onHold={(id) => holdMutation.mutate(id)}
              onDismiss={(id) => dismissMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
