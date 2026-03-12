// Universal Audit Types for Healthcare Compliance Platform

export type AuditType = 'psychotropic' | 'catheter' | 'skin_wound' | 'falls' | 'admissions';

export interface AuditStatus {
  last_audit_date: string | null;
  days_since_last_audit: number | null;
  total_runs: number;
  status: 'never_audited' | 'current' | 'due_soon' | 'overdue';
}

export interface ActionItemsByType {
  open_count: number;
  critical_count: number;
}

export interface Facility {
  id: number;
  name: string;
  address: string;
  type: string;
  state: string;
  region: string;
  bed_count: number;
  is_active: boolean;
  overall_status: 'compliant' | 'warning' | 'needs_attention' | 'critical';
  total_open_items: number;
  total_critical_items: number;
  audit_status: Record<string, AuditStatus>;
  action_items_by_type: Record<string, ActionItemsByType>;
  never_audited_types: string[];
  overdue_types: string[];
  // Legacy fields for backward compatibility
  compliance_score?: number;
  last_audit_date?: string;
  total_residents?: number;
}

export interface AuditRun {
  id: number;  // Database ID (API returns audit_run_id as integer)
  audit_type: AuditType;
  facility_id: number;
  facility_name: string;
  created_at: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  total_findings: number;
  critical_findings: number;
  action_items_count: number;
  compliance_score: number | undefined;
  progress?: number;
  audit_date?: string;  // Some endpoints return audit_date instead of created_at
  total_patients?: number;  // Total patients audited
  action_items_created?: number;  // Action items created this run
  export_available?: boolean;  // Whether export is available
  affected_compliance_score?: number;  // Affected-only compliance score
}

// Enhanced Finding types for complete audit trail
export type FindingType = 'medication_compliance' | 'monitoring_effectiveness' | 'monitoring_relevance';
export type ComplianceStatus = 'compliant' | 'violation' | 'effective' | 'orphaned';
export type MonitoringType = 'side_effect' | 'behavior';

export interface Finding {
  id: string;
  audit_run_id: string;
  patient_id: number;
  mrn: string;
  finding_code: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'info';
  description: string;
  category: string;
  created_at: string;
  resolved_at?: string;
  auto_resolved: boolean;
}

export interface EnhancedFinding {
  id: number;
  finding_type: FindingType;
  compliance_status: ComplianceStatus;
  finding_code: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'info';
  source_order_description?: string;
  monitoring_order_description?: string;
  days_since_monitoring?: number;
  monitoring_type?: MonitoringType;
  related_medication_count?: number;
  created_at: string;
}

export interface EnhancedAuditSummary {
  total_medications_audited: number;
  compliant_medications: number;
  violation_medications: number;
  compliance_rate: number;
  effective_monitoring_orders: number;
  orphaned_monitoring_orders: number;
  action_items_created: number;
  action_items_resolved: number;
}

export interface EnhancedComprehensiveResults {
  audit_run: {
    id: number;
    audit_type: string;
    facility_id: number;
    status: string;
    audit_date: string;
    duration_seconds?: number;
  };
  summary: EnhancedAuditSummary;
  findings: {
    medication_compliance: EnhancedFinding[];
    monitoring_effectiveness: EnhancedFinding[];
    orphaned_monitoring: EnhancedFinding[];
  };
  action_items: EnhancedActionItem[];
}

export interface EnhancedActionItem extends ActionItem {
  source_order_description?: string;
  resolving_order_description?: string;
}

export interface ActionItem {
  id: string;
  audit_run_id: string;
  finding_id: string;
  audit_type: AuditType;
  facility_id: number;
  facility_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  title: string;
  description: string;
  finding_code: string;
  mrn?: string;
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  auto_resolved: boolean;
}

export interface DashboardMetrics {
  total_facilities: number;
  audits_completed_this_month?: number; // API uses this instead of total_audits_today
  total_audits_today?: number; // Legacy field
  pending_action_items: number;
  current_compliance?: number;
  compliance_trend: number;
  audit_types: {
    psychotropic?: {
      facilities: number;
      action_items: number; // API returns action_items, not recent_audits
    };
    catheter?: {
      facilities: number;
      action_items: number;
    };
    'skin-wound'?: { // API uses 'skin-wound' not 'skin_wound'
      facilities: number;
      action_items: number;
    };
    falls?: {
      facilities: number;
      action_items: number;
    };
    admissions?: {
      facilities: number;
      action_items: number;
    };
  };
  last_updated?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'audit_completed' | 'action_item_created' | 'action_item_resolved' | 'compliance_alert';
  audit_type: AuditType;
  facility_name: string;
  message: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface ExportRequest {
  id: string;
  audit_type: AuditType;
  facility_ids: number[];
  format: 'excel' | 'pdf' | 'csv';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  download_url?: string;
}

export interface FacilityCensus {
  facility_id: number;
  facility_name: string;
  total_current: number;
  admitted_7d: number;
  admitted_30d: number;
}

export interface CensusSummary {
  facilities: FacilityCensus[];
  totals: {
    total_current: number;
    admitted_7d: number;
    admitted_30d: number;
  };
  admission_filter: string;
}