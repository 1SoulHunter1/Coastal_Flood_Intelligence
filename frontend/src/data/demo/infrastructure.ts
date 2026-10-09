import type { InfrastructureSummary, CriticalFacility, RoadSegment } from '../../types';

export const demoInfrastructureSummary: InfrastructureSummary = {
  hospitals_at_risk: 3,
  schools_at_risk: 5,
  shelters_active: 4,
  road_segments_affected: 7,
  buildings_affected: 1240,
  critical_facilities_at_risk: 3
};

export const demoCriticalFacilities: CriticalFacility[] = [
  {
    id: 'FAC-01',
    name: 'Kulur Urban Health Centre & Maternity Ward',
    type: 'HOSPITAL',
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    status: 'AT_RISK',
    coordinates: [12.9265, 74.8340],
    capacity_or_load: '45 Inpatients / 12 ICU',
    elevation_m: 2.8,
    contact: '+91 824 245 8101'
  },
  {
    id: 'FAC-02',
    name: 'Kulur 110/33kV Electrical Substation (MESCOM)',
    type: 'POWER_STATION',
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    status: 'CRITICAL',
    coordinates: [12.9310, 74.8290],
    capacity_or_load: 'Primary Grid Hub (Feeds Panambur/Kulur)',
    elevation_m: 2.2,
    contact: 'MESCOM Emergency Cell: 1912'
  },
  {
    id: 'FAC-03',
    name: 'Gurupura River Tidal Sluice & Storm Pump 3',
    type: 'DRAIN_PUMP',
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    status: 'AT_RISK',
    coordinates: [12.9235, 74.8245],
    capacity_or_load: '18,000 L/min discharge capacity',
    elevation_m: 1.6,
    contact: 'MCC Drainage Division'
  },
  {
    id: 'FAC-04',
    name: 'Kulur St. Antony Memorial Community Shelter',
    type: 'SHELTER',
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    status: 'OPERATIONAL',
    coordinates: [12.9340, 74.8420],
    capacity_or_load: 'Capacity: 650 persons (Currently 120 occupied)',
    elevation_m: 6.2,
    contact: 'Revenue Inspector Zone 3'
  },
  {
    id: 'FAC-05',
    name: 'Old Port Marine Fishery Wharf Sluice Gate',
    type: 'DRAIN_PUMP',
    zone_id: 'Zone 05',
    zone_name: 'Bunder',
    status: 'AT_RISK',
    coordinates: [12.8640, 74.8340],
    capacity_or_load: 'Tidal Flap Gates 1 & 2',
    elevation_m: 1.5,
    contact: 'Ports & Inland Waterways'
  },
  {
    id: 'FAC-06',
    name: 'Bunder Government Fisheries High School Shelter',
    type: 'SHELTER',
    zone_id: 'Zone 05',
    zone_name: 'Bunder',
    status: 'OPERATIONAL',
    coordinates: [12.8710, 74.8390],
    capacity_or_load: 'Capacity: 500 persons (Equipped with generator)',
    elevation_m: 4.8,
    contact: 'NDRF Staging Team 2'
  },
  {
    id: 'FAC-07',
    name: 'Ullal Coastal Community Relief Centre',
    type: 'SHELTER',
    zone_id: 'Zone 01',
    zone_name: 'Ullal',
    status: 'OPERATIONAL',
    coordinates: [12.8180, 74.8510],
    capacity_or_load: 'Capacity: 800 persons (Medical post active)',
    elevation_m: 5.5,
    contact: 'Ullal Municipality Emergency Post'
  },
  {
    id: 'FAC-08',
    name: 'Father Muller Medical College & Hospital',
    type: 'HOSPITAL',
    zone_id: 'Zone 06',
    zone_name: 'Kankanady',
    status: 'OPERATIONAL',
    coordinates: [12.8685, 74.8650],
    capacity_or_load: '1250 Beds / Trauma Unit Level 1',
    elevation_m: 21.0,
    contact: '+91 824 223 8000'
  },
  {
    id: 'FAC-09',
    name: 'Wenlock District Hospital (Apex Emergency Hospital)',
    type: 'HOSPITAL',
    zone_id: 'Zone 04',
    zone_name: 'Hampankatta',
    status: 'OPERATIONAL',
    coordinates: [12.8710, 74.8465],
    capacity_or_load: '900 Beds / State Disaster Reserve Wing',
    elevation_m: 15.2,
    contact: '+91 824 242 4110'
  },
  {
    id: 'FAC-10',
    name: 'Dakshina Kannada District Collectorate EOC',
    type: 'GOV_CENTER',
    zone_id: 'Zone 04',
    zone_name: 'Hampankatta',
    status: 'OPERATIONAL',
    coordinates: [12.8745, 74.8490],
    capacity_or_load: 'District Disaster Management Authority (DDMA)',
    elevation_m: 16.5,
    contact: 'Control Room: 1077 / 0824-2442590'
  },
  {
    id: 'FAC-11',
    name: 'Pandeshwar Central Fire & Emergency Station',
    type: 'FIRE_STATION',
    zone_id: 'Zone 05',
    zone_name: 'Bunder',
    status: 'OPERATIONAL',
    coordinates: [12.8590, 74.8410],
    capacity_or_load: '8 Water Tenders • Rescue Boats Unit',
    elevation_m: 5.2,
    contact: '101 / 0824-2423333'
  },
  {
    id: 'FAC-12',
    name: 'Bunder Port Coastal Police Station',
    type: 'POLICE_STATION',
    zone_id: 'Zone 05',
    zone_name: 'Bunder',
    status: 'OPERATIONAL',
    coordinates: [12.8630, 74.8360],
    capacity_or_load: 'Coastal Patrol Unit & Wireless Dispatch',
    elevation_m: 3.8,
    contact: '112 / 0824-2420100'
  }
];

