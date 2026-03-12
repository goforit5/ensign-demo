import type { Finding } from '../types/audit';
import { auditRuns } from './auditRuns';

const FINDING_TEMPLATES: Record<string, Array<{
  code: string;
  description: string;
  severity: Finding['severity'];
  category: string;
  isViolation: boolean;
}>> = {
  psychotropic: [
    { code: 'PSYCH_MISSING_SIDE_EFFECT_MONITORING', description: 'No documented side effect monitoring for psychotropic medication within required timeframe', severity: 'critical', category: 'medication_compliance', isViolation: true },
    { code: 'PSYCH_MISSING_GDR', description: 'Gradual dose reduction not attempted or documented per F-Tag 758 requirements', severity: 'high', category: 'medication_compliance', isViolation: true },
    { code: 'PSYCH_MISSING_INFORMED_CONSENT', description: 'Informed consent for psychotropic medication not documented in medical record', severity: 'high', category: 'medication_compliance', isViolation: true },
    { code: 'PSYCH_BEHAVIOR_MONITORING_CURRENT', description: 'Behavior monitoring documentation is current and within compliance window', severity: 'info', category: 'monitoring_effectiveness', isViolation: false },
    { code: 'PSYCH_ORPHANED_MONITORING', description: 'Monitoring order exists without corresponding active psychotropic medication', severity: 'medium', category: 'monitoring_relevance', isViolation: true },
    { code: 'PSYCH_PRN_OVERUSE', description: 'PRN psychotropic medication administered more than 3 times in 7-day period without clinical justification', severity: 'high', category: 'medication_compliance', isViolation: true },
    { code: 'PSYCH_GDR_COMPLIANT', description: 'Gradual dose reduction completed within regulatory timeframe', severity: 'info', category: 'medication_compliance', isViolation: false },
    { code: 'PSYCH_INDICATION_DOCUMENTED', description: 'Clinical indication for psychotropic medication properly documented', severity: 'info', category: 'medication_compliance', isViolation: false },
  ],
  catheter: [
    { code: 'CATH_WEEKLY_ASSESSMENT_OVERDUE', description: 'Weekly catheter assessment not completed within required 7-day window', severity: 'critical', category: 'catheter_management', isViolation: true },
    { code: 'CATH_MISSING_CLINICAL_JUSTIFICATION', description: 'No documented clinical justification for continued indwelling catheter use', severity: 'high', category: 'catheter_management', isViolation: true },
    { code: 'CATH_NO_REMOVAL_TRIAL', description: 'No documented trial removal attempt for catheter in place >14 days', severity: 'high', category: 'catheter_management', isViolation: true },
    { code: 'CATH_INSERTION_DOCUMENTED', description: 'Catheter insertion date and clinical rationale properly documented', severity: 'info', category: 'catheter_management', isViolation: false },
    { code: 'CATH_UTI_PREVENTION', description: 'UTI prevention protocol not documented for catheterized patient', severity: 'medium', category: 'infection_control', isViolation: true },
    { code: 'CATH_CARE_PLAN_CURRENT', description: 'Catheter care plan is current and addresses infection prevention', severity: 'info', category: 'catheter_management', isViolation: false },
  ],
  skin_wound: [
    { code: 'SKIN_ASSESSMENT_NOT_CURRENT', description: 'Skin assessment not completed within required admission/weekly/quarterly timeframe', severity: 'critical', category: 'skin_assessment', isViolation: true },
    { code: 'SKIN_BRADEN_MISSING', description: 'Braden Scale risk assessment not documented for at-risk patient', severity: 'high', category: 'risk_assessment', isViolation: true },
    { code: 'SKIN_WOUND_MEASUREMENT_MISSING', description: 'Wound measurements not documented at required frequency', severity: 'high', category: 'wound_management', isViolation: true },
    { code: 'SKIN_TURNING_SCHEDULE', description: 'Repositioning/turning schedule not implemented for high-risk patient (Braden <=18)', severity: 'critical', category: 'prevention', isViolation: true },
    { code: 'SKIN_ASSESSMENT_CURRENT', description: 'Comprehensive skin assessment completed and documented within required timeframe', severity: 'info', category: 'skin_assessment', isViolation: false },
    { code: 'SKIN_PREVENTION_PLAN', description: 'Pressure injury prevention plan documented and active', severity: 'info', category: 'prevention', isViolation: false },
    { code: 'SKIN_NUTRITION_REFERRAL', description: 'Nutrition referral not initiated for patient with Stage 2+ pressure injury', severity: 'medium', category: 'wound_management', isViolation: true },
  ],
  falls: [
    { code: 'FALLS_NO_PREVENTION_PLAN', description: 'Fall prevention care plan not established after documented fall event', severity: 'critical', category: 'fall_prevention', isViolation: true },
    { code: 'FALLS_RISK_ASSESSMENT_OVERDUE', description: 'Fall risk assessment not completed within required quarterly timeframe', severity: 'high', category: 'risk_assessment', isViolation: true },
    { code: 'FALLS_POST_FALL_ASSESSMENT', description: 'Post-fall assessment not completed within 24 hours of fall event', severity: 'high', category: 'fall_response', isViolation: true },
    { code: 'FALLS_INTERVENTION_DOCUMENTED', description: 'Fall prevention interventions properly documented and implemented', severity: 'info', category: 'fall_prevention', isViolation: false },
    { code: 'FALLS_ENVIRONMENT_CHECK', description: 'Environmental safety check not documented for patient with fall history', severity: 'medium', category: 'fall_prevention', isViolation: true },
    { code: 'FALLS_RISK_CURRENT', description: 'Fall risk assessment is current and care plan aligns with risk level', severity: 'info', category: 'risk_assessment', isViolation: false },
  ],
  admissions: [
    { code: 'ADM_ASSESSMENT_INCOMPLETE', description: 'Admission assessment not completed within 24-hour regulatory window', severity: 'critical', category: 'admission_compliance', isViolation: true },
    { code: 'ADM_CARE_PLAN_MISSING', description: 'Initial care plan not established within 48 hours of admission', severity: 'high', category: 'admission_compliance', isViolation: true },
    { code: 'ADM_CONSENT_DOCUMENTED', description: 'Admission consent forms properly signed and documented', severity: 'info', category: 'admission_compliance', isViolation: false },
    { code: 'ADM_PHYSICIAN_ORDERS', description: 'Physician admission orders missing or incomplete', severity: 'high', category: 'admission_compliance', isViolation: true },
  ],
};

