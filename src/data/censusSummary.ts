import type { CensusSummary, FacilityCensus } from '../types/audit';
import { facilities } from './facilities';

const facilityCensusData: FacilityCensus[] = facilities.map((f) => ({
  facility_id: f.id,
  facility_name: f.name,
  total_current: f.total_residents || 0,
  admitted_7d: Math.floor((f.total_residents || 0) * 0.08),
  admitted_30d: Math.floor((f.total_residents || 0) * 0.22),
}));

export function getCensusSummary(
  facilityIds: number[],
  admissionFilter: string = 'all'
): CensusSummary {
  const selected = facilityCensusData.filter((f) =>
    facilityIds.includes(f.facility_id)
  );

  const totals = selected.reduce(
    (acc, f) => ({
      total_current: acc.total_current + f.total_current,
      admitted_7d: acc.admitted_7d + f.admitted_7d,
      admitted_30d: acc.admitted_30d + f.admitted_30d,
    }),
    { total_current: 0, admitted_7d: 0, admitted_30d: 0 }
  );

  return {
    facilities: selected,
    totals,
    admission_filter: admissionFilter,
  };
}
