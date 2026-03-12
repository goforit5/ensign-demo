import { Badge } from './Badge';
import type { BadgeSeverity } from './Badge';
import type { ComplianceStatus } from '../../types/audit';

interface ComplianceBadgeProps {
  status: ComplianceStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function ComplianceBadge({ status, size = 'sm' }: ComplianceBadgeProps) {
  const getSeverityAndLabel = (status: ComplianceStatus): { severity: BadgeSeverity; label: string; icon: string } => {
    switch (status) {
      case 'compliant':
        return { severity: 'compliant', label: 'Compliant', icon: '✓' };
      case 'violation':
        return { severity: 'critical', label: 'Violation', icon: '⚠' };
      case 'effective':
        return { severity: 'low', label: 'Effective', icon: '🎯' };
      case 'orphaned':
        return { severity: 'medium', label: 'Orphaned', icon: '🔍' };
      default:
        return { severity: 'low', label: status, icon: '' };
    }
  };

  const { severity, label, icon } = getSeverityAndLabel(status);

  return (
    <Badge variant="severity" severity={severity} size={size}>
      <span className="flex items-center space-x-1">
        <span>{icon}</span>
        <span>{label}</span>
      </span>
    </Badge>
  );
}