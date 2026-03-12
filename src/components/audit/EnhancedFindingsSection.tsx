import { useState } from 'react';
import { format } from 'date-fns';
import { 
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Card, Badge } from '../ui';
import { ComplianceBadge } from '../ui/ComplianceBadge';
import type { EnhancedFinding, FindingType } from '../../types/audit';

interface EnhancedFindingsSectionProps {
  findings: {
    medication_compliance: EnhancedFinding[];
    monitoring_effectiveness: EnhancedFinding[];
    orphaned_monitoring: EnhancedFinding[];
  };
}

interface FindingsTabProps {
  findingType: FindingType;
  findings: EnhancedFinding[];
  isActive: boolean;
  onTabClick: () => void;
}

function FindingsTab({ findingType, findings, isActive, onTabClick }: FindingsTabProps) {
  const getTabInfo = (type: FindingType) => {
    switch (type) {
      case 'medication_compliance':
        return {
          label: 'Medication Compliance',
          icon: DocumentTextIcon,
          description: 'Side effect & behavior monitoring compliance for each medication'
        };
      case 'monitoring_effectiveness':
        return {
          label: 'Monitoring Analysis', 
          icon: CheckCircleIcon,
          description: 'Effectiveness of monitoring orders and medication coverage'
        };
      case 'monitoring_relevance':
        return {
          label: 'Orphaned Monitoring',
          icon: MagnifyingGlassIcon,
          description: 'Monitoring orders with no related psychotropic medications'
        };
      default:
        return { label: type, icon: InformationCircleIcon, description: '' };
    }
  };

  const { label, icon: Icon, description } = getTabInfo(findingType);
  const count = findings.length;

  return (
    <button
      onClick={onTabClick}
      className={`px-4 py-3 text-left border-b-2 transition-colors ${
        isActive 
          ? 'border-primary-500 text-primary-600 bg-primary-50'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center space-x-2">
        <Icon className="w-5 h-5" />
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">{label}</span>
            <Badge variant="default" size="sm">{count}</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}

interface FindingsTableProps {
  findings: EnhancedFinding[];
  findingType: FindingType;
}

function FindingsTable({ findings, findingType }: FindingsTableProps) {
  const [sortField, setSortField] = useState<keyof EnhancedFinding>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedFindings = [...findings].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (aValue && bValue) {
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (field: keyof EnhancedFinding) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (findings.length === 0) {
    return (
      <Card variant="default" padding="lg">
        <div className="text-center">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {findingType.replace('_', ' ')} findings</h3>
          <p className="text-gray-500">No findings of this type were identified in this audit.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('compliance_status')}
              >
                Status
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('severity')}
              >
                Severity
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('finding_code')}
              >
                Finding Code
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('description')}
              >
                Description
              </th>
              {findingType === 'medication_compliance' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medication Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monitoring Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Since Monitoring
                  </th>
                </>
              )}
              {findingType === 'monitoring_effectiveness' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medications Covered
                </th>
              )}
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                Date Found
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedFindings.map((finding) => (
              <tr key={finding.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <ComplianceBadge 
                    status={finding.compliance_status} 
                    size="sm" 
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="severity" severity={finding.severity} size="sm">
                    {finding.severity}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {finding.finding_code}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                  <p className="line-clamp-2">{finding.description}</p>
                </td>
                {findingType === 'medication_compliance' && (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      <p className="line-clamp-1">{finding.source_order_description || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      <p className="line-clamp-1">{finding.monitoring_order_description || 'None'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {finding.days_since_monitoring !== undefined ? (
                        <span className={finding.days_since_monitoring >= 999 ? 'text-red-600 font-medium' : ''}>
                          {finding.days_since_monitoring >= 999 ? 'Not Found' : `${finding.days_since_monitoring} days`}
                        </span>
                      ) : 'N/A'}
                    </td>
                  </>
                )}
                {findingType === 'monitoring_effectiveness' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Badge variant="info" size="sm">
                      {finding.related_medication_count || 0} medications
                    </Badge>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(finding.created_at), 'MMM dd, yyyy HH:mm')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function EnhancedFindingsSection({ findings }: EnhancedFindingsSectionProps) {
  const [activeTab, setActiveTab] = useState<FindingType>('medication_compliance');
  const [isExpanded, setIsExpanded] = useState(false);

  const totalFindings = findings.medication_compliance.length + 
                       findings.monitoring_effectiveness.length + 
                       findings.orphaned_monitoring.length;

  const complianceFindings = findings.medication_compliance.filter(f => f.compliance_status === 'compliant');
  const violationFindings = findings.medication_compliance.filter(f => f.compliance_status === 'violation');

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Complete Audit Findings
          </h3>
          <p className="text-sm text-gray-500">
            {totalFindings} total findings • {complianceFindings.length} compliant • {violationFindings.length} violations • {findings.monitoring_effectiveness.length} effective monitoring • {findings.orphaned_monitoring.length} orphaned
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="default" size="sm">
            {isExpanded ? 'Hide' : 'Show'} Details
          </Badge>
          {isExpanded ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-0">
              <FindingsTab
                findingType="medication_compliance"
                findings={findings.medication_compliance}
                isActive={activeTab === 'medication_compliance'}
                onTabClick={() => setActiveTab('medication_compliance')}
              />
              <FindingsTab
                findingType="monitoring_effectiveness"
                findings={findings.monitoring_effectiveness}
                isActive={activeTab === 'monitoring_effectiveness'}
                onTabClick={() => setActiveTab('monitoring_effectiveness')}
              />
              <FindingsTab
                findingType="monitoring_relevance"
                findings={findings.orphaned_monitoring}
                isActive={activeTab === 'monitoring_relevance'}
                onTabClick={() => setActiveTab('monitoring_relevance')}
              />
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === 'medication_compliance' && (
              <FindingsTable 
                findings={findings.medication_compliance} 
                findingType="medication_compliance" 
              />
            )}
            {activeTab === 'monitoring_effectiveness' && (
              <FindingsTable 
                findings={findings.monitoring_effectiveness} 
                findingType="monitoring_effectiveness" 
              />
            )}
            {activeTab === 'monitoring_relevance' && (
              <FindingsTable 
                findings={findings.orphaned_monitoring} 
                findingType="monitoring_relevance" 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}