let findingId = 1000;

function generateFindings(auditRunId: number, auditType: string, totalCount: number): Finding[] {
  const templates = FINDING_TEMPLATES[auditType] || FINDING_TEMPLATES.psychotropic;
  const findings: Finding[] = [];
  const mrns = Array.from({ length: totalCount + 5 }, (_, i) =>
    `MRN-${String(i + 1234).padStart(6, '0')}`
  );

  for (let i = 0; i < totalCount; i++) {
    const template = templates[i % templates.length];
    const mrn = mrns[i % mrns.length];

    findings.push({
      id: String(findingId++),
      audit_run_id: String(auditRunId),
      patient_id: 2000 + i,
      mrn,
      finding_code: template.code,
      severity: template.severity,
      description: template.description,
      category: template.category,
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      auto_resolved: !template.isViolation,
      ...(template.isViolation ? {} : { resolved_at: new Date().toISOString() }),
    });
  }

  return findings;
}

// Pre-generate findings for all existing audit runs
const findingsMap = new Map<number, Finding[]>();
auditRuns.forEach((run) => {
  findingsMap.set(run.id, generateFindings(run.id, run.audit_type, run.total_findings));
});

export function getFindingsForRun(auditRunId: number): Finding[] {
  return findingsMap.get(auditRunId) || [];
}

export function generateNewFindings(auditRunId: number, auditType: string): Finding[] {
  const count = Math.floor(Math.random() * 6) + 2;
  const findings = generateFindings(auditRunId, auditType, count);
  findingsMap.set(auditRunId, findings);
  return findings;
}
