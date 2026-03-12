import { useState, useMemo } from 'react';
import {
  Bot,
  Clock,
  Shield,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  PageHeader,
  StatCard,
  Card,
  AgentHumanSplit,
  AgentBadge,
  ExpandableSection,
} from '../components/ui/Widgets';
import { useAgentActivity } from '../hooks/useAgentActivity';
import { useExceptions } from '../hooks/useExceptions';
import { AUDIT_TYPE_CONFIG, ALL_AUDIT_TYPES } from '../types/audit';
import { formatDistanceToNow, format, subDays } from 'date-fns';
import clsx from 'clsx';

export default function AgentWorkLedger() {
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showChartBreakdown, setShowChartBreakdown] = useState(false);

  const toggleSet = (set: Set<string>, setFn: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    setFn(next);
  };

  const filters: Record<string, string | number | undefined> = {};
  if (agentFilter !== 'all') filters.agent_name = agentFilter;
  if (resultFilter !== 'all') filters.result = resultFilter;
  const { data: activity } = useAgentActivity(
    Object.keys(filters).length > 0 ? filters as Parameters<typeof useAgentActivity>[0] : undefined
  );
  const { data: exceptions } = useExceptions();

  const totalActions = activity?.length || 0;
  const totalTimeSaved = activity?.reduce((s, a) => s + a.time_saved_minutes, 0) || 0;
  const totalPoliciesChecked = activity?.reduce((s, a) => s + a.policies_checked.length, 0) || 0;
  const exceptionRate = totalActions > 0
    ? Math.round((activity?.filter((a) => a.result === 'exception_created').length || 0) / totalActions * 100)
    : 0;

  const humanApprovals = exceptions?.filter((e) =>
    ['approved', 'synced', 'syncing'].includes(e.pcc_sync_status)
  ).length || 0;

  // Time saved chart data (last 7 days)
  const chartData = useMemo(() => {
    if (!activity) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayStr = format(date, 'yyyy-MM-dd');
      const dayActivity = activity.filter(
        (a) => format(new Date(a.created_at), 'yyyy-MM-dd') === dayStr
      );
      return {
        day: format(date, 'EEE'),
        timeSaved: dayActivity.reduce((s, a) => s + a.time_saved_minutes, 0),
        actions: dayActivity.length,
      };
    });
  }, [activity]);

  // Per-agent breakdown for chart expandable
  const perAgentChartData = useMemo(() => {
    if (!activity) return [];
    return ALL_AUDIT_TYPES.map((type) => {
      const typeActivity = activity.filter((a) => a.agent_name === type);
      const config = AUDIT_TYPE_CONFIG[type];
      return {
        type,
        label: config.shortLabel,
        timeSaved: typeActivity.reduce((s, a) => s + a.time_saved_minutes, 0),
        actions: typeActivity.length,
      };
    }).filter((d) => d.actions > 0).sort((a, b) => b.timeSaved - a.timeSaved);
  }, [activity]);

  // Per-agent summary — all 20 types
  const agentSummaries = ALL_AUDIT_TYPES.map((type) => {
    const typeActivity = activity?.filter((a) => a.agent_name === type) || [];
    const config = AUDIT_TYPE_CONFIG[type];
    return {
      type,
      label: config.shortLabel,
      ftag: config.ftag,
      actions: typeActivity.length,
      timeSaved: typeActivity.reduce((s, a) => s + a.time_saved_minutes, 0),
      exceptions: typeActivity.filter((a) => a.result === 'exception_created').length,
      avgConfidence: typeActivity.length > 0
        ? Math.round(typeActivity.reduce((s, a) => s + a.confidence, 0) / typeActivity.length)
        : 0,
      topPolicies: Array.from(new Set(typeActivity.flatMap((a) => a.policies_checked))).slice(0, 3),
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent Work Ledger"
        subtitle="Complete audit trail of all agent actions across 20 audit types"
      />

      <AgentHumanSplit agentCount={totalActions} humanCount={humanApprovals} />

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Actions" value={totalActions} icon={Bot} color="purple" />
        <StatCard label="Hours Saved" value={`${(totalTimeSaved / 60).toFixed(1)}h`} icon={Clock} color="green" />
        <StatCard label="Policies Checked" value={totalPoliciesChecked} icon={Shield} color="blue" />
        <StatCard label="Exception Rate" value={`${exceptionRate}%`} icon={AlertTriangle} color="amber" />
      </div>

      {/* 1. Time Saved — chart with expandable per-agent breakdown */}
      <ExpandableSection title="Time Saved" count={chartData.reduce((s, d) => s + d.actions, 0)}>
        <Card>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="timeSavedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}m`} />
              <Tooltip formatter={(value) => `${value} min`} />
              <Area type="monotone" dataKey="timeSaved" stroke="#3b82f6" fill="url(#timeSavedGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <button
          onClick={() => setShowChartBreakdown(!showChartBreakdown)}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
        >
          <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', showChartBreakdown && 'rotate-180')} />
          Per-agent breakdown
        </button>
        {showChartBreakdown && (
          <div className="mt-2 bg-white rounded-lg border border-gray-100 divide-y divide-gray-50">
            {perAgentChartData.map((d) => (
              <div key={d.type} className="flex items-center justify-between px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <AgentBadge agent={d.type} />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{d.actions} actions</span>
                  <span className="font-medium text-gray-700">{d.timeSaved}m saved</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ExpandableSection>

      {/* 2. Agent Summary — 20 agent cards in grid, expandable */}
      <ExpandableSection title="Agent Summary" count={ALL_AUDIT_TYPES.length}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {agentSummaries.map((s) => {
            const isExpanded = expandedAgents.has(s.type);
            return (
              <div key={s.type} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Collapsed: agent badge, action count, time saved */}
                <button
                  onClick={() => toggleSet(expandedAgents, setExpandedAgents, s.type)}
                  className="w-full text-left p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <AgentBadge agent={s.type} />
                    <ChevronDown className={clsx('w-3.5 h-3.5 text-gray-400 transition-transform', isExpanded && 'rotate-180')} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Actions</span>
                      <div className="font-semibold text-gray-900">{s.actions}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Time Saved</span>
                      <div className="font-semibold text-gray-900">{s.timeSaved}m</div>
                    </div>
                  </div>
                </button>
                {/* Expanded: avg confidence, exception count, top policies */}
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-gray-100 pt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Avg Confidence</span>
                        <div className="font-semibold text-gray-900">{s.avgConfidence}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Exceptions</span>
                        <div className="font-semibold text-gray-900">{s.exceptions}</div>
                      </div>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500 font-medium">F-Tag:</span>{' '}
                      <span className="text-gray-700">{s.ftag}</span>
                    </div>
                    {s.topPolicies.length > 0 && (
                      <div className="text-xs">
                        <span className="text-gray-500 font-medium">Top Policies:</span>
                        <ul className="mt-0.5 space-y-0.5">
                          {s.topPolicies.map((p, i) => (
                            <li key={i} className="text-gray-600 truncate">{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ExpandableSection>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
        >
          <option value="all">All Agents ({ALL_AUDIT_TYPES.length})</option>
          {ALL_AUDIT_TYPES.map((t) => {
            const config = AUDIT_TYPE_CONFIG[t];
            return (
              <option key={t} value={t}>{config.label} ({config.ftag})</option>
            );
          })}
        </select>
        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
        >
          <option value="all">All Results</option>
          <option value="completed">Completed</option>
          <option value="exception_created">Exception Created</option>
          <option value="no_issues">No Issues</option>
          <option value="review_needed">Review Needed</option>
        </select>
      </div>

      {/* 3. Activity Log — filterable table with expandable rows */}
      <ExpandableSection title="Activity Log" count={activity?.length || 0}>
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Agent</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Action</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Facility</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Result</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">Time Saved</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">When</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {(activity || []).slice(0, 50).map((act) => {
                  const isExpanded = expandedRows.has(act.id);
                  return (
                    <tr
                      key={act.id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleSet(expandedRows, setExpandedRows, act.id)}
                    >
                      <td className="px-4 py-2.5"><AgentBadge agent={act.agent_name} /></td>
                      <td className="px-4 py-2.5 text-gray-700 max-w-xs">
                        <div className="truncate">{act.action}</div>
                        {isExpanded && (
                          <div className="mt-2 space-y-1.5 text-xs text-gray-500">
                            <div>Confidence: <span className="font-medium text-gray-700">{act.confidence}%</span></div>
                            <div>
                              <span className="font-medium">Policies Checked:</span>
                              <ul className="mt-0.5 space-y-0.5">
                                {act.policies_checked.map((p, i) => (
                                  <li key={i} className="text-gray-600">{p}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 text-xs">{act.facility_name.replace('Ensign ', '')}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                          act.result === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          act.result === 'exception_created' ? 'bg-red-100 text-red-700' :
                          act.result === 'no_issues' ? 'bg-gray-100 text-gray-600' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {act.result.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{act.time_saved_minutes}m</td>
                      <td className="px-4 py-2.5 text-right text-xs text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(act.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-2 py-2.5">
                        <ChevronDown className={clsx('w-3.5 h-3.5 text-gray-400 transition-transform', isExpanded && 'rotate-180')} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </ExpandableSection>
    </div>
  );
}
