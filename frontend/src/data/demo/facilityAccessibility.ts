import type {
  HospitalAccessibility,
  ShelterAccessibility,
  SystemAccessSummary
} from '../../types/Accessibility';

export const demoHospitalsAccessibility: HospitalAccessibility[] = [
  {
    id: 'HOSP-WENLOCK',
    name: 'Wenlock District Hospital (Apex Emergency Hospital)',
    zone_id: 'Zone 04',
    zone_name: 'Hampankatta',
    facility_flood_status: 'DRY',
    access_status: 'AT_RISK',
    reason:
      'The hospital itself is outside the predicted flood area, but the primary access route via Pumpwell Circle is predicted to become impassable.',
    primary_route: {
      name: 'Pumpwell Circle → Main Access Road',
      corridor: 'NH-66 / Pumpwell Arterial Link',
      status: 'CLOSED'
    },
    alternative_route: {
      name: 'Bendoorwell → Alternative Road Corridor',
      corridor: 'Bendoorwell Elevated Bypass',
      status: 'OPEN',
      detour_minutes: 8,
      travel_time_minutes: 18,
      route_id: 'ROUTE-ALT-02'
    },
    contact: 'Apex Trauma Desk: +91 824 242 4110',
    coordinates: [12.8710, 74.8465]
  },
  {
    id: 'HOSP-KULUR',
    name: 'Kulur Urban Health Centre & Maternity Ward',
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    facility_flood_status: 'WATERLOGGED',
    access_status: 'CLOSED',
    reason:
      'Primary ground approach inundated by 0.34 m flood depth. Facility ground floor at immediate risk; patients routed to Wenlock Hospital.',
    primary_route: {
      name: 'Kulur Bridge Approach Road',
      corridor: 'Main Road 760',
      status: 'CLOSED',
      closure_time: '13:30 IST'
    },
    contact: 'Disaster Ward: +91 824 245 8101',
    coordinates: [12.9265, 74.8340]
  },
  {
    id: 'HOSP-MULLER',
    name: 'Father Muller Medical College & Hospital',
    zone_id: 'Zone 06',
    zone_name: 'Kankanady',
    facility_flood_status: 'DRY',
    access_status: 'OPEN',
    reason:
      'High ground location (21.0 m MSL) completely clear of inundation with unobstructed arterial access.',
    primary_route: {
      name: 'Kankanady Bypass Highway Route',
      corridor: 'High Elevation Highway Corridor',
      status: 'OPEN'
    },
    contact: 'Emergency ER: +91 824 223 8000',
    coordinates: [12.8685, 74.8650]
  }
];

export const demoSheltersAccessibility: ShelterAccessibility[] = [
  {
    id: 'SHELTER-A',
    name: 'Shelter A (Kulur St. Antony Memorial Community Shelter)',
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    capacity: 450,
    occupied: 120,
    flood_status: 'DRY',
    road_accessibility: 'OPEN',
    distance_km: 2.4,
    travel_time_minutes: 12,
    route_status: 'OPEN ACCESS',
    is_recommended: true,
    route_id: 'ROUTE-SHELTER-A',
    coordinates: [12.9340, 74.8420]
  },
  {
    id: 'SHELTER-B',
    name: 'Shelter B (Bunder Government Fisheries High School Shelter)',
    zone_id: 'Zone 05',
    zone_name: 'Bunder',
    capacity: 500,
    occupied: 0,
    flood_status: 'DRY',
    road_accessibility: 'CLOSED',
    distance_km: 3.1,
    travel_time_minutes: 25,
    route_status: 'NOT ACCESSIBLE',
    is_recommended: false,
    route_id: 'ROUTE-SHELTER-B',
    coordinates: [12.8710, 74.8390]
  },
  {
    id: 'SHELTER-C',
    name: 'Shelter C (Ullal Coastal Community Relief Centre)',
    zone_id: 'Zone 01',
    zone_name: 'Ullal',
    capacity: 800,
    occupied: 210,
    flood_status: 'DRY',
    road_accessibility: 'OPEN',
    distance_km: 4.1,
    travel_time_minutes: 16,
    route_status: 'OPEN ACCESS',
    is_recommended: false,
    coordinates: [12.8180, 74.8510]
  },
  {
    id: 'SHELTER-D',
    name: 'Shelter D (Kankanady Central High School Shelter)',
    zone_id: 'Zone 06',
    zone_name: 'Kankanady',
    capacity: 350,
    occupied: 45,
    flood_status: 'DRY',
    road_accessibility: 'OPEN',
    distance_km: 3.8,
    travel_time_minutes: 14,
    route_status: 'OPEN ACCESS',
    is_recommended: false,
    coordinates: [12.8650, 74.8620]
  }
];

export const demoSystemAccessSummary: SystemAccessSummary = {
  roads_closed_count: 3,
  roads_at_risk_count: 4,
  hospitals_accessible_ratio: '2 / 3',
  shelters_reachable_ratio: '3 / 4',
  critical_facilities_count: 3,
  access_status_headline: '2 critical facilities require emergency route diversion.'
};

export const getReachableShelters = (): ShelterAccessibility[] => {
  return demoSheltersAccessibility.filter((s) => s.road_accessibility === 'OPEN');
};

export const getReachableHospitals = (): HospitalAccessibility[] => {
  return demoHospitalsAccessibility.filter((h) => h.access_status !== 'CLOSED');
};

export const getNearestReachableShelter = (_zoneId?: string): ShelterAccessibility => {
  return (
    demoSheltersAccessibility.find((s) => s.is_recommended) ||
    demoSheltersAccessibility.find((s) => s.road_accessibility === 'OPEN') ||
    demoSheltersAccessibility[0]
  );
};
