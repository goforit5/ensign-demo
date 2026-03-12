import type { AuditType } from '../types/audit';

export const AUDIT_TYPES = {
  PSYCHOTROPIC: 'psychotropic' as const,
  CATHETER: 'catheter' as const,
  SKIN_WOUND: 'skin_wound' as const,
  FALLS: 'falls' as const,
  ADMISSIONS: 'admissions' as const,
} as const;

export interface AuditTypeConfig {
  value: AuditType | 'all';
  label: string;
  icon: string;
  description: string;
  regulatoryTag?: string;
}

export const AUDIT_TYPE_CONFIGS: AuditTypeConfig[] = [
  {
    value: 'all',
    label: 'All Audits',
    icon: '📊',
    description: 'All audit types'
  },
  {
    value: AUDIT_TYPES.PSYCHOTROPIC,
    label: 'Psychotropic',
    icon: '🧠',
    description: 'Medication monitoring compliance',
    regulatoryTag: 'F-Tag 758'
  },
  {
    value: AUDIT_TYPES.CATHETER,
    label: 'Catheter',
    icon: '🔬',
    description: 'Infection control protocols',
    regulatoryTag: 'F-Tag 441'
  },
  {
    value: AUDIT_TYPES.SKIN_WOUND,
    label: 'Skin & Wound',
    icon: '🩹',
    description: 'Pressure ulcer prevention',
    regulatoryTag: 'F-Tag 686'
  },
  {
    value: AUDIT_TYPES.FALLS,
    label: 'Falls',
    icon: '🏥',
    description: 'Fall documentation and prevention tracking',
    regulatoryTag: 'F-Tag 689'
  },
  {
    value: AUDIT_TYPES.ADMISSIONS,
    label: 'Admissions',
    icon: '📝',
    description: 'Admission document completion and signature compliance',
    regulatoryTag: 'F-Tag 584'
  },
];

export const AUDIT_TYPE_STYLES = {
  all: 'border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100',
  [AUDIT_TYPES.PSYCHOTROPIC]: 'border-psychotropic-200 bg-psychotropic-50 text-psychotropic-700 hover:bg-psychotropic-100',
  [AUDIT_TYPES.CATHETER]: 'border-catheter-200 bg-catheter-50 text-catheter-700 hover:bg-catheter-100',
  [AUDIT_TYPES.SKIN_WOUND]: 'border-skinwound-200 bg-skinwound-50 text-skinwound-700 hover:bg-skinwound-100',
  [AUDIT_TYPES.FALLS]: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
  [AUDIT_TYPES.ADMISSIONS]: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
} as const;

export const getAuditTypeConfig = (type: AuditType | 'all'): AuditTypeConfig | undefined => {
  return AUDIT_TYPE_CONFIGS.find(config => config.value === type);
};