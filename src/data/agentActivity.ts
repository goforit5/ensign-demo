import type { AgentActivity, AuditType } from '../types/audit';
import { facilities } from './facilities';

interface ActivityTemplate {
  agent_name: AuditType;
  actions: string[];
  policies: string[];
  time_range: [number, number];
}

const activityTemplates: ActivityTemplate[] = [
  {
    agent_name: 'psychotropic',
    actions: [
      'Scanned {n} medication records for GDR compliance',
      'Reviewed {n} AIMS assessments for completeness',
      'Checked {n} PRN administration logs for overuse patterns',
      'Verified informed consent documentation for {n} residents',
      'Analyzed {n} psychotropic orders for clinical indication',
    ],
    policies: ['F-758 (Free of Unnecessary Medications)', 'F-757 (Drug Regimen Review)', 'F-759 (Medication Monitoring)'],
    time_range: [8, 25],
  },
  {
    agent_name: 'catheter',
    actions: [
      'Reviewed {n} catheter assessments for weekly compliance',
      'Checked {n} catheter orders for clinical justification',
      'Scanned {n} CAUTI prevention bundles',
      'Verified trial removal documentation for {n} catheters',
      'Audited {n} catheter insertion records',
    ],
    policies: ['F-690 (Urinary Catheter)', 'F-880 (Infection Control)', 'F-684 (Quality of Care)'],
    time_range: [5, 18],
  },
  {
    agent_name: 'skin_wound',
    actions: [
      'Assessed {n} skin assessment records for timeliness',
      'Measured {n} wound documentation entries',
      'Verified Braden scores for {n} at-risk residents',
      'Checked turning schedules for {n} high-risk patients',
      'Reviewed {n} pressure injury prevention plans',
    ],
    policies: ['F-686 (Pressure Injuries)', 'F-684 (Quality of Care)', 'F-685 (Treatment/Services)'],
    time_range: [10, 30],
  },
  {
    agent_name: 'falls',
    actions: [
      'Reviewed {n} fall risk assessments for currency',
      'Checked {n} post-fall assessments for completeness',
      'Verified fall prevention care plans for {n} residents',
      'Analyzed {n} incident reports for fall patterns',
      'Audited environmental safety checks for {n} rooms',
    ],
    policies: ['F-689 (Free of Accident Hazards)', 'F-684 (Quality of Care)', 'F-609 (Reporting)'],
    time_range: [6, 20],
  },
  {
    agent_name: 'admissions',
    actions: [
      'Verified {n} admission assessments for completeness',
      'Checked {n} initial care plan timelines',
      'Reviewed {n} physician order sets for completeness',
      'Audited {n} medication reconciliation records',
      'Verified consent documentation for {n} new admissions',
    ],
    policies: ['F-656 (Comprehensive Care Plans)', 'F-657 (Care Plan Timing)', 'F-684 (Quality of Care)'],
    time_range: [5, 15],
  },
  {
    agent_name: 'infection_control',
    actions: [
      'Reviewed {n} hand hygiene compliance records',
      'Audited {n} isolation precaution orders for adherence',
      'Checked {n} antibiotic stewardship reviews for timeliness',
      'Scanned {n} infection surveillance logs for outbreak patterns',
      'Verified PPE compliance documentation for {n} staff observations',
    ],
    policies: ['F-880 (Infection Prevention & Control)', 'F-881 (Antibiotic Stewardship)', 'F-882 (Infection Preventionist)'],
    time_range: [8, 22],
  },
  {
    agent_name: 'drug_regimen',
    actions: [
      'Reviewed {n} monthly drug regimen reviews for completeness',
      'Checked {n} pharmacist recommendations for physician response',
      'Analyzed {n} medication profiles for drug interactions',
      'Verified {n} high-risk medication monitoring parameters',
      'Audited {n} controlled substance reconciliation records',
    ],
    policies: ['F-757 (Drug Regimen Review)', 'F-755 (Pharmacy Services)', 'F-756 (Drug Storage)'],
    time_range: [10, 28],
  },
  {
    agent_name: 'pain_management',
    actions: [
      'Reviewed {n} pain assessment records for timeliness',
      'Checked {n} PRN analgesic reassessments for completion',
      'Verified non-pharmacological intervention documentation for {n} residents',
      'Audited {n} pain management care plans for individualization',
      'Analyzed {n} pain scale selections for cognitive appropriateness',
    ],
    policies: ['F-697 (Pain Management)', 'F-684 (Quality of Care)', 'F-656 (Care Plans)'],
    time_range: [6, 18],
  },
  {
    agent_name: 'nutrition',
    actions: [
      'Reviewed {n} weight records for significant change patterns',
      'Checked {n} dietitian referrals for timeliness',
      'Verified I&O documentation compliance for {n} at-risk residents',
      'Audited {n} dietary orders against physician prescriptions',
      'Analyzed {n} nutritional supplement administration records',
    ],
    policies: ['F-812 (Nutrition/Hydration)', 'F-692 (Nourishment)', 'F-803 (Menus and Nutritional Adequacy)'],
    time_range: [7, 20],
  },
  {
    agent_name: 'abuse_prevention',
    actions: [
      'Reviewed {n} staff abuse prevention training records',
      'Audited {n} incident reports for timely state agency notification',
      'Checked {n} investigation files for completeness and timeliness',
      'Verified background check documentation for {n} staff members',
      'Scanned {n} resident grievances for potential abuse indicators',
    ],
    policies: ['F-600 (Free from Abuse/Neglect)', 'F-607 (Develop/Implement Policies)', 'F-610 (Alleged Violations)'],
    time_range: [8, 22],
  },
  {
    agent_name: 'restraints',
    actions: [
      'Reviewed {n} restraint release and repositioning logs',
      'Checked {n} restraint orders for physician renewal compliance',
      'Verified least-restrictive alternative documentation for {n} residents',
      'Audited {n} restraint-related skin assessments',
      'Analyzed {n} IDT meeting notes for restraint reduction discussions',
    ],
    policies: ['F-604 (Right to be Free from Restraints)', 'F-605 (Restraint Justification)', 'F-606 (Restraint Safety)'],
    time_range: [5, 15],
  },
  {
    agent_name: 'resident_rights',
    actions: [
      'Reviewed {n} resident grievance files for resolution timeliness',
      'Audited {n} privacy compliance observations during care',
      'Checked {n} resident council meeting minutes for follow-up items',
      'Verified advance directive documentation for {n} residents',
      'Scanned {n} discharge notice records for proper notification',
    ],
    policies: ['F-550 (Resident Rights)', 'F-551 (Rights Exercised)', 'F-552 (Right to be Informed)'],
    time_range: [5, 16],
  },
  {
    agent_name: 'discharge_planning',
    actions: [
      'Reviewed {n} discharge plans for timeliness of initiation',
      'Checked {n} medication reconciliation records pre-discharge',
      'Verified caregiver education documentation for {n} discharges',
      'Audited {n} DME and home health coordination records',
      'Analyzed {n} readmission cases for discharge planning gaps',
    ],
    policies: ['F-660 (Discharge Planning)', 'F-661 (Discharge Summary)', 'F-622 (Transfer/Discharge)'],
    time_range: [6, 18],
  },
  {
    agent_name: 'dialysis',
    actions: [
      'Reviewed {n} pre/post dialysis vital sign records',
      'Checked {n} dialysis access site assessment logs',
      'Verified renal diet compliance for {n} dialysis patients',
      'Audited {n} nephrologist communication records',
      'Analyzed {n} dialysis schedule adherence records',
    ],
    policies: ['F-698 (Dialysis)', 'F-684 (Quality of Care)', 'F-812 (Nutrition)'],
    time_range: [8, 24],
  },
  {
    agent_name: 'emergency_prep',
    actions: [
      'Reviewed {n} emergency drill participation records',
      'Checked {n} generator testing logs for weekly compliance',
      'Verified emergency supply inventory for {n} locations',
      'Audited {n} evacuation route postings for currency',
      'Analyzed {n} emergency contact lists for accuracy',
    ],
    policies: ['F-837 (Emergency Preparedness)', 'F-838 (Emergency Plan)', 'NFPA 110 (Generator Testing)'],
    time_range: [4, 12],
  },
  {
    agent_name: 'staff_competency',
    actions: [
      'Reviewed {n} staff certification records for expiration dates',
      'Checked {n} new hire orientation checklists for completion',
      'Verified competency validation records for {n} clinical staff',
      'Audited {n} in-service attendance records',
      'Analyzed {n} staffing schedules for minimum ratio compliance',
    ],
    policies: ['F-726 (Staff Competency)', 'F-725 (Sufficient Staff)', 'F-940 (Training Requirements)'],
    time_range: [5, 15],
  },
  {
    agent_name: 'quality_assurance',
    actions: [
      'Reviewed {n} QAPI meeting minutes for required elements',
      'Checked {n} performance improvement project milestones',
      'Verified root cause analysis completion for {n} events',
      'Audited {n} corrective action plan implementation records',
      'Analyzed {n} quality indicator trends for threshold breaches',
    ],
    policies: ['F-944 (QAPI Program)', 'F-945 (QAPI Plan)', 'F-946 (Quality Assessment)'],
    time_range: [6, 20],
  },
  {
    agent_name: 'medication_errors',
    actions: [
      'Reviewed {n} medication administration time records for compliance',
      'Checked {n} MAR entries for documentation completeness',
      'Verified high-alert medication double-check records for {n} administrations',
      'Audited {n} controlled substance count sheets for discrepancies',
      'Analyzed {n} medication error reports for trending patterns',
    ],
    policies: ['F-760 (Medication Errors)', 'F-761 (Label/Store Drugs)', 'F-755 (Pharmacy Services)'],
    time_range: [8, 22],
  },
  {
    agent_name: 'behavioral_health',
    actions: [
      'Reviewed {n} behavioral management plans for individualization',
      'Checked {n} psychiatric evaluation follow-up timelines',
      'Verified de-escalation intervention documentation for {n} episodes',
      'Audited {n} behavioral health service referrals',
      'Analyzed {n} PRN psychotropic usage patterns for behavioral residents',
    ],
    policies: ['F-740 (Behavioral Health Services)', 'F-741 (Sufficient/Competent Staff)', 'F-742 (Treatment/Services)'],
    time_range: [7, 20],
  },
  {
    agent_name: 'ventilator_resp',
    actions: [
      'Reviewed {n} ventilator weaning assessment records',
      'Checked {n} tracheostomy care documentation logs',
      'Verified respiratory care plan updates for {n} patients',
      'Audited {n} emergency equipment bedside checks',
      'Analyzed {n} oxygen saturation trending records',
    ],
    policies: ['F-868 (Ventilator/Respiratory)', 'F-684 (Quality of Care)', 'F-656 (Care Plans)'],
    time_range: [10, 30],
  },
];

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600000).toISOString();
}

