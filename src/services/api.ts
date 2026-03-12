import type { Exception, AgentActivity, HighRiskResident, SurveyCategory, Facility } from '../types/audit';
import { ALL_AUDIT_TYPES } from '../types/audit';
import { facilities } from '../data/facilities';
import { exceptions as exceptionsData } from '../data/exceptions';
import { agentActivity as agentActivityData } from '../data/agentActivity';
import { highRiskResidents } from '../data/highRiskResidents';
import { surveyCategories } from '../data/surveyReadiness';

function delay(ms: number = 150 + Math.random() * 200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

class ApiClient {
  // ── Facilities ──

  async getFacilities(): Promise<Facility[]> {
    await delay();
    return [...facilities];
  }

  async getFacility(id: number): Promise<Facility | undefined> {
    await delay();
    return facilities.find((f) => f.id === id);
  }

  // ── Exceptions ──

  async getExceptions(filters?: {
    audit_type?: string;
    facility_id?: number;
    status?: string;
    severity?: string;
  }): Promise<Exception[]> {
    await delay();
    let result = [...exceptionsData];
    if (filters?.audit_type) result = result.filter((e) => e.audit_type === filters.audit_type);
    if (filters?.facility_id) result = result.filter((e) => e.facility_id === filters.facility_id);
    if (filters?.status) result = result.filter((e) => e.pcc_sync_status === filters.status);
    if (filters?.severity) result = result.filter((e) => e.severity === filters.severity);
    return result;
  }

  async approveException(id: string): Promise<Exception> {
    await delay(200);
    const exc = exceptionsData.find((e) => e.id === id);
    if (!exc) throw new Error('Exception not found');

    // Set syncing immediately
    exc.pcc_sync_status = 'syncing';
    exc.approved_by = 'Barry';
    exc.approved_at = new Date().toISOString();

    // Simulate PCC sync: 95% success, 5% failure
    setTimeout(() => {
      exc.pcc_sync_status = Math.random() < 0.95 ? 'synced' : 'failed';
    }, 1500);

    return { ...exc };
  }

  async batchApproveExceptions(ids: string[]): Promise<void> {
    await delay(300);
    for (const id of ids) {
      const exc = exceptionsData.find((e) => e.id === id);
      if (exc && exc.pcc_sync_status === 'pending') {
        exc.pcc_sync_status = 'syncing';
        exc.approved_by = 'Barry';
        exc.approved_at = new Date().toISOString();

        setTimeout(() => {
          exc.pcc_sync_status = Math.random() < 0.95 ? 'synced' : 'failed';
        }, 1500 + Math.random() * 500);
      }
    }
  }

  async holdException(id: string): Promise<void> {
    await delay();
    const exc = exceptionsData.find((e) => e.id === id);
    if (exc) exc.pcc_sync_status = 'held';
  }

  async dismissException(id: string): Promise<void> {
    await delay();
    const exc = exceptionsData.find((e) => e.id === id);
    if (exc) exc.pcc_sync_status = 'dismissed';
  }

  // ── Agent Activity ──

  async getAgentActivity(filters?: {
    agent_name?: string;
    facility_id?: number;
    result?: string;
    days?: number;
  }): Promise<AgentActivity[]> {
    await delay();
    let result = [...agentActivityData];
    if (filters?.agent_name) result = result.filter((a) => a.agent_name === filters.agent_name);
    if (filters?.facility_id) result = result.filter((a) => a.facility_id === filters.facility_id);
    if (filters?.result) result = result.filter((a) => a.result === filters.result);
    if (filters?.days) {
      const cutoff = new Date(Date.now() - filters.days * 86400000);
      result = result.filter((a) => new Date(a.created_at) >= cutoff);
    }
    return result;
  }

  // ── High Risk Residents ──

  async getHighRiskResidents(facilityId?: number): Promise<HighRiskResident[]> {
    await delay();
    if (facilityId) return highRiskResidents.filter((r) => r.facility_id === facilityId);
    return [...highRiskResidents];
  }

  // ── Survey Readiness ──

  async getSurveyReadiness(): Promise<SurveyCategory[]> {
    await delay();
    return [...surveyCategories];
  }

  // ── Command Center Metrics ──

  async getCommandCenterMetrics(): Promise<{
    totalFacilities: number;
    totalCensus: number;
    activeExceptions: number;
    agentActionsToday: number;
    complianceScore: number;
    overdueCorrections: number;
    surveyRiskScore: number;
    agentActionsTotal: number;
    humanApprovals: number;
    auditTypeCount: number;
  }> {
    await delay();
    const pendingExceptions = exceptionsData.filter((e) => e.pcc_sync_status === 'pending').length;
    const todayActivity = agentActivityData.filter((a) => {
      const d = new Date(a.created_at);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    });
    const approvals = exceptionsData.filter((e) =>
      ['approved', 'synced', 'syncing'].includes(e.pcc_sync_status)
    ).length;
    const avgCompliance = Math.round(
      facilities.reduce((s, f) => s + (f.compliance_score || 0), 0) / facilities.length
    );

    return {
      totalFacilities: facilities.length,
      totalCensus: facilities.reduce((s, f) => s + (f.total_residents || 0), 0),
      activeExceptions: pendingExceptions,
      agentActionsToday: todayActivity.length,
      complianceScore: avgCompliance,
      overdueCorrections: exceptionsData.filter((e) => {
        const created = new Date(e.created_at);
        const hoursSince = (Date.now() - created.getTime()) / 3600000;
        return e.pcc_sync_status === 'pending' && hoursSince > 24;
      }).length,
      surveyRiskScore: Math.round(
        surveyCategories.reduce((s, c) => s + c.score, 0) / surveyCategories.length
      ),
      agentActionsTotal: agentActivityData.length,
      humanApprovals: approvals,
      auditTypeCount: ALL_AUDIT_TYPES.length,
    };
  }
}

export const apiClient = new ApiClient();
