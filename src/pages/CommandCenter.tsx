import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Bot,
  Shield,
  Clock,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  Zap,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  AgentHumanSplit,
  PriorityBadge,
  ConfidenceBar,
  ActionButton,
  AgentBadge,
  SectionLabel,
} from '../components/ui/Widgets';
import { useCommandCenter, useFacilities } from '../hooks/useCommandCenter';
import {
  useExceptions,
  useApproveException,
  useBatchApproveExceptions,
} from '../hooks/useExceptions';
import { useAgentActivity } from '../hooks/useAgentActivity';
import { ALL_AUDIT_TYPES, AUDIT_TYPE_CONFIG } from '../types/audit';
import type { Facility, Exception } from '../types/audit';

// ── Expandable Stat Card ──

function ExpandableStatCard({
  label,
  value,
  icon: Icon,
  color,
  children,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'gray';
  children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 transition-all ${
        expanded ? 'ring-2 ring-blue-100' : ''
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">{label}</span>
          <div className="flex items-center gap-1.5">
            <div className={`p-1.5 rounded-lg ${colorMap[color]}`}>
              <Icon className="w-4 h-4" />
            </div>
            {children && (
              expanded
                ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            )}
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </button>
      {expanded && children && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Inline Approval Card ──

function InlineApprovalCard({
  exc,
  onApprove,
  isApproving,
}: {
  exc: Exception;
  onApprove: (id: string) => void;
  isApproving: boolean;
}) {
  const isSyncing = exc.pcc_sync_status === 'syncing';
  const isSynced = exc.pcc_sync_status === 'synced';
  const isFailed = exc.pcc_sync_status === 'failed';
  const isDone = isSynced || isFailed;

  return (
    <div
      className={`flex items-start justify-between p-3 rounded-lg transition-all ${
        isDone ? 'bg-gray-50/50 opacity-60' : 'bg-gray-50 hover:bg-gray-100/80'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <PriorityBadge severity={exc.severity} />
          <AgentBadge agent={exc.agent_name} />
        </div>
        <p className="text-sm font-medium text-gray-900 truncate">
          {exc.resident_name}
          <span className="text-gray-400 font-normal ml-1.5">{exc.mrn}</span>
        </p>
        <p className="text-xs text-gray-600 mt-0.5 truncate">{exc.title}</p>
        <div className="mt-1.5 w-28">
          <ConfidenceBar value={exc.confidence} />
        </div>
      </div>

      <div className="flex-shrink-0 ml-3">
        {isSyncing ? (
          <div className="flex items-center gap-1.5 text-blue-600 text-xs font-medium px-2 py-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Syncing to PCC...
          </div>
        ) : isSynced ? (
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium px-2 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Synced
          </div>
        ) : isFailed ? (
          <div className="flex items-center gap-1.5 text-red-600 text-xs font-medium px-2 py-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Failed
          </div>
        ) : (
          <ActionButton
            variant="success"
            size="xs"
            onClick={() => onApprove(exc.id)}
            loading={isApproving}
          >
            Approve
          </ActionButton>
        )}
      </div>
    </div>
  );
}

// ── Facility Card ──

function FacilityCard({ fac, onClick }: { fac: Facility; onClick: () => void }) {
  const scoreColor =
    fac.health_score >= 90
      ? 'text-emerald-600'
      : fac.health_score >= 75
      ? 'text-amber-600'
      : 'text-red-600';

  const borderColor =
    fac.overall_status === 'compliant'
      ? 'border-emerald-200 bg-emerald-50/30'
      : fac.overall_status === 'warning'
      ? 'border-amber-200 bg-amber-50/30'
      : fac.overall_status === 'critical'
      ? 'border-red-200 bg-red-50/30'
      : 'border-orange-200 bg-orange-50/30';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 border cursor-pointer hover:shadow-md transition-all ${borderColor}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900 truncate">
          {fac.name.replace('Ensign ', '')}
        </h4>
        <span className={`text-2xl font-bold ${scoreColor}`}>{fac.health_score}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{fac.total_open_items} exceptions</span>
        <span>Census: {fac.total_residents}</span>
      </div>
    </div>
  );
}

// ── Main Component ──

export default function CommandCenter() {
  const navigate = useNavigate();
  const { data: metrics } = useCommandCenter();
  const { data: facilities } = useFacilities();
  const { data: exceptions } = useExceptions();
  const { data: activity } = useAgentActivity({ days: 1 });
  const approveMutation = useApproveException();
  const batchApproveMutation = useBatchApproveExceptions();
  const [agentsExpanded, setAgentsExpanded] = useState(false);

  const pendingExceptions = exceptions
    ?.filter((e) => e.pcc_sync_status === 'pending')
    .sort((a, b) => {
      const sev = { critical: 4, high: 3, medium: 2, low: 1 };
      return (sev[b.severity] || 0) - (sev[a.severity] || 0);
    })
    .slice(0, 5) || [];

  const highConfidenceIds = pendingExceptions
    .filter((e) => e.confidence >= 95)
    .map((e) => e.id);

  // Aggregate agent activity by ALL 20 types
  const agentSummary = ALL_AUDIT_TYPES.map((type) => {
    const typeActivity = activity?.filter((a) => a.agent_name === type) || [];
    return {
      type,
      label: AUDIT_TYPE_CONFIG[type].shortLabel,
      count: typeActivity.length,
      exceptions: typeActivity.filter((a) => a.result === 'exception_created').length,
      timeSaved: typeActivity.reduce((s, a) => s + a.time_saved_minutes, 0),
    };
  }).filter((s) => s.count > 0);

  const totalAgentActions = agentSummary.reduce((s, a) => s + a.count, 0);

  // Sort facilities by health score ascending (worst first)
  const sortedFacilities = [...(facilities || [])].sort(
    (a, b) => a.health_score - b.health_score
  );

  // Census breakdown by facility for expandable card
  const censusByFacility = facilities
    ?.map((f) => ({ name: f.name.replace('Ensign ', ''), census: f.total_residents || 0 }))
    .sort((a, b) => b.census - a.census)
    .slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <PageHeader
        title="Command Center"
        subtitle={`Agents handled ${metrics?.agentActionsTotal?.toLocaleString() || 0} actions today, you approved ${metrics?.humanApprovals || 0}`}
      />

      {/* Agent/Human Split */}
      <AgentHumanSplit
        agentCount={metrics?.agentActionsTotal || 0}
        humanCount={metrics?.humanApprovals || 0}
      />

      {/* 6 Expandable Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <ExpandableStatCard
          label="Census"
          value={metrics?.totalCensus?.toLocaleString() || 0}
          icon={Users}
          color="blue"
        >
          <div className="space-y-1.5">
            {censusByFacility.map((f) => (
              <div key={f.name} className="flex justify-between text-xs">
                <span className="text-gray-600 truncate">{f.name}</span>
                <span className="font-medium text-gray-900 ml-2">{f.census}</span>
              </div>
            ))}
          </div>
        </ExpandableStatCard>

        <ExpandableStatCard
          label="Active Exceptions"
          value={metrics?.activeExceptions || 0}
          icon={AlertTriangle}
          color="red"
        >
          <div className="space-y-1.5">
            {ALL_AUDIT_TYPES.map((type) => {
              const count = exceptions?.filter(
                (e) => e.audit_type === type && e.pcc_sync_status === 'pending'
              ).length || 0;
              if (count === 0) return null;
              return (
                <div key={type} className="flex justify-between text-xs">
                  <span className="text-gray-600">{AUDIT_TYPE_CONFIG[type].shortLabel}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              );
            })}
          </div>
        </ExpandableStatCard>

        <ExpandableStatCard
          label="Agent Actions Today"
          value={metrics?.agentActionsToday || 0}
          icon={Bot}
          color="purple"
        >
          <div className="space-y-1.5">
            {agentSummary.slice(0, 5).map((s) => (
              <div key={s.type} className="flex justify-between text-xs">
                <span className="text-gray-600">{s.label}</span>
                <span className="font-medium text-gray-900">{s.count}</span>
              </div>
            ))}
          </div>
        </ExpandableStatCard>

        <ExpandableStatCard
          label="Compliance Score"
          value={`${metrics?.complianceScore || 0}%`}
          icon={Shield}
          color="green"
        >
          <div className="space-y-1.5">
            {sortedFacilities.slice(0, 5).map((f) => (
              <div key={f.id} className="flex justify-between text-xs">
                <span className="text-gray-600 truncate">{f.name.replace('Ensign ', '')}</span>
                <span className="font-medium text-gray-900">{f.compliance_score || 0}%</span>
              </div>
            ))}
          </div>
        </ExpandableStatCard>

        <ExpandableStatCard
          label="Overdue Corrections"
          value={metrics?.overdueCorrections || 0}
          icon={Clock}
          color="amber"
        />

        <ExpandableStatCard
          label="Survey Risk"
          value={`${metrics?.surveyRiskScore || 0}%`}
          icon={ClipboardCheck}
          color="blue"
        />
      </div>

      {/* Do These First */}
      <Card
        title="Do These First"
        actions={
          <div className="flex items-center gap-2">
            {highConfidenceIds.length > 0 && (
              <ActionButton
                variant="success"
                size="xs"
                onClick={() => batchApproveMutation.mutate(highConfidenceIds)}
                loading={batchApproveMutation.isPending}
              >
                <Zap className="w-3 h-3" />
                Batch Approve {highConfidenceIds.length} {'\u2265'}95%
              </ActionButton>
            )}
            <ActionButton variant="ghost" size="xs" onClick={() => navigate('/exceptions')}>
              View all
            </ActionButton>
          </div>
        }
      >
        {pendingExceptions.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">All caught up! No pending exceptions.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingExceptions.map((exc) => (
              <InlineApprovalCard
                key={exc.id}
                exc={exc}
                onApprove={(id) => approveMutation.mutate(id)}
                isApproving={approveMutation.isPending}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Facility Grid */}
      <div>
        <SectionLabel>Facilities (sorted by health score)</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedFacilities.map((fac) => (
            <FacilityCard
              key={fac.id}
              fac={fac}
              onClick={() => navigate(`/facility/${fac.id}`)}
            />
          ))}
        </div>
      </div>

      {/* What Agents Handled Today — expandable */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <button
          onClick={() => setAgentsExpanded(!agentsExpanded)}
          className="w-full flex items-center justify-between px-5 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-900">What Agents Handled Today</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {agentSummary.length} agent types handled {totalAgentActions} total actions
            </span>
            {agentsExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>

        {agentsExpanded && (
          <div className="px-5 pb-4 border-t border-gray-50 pt-3 space-y-2.5">
            {agentSummary.map((s) => (
              <div
                key={s.type}
                className="flex items-center justify-between py-1.5"
              >
                <div className="flex items-center gap-2">
                  <AgentBadge agent={s.type} />
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{s.count} actions</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {s.exceptions} exceptions
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {s.timeSaved}min saved
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
