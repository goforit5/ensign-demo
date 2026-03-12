/**
 * Action Item Helper Utilities
 * DRY refactoring for action item transformation and filtering
 */

import type { ActionItem } from '../types/audit';

/**
 * Transform API action item response to frontend ActionItem type
 *
 * Consolidates duplicate transformation logic from api.ts
 */
export function transformApiActionItem(
  apiItem: any,
  facilityName: string
): ActionItem {
  return {
    id: apiItem.id?.toString() || '',
    audit_run_id: apiItem.audit_run_id?.toString() || '',
    finding_id: apiItem.finding_id?.toString() || '',
    audit_type: apiItem.audit_type,
    facility_id: apiItem.facility_id,
    facility_name: facilityName,
    severity: apiItem.severity,
    status: apiItem.status,
    title: apiItem.finding_description,
    description: apiItem.finding_description,
    finding_code: apiItem.finding_code,
    mrn: apiItem.mrn,
    assigned_to: apiItem.assigned_to,
    due_date: apiItem.due_date,
    created_at: apiItem.created_at,
    updated_at: apiItem.updated_at,
    auto_resolved: apiItem.auto_resolved || false,
  };
}

/**
 * Enrich action items with facility names from a facility map
 *
 * Common pattern used in api.ts
 */
export function enrichActionItemsWithFacilityNames(
  items: ActionItem[],
  facilitiesMap: Map<number, string>
): ActionItem[] {
  return items.map((item) => ({
    ...item,
    facility_name: item.facility_name || facilitiesMap.get(item.facility_id) || 'Unknown Facility',
  }));
}

/**
 * Group action items by severity
 */
export function groupActionItemsBySeverity(items: ActionItem[]) {
  return {
    critical: items.filter((item) => item.severity === 'critical'),
    high: items.filter((item) => item.severity === 'high'),
    medium: items.filter((item) => item.severity === 'medium'),
    low: items.filter((item) => item.severity === 'low'),
  };
}

/**
 * Group action items by status
 */
export function groupActionItemsByStatus(items: ActionItem[]) {
  return {
    open: items.filter((item) => item.status === 'open'),
    in_progress: items.filter((item) => item.status === 'in_progress'),
    resolved: items.filter((item) => item.status === 'resolved'),
    dismissed: items.filter((item) => item.status === 'dismissed'),
  };
}

/**
 * Calculate action item metrics
 *
 * Used in dashboards and summary cards
 */
export function calculateActionItemMetrics(items: ActionItem[]) {
  const total = items.length;
  const open = items.filter((item) => item.status === 'open').length;
  const inProgress = items.filter((item) => item.status === 'in_progress').length;
  const resolved = items.filter((item) => item.status === 'resolved').length;
  const critical = items.filter((item) => item.severity === 'critical').length;
  const autoResolved = items.filter((item) => item.auto_resolved).length;

  return {
    total,
    open,
    in_progress: inProgress,
    resolved,
    critical,
    auto_resolved: autoResolved,
    by_audit_type: calculateByAuditType(items),
    by_severity: {
      critical: items.filter((item) => item.severity === 'critical').length,
      high: items.filter((item) => item.severity === 'high').length,
      medium: items.filter((item) => item.severity === 'medium').length,
      low: items.filter((item) => item.severity === 'low').length,
    },
  };
}

/**
 * Calculate action items by audit type
 */
function calculateByAuditType(items: ActionItem[]): Record<string, number> {
  const counts: Record<string, number> = {};

  items.forEach((item) => {
    counts[item.audit_type] = (counts[item.audit_type] || 0) + 1;
  });

  return counts;
}

/**
 * Filter action items by multiple criteria
 *
 * Useful for search/filter functionality
 */
export function filterActionItems(
  items: ActionItem[],
  filters: {
    facility_id?: number;
    audit_type?: string;
    status?: string;
    severity?: string;
    search?: string;
  }
): ActionItem[] {
  return items.filter((item) => {
    // Facility filter
    if (filters.facility_id && item.facility_id !== filters.facility_id) {
      return false;
    }

    // Audit type filter
    if (filters.audit_type && filters.audit_type !== 'all' && item.audit_type !== filters.audit_type) {
      return false;
    }

    // Status filter
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    // Severity filter
    if (filters.severity && item.severity !== filters.severity) {
      return false;
    }

    // Search filter (searches in title, description, MRN, finding code)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.mrn?.toLowerCase().includes(searchLower) ||
        item.finding_code?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    return true;
  });
}
