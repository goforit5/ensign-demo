import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { agentActivity } from '../data/agentActivity';
import { facilities } from '../data/facilities';
import { ALL_AUDIT_TYPES, AUDIT_TYPE_CONFIG } from '../types/audit';
import type { AgentActivity, AuditType } from '../types/audit';

const SCAN_ACTIONS: Record<AuditType, string[]> = {
  psychotropic: ['Scanned medication records for compliance', 'Reviewed AIMS assessments', 'Checked PRN logs'],
  catheter: ['Reviewed catheter assessments', 'Checked catheter orders', 'Scanned CAUTI bundles'],
  skin_wound: ['Assessed skin records', 'Measured wound documentation', 'Verified Braden scores'],
  falls: ['Reviewed fall risk assessments', 'Checked post-fall reports', 'Verified prevention plans'],
  admissions: ['Verified admission assessments', 'Checked care plan timelines', 'Reviewed order sets'],
  infection_control: ['Reviewed hand hygiene audits', 'Checked isolation protocols', 'Scanned infection surveillance'],
  drug_regimen: ['Reviewed drug regimen reports', 'Checked pharmacy consultations', 'Scanned interaction alerts'],
  pain_management: ['Assessed pain records', 'Reviewed pain care plans', 'Checked intervention logs'],
  nutrition: ['Reviewed nutrition screenings', 'Checked dietary compliance', 'Scanned weight logs'],
  abuse_prevention: ['Reviewed training records', 'Audited incident files', 'Checked background clearances'],
  restraints: ['Reviewed restraint assessments', 'Checked release schedules', 'Audited reduction plans'],
  resident_rights: ['Reviewed grievance records', 'Checked privacy audits', 'Verified consent documentation'],
  discharge_planning: ['Reviewed discharge plans', 'Checked transition summaries', 'Audited follow-up schedules'],
  dialysis: ['Reviewed treatment records', 'Checked vascular access', 'Audited fluid protocols'],
  emergency_prep: ['Reviewed drill records', 'Checked evacuation plans', 'Audited supply inventories'],
  staff_competency: ['Reviewed competency evaluations', 'Checked education records', 'Audited skills validations'],
  quality_assurance: ['Reviewed QAPI minutes', 'Checked PIP projects', 'Audited quality indicators'],
  medication_errors: ['Reviewed error reports', 'Checked near-miss events', 'Audited accuracy records'],
  behavioral_health: ['Reviewed behavioral assessments', 'Checked intervention plans', 'Audited service logs'],
  ventilator_resp: ['Reviewed weaning protocols', 'Checked respiratory assessments', 'Audited trach care docs'],
};

let nextActivityId = 9000;

export function useAgentSimulation() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random agent type from all 20 types
      const agentType = ALL_AUDIT_TYPES[Math.floor(Math.random() * ALL_AUDIT_TYPES.length)];
      // Pick a random facility from all 20 facilities
      const fac = facilities[Math.floor(Math.random() * facilities.length)];
      const actions = SCAN_ACTIONS[agentType];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const count = Math.floor(Math.random() * 30) + 5;
      const config = AUDIT_TYPE_CONFIG[agentType];

      const newActivity: AgentActivity = {
        id: `act-${nextActivityId++}`,
        agent_name: agentType,
        action: `${action} (${count} records)`,
        facility_id: fac.id,
        facility_name: fac.name,
        confidence: 80 + Math.floor(Math.random() * 19),
        policies_checked: [`${config.ftag} (${config.label})`],
        time_saved_minutes: 5 + Math.floor(Math.random() * 20),
        result: Math.random() < 0.8 ? 'completed' : 'exception_created',
        created_at: new Date().toISOString(),
      };

      agentActivity.unshift(newActivity);

      // Update facility last_agent_scan
      fac.last_agent_scan = new Date().toISOString();
      fac.agent_actions_today += 1;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['agentActivity'] });
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      queryClient.invalidateQueries({ queryKey: ['commandCenter'] });
    }, 45000);

    return () => clearInterval(interval);
  }, [queryClient]);
}
