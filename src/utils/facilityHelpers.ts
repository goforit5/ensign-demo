/**
 * Facility Helper Utilities
 * DRY refactoring for facility data transformation
 */

import type { Facility } from '../types/audit';

/**
 * Transform API facility response to frontend Facility type
 *
 * Consolidates duplicate transformation logic from:
 * - api.ts:getFacilities()
 * - RunAuditsView.tsx (facility mapping)
 */
export function transformApiFacilityToFacility(
  apiFacility: any,
  residentCount: number = 0
): Facility {
  return {
    id: apiFacility.facility_id,
    name: apiFacility.facility_name,
    address: `${apiFacility.region}, ${apiFacility.state}`,
    type: apiFacility.facility_type,
    state: apiFacility.state,
    region: apiFacility.region,
    bed_count: apiFacility.bed_count,
    is_active: apiFacility.is_active,
    overall_status: apiFacility.overall_status,
    total_open_items: apiFacility.total_open_items,
    total_critical_items: apiFacility.total_critical_items,
    audit_status: apiFacility.audit_status,
    action_items_by_type: apiFacility.action_items_by_type,
    never_audited_types: apiFacility.never_audited_types,
    overdue_types: apiFacility.overdue_types,
    compliance_score: apiFacility.current_compliance_score || 0,
    last_audit_date: getLatestAuditDate(apiFacility.audit_status) ?? undefined,
    total_residents: residentCount,
  };
}

/**
 * Get the latest audit date from audit_status object
 *
 * Consolidates duplicate logic from api.ts
 */
export function getLatestAuditDate(auditStatus: Record<string, any>): string | null {
  if (!auditStatus) return null;

  let latestDateStr: string | null = null;

  Object.values(auditStatus).forEach((status: any) => {
    if (status?.last_audit_date) {
      const currentDate = status.last_audit_date;
      if (!latestDateStr || currentDate > latestDateStr) {
        latestDateStr = currentDate;
      }
    }
  });

  return latestDateStr;
}

/**
 * Create a facility lookup map (id → name)
 *
 * Common pattern used across multiple components
 */
export function createFacilityMap(facilities: Facility[]): Map<number, string> {
  return new Map(facilities.map((f) => [f.id, f.name]));
}

/**
 * Categorize facilities by overall status
 *
 * Used in TriageView and dashboards
 */
export function categorizeFacilities(facilities: Facility[]) {
  return {
    critical: facilities.filter(
      (f) => f.overall_status === 'critical' && f.total_open_items > 0
    ),
    neverAudited: facilities.filter(
      (f) => f.never_audited_types && f.never_audited_types.length > 0
    ),
    allClear: facilities.filter(
      (f) => f.overall_status === 'compliant' && f.total_open_items === 0
    ),
    warning: facilities.filter((f) => f.overall_status === 'warning'),
    needsAttention: facilities.filter((f) => f.overall_status === 'needs_attention'),
  };
}
