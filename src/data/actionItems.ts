import type { ActionItem, AuditType } from '../types/audit';
import { auditRuns } from './auditRuns';
import { getFindingsForRun } from './findings';

let actionItemId = 5000;

function generateActionItems(
  auditRunId: number,
  auditType: AuditType,
  facilityId: number,
  facilityName: string,
  count: number
): ActionItem[] {
  const findings = getFindingsForRun(auditRunId);
  const violations = findings.filter(
    (f) => f.severity !== 'info' && !f.auto_resolved
  );
  const items: ActionItem[] = [];

  for (let i = 0; i < count && i < violations.length; i++) {
    const finding = violations[i];
    const isOld = Math.random() > 0.7;
    const isResolved = Math.random() > 0.6;
    const isAutoResolved = isResolved && Math.random() > 0.5;

    items.push({
      id: String(actionItemId++),
      audit_run_id: String(auditRunId),
      finding_id: finding.id,
      audit_type: auditType,
      facility_id: facilityId,
      facility_name: facilityName,
      severity: finding.severity as ActionItem['severity'],
      status: isResolved ? 'resolved' : isOld ? 'in_progress' : 'open',
      title: finding.description,
      description: finding.description,
      finding_code: finding.finding_code,
      mrn: finding.mrn,
      assigned_to: isOld
        ? ['Dr. Martinez', 'Nurse Johnson', 'DON Williams', 'RN Chen'][
            Math.floor(Math.random() * 4)
          ]
        : undefined,
      due_date: isResolved
        ? undefined
        : new Date(
            Date.now() + (7 + Math.floor(Math.random() * 14)) * 86400000
          ).toISOString(),
      created_at: finding.created_at,
      updated_at: new Date(
        Date.now() - Math.random() * 3 * 86400000
      ).toISOString(),
      auto_resolved: isAutoResolved,
    });
  }

  // If we need more items than violations, create extras from templates
  while (items.length < count) {
    const f = findings[items.length % findings.length];
    if (!f) break;
    items.push({
      id: String(actionItemId++),
      audit_run_id: String(auditRunId),
      finding_id: f.id,
      audit_type: auditType,
      facility_id: facilityId,
      facility_name: facilityName,
      severity: (['medium', 'high', 'critical'] as const)[
        Math.floor(Math.random() * 3)
      ],
      status: 'open',
      title: f.description,
      description: f.description,
      finding_code: f.finding_code,
      mrn: f.mrn,
      created_at: f.created_at,
      updated_at: new Date().toISOString(),
      auto_resolved: false,
    });
  }

  return items;
}

// Pre-generate action items for all audit runs
const allActionItems: ActionItem[] = [];

auditRuns.forEach((run) => {
  if (run.action_items_count > 0) {
    const items = generateActionItems(
      run.id,
      run.audit_type,
      run.facility_id,
      run.facility_name,
      run.action_items_count
    );
    allActionItems.push(...items);
  }
});

export function getAllActionItems(filters?: {
  facility_id?: number;
  audit_type?: string;
  status?: string;
  severity?: string;
  limit?: number;
}): ActionItem[] {
  let items = [...allActionItems];

  if (filters?.facility_id) {
    items = items.filter((i) => i.facility_id === filters.facility_id);
  }
  if (filters?.audit_type && filters.audit_type !== 'all') {
    items = items.filter((i) => i.audit_type === filters.audit_type);
  }
  if (filters?.status) {
    items = items.filter((i) => i.status === filters.status);
  }
  if (filters?.severity) {
    items = items.filter((i) => i.severity === filters.severity);
  }
  if (filters?.limit) {
    items = items.slice(0, filters.limit);
  }

  return items;
}

export function getActionItemsForRun(auditRunId: number): ActionItem[] {
  return allActionItems.filter((i) => i.audit_run_id === String(auditRunId));
}

export function addActionItems(items: ActionItem[]): void {
  allActionItems.push(...items);
}

export function generateNewActionItems(
  auditRunId: number,
  auditType: AuditType,
  facilityId: number,
  facilityName: string
): ActionItem[] {
  const count = Math.floor(Math.random() * 4) + 1;
  const items = generateActionItems(
    auditRunId,
    auditType,
    facilityId,
    facilityName,
    count
  );
  allActionItems.push(...items);
  return items;
}
