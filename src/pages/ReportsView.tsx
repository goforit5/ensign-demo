import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Card, Button, Badge } from '../components/ui';
import { apiClient } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import type { AuditRun } from '../types/audit';
import { formatRelativeDate } from '../utils/dateHelpers';
import { MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

type TimeGroup = 'today' | 'yesterday' | 'this_week' | 'earlier';

export const ReportsView: React.FC = () => {
  const { data: recentAudits = [], isLoading: loadingAudits } = useQuery({
    queryKey: ['recent-audits'],
    queryFn: () => apiClient.getRecentAudits(50),
    staleTime: 30000,
  });

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAudits, setExpandedAudits] = useState<Set<string>>(new Set());
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const getLatestAuditsOnly = (audits: AuditRun[]): AuditRun[] => {
    const latestMap = new Map<string, AuditRun>();
    audits.forEach(audit => {
      const key = `${audit.facility_id}-${audit.audit_type}`;
      const existing = latestMap.get(key);
      if (!existing || new Date(audit.created_at) > new Date(existing.created_at)) latestMap.set(key, audit);
    });
    return Array.from(latestMap.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const groupAuditsByTime = (audits: AuditRun[]): Map<TimeGroup, AuditRun[]> => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const groups = new Map<TimeGroup, AuditRun[]>([['today', []], ['yesterday', []], ['this_week', []], ['earlier', []]]);
    audits.forEach(audit => {
      const d = new Date(audit.created_at);
      if (d >= today) groups.get('today')!.push(audit);
      else if (d >= yesterday) groups.get('yesterday')!.push(audit);
      else if (d >= weekAgo) groups.get('this_week')!.push(audit);
      else groups.get('earlier')!.push(audit);
    });
    return groups;
  };

  const filteredAudits = useMemo(() => {
    let audits = recentAudits;
    if (!showAllHistory) audits = getLatestAuditsOnly(audits);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      audits = audits.filter(a => a.facility_name.toLowerCase().includes(query) || a.audit_type.toLowerCase().includes(query));
    }
    return audits;
  }, [recentAudits, searchQuery, showAllHistory]);

  const groupedAudits = useMemo(() => groupAuditsByTime(filteredAudits), [filteredAudits]);

  const togglePreview = (auditId: number) => {
    setExpandedAudits(prev => {
      const next = new Set(prev);
      const id = auditId.toString();
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleExportAudit = async (auditRun: AuditRun) => {
    try { await apiClient.exportAuditResults(auditRun.id); } catch (err) { console.error('Export failed:', err); }
  };

  const getSeverityBorderClass = (audit: AuditRun): string => {
    const compliance = audit.compliance_score ?? 100;
    if (compliance < 50) return 'border-l-4 border-red-500';
    if (compliance < 75) return 'border-l-4 border-yellow-500';
    if (compliance < 90) return 'border-l-4 border-blue-500';
    return 'border-l-4 border-green-500';
  };

  const getTimeGroupLabel = (group: TimeGroup): string => ({ today: 'Today', yesterday: 'Yesterday', this_week: 'This Week', earlier: 'Earlier' })[group];

  if (loadingAudits) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Typography variant="title1" className="mb-2">Reports Hub</Typography>
      <Typography variant="body" color="secondary">Loading reports...</Typography>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Typography variant="title1" className="mb-2">Reports Hub</Typography>
        <Typography variant="body" color="secondary">Export audit reports and review compliance history</Typography>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="relative max-w-md flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search by facility or audit type..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <Button variant={showAllHistory ? 'primary' : 'outline'} size="sm" onClick={() => setShowAllHistory(!showAllHistory)} className="ml-4">
          {showAllHistory ? 'Show Latest Only' : 'Show All History'}
        </Button>
      </div>

      <div className="space-y-8">
        {Array.from(groupedAudits.entries()).map(([group, audits]) => {
          if (audits.length === 0) return null;
          return (
            <section key={group}>
              <div className="mb-4">
                <Typography variant="title2" className="text-gray-900">{getTimeGroupLabel(group)}</Typography>
                <div className="h-px bg-gray-200 mt-2" />
              </div>
              <div className="space-y-3">
                {audits.map((audit) => {
                  const isExpanded = expandedAudits.has(audit.id.toString());
                  return (
                    <Card key={audit.id} variant="default" className={`hover:shadow-lg transition-all ${getSeverityBorderClass(audit)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant="default" size="sm">{audit.audit_type}</Badge>
                            <Typography variant="body" className="font-semibold">{audit.facility_name}</Typography>
                          </div>
                          <div className="flex items-center gap-4 mb-2">
                            <Typography variant="caption1" color="secondary">{formatRelativeDate(new Date(audit.created_at))}</Typography>
                            <Typography variant="caption1" className="font-medium">{audit.action_items_count} action items</Typography>
                            {audit.compliance_score !== undefined && (
                              <Typography variant="caption1" className={audit.compliance_score >= 90 ? 'text-green-600 font-medium' : audit.compliance_score >= 75 ? 'text-yellow-600 font-medium' : 'text-red-600 font-medium'}>
                                {Math.round(audit.compliance_score)}% compliant
                              </Typography>
                            )}
                          </div>
                          {audit.action_items_count > 0 && (
                            <button onClick={() => togglePreview(audit.id)} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2">
                              {isExpanded ? <><ChevronUpIcon className="w-4 h-4" />Hide findings</> : <><ChevronDownIcon className="w-4 h-4" />Show top findings</>}
                            </button>
                          )}
                          {isExpanded && audit.action_items_count > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1"><Badge variant="danger" size="sm">Critical</Badge><span className="font-medium">Documentation missing</span></div>
                                <p className="text-xs text-gray-500">Export full report to see all {audit.action_items_count} findings</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <Button variant="outline" size="sm" onClick={() => handleExportAudit(audit)}>Export Excel</Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
        {filteredAudits.length === 0 && (
          <Card className="text-center py-12">
            <Typography variant="body" color="secondary">{searchQuery ? `No audits found matching "${searchQuery}"` : 'No audit runs found.'}</Typography>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReportsView;