function generateActivity(): AgentActivity[] {
  const activities: AgentActivity[] = [];
  let id = 1;

  // Generate ~200 activities over past 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    for (const template of activityTemplates) {
      // ~1-2 activities per agent per day (20 agents * ~1.5 * 7 days = ~210)
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        const fac = facilities[Math.floor(Math.random() * facilities.length)];
        const action = template.actions[Math.floor(Math.random() * template.actions.length)]
          .replace('{n}', String(Math.floor(Math.random() * 40) + 5));
        const hoursBack = dayOffset * 24 + Math.floor(Math.random() * 18) + 6;

        const resultRoll = Math.random();
        const result: AgentActivity['result'] = resultRoll < 0.55
          ? 'completed'
          : resultRoll < 0.75
          ? 'no_issues'
          : resultRoll < 0.92
          ? 'exception_created'
          : 'review_needed';

        activities.push({
          id: `act-${String(id++).padStart(4, '0')}`,
          agent_name: template.agent_name,
          action,
          facility_id: fac.id,
          facility_name: fac.name,
          confidence: 75 + Math.floor(Math.random() * 24),
          policies_checked: template.policies.slice(0, 1 + Math.floor(Math.random() * template.policies.length)),
          time_saved_minutes: template.time_range[0] + Math.floor(Math.random() * (template.time_range[1] - template.time_range[0])),
          result,
          created_at: hoursAgo(hoursBack),
        });
      }
    }
  }

  return activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export const agentActivity: AgentActivity[] = generateActivity();
