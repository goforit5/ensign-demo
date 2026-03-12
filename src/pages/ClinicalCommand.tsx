import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bandage,
  Pill,
  PersonStanding,
  Shield,
  FileWarning,
} from 'lucide-react';
import {
  PageHeader,
  StatCard,
  Card,
  PriorityBadge,
  ConfidenceBar,
} from '../components/ui/Widgets';
import { useClinicalMonitoring } from '../hooks/useClinicalMonitoring';
import { useExceptions } from '../hooks/useExceptions';
import { ALL_AUDIT_TYPES, AUDIT_TYPE_CONFIG } from '../types/audit';
import type { AuditType, HighRiskResident } from '../types/audit';
import { formatDistanceToNow } from 'date-fns';

// ── Expandable Audit Type Card ──

function AuditTypeCard({
  type,
  findingsCount,
  complianceRate,
  lastScan,
  pendingCount,
  recentFindings,
}: {
  type: AuditType;
  findingsCount: number;
  complianceRate: number;
  lastScan: string;
  pendingCount: number;
  recentFindings: { title: string; severity: string; confidence: number; created_at: string }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const config = AUDIT_TYPE_CONFIG[type];

  const complianceColor =
    complianceRate >= 90
      ? 'text-emerald-600'
      : complianceRate >= 75
      ? 'text-amber-600'
      : 'text-red-600';

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border transition-all ${
        expanded ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${config.bgColor} ${config.color}`}>
              {config.shortLabel}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">{config.ftag}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Green pulse dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Findings</span>
            <div className="font-semibold text-gray-900">{findingsCount}</div>
          </div>
          <div>
            <span className="text-gray-500">Compliance</span>
            <div className={`font-semibold ${complianceColor}`}>{complianceRate}%</div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
          <div className="text-xs text-gray-500">
            Last scan {formatDistanceToNow(new Date(lastScan), { addSuffix: true })}
          </div>

          {recentFindings.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500">Recent findings</div>
              {recentFindings.map((f, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <PriorityBadge severity={f.severity as 'low' | 'medium' | 'high' | 'critical'} />
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(f.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 truncate">{f.title}</p>
                  <div className="mt-1 w-20">
                    <ConfidenceBar value={f.confidence} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No recent findings</p>
          )}

          {pendingCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/exceptions`);
              }}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              View {pendingCount} pending in queue
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Expandable High-Risk Resident Row ──

