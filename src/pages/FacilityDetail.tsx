import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Users,
  AlertTriangle,
  Bot,
  ChevronDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Card,
  StatCard,
  PriorityBadge,
  ConfidenceBar,
  ActionButton,
  AgentBadge,
  ExpandableSection,
} from '../components/ui/Widgets';
import { useFacilityDetail } from '../hooks/useFacilityDetail';
import { useApproveException, useHoldException, useDismissException } from '../hooks/useExceptions';
import { AUDIT_TYPE_CONFIG, ALL_AUDIT_TYPES } from '../types/audit';
import type { AuditType } from '../types/audit';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

export default function FacilityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const facilityId = parseInt(id || '1');
  const { facility, exceptions, activity, highRiskResidents, isLoading } = useFacilityDetail(facilityId);
  const approveMutation = useApproveException();
  const holdMutation = useHoldException();
  const dismissMutation = useDismissException();

  const [expandedExceptions, setExpandedExceptions] = useState<Set<string>>(new Set());
  const [expandedActivity, setExpandedActivity] = useState<Set<string>>(new Set());
  const [expandedResidents, setExpandedResidents] = useState<Set<string>>(new Set());
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  const toggleSet = (set: Set<string>, setFn: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    setFn(next);
  };

  if (isLoading || !facility) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  const pendingExceptions = exceptions.filter((e) => e.pcc_sync_status === 'pending');

  // Compliance by audit type chart data — all 20 types
  const complianceData = ALL_AUDIT_TYPES.map((type) => {
    const status = facility.audit_status[type];
    const config = AUDIT_TYPE_CONFIG[type];
    const actionItems = facility.action_items_by_type[type];
    return {
      type,
      name: config.shortLabel,
      ftag: config.ftag,
      compliance: status && status.total_runs > 0 ? 85 + Math.floor(Math.random() * 15) : 0,
      open: actionItems?.open_count || 0,
      critical: actionItems?.critical_count || 0,
      status: status?.status || 'never_audited',
      totalRuns: status?.total_runs || 0,
    };
  }).sort((a, b) => a.compliance - b.compliance);

  const healthColor =
    facility.health_score >= 90 ? 'text-emerald-600' :
    facility.health_score >= 75 ? 'text-amber-600' :
    'text-red-600';

  const statusColor =
    facility.overall_status === 'compliant' ? 'bg-emerald-100 text-emerald-700' :
    facility.overall_status === 'warning' ? 'bg-amber-100 text-amber-700' :
    facility.overall_status === 'critical' ? 'bg-red-100 text-red-700' :
    'bg-orange-100 text-orange-700';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-200 transition-colors mt-1">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{facility.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
              {facility.overall_status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{facility.address} &middot; {facility.type}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-4xl font-bold ${healthColor}`}>{facility.health_score}</div>
          <div className="text-xs text-gray-500">Health Score</div>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Census" value={`${facility.total_residents} / ${facility.bed_count}`} icon={Users} color="blue" />
        <StatCard label="Open Exceptions" value={pendingExceptions.length} icon={AlertTriangle} color="red" />
        <StatCard label="Agent Actions Today" value={facility.agent_actions_today} icon={Bot} color="purple" />
        <StatCard label="Audit Types Active" value={Object.values(facility.audit_status).filter((s) => s.total_runs > 0).length} icon={Building2} color="green" />
      </div>

      {/* 1. Decisions Needing Input — expandable exception cards */}
      <ExpandableSection title="Decisions Needing Input" count={pendingExceptions.length} defaultExpanded={pendingExceptions.length > 0}>
        {pendingExceptions.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">All caught up for this facility.</p>
        ) : (
          <div className="space-y-2">
            {pendingExceptions.slice(0, 12).map((exc) => {
              const isExpanded = expandedExceptions.has(exc.id);
              const config = AUDIT_TYPE_CONFIG[exc.audit_type];
              return (
                <div key={exc.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <button
                    onClick={() => toggleSet(expandedExceptions, setExpandedExceptions, exc.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <PriorityBadge severity={exc.severity} />
                      <AgentBadge agent={exc.agent_name} />
                      <span className="text-sm font-medium text-gray-900 truncate">{exc.title}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-500">{exc.resident_name}</span>
                      <ChevronDown className={clsx('w-4 h-4 text-gray-400 transition-transform', isExpanded && 'rotate-180')} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div>MRN: <span className="font-medium text-gray-700">{exc.mrn}</span></div>
                        <div>F-Tag: <span className="font-medium text-gray-700">{config.ftag}</span></div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">AI Recommendation</div>
                        <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-2.5">{exc.ai_recommendation}</p>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Evidence</div>
                        <ul className="space-y-1">
                          {exc.evidence_chain.map((ev, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                              {ev}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="w-32">
                        <ConfidenceBar value={exc.confidence} />
                      </div>
                      <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                        <ActionButton variant="success" size="sm" onClick={() => approveMutation.mutate(exc.id)} loading={approveMutation.isPending}>
                          Approve
                        </ActionButton>
                        <ActionButton variant="secondary" size="sm" onClick={() => holdMutation.mutate(exc.id)}>
                          Hold
                        </ActionButton>
                        <ActionButton variant="ghost" size="sm" onClick={() => dismissMutation.mutate(exc.id)}>
                          Dismiss
                        </ActionButton>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ExpandableSection>

      {/* 2. Compliance by Audit Type — chart + expandable detail */}
      <ExpandableSection title="Compliance by Audit Type" count={ALL_AUDIT_TYPES.length}>
        <Card>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={complianceData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="compliance" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <div className="mt-3 space-y-1">
          {complianceData.map((item) => {
            const isExpanded = expandedTypes.has(item.type);
            const config = AUDIT_TYPE_CONFIG[item.type as AuditType];
            return (
              <div key={item.type} className="bg-white rounded-lg border border-gray-100">
                <button
                  onClick={() => toggleSet(expandedTypes, setExpandedTypes, item.type)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.color}`}>
                      {config.ftag}
                    </span>
                    <span className="text-sm text-gray-900">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${item.compliance >= 90 ? 'text-emerald-600' : item.compliance >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                      {item.compliance}%
                    </span>
                    <ChevronDown className={clsx('w-3.5 h-3.5 text-gray-400 transition-transform', isExpanded && 'rotate-180')} />
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-3 pb-2 border-t border-gray-50 pt-2 grid grid-cols-3 gap-3 text-xs text-gray-500">
                    <div>Open Items: <span className="font-medium text-gray-700">{item.open}</span></div>
                    <div>Critical: <span className="font-medium text-red-600">{item.critical}</span></div>
                    <div>Total Runs: <span className="font-medium text-gray-700">{item.totalRuns}</span></div>
                    <div>Status: <span className="font-medium text-gray-700">{item.status.replace('_', ' ')}</span></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* 3. Agent Activity — expandable rows */}
      <ExpandableSection title="Agent Activity" count={activity.length}>
        <div className="space-y-1">
          {activity.slice(0, 20).map((act) => {
            const isExpanded = expandedActivity.has(act.id);
            return (
              <div key={act.id} className="bg-white rounded-lg border border-gray-100">
                <button
                  onClick={() => toggleSet(expandedActivity, setExpandedActivity, act.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AgentBadge agent={act.agent_name} />
                    <span className="text-sm text-gray-700 truncate">{act.action}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                      act.result === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      act.result === 'exception_created' ? 'bg-red-100 text-red-700' :
                      act.result === 'no_issues' ? 'bg-gray-100 text-gray-600' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {act.result.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(act.created_at), { addSuffix: true })}
                    </span>
                    <ChevronDown className={clsx('w-3.5 h-3.5 text-gray-400 transition-transform', isExpanded && 'rotate-180')} />
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-3 pb-2 border-t border-gray-50 pt-2 space-y-1">
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div>Confidence: <span className="font-medium text-gray-700">{act.confidence}%</span></div>
                      <div>Time Saved: <span className="font-medium text-gray-700">{act.time_saved_minutes}m</span></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold">Policies Checked:</span>{' '}
                      {act.policies_checked.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* 4. High-Risk Residents — expandable rows */}
      <ExpandableSection title="High-Risk Residents" count={highRiskResidents.length} defaultExpanded={highRiskResidents.length > 0}>
        {highRiskResidents.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">No high-risk residents at this facility.</p>
        ) : (
          <div className="space-y-1">
            {highRiskResidents.map((res) => {
              const isExpanded = expandedResidents.has(res.id);
              return (
                <div key={res.id} className="bg-white rounded-lg border border-gray-100">
                  <button
                    onClick={() => toggleSet(expandedResidents, setExpandedResidents, res.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-sm font-bold ${res.risk_score >= 85 ? 'text-red-600' : res.risk_score >= 75 ? 'text-amber-600' : 'text-gray-600'}`}>
                        {res.risk_score}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{res.name}</span>
                      <span className="text-xs text-gray-500">{res.mrn}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-500">{res.active_findings} findings</span>
                      <ChevronDown className={clsx('w-3.5 h-3.5 text-gray-400 transition-transform', isExpanded && 'rotate-180')} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-2 border-t border-gray-50 pt-2 space-y-1">
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                        <div>Age: <span className="font-medium text-gray-700">{res.age}</span></div>
                        <div>Days Admitted: <span className="font-medium text-gray-700">{res.days_since_admission}</span></div>
                        <div>Active Findings: <span className="font-medium text-gray-700">{res.active_findings}</span></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold">Risk Factors:</span>
                        <ul className="mt-1 space-y-0.5">
                          {res.risk_factors.map((rf, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                              {rf}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ExpandableSection>
    </div>
  );
}
