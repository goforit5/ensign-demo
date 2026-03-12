import type {
  DashboardMetrics,
  Facility,
  AuditRun,
  ActionItem,
  ActivityEvent,
  Finding,
  CensusSummary,
} from '../types/audit';
import { facilities } from '../data/facilities';
import { auditRuns, getAuditRunById } from '../data/auditRuns';
import {
  getAllActionItems as getActionItemsData,
  getActionItemsForRun,
  generateNewActionItems,
} from '../data/actionItems';
import { getFindingsForRun, generateNewFindings } from '../data/findings';
import { getCensusSummary } from '../data/censusSummary';
// Config imported for potential future use
import * as XLSX from 'xlsx';

function delay(ms: number = 200 + Math.random() * 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

let nextRunId = 500;

class ApiClient {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    await delay();
    const openItems = getActionItemsData({ status: 'open' });
    const recentRuns = auditRuns.filter((r) => {
      const d = new Date(r.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    return {
      total_facilities: facilities.length,
      audits_completed_this_month: recentRuns.length,
      total_audits_today: recentRuns.filter((r) => {
        const d = new Date(r.created_at);
        const now = new Date();
        return d.toDateString() === now.toDateString();
      }).length,
      pending_action_items: openItems.length,
      current_compliance: Math.round(
        facilities.reduce((sum, f) => sum + (f.compliance_score || 0), 0) /
          facilities.length
      ),
      compliance_trend: 2.3,
      audit_types: {
        psychotropic: {
          facilities: facilities.length,
          action_items: getActionItemsData({ audit_type: 'psychotropic', status: 'open' }).length,
        },
        catheter: {
          facilities: facilities.length,
          action_items: getActionItemsData({ audit_type: 'catheter', status: 'open' }).length,
        },
        'skin-wound': {
          facilities: facilities.length,
          action_items: getActionItemsData({ audit_type: 'skin_wound', status: 'open' }).length,
        },
        falls: {
          facilities: facilities.length,
          action_items: getActionItemsData({ audit_type: 'falls', status: 'open' }).length,
        },
        admissions: {
          facilities: facilities.length,
          action_items: getActionItemsData({ audit_type: 'admissions', status: 'open' }).length,
        },
      },
      last_updated: new Date().toISOString(),
    };
  }

  async getFacilities(): Promise<Facility[]> {
    await delay();
    return [...facilities];
  }

  async getCensusSummary(
    facilityIds: number[],
    admissionFilter: string = 'all'
  ): Promise<CensusSummary> {
    await delay();
    return getCensusSummary(facilityIds, admissionFilter);
  }

  async getRecentAudits(limit: number = 10): Promise<AuditRun[]> {
    await delay();
    return auditRuns
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, limit);
  }

  async getActionItems(_facilityId?: number): Promise<ActionItem[]> {
    await delay();
    return getActionItemsData(
      _facilityId ? { facility_id: _facilityId } : undefined
    );
  }

  async getAllActionItems(filters?: {
    facility_id?: number;
    audit_type?: string;
    status?: string;
    severity?: string;
    skip?: number;
    limit?: number;
  }): Promise<ActionItem[]> {
    await delay();
    return getActionItemsData(filters);
  }

  async updateActionItemStatus(
    _itemId: string,
    _status: string,
    _notes?: string,
    _assignedTo?: string
  ): Promise<void> {
    await delay();
  }

  async bulkUpdateActionItems(
    _itemIds: string[],
    _updates: { status?: string; assigned_to?: string; notes?: string }
  ): Promise<void> {
    await delay();
  }

  async exportActionItems(_filters?: {
    facility_id?: number;
    audit_type?: string;
    status?: string;
    include_resolved?: boolean;
  }): Promise<string> {
    await delay();
    // Generate and download Excel
    const items = getActionItemsData(_filters);
    this.downloadExcel(
      items.map((i) => ({
        Facility: i.facility_name,
        'Audit Type': i.audit_type,
        Severity: i.severity,
        Status: i.status,
        MRN: i.mrn || '',
        'Finding Code': i.finding_code,
        Title: i.title,
        'Assigned To': i.assigned_to || '',
        'Created At': i.created_at,
      })),
      'action-items-export'
    );
    return '#';
  }

  async getActivityEvents(): Promise<ActivityEvent[]> {
    await delay();
    const events: ActivityEvent[] = [];
    const recent = auditRuns.slice(0, 8);

    recent.forEach((audit) => {
      events.push({
        id: `event_audit_${audit.id}`,
        type: 'audit_completed',
        audit_type: audit.audit_type,
        facility_name: audit.facility_name,
        message: `${audit.audit_type} audit completed with ${audit.compliance_score}% compliance`,
        timestamp: audit.created_at,
        severity: audit.critical_findings > 0 ? 'high' : 'low',
      });
    });

    return events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async runAudit(
    auditType: string,
    facilityId: number
  ): Promise<{ audit_run_id: number; status: string }> {
    await delay(500);
    const fac = facilities.find((f) => f.id === facilityId);
    const complianceScore = 70 + Math.floor(Math.random() * 25);
    const totalFindings = Math.floor(Math.random() * 8) + 1;

    const newRun: AuditRun = {
      id: nextRunId++,
      audit_type: auditType as AuditRun['audit_type'],
      facility_id: facilityId,
      facility_name: fac?.name || 'Unknown',
      created_at: new Date().toISOString(),
      status: 'completed',
      total_findings: totalFindings,
      critical_findings: Math.floor(Math.random() * 2),
      action_items_count: 0,
      compliance_score: complianceScore,
      progress: 100,
      total_patients: Math.floor(Math.random() * 30) + 10,
      export_available: true,
    };

    auditRuns.unshift(newRun);

    // Generate findings and action items
    generateNewFindings(newRun.id, auditType);
    const newItems = generateNewActionItems(
      newRun.id,
      auditType as AuditRun['audit_type'],
      facilityId,
      fac?.name || 'Unknown'
    );
    newRun.action_items_count = newItems.length;
    newRun.action_items_created = newItems.length;

    return { audit_run_id: newRun.id, status: 'completed' };
  }

  async getAuditRunById(auditRunId: number): Promise<AuditRun> {
    await delay();
    const run = getAuditRunById(auditRunId);
    if (!run) throw new Error('Audit run not found');
    return run;
  }

  async getComprehensiveAuditResults(auditRunId: number): Promise<{
    audit_run: any;
    summary: any;
    action_items: {
      new: ActionItem[];
      existing_open: ActionItem[];
      resolved_this_run: ActionItem[];
    };
    all_action_items: ActionItem[];
    findings: Finding[];
  }> {
    await delay();
    const run = getAuditRunById(auditRunId);
    if (!run) throw new Error('Audit run not found');

    const findings = getFindingsForRun(auditRunId);
    const actionItems = getActionItemsForRun(auditRunId);
    const openItems = actionItems.filter((i) => i.status === 'open');
    const resolvedItems = actionItems.filter((i) => i.status === 'resolved');

    return {
      audit_run: {
        id: run.id,
        audit_type: run.audit_type,
        facility_id: run.facility_id,
        facility_name: run.facility_name,
        status: run.status,
        audit_date: run.created_at,
        total_findings: run.total_findings,
      },
      summary: {
        total_medications_audited: run.total_patients || 20,
        compliant_medications: (run.total_patients || 20) - run.total_findings,
        violation_medications: run.total_findings,
        compliance_rate: run.compliance_score || 0,
        effective_monitoring_orders: Math.floor(Math.random() * 10) + 5,
        orphaned_monitoring_orders: Math.floor(Math.random() * 3),
        action_items_created: run.action_items_count,
        action_items_resolved: resolvedItems.length,
        total_open_items: openItems.length,
      },
      action_items: {
        new: openItems.slice(0, Math.ceil(openItems.length / 2)),
        existing_open: openItems.slice(Math.ceil(openItems.length / 2)),
        resolved_this_run: resolvedItems,
      },
      all_action_items: actionItems,
      findings,
    };
  }

  async getAuditFindings(auditRunId: number): Promise<Finding[]> {
    await delay();
    return getFindingsForRun(auditRunId);
  }

  async getAuditActionItems(auditRunId: number): Promise<ActionItem[]> {
    await delay();
    return getActionItemsForRun(auditRunId);
  }

  async exportAuditResults(auditRunId: number): Promise<void> {
    await delay(300);
    const run = getAuditRunById(auditRunId);
    if (!run) throw new Error('Audit run not found');

    const findings = getFindingsForRun(auditRunId);
    const actionItems = getActionItemsForRun(auditRunId);

    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Audit Report - Ensign Clinical Audit Platform'],
      [''],
      ['Facility', run.facility_name],
      ['Audit Type', run.audit_type],
      ['Date', new Date(run.created_at).toLocaleDateString()],
      ['Compliance Score', `${run.compliance_score}%`],
      ['Total Findings', run.total_findings],
      ['Action Items', run.action_items_count],
      ['Status', run.status],
      [''],
      ['DEMO ENVIRONMENT - All data is synthetic'],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    // Findings sheet
    if (findings.length > 0) {
      const findingsData = findings.map((f) => ({
        MRN: f.mrn,
        'Finding Code': f.finding_code,
        Severity: f.severity,
        Description: f.description,
        Category: f.category,
        'Date Found': new Date(f.created_at).toLocaleDateString(),
        Status: f.resolved_at ? 'Resolved' : 'Open',
        'Auto Resolved': f.auto_resolved ? 'Yes' : 'No',
      }));
      const findingsSheet = XLSX.utils.json_to_sheet(findingsData);
      XLSX.utils.book_append_sheet(wb, findingsSheet, 'Findings');
    }

    // Action Items sheet
    if (actionItems.length > 0) {
      const aiData = actionItems.map((i) => ({
        MRN: i.mrn || '',
        'Finding Code': i.finding_code,
        Severity: i.severity,
        Status: i.status,
        Title: i.title,
        'Assigned To': i.assigned_to || '',
        'Due Date': i.due_date
          ? new Date(i.due_date).toLocaleDateString()
          : '',
        Created: new Date(i.created_at).toLocaleDateString(),
        'Auto Resolved': i.auto_resolved ? 'Yes' : 'No',
      }));
      const aiSheet = XLSX.utils.json_to_sheet(aiData);
      XLSX.utils.book_append_sheet(wb, aiSheet, 'Action Items');
    }

    const filename = `audit-${run.audit_type}-${run.facility_name.replace(/\s+/g, '_')}-${new Date(run.created_at).toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  async exportBatchAudits(auditRunIds: number[]): Promise<void> {
    await delay(500);
    const wb = XLSX.utils.book_new();

    auditRunIds.forEach((id) => {
      const run = getAuditRunById(id);
      if (!run) return;

      const findings = getFindingsForRun(id);
      const actionItems = getActionItemsForRun(id);

      const sheetName = `${run.audit_type.substring(0, 6)}-${run.facility_name.substring(0, 12)}`.substring(0, 31);

      const data = [
        ['Facility', run.facility_name],
        ['Audit Type', run.audit_type],
        ['Date', new Date(run.created_at).toLocaleDateString()],
        ['Compliance', `${run.compliance_score}%`],
        ['Findings', run.total_findings],
        ['Action Items', run.action_items_count],
        [''],
        ['--- Findings ---'],
        ...findings.map((f) => [
          f.mrn,
          f.finding_code,
          f.severity,
          f.description,
        ]),
        [''],
        ['--- Action Items ---'],
        ...actionItems.map((i) => [
          i.mrn || '',
          i.finding_code,
          i.severity,
          i.status,
          i.title,
        ]),
      ];

      const sheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, sheet, sheetName);
    });

    const filename = `batch-audit-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  private downloadExcel(data: Record<string, any>[], basename: string): void {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${basename}-${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}

export const apiClient = new ApiClient();