export const demoRoadSegments: RoadSegment[] = [
  {
    id: 'ROAD-01',
    name: 'NH-66 Kulur River Bridge & Northern Approach',
    category: 'NH-66',
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    status: 'INUNDATED',
    water_depth_cm: 45,
    coordinates: [
      [12.9220, 74.8250],
      [12.9270, 74.8290],
      [12.9340, 74.8320],
      [12.9410, 74.8350]
    ]
  },
  {
    id: 'ROAD-02',
    name: 'Kulur-Kavoor Connecting Arterial Road',
    category: 'ARTERIAL',
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    status: 'WATERLOGGED',
    water_depth_cm: 28,
    coordinates: [
      [12.9310, 74.8320],
      [12.9360, 74.8410],
      [12.9400, 74.8460]
    ]
  },
  {
    id: 'ROAD-03',
    name: 'Bunder Marine Wharf Approach Road',
    category: 'ARTERIAL',
    zone_id: 'Zone 05',
    zone_name: 'Bunder',
    status: 'INUNDATED',
    water_depth_cm: 38,
    coordinates: [
      [12.8620, 74.8320],
      [12.8680, 74.8350],
      [12.8730, 74.8380]
    ]
  },
  {
    id: 'ROAD-04',
    name: 'NH-66 Netravati Bridge & Ullal Junction Ramp',
    category: 'NH-66',
    zone_id: 'Zone 01',
    zone_name: 'Ullal',
    status: 'WATERLOGGED',
    water_depth_cm: 20,
    coordinates: [
      [12.8280, 74.8480],
      [12.8220, 74.8510],
      [12.8150, 74.8540]
    ]
  },
  {
    id: 'ROAD-05',
    name: 'Bolar Hoige Bazar Riverfront Road',
    category: 'ARTERIAL',
    zone_id: 'Zone 02',
    zone_name: 'Bolar',
    status: 'WATERLOGGED',
    water_depth_cm: 22,
    coordinates: [
      [12.8440, 74.8360],
      [12.8490, 74.8390],
      [12.8550, 74.8420]
    ]
  },
  {
    id: 'ROAD-06',
    name: 'Hampankatta Central Railway Underpass',
    category: 'ARTERIAL',
    zone_id: 'Zone 04',
    zone_name: 'Hampankatta',
    status: 'WATERLOGGED',
    water_depth_cm: 18,
    coordinates: [
      [12.8690, 74.8450],
      [12.8720, 74.8490]
    ]
  },
  {
    id: 'ROAD-07',
    name: 'Pumpwell Highway Underpass Bypass',
    category: 'NH-66',
    zone_id: 'Zone 06',
    zone_name: 'Kankanady',
    status: 'PASSABLE',
    water_depth_cm: 8,
    coordinates: [
      [12.8610, 74.8630],
      [12.8660, 74.8680],
      [12.8710, 74.8720]
    ]
  }
];