function HighRiskRow({ resident }: { resident: HighRiskResident }) {
  const [expanded, setExpanded] = useState(false);

  const scoreColor =
    resident.risk_score >= 85
      ? 'bg-red-100 text-red-700'
      : resident.risk_score >= 75
      ? 'bg-orange-100 text-orange-700'
      : 'bg-amber-100 text-amber-700';

  return (
    <div className={`border-b border-gray-50 last:border-0 ${expanded ? 'bg-gray-50/50' : ''}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate">{resident.name}</span>
          <span className="text-xs text-gray-400 font-mono">{resident.mrn}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-gray-500 hidden sm:inline">
            {resident.facility_name.replace('Ensign ', '')}
          </span>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${scoreColor}`}>
            {resident.risk_score}
          </span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Age</span>
              <div className="font-medium text-gray-900">{resident.age}</div>
            </div>
            <div>
              <span className="text-gray-500">Days Since Admission</span>
              <div className="font-medium text-gray-900">{resident.days_since_admission}</div>
            </div>
            <div>
              <span className="text-gray-500">Active Findings</span>
              <div className="font-medium text-gray-900">{resident.active_findings}</div>
            </div>
            <div>
              <span className="text-gray-500">Facility</span>
              <div className="font-medium text-gray-900">{resident.facility_name.replace('Ensign ', '')}</div>
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Risk Factors</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {resident.risk_factors.map((factor, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-100"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Documentation Gaps — expandable per type ──

function DocGapRow({
  type,
  complianceRate,
  pendingCount,
}: {
  type: AuditType;
  complianceRate: number;
  pendingCount: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = AUDIT_TYPE_CONFIG[type];
  const barColor =
    complianceRate >= 90 ? 'bg-emerald-500' : complianceRate >= 75 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded px-1 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bgColor} ${config.color}`}>
            {config.shortLabel}
          </span>
          <span className="text-xs text-gray-400">{config.ftag}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor}`}
              style={{ width: `${complianceRate}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-900 w-8 text-right">{complianceRate}%</span>
          {pendingCount > 0 && (
            <span className="text-xs text-red-600 font-medium w-6 text-right">{pendingCount}</span>
          )}
          {expanded ? (
            <ChevronUp className="w-3 h-3 text-gray-400" />
          ) : (
            <ChevronDown className="w-3 h-3 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="pl-3 pb-2 text-xs text-gray-500">
          <p>{config.label} ({config.ftag})</p>
          <p className="mt-0.5">
            {pendingCount > 0
              ? `${pendingCount} pending documentation gaps requiring review`
              : 'No documentation gaps detected'}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Component ──

export default function ClinicalCommand() {
  const { auditTypeStats, highRiskResidents } = useClinicalMonitoring();
  const { data: exceptions } = useExceptions();

  // Quick stats
  const fallsLast7d = exceptions?.filter(
    (e) => e.audit_type === 'falls' && new Date(e.created_at) > new Date(Date.now() - 7 * 86400000)
  ).length || 0;

  const activeWounds = exceptions?.filter(
    (e) => e.audit_type === 'skin_wound' && e.pcc_sync_status === 'pending'
  ).length || 0;

  const infections = exceptions?.filter(
    (e) => e.audit_type === 'infection_control' && e.pcc_sync_status === 'pending'
  ).length || 0;

  const psychReviews = exceptions?.filter(
    (e) => e.audit_type === 'psychotropic' && e.pcc_sync_status === 'pending'
  ).length || 0;

  const overdueAssessments = exceptions?.filter(
    (e) => e.severity === 'critical' && e.pcc_sync_status === 'pending'
  ).length || 0;

  // Build full 20-type stats from exceptions data
  const fullAuditStats = ALL_AUDIT_TYPES.map((type) => {
    const existing = auditTypeStats.find((s) => s.type === type);
    if (existing) return existing;

    const typeExceptions = exceptions?.filter((e) => e.audit_type === type) || [];
    const pending = typeExceptions.filter((e) => e.pcc_sync_status === 'pending').length;
    const total = typeExceptions.length;
    const complianceRate = total > 0 ? Math.round(((total - pending) / total) * 100) : 100;

    return {
      type,
      findingsCount: total,
      pendingCount: pending,
      complianceRate,
      lastScan: new Date().toISOString(),
    };
  });

  // Recent findings per type for expanded cards
  const recentFindingsByType = (type: AuditType) => {
    return (
      exceptions
        ?.filter((e) => e.audit_type === type)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
        .map((e) => ({
          title: e.title,
          severity: e.severity,
          confidence: e.confidence,
          created_at: e.created_at,
        })) || []
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Command"
        subtitle="Live monitoring of all 20 audit types running continuously"
      />

      {/* Audit Type Monitor Grid — 20 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {fullAuditStats.map((stat) => (
          <AuditTypeCard
            key={stat.type}
            type={stat.type}
            findingsCount={stat.findingsCount}
            complianceRate={stat.complianceRate}
            lastScan={stat.lastScan}
            pendingCount={stat.pendingCount}
            recentFindings={recentFindingsByType(stat.type)}
          />
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <StatCard label="Falls (7d)" value={fallsLast7d} icon={PersonStanding} color="red" />
        <StatCard label="Active Wounds" value={activeWounds} icon={Bandage} color="amber" />
        <StatCard label="Infections" value={infections} icon={Shield} color="red" />
        <StatCard label="Psych Reviews" value={psychReviews} icon={Pill} color="purple" />
        <StatCard label="Overdue Assessments" value={overdueAssessments} icon={FileWarning} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High-Risk Residents — expandable rows */}
        <Card
          title="High-Risk Residents"
          actions={<span className="text-xs text-gray-500">Top 10 by risk score</span>}
          padding={false}
        >
          <div>
            {highRiskResidents.slice(0, 10).map((r) => (
              <HighRiskRow key={r.id} resident={r} />
            ))}
          </div>
        </Card>

        {/* Documentation Gaps — expandable per audit type */}
        <Card title="Documentation Gaps by Audit Type">
          <div className="space-y-0.5">
            {fullAuditStats
              .sort((a, b) => a.complianceRate - b.complianceRate)
              .map((stat) => (
                <DocGapRow
                  key={stat.type}
                  type={stat.type}
                  complianceRate={stat.complianceRate}
                  pendingCount={stat.pendingCount}
                />
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
