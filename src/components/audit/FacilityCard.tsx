import { Card, Badge } from '../ui';
import type { Facility, AuditType } from '../../types/audit';
import { format } from 'date-fns';

interface FacilityCardProps {
  facility: Facility;
  auditType?: AuditType;
  onClick?: () => void;
  showAuditActions?: boolean;
  onRunAudit?: (facility: Facility, auditType?: AuditType) => void;
}

export function FacilityCard({ 
  facility, 
  auditType,
  onClick,
  showAuditActions = true,
  onRunAudit
}: FacilityCardProps) {
  const getComplianceColor = (score: number) => {
    if (score === 0) return 'text-gray-500';
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBadge = (score: number) => {
    if (score === 0) return { label: 'No Audits', severity: 'medium' as const };
    if (score >= 90) return { label: 'Excellent', severity: 'low' as const };
    if (score >= 80) return { label: 'Good', severity: 'medium' as const };
    if (score >= 70) return { label: 'Needs Improvement', severity: 'high' as const };
    return { label: 'Critical', severity: 'critical' as const };
  };

  const complianceBadge = getComplianceBadge(facility.compliance_score || 0);
  
  // Get the most recent audit date from all audit types
  const getLastAuditDate = () => {
    let latestDate: Date | null = null;
    
    Object.values(facility.audit_status || {}).forEach(status => {
      if (status.last_audit_date) {
        const date = new Date(status.last_audit_date);
        if (!latestDate || date > latestDate) {
          latestDate = date;
        }
      }
    });
    
    return latestDate ? format(latestDate, 'MMM dd, yyyy') : 'No Audits';
  };
  
  const lastAuditDate = getLastAuditDate();

  return (
    <Card 
      variant="elevated" 
      auditType={auditType}
      onClick={onClick}
      className="hover:scale-[1.02] transition-transform duration-200"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {facility.name}
            </h3>
            <p className="text-sm text-gray-600">{facility.address}</p>
            <p className="text-xs text-gray-500 mt-1">
              {facility.type} • {facility.total_residents || facility.bed_count || 0} residents
            </p>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${getComplianceColor(facility.compliance_score || 0)}`}>
              {!facility.compliance_score ? 'N/A' : `${Math.round(facility.compliance_score)}%`}
            </div>
            <Badge variant="severity" severity={complianceBadge.severity} size="sm">
              {complianceBadge.label}
            </Badge>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Last Audit</p>
            <p className="text-sm font-medium text-gray-900">{lastAuditDate}</p>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Facility ID</p>
            <p className="text-sm font-medium text-gray-900">#{facility.id}</p>
          </div>
        </div>

        {/* Audit Actions */}
        {showAuditActions && (
          <div className="flex space-x-2 pt-3 border-t border-gray-100">
            <button className="flex-1 text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 py-2 px-3 rounded-md transition-colors duration-200">
              View Details
            </button>
            <button 
              className="flex-1 text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 py-2 px-3 rounded-md transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onRunAudit?.(facility, auditType);
              }}
            >
              Run Audit
            </button>
          </div>
        )}

        {/* Audit Type Indicator */}
        {auditType && (
          <div className="absolute top-3 right-3">
            <Badge variant="audit-type" auditType={auditType} size="sm">
              {auditType.replace('-', ' ')}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}