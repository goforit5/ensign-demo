// Universal Audit Types for Healthcare Compliance Platform
// Top 20 CMS F-Tag audit categories that cause survey citations

export type AuditType =
  | 'psychotropic'        // F-758 Free of Unnecessary Medications
  | 'catheter'            // F-690 Urinary Catheter
  | 'skin_wound'          // F-686 Pressure Injuries
  | 'falls'               // F-689 Free of Accident Hazards
  | 'admissions'          // F-656/657 Comprehensive Care Plans
  | 'infection_control'   // F-880 Infection Prevention & Control
  | 'drug_regimen'        // F-757 Drug Regimen Review
  | 'pain_management'     // F-697 Pain Management
  | 'nutrition'           // F-812 Nutrition/Hydration
  | 'abuse_prevention'    // F-600 Free from Abuse/Neglect
  | 'restraints'          // F-604 Right to be Free from Restraints
  | 'resident_rights'     // F-550 Resident Rights
  | 'discharge_planning'  // F-660 Discharge Planning
  | 'dialysis'            // F-698 Dialysis
  | 'emergency_prep'      // F-837 Emergency Preparedness
  | 'staff_competency'    // F-726 Staff Competency
  | 'quality_assurance'   // F-944 QAPI Program
  | 'medication_errors'   // F-760 Medication Errors
  | 'behavioral_health'   // F-740 Behavioral Health Services
  | 'ventilator_resp'     // F-868 Ventilator/Respiratory Care
;

export type AgentType = AuditType;

export const AUDIT_TYPE_CONFIG: Record<AuditType, {
  label: string;
  shortLabel: string;
  ftag: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  psychotropic:       { label: 'Psychotropic Medications', shortLabel: 'Psych Meds', ftag: 'F-758', color: 'text-violet-700', bgColor: 'bg-violet-100', borderColor: 'border-violet-200' },
  catheter:           { label: 'Urinary Catheter', shortLabel: 'Catheter', ftag: 'F-690', color: 'text-teal-700', bgColor: 'bg-teal-100', borderColor: 'border-teal-200' },
  skin_wound:         { label: 'Pressure Injuries', shortLabel: 'Skin/Wound', ftag: 'F-686', color: 'text-orange-700', bgColor: 'bg-orange-100', borderColor: 'border-orange-200' },
  falls:              { label: 'Accident Hazards', shortLabel: 'Falls', ftag: 'F-689', color: 'text-sky-700', bgColor: 'bg-sky-100', borderColor: 'border-sky-200' },
  admissions:         { label: 'Care Plan Compliance', shortLabel: 'Admissions', ftag: 'F-656', color: 'text-pink-700', bgColor: 'bg-pink-100', borderColor: 'border-pink-200' },
  infection_control:  { label: 'Infection Prevention', shortLabel: 'Infection', ftag: 'F-880', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-200' },
  drug_regimen:       { label: 'Drug Regimen Review', shortLabel: 'Drug Review', ftag: 'F-757', color: 'text-indigo-700', bgColor: 'bg-indigo-100', borderColor: 'border-indigo-200' },
  pain_management:    { label: 'Pain Management', shortLabel: 'Pain Mgmt', ftag: 'F-697', color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-200' },
  nutrition:          { label: 'Nutrition & Hydration', shortLabel: 'Nutrition', ftag: 'F-812', color: 'text-lime-700', bgColor: 'bg-lime-100', borderColor: 'border-lime-200' },
  abuse_prevention:   { label: 'Abuse & Neglect Prevention', shortLabel: 'Abuse Prev', ftag: 'F-600', color: 'text-rose-700', bgColor: 'bg-rose-100', borderColor: 'border-rose-200' },
  restraints:         { label: 'Restraint-Free Care', shortLabel: 'Restraints', ftag: 'F-604', color: 'text-fuchsia-700', bgColor: 'bg-fuchsia-100', borderColor: 'border-fuchsia-200' },
  resident_rights:    { label: 'Resident Rights', shortLabel: 'Rights', ftag: 'F-550', color: 'text-emerald-700', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-200' },
  discharge_planning: { label: 'Discharge Planning', shortLabel: 'Discharge', ftag: 'F-660', color: 'text-cyan-700', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-200' },
  dialysis:           { label: 'Dialysis Services', shortLabel: 'Dialysis', ftag: 'F-698', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
  emergency_prep:     { label: 'Emergency Preparedness', shortLabel: 'Emergency', ftag: 'F-837', color: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-200' },
  staff_competency:   { label: 'Staff Competency', shortLabel: 'Staff Comp', ftag: 'F-726', color: 'text-slate-700', bgColor: 'bg-slate-100', borderColor: 'border-slate-200' },
  quality_assurance:  { label: 'QAPI Program', shortLabel: 'QAPI', ftag: 'F-944', color: 'text-purple-700', bgColor: 'bg-purple-100', borderColor: 'border-purple-200' },
  medication_errors:  { label: 'Medication Errors', shortLabel: 'Med Errors', ftag: 'F-760', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-100' },
  behavioral_health:  { label: 'Behavioral Health', shortLabel: 'Behavioral', ftag: 'F-740', color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-100' },
  ventilator_resp:    { label: 'Ventilator/Respiratory', shortLabel: 'Vent/Resp', ftag: 'F-868', color: 'text-stone-700', bgColor: 'bg-stone-100', borderColor: 'border-stone-200' },
};

export const ALL_AUDIT_TYPES = Object.keys(AUDIT_TYPE_CONFIG) as AuditType[];

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
  compliance_score?: number;
  last_audit_date?: string;
  total_residents?: number;
  health_score: number;
  agent_actions_today: number;
  last_agent_scan: string;
}

export interface AuditRun {
  id: number;
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
  audit_date?: string;
  total_patients?: number;
  action_items_created?: number;
  export_available?: boolean;
  affected_compliance_score?: number;
}

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
  confidence?: number;
  agent_name?: AgentType;
  evidence_chain?: string[];
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

// ── New Types for Redesign ──

export type ExceptionStatus = 'pending' | 'approved' | 'syncing' | 'synced' | 'failed' | 'held' | 'dismissed';

export interface Exception {
  id: string;
  audit_type: AuditType;
  facility_id: number;
  facility_name: string;
  finding_code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  mrn: string;
  resident_name: string;
  confidence: number;
  ai_recommendation: string;
  evidence_chain: string[];
  pcc_sync_status: ExceptionStatus;
  approved_by?: string;
  approved_at?: string;
  agent_name: AgentType;
  created_at: string;
}

export interface AgentActivity {
  id: string;
  agent_name: AgentType;
  action: string;
  facility_id: number;
  facility_name: string;
  confidence: number;
  policies_checked: string[];
  time_saved_minutes: number;
  result: 'completed' | 'exception_created' | 'no_issues' | 'review_needed';
  created_at: string;
}

export interface HighRiskResident {
  id: string;
  mrn: string;
  name: string;
  facility_id: number;
  facility_name: string;
  risk_score: number;
  risk_factors: string[];
  active_findings: number;
  age: number;
  days_since_admission: number;
}

export interface SurveyCategory {
  name: string;
  score: number;
  items_compliant: number;
  items_total: number;
  vulnerabilities: string[];
  icon: string;
}

export interface DashboardMetrics {
  total_facilities: number;
  audits_completed_this_month?: number;
  total_audits_today?: number;
  pending_action_items: number;
  current_compliance?: number;
  compliance_trend: number;
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
