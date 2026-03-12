// Status and Severity Constants

export const STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
  INFO: 'info',
} as const;

export type StatusType = typeof STATUS[keyof typeof STATUS];
export type SeverityType = typeof SEVERITY[keyof typeof SEVERITY];

// UI Styling for statuses
export const STATUS_STYLES: Record<StatusType, string> = {
  [STATUS.OPEN]: 'bg-red-50 text-red-700 border-red-200',
  [STATUS.IN_PROGRESS]: 'bg-blue-50 text-blue-700 border-blue-200',
  [STATUS.RESOLVED]: 'bg-green-50 text-green-700 border-green-200',
  [STATUS.DISMISSED]: 'bg-gray-50 text-gray-700 border-gray-200',
  [STATUS.PENDING]: 'bg-gray-50 text-gray-700 border-gray-200',
  [STATUS.RUNNING]: 'bg-blue-50 text-blue-700 border-blue-200',
  [STATUS.COMPLETED]: 'bg-green-50 text-green-700 border-green-200',
  [STATUS.FAILED]: 'bg-red-50 text-red-700 border-red-200',
};

// UI Styling for severities  
export const SEVERITY_STYLES: Record<SeverityType, string> = {
  [SEVERITY.CRITICAL]: 'bg-red-50 text-red-700 border-red-200',
  [SEVERITY.HIGH]: 'bg-orange-50 text-orange-700 border-orange-200',
  [SEVERITY.MEDIUM]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  [SEVERITY.LOW]: 'bg-green-50 text-green-700 border-green-200',
  [SEVERITY.INFO]: 'bg-blue-50 text-blue-700 border-blue-200',
};

// Status display labels
export const STATUS_LABELS: Record<StatusType, string> = {
  [STATUS.OPEN]: 'Open',
  [STATUS.IN_PROGRESS]: 'In Progress',
  [STATUS.RESOLVED]: 'Resolved',
  [STATUS.DISMISSED]: 'Dismissed',
  [STATUS.PENDING]: 'Pending',
  [STATUS.RUNNING]: 'Running',
  [STATUS.COMPLETED]: 'Completed',
  [STATUS.FAILED]: 'Failed',
};

// Severity display labels
export const SEVERITY_LABELS: Record<SeverityType, string> = {
  [SEVERITY.CRITICAL]: 'Critical',
  [SEVERITY.HIGH]: 'High',
  [SEVERITY.MEDIUM]: 'Medium',
  [SEVERITY.LOW]: 'Low',
  [SEVERITY.INFO]: 'Info',
};