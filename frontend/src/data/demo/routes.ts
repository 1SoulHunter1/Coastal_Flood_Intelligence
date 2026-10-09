import type { EmergencyRoute } from '../../types/Route';

export const demoEmergencyRoutes: EmergencyRoute[] = [
  {
    id: 'ROUTE-ALT-02',
    name: 'Bendoorwell Corridor (Recommended Alternative Hospital Route)',
    type: 'ALTERNATIVE',
    status: 'OPEN',
    origin: 'Kulur / Northern Zone Staging Point',
    destination: 'Wenlock District Hospital',
    destination_type: 'HOSPITAL',
    detour_minutes: 8,
    travel_time_minutes: 18,
    distance_km: 5.6,
    corridor: 'Bendoorwell Elevated Bypass Corridor',
    associated_zone_id: 'Zone 03',
    notes: 'Safe for all emergency vehicle types. Clears 0.30 m water depth threshold.',
    coordinates: [
      [12.9220, 74.8350],
      [12.9050, 74.8420],
      [12.8880, 74.8510],
      [12.8750, 74.8550],
      [12.8710, 74.8465]
    ]
  },
  {
    id: 'ROUTE-PRI-01',
    name: 'Pumpwell Circle Primary Arterial Access (Blocked)',
    type: 'PRIMARY',
    status: 'CLOSED',
    origin: 'Pumpwell Circle Junction',
    destination: 'Wenlock District Hospital',
    destination_type: 'HOSPITAL',
    travel_time_minutes: 10,
    distance_km: 3.2,
    closure_time: '14:10 IST',
    corridor: 'Pumpwell Underpass Low Corridor',
    associated_zone_id: 'Zone 04',
    notes: 'Inundated by 0.35 m water depth. Impassable for standard emergency transport.',
    coordinates: [
      [12.8610, 74.8630],
      [12.8640, 74.8570],
      [12.8670, 74.8470],
      [12.8710, 74.8465]
    ]
  },
  {
    id: 'ROUTE-SHELTER-A',
    name: 'Shelter A Evacuation Access Corridor',
    type: 'ALTERNATIVE',
    status: 'OPEN',
    origin: 'Kulur Waterfront Settlement',
    destination: 'St. Antony Memorial Shelter',
    destination_type: 'SHELTER',
    travel_time_minutes: 12,
    distance_km: 2.4,
    corridor: 'Kulur High Ridge Arterial',
    associated_zone_id: 'Zone 03',
    notes: 'Dry surface access verified. Gradient above storm tide level.',
    coordinates: [
      [12.9240, 74.8310],
      [12.9280, 74.8360],
      [12.9340, 74.8420]
    ]
  }
];

export const findAlternativeRoute = (facilityId?: string): EmergencyRoute | undefined => {
  if (facilityId === 'HOSP-WENLOCK' || !facilityId) {
    return demoEmergencyRoutes.find((r) => r.id === 'ROUTE-ALT-02');
  }
  return demoEmergencyRoutes.find((r) => r.status === 'OPEN');
};
