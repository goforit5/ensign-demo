import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ChevronLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Card, Badge, Button } from '../components/ui';
import { useAuditRun, useAuditFindings, useAuditActionItems, useComprehensiveAuditResults } from '../hooks/api/useAuditDetails';
import { apiClient } from '../services/api';
import { COMPLIANCE_CONFIG } from '../constants/config';
import type { Finding, ActionItem } from '../types/audit';

interface FindingsTableProps {
  findings: Finding[];
  isLoading: boolean;
}

function FindingsTable({ findings, isLoading }: FindingsTableProps) {
  const [sortField, setSortField] = useState<keyof Finding>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedFindings = [...findings].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (aValue && bValue) {
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (field: keyof Finding) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (isLoading) {
    return (
      <Card variant="elevated">
        <div className="animate-pulse space-y-4 p-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('severity')}>Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('finding_code')}>Finding Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('description')}>Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('category')}>Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('created_at')}>Date Found</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedFindings.map((finding) => (
              <tr key={finding.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="severity" severity={finding.severity} size="sm">{finding.severity}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{finding.finding_code}</td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-md"><p className="line-clamp-2">{finding.description}</p></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{finding.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(finding.created_at), 'MMM dd, yyyy HH:mm')}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {finding.resolved_at ? (
                    <div className="flex items-center space-x-1">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Resolved</span>
                      {finding.auto_resolved && <Badge variant="default" size="sm">Auto</Badge>}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-orange-600">Open</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {findings.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Findings</h3>
          <p className="text-gray-500">This audit did not identify any compliance issues.</p>
        </div>
      )}
    </Card>
  );
}

interface ActionItemsTableProps {
  actionItems: ActionItem[];
  isLoading: boolean;
}

function ActionItemsTable({ actionItems, isLoading }: ActionItemsTableProps) {
  const [sortField, setSortField] = useState<keyof ActionItem>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleSort = (field: keyof ActionItem) => {
    if (field === sortField) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('desc'); }
  };

  const filteredAndSortedItems = actionItems
    .filter(item => filterSeverity === 'all' || item.severity === filterSeverity)
    .filter(item => filterStatus === 'all' || item.status === filterStatus)
    .sort((a, b) => {
      const aValue = a[sortField]; const bValue = b[sortField];
      if (aValue && bValue) { if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1; if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1; }
      return 0;
    });

  if (isLoading) return <Card variant="elevated"><div className="animate-pulse space-y-4 p-6">{[1,2,3].map(i => <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>)}</div></Card>;

  if (actionItems.length === 0) return (
    <Card variant="elevated" padding="lg">
      <div className="text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Action Items</h3>
        <p className="text-gray-500">All findings from this audit have been automatically resolved or require no action.</p>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Card variant="default" padding="sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Severity:</label>
            <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="rounded-md border-gray-300 text-sm">
              <option value="all">All</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-md border-gray-300 text-sm">
              <option value="all">All</option><option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="flex-1"></div>
          <div className="text-sm text-gray-500">Showing {filteredAndSortedItems.length} of {actionItems.length} items</div>
        </div>
      </Card>

      <Card variant="elevated" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('severity')}>Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('title')} style={{ width: '35%' }}>Action Required</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('finding_code')}>Finding Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('created_at')}>Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap"><Badge variant="severity" severity={item.severity} size="sm">{item.severity}</Badge></td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{item.mrn}</td>
                  <td className="px-6 py-4" style={{ width: '35%' }}>
                    <p className="text-sm font-medium text-gray-900 line-clamp-3">{item.title}</p>
                    {item.auto_resolved && <Badge variant="default" size="sm" className="mt-1">Auto-Resolved</Badge>}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{item.finding_code}</td>
                  <td className="px-4 py-4 whitespace-nowrap"><Badge variant="status" status={item.status} size="sm">{item.status.replace('_', ' ')}</Badge></td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDistanceToNow(new Date(item.created_at + 'Z'), { addSuffix: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

interface FindingsSectionProps {
  findings: Finding[];
  isLoading: boolean;
}

function FindingsSection({ findings, isLoading }: FindingsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Technical Findings Details</h3>
          <p className="text-sm text-gray-500">{findings.length} detailed audit findings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="default" size="sm">{isExpanded ? 'Hide' : 'Show'} Details</Badge>
          {isExpanded ? <ChevronDownIcon className="w-5 h-5 text-gray-400" /> : <ChevronRightIcon className="w-5 h-5 text-gray-400" />}
        </div>
      </button>
      {isExpanded && <div className="mt-4"><FindingsTable findings={findings} isLoading={isLoading} /></div>}
    </div>
  );
}

export default function AuditDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);

  const { data: comprehensiveData, isLoading: comprehensiveLoading, error: comprehensiveError } = useComprehensiveAuditResults(id || '');
  const { data: auditRun, isLoading: auditLoading, error: auditError } = useAuditRun(id || '');
  const { data: findings = [], isLoading: findingsLoading } = useAuditFindings(id || '');
  const { data: actionItems = [], isLoading: actionItemsLoading } = useAuditActionItems(id || '');

  if (!id) { navigate('/', { replace: true }); return <div>Redirecting...</div>; }

  const currentAuditRun = comprehensiveData?.audit_run ? {
    id: comprehensiveData.audit_run.id.toString(),
    audit_type: comprehensiveData.audit_run.audit_type,
    facility_id: comprehensiveData.audit_run.facility_id,
    facility_name: comprehensiveData.audit_run.facility_name || comprehensiveData.all_action_items[0]?.facility_name || 'Unknown Facility',
    created_at: comprehensiveData.audit_run.audit_date,
    status: comprehensiveData.audit_run.status,
    total_findings: comprehensiveData.audit_run.total_findings || 0,
    critical_findings: comprehensiveData.findings?.filter((f: Finding) => f.severity === 'critical' || f.severity === 'high').length || 0,
    action_items_count: comprehensiveData.summary.total_open_items,
    compliance_score: Math.round(comprehensiveData.audit_run.total_findings === 0 ? 100 : Math.max(0, 100 - (comprehensiveData.audit_run.total_findings * 5)))
  } : auditRun;

  const allActionItems = comprehensiveData?.all_action_items || actionItems;
  const actionItemsRequired = allActionItems.filter((item: ActionItem) => item.status === 'open' && !item.auto_resolved);
  const actionItemsAutoVerified = allActionItems.filter((item: ActionItem) => item.status === 'resolved' && item.auto_resolved);
  const actionItemsCompleted = allActionItems.filter((item: ActionItem) => item.status === 'resolved' && !item.auto_resolved);
  const currentFindings = comprehensiveData?.findings || findings;
  const isLoading = comprehensiveLoading || auditLoading;
  const error = comprehensiveError || auditError;

  const handleExportResults = async () => {
    if (!id) return;
    setIsExporting(true);
    try { await apiClient.exportAuditResults(parseInt(id, 10)); }
    catch (err) { console.error('Export failed:', err); }
    finally { setIsExporting(false); }
  };

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card variant="elevated" padding="lg" className="max-w-md">
        <div className="text-center">
          <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Audit Not Found</h2>
          <p className="text-gray-500 mb-4">The requested audit could not be found.</p>
          <Button variant="primary" onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </Card>
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div><div className="h-32 bg-gray-200 rounded mb-6"></div></div></div></div>
  );

  if (!currentAuditRun) return null;

  const complianceScore = currentAuditRun.compliance_score ?? 0;
  const complianceColor = complianceScore >= COMPLIANCE_CONFIG.THRESHOLDS.EXCELLENT ? 'green' : complianceScore >= COMPLIANCE_CONFIG.THRESHOLDS.GOOD ? 'yellow' : 'red';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/')} className="flex items-center space-x-2">
                <ChevronLeftIcon className="w-4 h-4" /><span>Back to Dashboard</span>
              </Button>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm" onClick={handleExportResults} disabled={isExporting}>
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />{isExporting ? 'Exporting...' : 'Export Results'}
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="audit-type" auditType={currentAuditRun.audit_type} size="lg">{currentAuditRun.audit_type.replace('-', ' ')} Audit</Badge>
              <Badge variant="status" status={currentAuditRun.status} size="lg">{currentAuditRun.status}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">{currentAuditRun.facility_name}</h1>
            <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2"><CalendarIcon className="w-4 h-4" /><span>Audit Date: {format(new Date(currentAuditRun.created_at), 'MMMM dd, yyyy')}</span></div>
              <div className="flex items-center space-x-2"><ClockIcon className="w-4 h-4" /><span>Started: {formatDistanceToNow(new Date(currentAuditRun.created_at), { addSuffix: true })}</span></div>
              <div className="flex items-center space-x-2"><UserIcon className="w-4 h-4" /><span>Run ID: #{currentAuditRun.id}</span></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card variant="elevated" padding="sm"><div className="text-center"><p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Compliance Score</p><p className={`text-3xl font-bold text-${complianceColor}-600`}>{Math.round(complianceScore)}%</p></div></Card>
          <Card variant="elevated" padding="sm"><div className="text-center"><p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Total Findings</p><p className="text-3xl font-bold text-gray-900">{currentAuditRun.total_findings || 0}</p></div></Card>
          <Card variant="elevated" padding="sm"><div className="text-center"><p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Action Items</p><p className="text-3xl font-bold text-red-600">{actionItemsRequired.length}</p></div></Card>
          <Card variant="elevated" padding="sm"><div className="text-center"><p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Critical Issues</p><p className="text-3xl font-bold text-red-600">{currentAuditRun.critical_findings || 0}</p></div></Card>
        </div>

        <div className="mb-8 space-y-8">
          {actionItemsRequired.length > 0 && (
            <div>
              <div className="mb-4"><h2 className="text-2xl font-bold text-red-600 flex items-center space-x-2"><ExclamationTriangleIcon className="w-6 h-6" /><span>Action Required</span></h2><p className="text-sm text-gray-500 mt-1">{actionItemsRequired.length} compliance violations requiring immediate attention</p></div>
              <ActionItemsTable actionItems={actionItemsRequired} isLoading={comprehensiveLoading || actionItemsLoading} />
            </div>
          )}
          {actionItemsAutoVerified.length > 0 && (
            <div>
              <div className="mb-4 flex items-center space-x-2"><CheckCircleIcon className="w-5 h-5 text-green-600" /><h3 className="text-lg font-semibold text-green-600">Auto-Verified</h3><Badge variant="success" size="sm">{actionItemsAutoVerified.length}</Badge></div>
              <ActionItemsTable actionItems={actionItemsAutoVerified} isLoading={false} />
            </div>
          )}
          {actionItemsCompleted.length > 0 && (
            <div>
              <div className="mb-4 flex items-center space-x-2"><CheckCircleIcon className="w-5 h-5 text-blue-600" /><h3 className="text-lg font-semibold text-blue-600">Completed</h3><Badge variant="info" size="sm">{actionItemsCompleted.length}</Badge></div>
              <ActionItemsTable actionItems={actionItemsCompleted} isLoading={false} />
            </div>
          )}
          {allActionItems.length === 0 && !comprehensiveLoading && !actionItemsLoading && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
              <p className="text-sm text-gray-500">No action items found. This facility is in full compliance for this audit.</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-8">
          <FindingsSection findings={currentFindings} isLoading={comprehensiveLoading || findingsLoading} />
        </div>
      </main>
    </div>
  );
}
