import type { AuditRun, AuditType } from '../types/audit';
import { facilities } from './facilities';

function daysAgo(days: number, hours: number = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

let nextId = 100;

function run(
  auditType: AuditType,
  facilityId: number,
  daysBack: number,
  totalFindings: number,
  criticalFindings: number,
  actionItems: number,
  complianceScore: number
): AuditRun {
  const fac = facilities.find((f) => f.id === facilityId);
  return {
    id: nextId++,
    audit_type: auditType,
    facility_id: facilityId,
    facility_name: fac?.name || 'Unknown',
    created_at: daysAgo(daysBack, 8 + Math.floor(Math.random() * 8)),
    status: 'completed',
    total_findings: totalFindings,
    critical_findings: criticalFindings,
    action_items_count: actionItems,
    compliance_score: complianceScore,
    progress: 100,
    total_patients: Math.floor(Math.random() * 30) + 15,
    action_items_created: actionItems,
    export_available: true,
  };
}

export const auditRuns: AuditRun[] = [
  // Today's audits
  run('psychotropic', 1, 0, 6, 1, 3, 85),
  run('falls', 2, 0, 2, 0, 1, 96),
  run('falls', 4, 0, 1, 0, 0, 98),
  run('psychotropic', 2, 0, 1, 0, 1, 97),

  // Yesterday
  run('catheter', 1, 1, 4, 0, 2, 88),
  run('psychotropic', 7, 1, 5, 1, 2, 82),
  run('falls', 6, 1, 3, 0, 1, 91),
  run('skin_wound', 3, 1, 8, 2, 4, 68),

  // 2 days ago
  run('falls', 1, 2, 3, 0, 1, 92),
  run('catheter', 2, 2, 1, 0, 0, 98),
  run('psychotropic', 4, 2, 0, 0, 0, 100),
  run('skin_wound', 6, 2, 7, 1, 3, 72),

  // 3-5 days ago
  run('catheter', 6, 3, 5, 1, 2, 78),
  run('psychotropic', 3, 3, 9, 3, 5, 62),
  run('falls', 7, 3, 2, 0, 1, 94),
  run('catheter', 5, 4, 6, 1, 3, 75),
  run('skin_wound', 7, 4, 4, 1, 2, 80),
  run('psychotropic', 5, 5, 3, 0, 2, 89),
  run('falls', 3, 5, 5, 1, 2, 84),

  // 1-2 weeks ago
  run('skin_wound', 1, 7, 5, 1, 2, 78),
  run('catheter', 3, 8, 10, 3, 5, 58),
  run('psychotropic', 6, 9, 7, 2, 4, 70),
  run('falls', 5, 10, 4, 0, 2, 88),
  run('skin_wound', 4, 12, 2, 0, 1, 95),
  run('catheter', 4, 14, 1, 0, 0, 98),

  // 3-8 weeks ago
  run('psychotropic', 1, 21, 4, 1, 2, 86),
  run('falls', 6, 25, 6, 1, 3, 80),
  run('skin_wound', 2, 28, 3, 0, 1, 90),
  run('catheter', 7, 30, 3, 0, 1, 91),
  run('psychotropic', 7, 35, 4, 1, 2, 84),
  run('falls', 4, 40, 1, 0, 0, 99),
  run('skin_wound', 5, 45, 6, 2, 3, 72),
  run('catheter', 1, 50, 3, 0, 1, 92),
  run('psychotropic', 2, 55, 2, 0, 1, 94),
];

export function getAuditRunById(id: number): AuditRun | undefined {
  return auditRuns.find((r) => r.id === id);
}
