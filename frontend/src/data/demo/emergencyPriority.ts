import type { EmergencyPriorityItem } from '../../types';

export const demoEmergencyPriorityTable: EmergencyPriorityItem[] = [
  {
    rank: 1,
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    risk_level: 'High',
    exposure: 'Very High',
    critical_facilities: 3,
    priority: 'IMMEDIATE',
    priority_score: 94.2,
    rationale: 'NH-66 arterial severance risk, 110kV substation threatened, 1,240 vulnerable buildings in backwater floodplain.'
  },
  {
    rank: 2,
    zone_id: 'Zone 05',
    zone_name: 'Bunder',
    risk_level: 'High',
    exposure: 'High',
    critical_facilities: 2,
    priority: 'URGENT',
    priority_score: 87.5,
    rationale: 'Old port wharf overflow, fish market informal workforce exposure, low storm barrier elevation.'
  },
  {
    rank: 3,
    zone_id: 'Zone 02',
    zone_name: 'Bolar',
    risk_level: 'Moderate',
    exposure: 'High',
    critical_facilities: 2,
    priority: 'HIGH',
    priority_score: 72.8,
    rationale: 'River confluence backflow near boat jetties; 640 buildings in tidal buffer zone.'
  },
  {
    rank: 4,
    zone_id: 'Zone 04',
    zone_name: 'Hampankatta',
    risk_level: 'Moderate',
    exposure: 'Medium',
    critical_facilities: 1,
    priority: 'MONITOR',
    priority_score: 54.3,
    rationale: 'Commercial heart with Raja Kaluve canal bottleneck and underpass waterlogging; hospital apex safe on ridge.'
  },
  {
    rank: 5,
    zone_id: 'Zone 06',
    zone_name: 'Kankanady',
    risk_level: 'Low',
    exposure: 'Low',
    critical_facilities: 0,
    priority: 'LOW',
    priority_score: 38.6,
    rationale: 'Elevated urban hub; transit disruption risk around Pumpwell flyover approach only.'
  },
  {
    rank: 6,
    zone_id: 'Zone 01',
    zone_name: 'Ullal',
    risk_level: 'High',
    exposure: 'High',
    critical_facilities: 2,
    priority: 'URGENT',
    priority_score: 83.1,
    rationale: 'Combined coastal erosion wave action and southern Netravati estuary high-tide surge.'
  },
  {
    rank: 7,
    zone_id: 'Zone 07',
    zone_name: 'Deralakatte',
    risk_level: 'Low',
    exposure: 'Low',
    critical_facilities: 0,
    priority: 'LOW',
    priority_score: 19.4,
    rationale: 'High laterite plateau; negligible flood risk, designated secondary evacuation reception area.'
  }
];
