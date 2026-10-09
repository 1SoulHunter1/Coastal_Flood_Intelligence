import type {
  ZoneData,
  EnvironmentConditions,
  ForecastPoint,
  InfrastructureSummary,
  CriticalFacility,
  AlertItem,
  EmergencyPriorityItem,
  SituationBriefData,
  RoadImpactItem,
  HospitalAccessibility,
  ShelterAccessibility,
  SystemAccessSummary,
  EmergencyRoute,
  ResponderBriefing,
  PublicAlertTemplate,
  ZoneFloodDepth
} from '../../types';
import type { GisGeoJsonLine } from '../demo/gisLayers';

// =========================================================================
// UDUPI ENVIRONMENT DATA (SIMULATION)
// =========================================================================
export const udupiEnvironmentConditions: EnvironmentConditions = {
  observed_rainfall_rate_mm_hr: 32.4,
  rainfall_24h_total_mm: 118.0,
  rainfall_status: 'RISING',
  tide_level_m: 1.88,
  tide_status: 'HIGH TIDE',
  storm_surge_m: 0.38,
  wind_speed_kmh: 42.0,
  wind_direction: 'WSW',
  river_discharge_m3s: 740.0,
  weather_source: 'Explicit demo fixture — not live data',
  marine_source: 'Explicit demo fixture — not live data',
  river_source: 'Explicit demo fixture — not live data',
  feed_timestamp_ist: 'Demo fixture — no provider timestamp'
};

// =========================================================================
// UDUPI COASTAL FLOOD ZONES (SIMULATION)
// =========================================================================
export const udupiZones: ZoneData[] = [
  {
    zone_id: 'Zone 01',
    zone_name: 'Malpe Harbor',
    risk_level: 'HIGH',
    flood_probability: 84,
    severity: 'HIGH',
    expected_onset: '17:15 IST',
    expected_peak: '21:00 IST',
    risk_drivers: [
      { factor: 'tide_height', percentage: 70, impact_description: 'Astronomical high tide (+1.88m CD) at fisheries wharf' },
      { factor: 'storm_surge', percentage: 30, impact_description: 'Arabian Sea coastal swell and storm surge (+0.38m)' }
    ],
    estimated_population: 14200,
    affected_buildings: 980,
    affected_roads: 5,
    critical_facilities: 3,
    elevation_avg_m: 1.8,
    center: [13.3510, 74.7040],
    coordinates: [
      [13.3600, 74.6980],
      [13.3620, 74.7120],
      [13.3420, 74.7150],
      [13.3400, 74.7000]
    ],
    priority_rank: 2,
    priority_status: 'IMMEDIATE',
    priority_score: 84,
    drainage_capacity_rating: 'SEVERELY CONGESTED',
    key_observation: 'Tidal backsurge inundating Malpe fishing harbor and lower jetty terminals.'
  },
  {
    zone_id: 'Zone 02',
    zone_name: 'Udyavara Estuary',
    risk_level: 'CRITICAL',
    flood_probability: 89,
    severity: 'CRITICAL',
    expected_onset: '17:40 IST',
    expected_peak: '21:30 IST',
    risk_drivers: [
      { factor: 'drainage_density', percentage: 65, impact_description: 'Severe estuarine confluence backwater congestion' },
      { factor: 'elevation', percentage: 35, impact_description: 'Low ground elevation (<1.5m MSL) near mangrove creeks' }
    ],
    estimated_population: 11500,
    affected_buildings: 820,
    affected_roads: 4,
    critical_facilities: 2,
    elevation_avg_m: 1.4,
    center: [13.3120, 74.7350],
    coordinates: [
      [13.3250, 74.7200],
      [13.3280, 74.7500],
      [13.3000, 74.7520],
      [13.2980, 74.7220]
    ],
    priority_rank: 1,
    priority_status: 'IMMEDIATE',
    priority_score: 89,
    drainage_capacity_rating: 'SEVERELY CONGESTED',
    key_observation: 'Papanashini river backwater overflow isolating low-lying fishing hamlets.'
  },
  {
    zone_id: 'Zone 03',
    zone_name: 'Kaup Coast',
    risk_level: 'HIGH',
    flood_probability: 76,
    severity: 'HIGH',
    expected_onset: '18:00 IST',
    expected_peak: '22:00 IST',
    risk_drivers: [
      { factor: 'storm_surge', percentage: 55, impact_description: 'Direct open wave runup along Kaup lighthouse beach' },
      { factor: 'rainfall_6h', percentage: 45, impact_description: 'Localized precipitation accumulation in coastal depressions' }
    ],
    estimated_population: 16800,
    affected_buildings: 1150,
    affected_roads: 6,
    critical_facilities: 2,
    elevation_avg_m: 2.2,
    center: [13.2230, 74.7480],
    coordinates: [
      [13.2400, 74.7350],
      [13.2420, 74.7620],
      [13.2050, 74.7650],
      [13.2020, 74.7380]
    ],
    priority_rank: 3,
    priority_status: 'URGENT',
    priority_score: 76,
    drainage_capacity_rating: 'STRESSED',
    key_observation: 'Wave runup exceeding seawall crest height; localized beach access cutoff.'
  },
  {
    zone_id: 'Zone 04',
    zone_name: 'Brahmavara River Delta',
    risk_level: 'MODERATE',
    flood_probability: 52,
    severity: 'MODERATE',
    expected_onset: '19:30 IST',
    expected_peak: '23:15 IST',
    risk_drivers: [
      { factor: 'river_discharge', percentage: 60, impact_description: 'Sita River high monsoon agricultural runoff' },
      { factor: 'tide_height', percentage: 40, impact_description: 'Moderate backflow at river mouth' }
    ],
    estimated_population: 13400,
    affected_buildings: 760,
    affected_roads: 3,
    critical_facilities: 1,
    elevation_avg_m: 3.5,
    center: [13.4350, 74.7520],
    coordinates: [
      [13.4550, 74.7350],
      [13.4580, 74.7700],
      [13.4150, 74.7720],
      [13.4120, 74.7380]
    ],
    priority_rank: 4,
    priority_status: 'HIGH',
    priority_score: 52,
    drainage_capacity_rating: 'ADEQUATE',
    key_observation: 'Agricultural inundation along Sita riverbanks; NH-66 transit currently clear.'
  },
  {
    zone_id: 'Zone 05',
    zone_name: 'Padubidri Coast',
    risk_level: 'LOW',
    flood_probability: 28,
    severity: 'LOW',
    expected_onset: '21:00 IST',
    expected_peak: '01:30 IST',
    risk_drivers: [
      { factor: 'rainfall_6h', percentage: 70, impact_description: 'Intermittent squally showers' },
      { factor: 'tide_height', percentage: 30, impact_description: 'Sub-critical tidal influx' }
    ],
    estimated_population: 9200,
    affected_buildings: 510,
    affected_roads: 2,
    critical_facilities: 1,
    elevation_avg_m: 4.8,
    center: [13.1420, 74.7810],
    coordinates: [
      [13.1600, 74.7650],
      [13.1620, 74.7980],
      [13.1250, 74.8000],
      [13.1220, 74.7680]
    ],
    priority_rank: 5,
    priority_status: 'MONITOR',
    priority_score: 28,
    drainage_capacity_rating: 'ADEQUATE',
    key_observation: 'Normal drainage functioning with stable coastal buffers.'
  }
];

// =========================================================================
// UDUPI GIS VECTORS: RIVERS & WATER BODIES (SIMULATION)
// =========================================================================
export const udupiGisRivers: GisGeoJsonLine[] = [
  {
    id: 'RIV-UD-SWARNA',
    name: 'Swarna River',
    type: 'RIVER',
    coordinates: [
      [13.3750, 74.8250],
      [13.3650, 74.7800],
      [13.3580, 74.7400],
      [13.3530, 74.7150],
      [13.3480, 74.6980]
    ]
  },
  {
    id: 'RIV-UD-UDYAVARA',
    name: 'Udyavara (Papanashini) River',
    type: 'RIVER',
    coordinates: [
      [13.2980, 74.8100],
      [13.3050, 74.7650],
      [13.3110, 74.7380],
      [13.3150, 74.7180]
    ]
  },
  {
    id: 'RIV-UD-SITA',
    name: 'Sita River',
    type: 'RIVER',
    coordinates: [
      [13.4550, 74.8250],
      [13.4450, 74.7850],
      [13.4380, 74.7480],
      [13.4320, 74.7200]
    ]
  }
];

// =========================================================================
// UDUPI GIS HIGHWAYS (SIMULATION)
// =========================================================================
export const udupiGisHighways: GisGeoJsonLine[] = [
  {
    id: 'HWY-UD-NH66',
    name: 'NH-66 Coastal Corridor (Udupi Expressway)',
    type: 'HIGHWAY',
    coordinates: [
      [13.1200, 74.7850],
      [13.2200, 74.7550],
      [13.3100, 74.7450],
      [13.3420, 74.7490],
      [13.4400, 74.7550]
    ]
  }
];

// =========================================================================
// UDUPI CRITICAL FACILITIES (SIMULATION)
// =========================================================================
export const udupiCriticalFacilities: CriticalFacility[] = [
  {
    id: 'HOSP-UD-DIST',
    name: 'District Hospital Udupi (Ajjarakad)',
    type: 'HOSPITAL',
    zone_id: 'Zone 01',
    zone_name: 'Udupi Central / Malpe',
    status: 'OPERATIONAL',
    coordinates: [13.3380, 74.7450],
    capacity_or_load: '350 Beds (Normal Capacity)',
    contact: '+91 820 252 0200',
    elevation_m: 14.5
  },
  {
    id: 'HOSP-UD-KASTURBA',
    name: 'Kasturba Hospital (Manipal Referral Center)',
    type: 'HOSPITAL',
    zone_id: 'Zone 01',
    zone_name: 'Manipal Heights',
    status: 'OPERATIONAL',
    coordinates: [13.3530, 74.7880],
    capacity_or_load: '2000 Beds (Tertiary Care Trauma)',
    contact: '+91 820 292 2761',
    elevation_m: 72.0
  },
  {
    id: 'SHELTER-UD-MALPE',
    name: 'Shelter 01 (Malpe Fishermen Auction Community Center)',
    type: 'SHELTER',
    zone_id: 'Zone 01',
    zone_name: 'Malpe Harbor',
    status: 'OPERATIONAL',
    coordinates: [13.3540, 74.7120],
    capacity_or_load: '500 Persons',
    contact: '+91 820 253 8811',
    elevation_m: 4.5
  },
  {
    id: 'SHELTER-UD-UDYAVARA',
    name: 'Udyavara Community Hall Shelter',
    type: 'SHELTER',
    zone_id: 'Zone 02',
    zone_name: 'Udyavara Estuary',
    status: 'STANDBY',
    coordinates: [13.3150, 74.7380],
    capacity_or_load: '350 Persons',
    contact: '+91 820 253 4422',
    elevation_m: 3.2
  },
  {
    id: 'FIRE-UD-BANNANJE',
    name: 'Udupi Fire & Emergency Station (Bannanje)',
    type: 'FIRE_STATION',
    zone_id: 'Zone 01',
    zone_name: 'Bannanje',
    status: 'OPERATIONAL',
    coordinates: [13.3320, 74.7480],
    capacity_or_load: '5 Rapid Response Boats',
    contact: '101 / +91 820 252 0333',
    elevation_m: 16.0
  },
  {
    id: 'POLICE-UD-MALPE',
    name: 'Malpe Coastal Security Police Station',
    type: 'POLICE_STATION',
    zone_id: 'Zone 01',
    zone_name: 'Malpe Harbor',
    status: 'AT_RISK',
    coordinates: [13.3490, 74.7080],
    capacity_or_load: 'Coastal Patrol Units',
    contact: '112 / +91 820 253 8100',
    elevation_m: 2.1
  }
];

// =========================================================================
// UDUPI ROAD IMPACT & ROUTING (0.30M RULE)
// =========================================================================
export const udupiRoadImpacts: RoadImpactItem[] = [
  {
    id: 'ROAD-UD-MALPE-PORT',
    name: 'Malpe Harbor Wharf Access Corridor',
    zone_id: 'Zone 01',
    zone_name: 'Malpe Harbor',
    category: 'ARTERIAL',
    predicted_depth_m: 0.36,
    water_depth_cm: 36,
    status: 'CLOSED',
    closure_reason: 'Flood depth exceeds 0.30 m threshold. Wharf submerged at high tide.',
    predicted_closure_time: '17:15 IST',
    coordinates: [
      [13.3480, 74.7060],
      [13.3530, 74.7100]
    ],
    alternative_route_available: true,
    alternative_route_id: 'ROUTE-UD-ALT-01'
  },
  {
    id: 'ROAD-UD-UDYAVARA-BRG',
    name: 'Udyavara River Road Link',
    zone_id: 'Zone 02',
    zone_name: 'Udyavara Estuary',
    category: 'STATE_HIGHWAY',
    predicted_depth_m: 0.22,
    water_depth_cm: 22,
    status: 'AT_RISK',
    closure_reason: 'Approaching critical inundation threshold; high-clearance vehicles only.',
    coordinates: [
      [13.3100, 74.7320],
      [13.3160, 74.7400]
    ],
    alternative_route_available: true
  },
  {
    id: 'ROAD-UD-NH66-BYPASS',
    name: 'NH-66 Karavali Bypass Corridor',
    zone_id: 'Zone 01',
    zone_name: 'Udupi Urban',
    category: 'NH-66',
    predicted_depth_m: 0.08,
    water_depth_cm: 8,
    status: 'OPEN',
    coordinates: [
      [13.3300, 74.7440],
      [13.3450, 74.7480]
    ],
    alternative_route_available: true
  }
];

// =========================================================================
// UDUPI EMERGENCY ROUTES (SIMULATION)
// =========================================================================
export const udupiEmergencyRoutes: EmergencyRoute[] = [
  {
    id: 'ROUTE-UD-ALT-01',
    name: 'Bannanje - Karavali Bypass Ingress',
    type: 'ALTERNATIVE',
    status: 'OPEN',
    origin: 'Malpe Police Station Junction',
    destination: 'District Hospital Udupi (Ajjarakad)',
    destination_type: 'HOSPITAL',
    detour_minutes: 6,
    travel_time_minutes: 18,
    distance_km: 5.4,
    corridor: 'Malpe Main Road -> Karavali Junction -> Ajjarakad',
    coordinates: [
      [13.3530, 74.7100],
      [13.3450, 74.7250],
      [13.3380, 74.7450]
    ],
    associated_zone_id: 'Zone 01',
    notes: 'Primary emergency evacuation bypass avoiding inundated Malpe port wharf.'
  }
];

// =========================================================================
// UDUPI HOSPITAL & SHELTER ACCESSIBILITY (SIMULATION)
// =========================================================================
export const udupiHospitalsAccessibility: HospitalAccessibility[] = [
  {
    id: 'HOSP-UD-DIST',
    name: 'District Hospital Udupi (Ajjarakad)',
    zone_id: 'Zone 01',
    zone_name: 'Udupi Central',
    facility_flood_status: 'DRY',
    access_status: 'OPEN',
    reason: 'Hospital facility and approach roads elevated outside tidal flood basin.',
    primary_route: {
      name: 'Karavali Junction Corridor',
      corridor: 'NH-66 -> Ajjarakad Main Road',
      status: 'OPEN'
    },
    contact: '+91 820 252 0200',
    coordinates: [13.3380, 74.7450]
  }
];

export const udupiSheltersAccessibility: ShelterAccessibility[] = [
  {
    id: 'SHELTER-UD-MALPE',
    name: 'Malpe Fishermen Auction Community Center',
    zone_id: 'Zone 01',
    zone_name: 'Malpe Harbor',
    capacity: 500,
    occupied: 60,
    flood_status: 'DRY',
    road_accessibility: 'OPEN',
    distance_km: 1.8,
    travel_time_minutes: 8,
    route_status: 'OPEN ACCESS',
    is_recommended: true,
    coordinates: [13.3540, 74.7120]
  },
  {
    id: 'SHELTER-UD-UDYAVARA',
    name: 'Udyavara Community Hall Shelter',
    zone_id: 'Zone 02',
    zone_name: 'Udyavara Estuary',
    capacity: 350,
    occupied: 0,
    flood_status: 'DRY',
    road_accessibility: 'AT_RISK',
    distance_km: 3.2,
    travel_time_minutes: 15,
    route_status: 'RESTRICTED',
    is_recommended: false,
    coordinates: [13.3150, 74.7380]
  }
];

export const udupiSystemAccessSummary: SystemAccessSummary = {
  roads_closed_count: 1,
  roads_at_risk_count: 1,
  hospitals_accessible_ratio: '2 / 2',
  shelters_reachable_ratio: '2 / 2',
  critical_facilities_count: 2,
  access_status_headline: 'Malpe port wharf closed (>=0.30m); Karavali bypass open.'
};

// =========================================================================
// UDUPI FORECAST TIMELINE (SIMULATION)
// =========================================================================
export const udupiForecastTimeline: ForecastPoint[] = [
  { time_label: 'NOW', timestamp: '17:30 IST', flood_probability: 58, rainfall_rate_mm_hr: 24.0, tide_level_m: 1.62, storm_surge_m: 0.28, is_onset: false, is_peak: false, notes: 'Tidal influx starting at Malpe estuary' },
  { time_label: '+3H', timestamp: '20:30 IST', flood_probability: 82, rainfall_rate_mm_hr: 36.0, tide_level_m: 1.85, storm_surge_m: 0.36, is_onset: true, is_peak: false, notes: 'Expected onset: fisheries wharf inundation' },
  { time_label: '+6H', timestamp: '23:30 IST', flood_probability: 86, rainfall_rate_mm_hr: 30.0, tide_level_m: 1.88, storm_surge_m: 0.38, is_onset: false, is_peak: true, notes: 'Peak inundation window across Malpe & Udyavara' },
  { time_label: '+9H', timestamp: '02:30 IST', flood_probability: 70, rainfall_rate_mm_hr: 20.0, tide_level_m: 1.45, storm_surge_m: 0.25, is_onset: false, is_peak: false, notes: 'Tidal ebb beginning; water levels receding' },
  { time_label: '+12H', timestamp: '05:30 IST', flood_probability: 44, rainfall_rate_mm_hr: 14.0, tide_level_m: 1.10, storm_surge_m: 0.15, is_onset: false, is_peak: false, notes: 'Normal low slack water' },
  { time_label: '+18H', timestamp: '11:30 IST', flood_probability: 32, rainfall_rate_mm_hr: 10.0, tide_level_m: 1.25, storm_surge_m: 0.10, is_onset: false, is_peak: false, notes: 'Road accessibility fully restored' },
  { time_label: '+24H', timestamp: '17:30 IST', flood_probability: 25, rainfall_rate_mm_hr: 8.0, tide_level_m: 1.30, storm_surge_m: 0.08, is_onset: false, is_peak: false, notes: 'Standard monsoon baseline' }
];

// =========================================================================
// UDUPI EMERGENCY PRIORITY TABLE (MCDA SIMULATION)
// =========================================================================
export const udupiEmergencyPriorityTable: EmergencyPriorityItem[] = [
  {
    rank: 1,
    zone_id: 'Zone 02',
    zone_name: 'Udyavara Estuary',
    risk_level: 'CRITICAL',
    exposure: 'HIGH',
    critical_facilities: 2,
    priority: 'IMMEDIATE',
    priority_score: 89,
    rationale: 'Severe backwater flooding across mangrove residential fringes with road access at risk.'
  },
  {
    rank: 2,
    zone_id: 'Zone 01',
    zone_name: 'Malpe Harbor',
    risk_level: 'HIGH',
    exposure: 'VERY HIGH',
    critical_facilities: 3,
    priority: 'IMMEDIATE',
    priority_score: 84,
    rationale: 'High spring tide with wharf cutoff (depth >= 0.30m) disrupting fisheries logistics.'
  },
  {
    rank: 3,
    zone_id: 'Zone 03',
    zone_name: 'Kaup Coast',
    risk_level: 'HIGH',
    exposure: 'HIGH',
    critical_facilities: 2,
    priority: 'URGENT',
    priority_score: 76,
    rationale: 'Active storm surge runup along lighthouse beachfront road.'
  },
  {
    rank: 4,
    zone_id: 'Zone 04',
    zone_name: 'Brahmavara River Delta',
    risk_level: 'MODERATE',
    exposure: 'MEDIUM',
    critical_facilities: 1,
    priority: 'HIGH',
    priority_score: 52,
    rationale: 'Sita River delta swelling; agricultural lowlands impacted.'
  },
  {
    rank: 5,
    zone_id: 'Zone 05',
    zone_name: 'Padubidri Coast',
    risk_level: 'LOW',
    exposure: 'LOW',
    critical_facilities: 1,
    priority: 'MONITOR',
    priority_score: 28,
    rationale: 'Stable drainage channels with nominal tidal influx.'
  }
];

// =========================================================================
// UDUPI ALERTS (2 ALERTS)
// =========================================================================
export const udupiActiveAlerts: AlertItem[] = [
  {
    id: 'ALT-UD-01',
    zone_id: 'Zone 02',
    zone_name: 'Udyavara Estuary',
    risk_level: 'CRITICAL',
    flood_probability: 89,
    expected_onset: '17:40 IST',
    expected_peak: '21:30 IST',
    headline: 'Critical Inundation Warning — Udyavara Backwaters',
    drivers: 'Tidal backsurge + Papanashini overflow',
    action_summary: 'Deploy emergency rescue rafts; evacuate low-lying riverbank households to Udyavara Hall.',
    issued_at: '16:45 IST',
    evacuation_advised: true
  },
  {
    id: 'ALT-UD-02',
    zone_id: 'Zone 01',
    zone_name: 'Malpe Harbor',
    risk_level: 'HIGH',
    flood_probability: 84,
    expected_onset: '17:15 IST',
    expected_peak: '21:00 IST',
    headline: 'High Tidal Surge Alert — Malpe Fishing Harbor',
    drivers: 'Spring tide coincidence (+1.88m) + coastal storm surge',
    action_summary: 'Suspend fishing boat docking; divert vehicular traffic away from lower wharf.',
    issued_at: '17:00 IST',
    evacuation_advised: false
  }
];

// =========================================================================
// UDUPI SITUATION BRIEF
// =========================================================================
export const udupiSituationBrief: SituationBriefData = {
  title: 'COASTGUARD-AI SITUATION BRIEFING — UDUPI DISTRICT',
  bulletin_number: 'CG-UD-2026-04',
  timestamp_ist: '17:30 IST, October 8, 2026',
  headline: 'Tidal Surge Alert at Malpe Harbor & Udyavara Estuarine Inundation',
  narrative_paragraph_1: 'Coinciding astronomical high tide and Arabian Sea storm surge (+0.38m) are driving elevated water levels into the Malpe fisheries basin and Udyavara estuarine channels.',
  narrative_paragraph_2: 'The lower wharf at Malpe harbor has exceeded the 0.30m vehicle cutoff threshold, prompting proactive traffic diversions via the Karavali bypass.',
  recommended_primary_zone: 'Zone 02 — Udyavara Estuary',
  key_meteorological_trigger: 'Swarna river discharge (740 m³/s) and +1.88m astronomical spring tide',
  prepared_by: 'Udupi District Disaster Management Authority (DDMA)'
};

// =========================================================================
// UDUPI FLOOD DEPTH CONTOURS (SIMULATION)
// =========================================================================
export const udupiZoneFloodDepths: Record<string, ZoneFloodDepth> = {
  'Zone 01': {
    zone_id: 'Zone 01',
    zone_name: 'Malpe Harbor',
    baseline_depth_m: 0.32,
    max_depth_m: 0.58,
    mean_depth_m: 0.28,
    critical_depth_threshold_m: 0.30,
    area_inundated_sq_km: 1.45,
    depth_polygons: [
      [
        [13.3510, 74.7040],
        [13.3540, 74.7080],
        [13.3480, 74.7110],
        [13.3450, 74.7070]
      ]
    ]
  }
};

// =========================================================================
// UDUPI RESPONDER BRIEFING
// =========================================================================
export const getUdupiResponderBriefing = (zoneId: string = 'Zone 01'): ResponderBriefing => {
  return {
    zone_id: zoneId,
    zone_name: zoneId === 'Zone 02' ? 'Udyavara Estuary' : 'Malpe Harbor',
    headline: `${zoneId} — Udupi Coastal Tactical Response Directive`,
    risk_level: zoneId === 'Zone 02' ? 'CRITICAL' : 'HIGH',
    expected_onset: '17:15 IST',
    expected_peak: '21:00 IST',
    roads_affected_count: 5,
    roads_closed_count: 1,
    critical_facilities_at_risk_count: 2,
    key_actions: [
      'Prioritize Malpe fishing harbor and Udyavara estuarine fringes.',
      'Enforce vehicle traffic diversion from submerged Malpe port wharf.',
      'Verify emergency access corridors to District Hospital Udupi.',
      'Maintain open bypass routes via Bannanje - Karavali corridor.',
      'Monitor Swarna river discharge and tidal surge at Malpe gauge.'
    ],
    responder_actions: [
      {
        category: 'IMMEDIATE',
        action: 'Deploy inflatable rescue rafts and sandbag flood barriers',
        target_location: 'Malpe lower wharf & jetty #2',
        timing: 'Before 17:30 IST',
        priority: 'URGENT'
      },
      {
        category: 'TRAFFIC CONTROL',
        action: 'Divert commercial fish transport trucks to upper Karavali bypass',
        target_location: 'Malpe Harbor main approach',
        timing: 'Starting 17:15 IST',
        priority: 'HIGH'
      },
      {
        category: 'ROUTE MANAGEMENT',
        action: 'Keep Bannanje - Karavali alternative corridor signposted and clear',
        target_location: 'Bannanje - Karavali Corridor',
        timing: 'Immediate',
        priority: 'HIGH'
      },
      {
        category: 'CRITICAL FACILITY',
        action: 'Maintain standby ambulance readiness at District Hospital Udupi',
        target_location: 'District Hospital Udupi (Ajjarakad)',
        timing: 'Continuous monitoring',
        priority: 'URGENT'
      }
    ],
    generated_timestamp: '17:35 IST'
  };
};

// =========================================================================
// UDUPI PUBLIC ALERTS (BILINGUAL: ENGLISH & KANNADA)
// =========================================================================
export const getUdupiPublicAlert = (zoneId: string = 'Zone 01'): PublicAlertTemplate => {
  return {
    zone_id: zoneId,
    zone_name: zoneId === 'Zone 02' ? 'Udyavara' : 'Malpe',
    risk_level: 'HIGH',
    expected_onset: '17:15 IST',
    expected_peak: '21:00 IST',
    nearest_shelter_name: 'Malpe Fishermen Auction Community Center',
    nearest_shelter_distance_km: 1.8,
    english: {
      title: 'FLOOD WARNING — UDUPI',
      body: 'Zone: Zone 01 — Malpe\nRisk Level: HIGH\nExpected Onset: 17:15 IST\nExpected Peak: 21:00 IST\n\nResidents in low-lying coastal and harbor areas should move toward the nearest identified dry shelter and avoid flooded wharf roads.',
      advisory: 'Nearest reachable shelter: Malpe Fishermen Auction Community Center — 1.8 km. Avoid Malpe Port Road (CLOSED).',
      sms_text: 'FLOOD WARNING (UDUPI): Zone 01 Malpe at HIGH risk from 17:15 IST. Avoid flooded port roads. Nearest shelter: Malpe Shelter (1.8km). Helpline: 1077.',
      whatsapp_text: '*FLOOD WARNING — UDUPI*\n\n*Zone:* Zone 01 — Malpe Harbor\n*Risk:* HIGH\n*Onset:* 17:15 IST | *Peak:* 21:00 IST\n\nResidents near harbor wharf should move toward identified safe shelters.\n\n*Nearest Safe Shelter:* Malpe Fishermen Auction Community Center (1.8 km)\n*Road Closures:* Malpe Port Wharf Road is CLOSED (depth >= 0.30m).\n*Helpline:* 1077 / 112\n\n_SIMULATION PUBLIC ALERT — Udupi Disaster Control Room_'
    },
    kannada: {
      title: 'ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ — ಉಡುಪಿ',
      body: 'ವಲಯ: ಮಾಲ್ಪೆ ಬಂದರು (Zone 01)\nಅಪಾಯ ಮಟ್ಟ: ಹೆಚ್ಚು\nನಿರೀಕ್ಷಿತ ಆರಂಭ: ಸಂಜೆ 5:15\nನಿರೀಕ್ಷಿತ ಗರಿಷ್ಠ: ರಾತ್ರಿ 9:00\n\nನೀರು ತುಂಬಿರುವ ಬಂದರು ರಸ್ತೆಗಳಲ್ಲಿ ಪ್ರಯಾಣಿಸಬೇಡಿ. ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಕೇಂದ್ರಕ್ಕೆ ತೆರಳಿ.',
      advisory: 'ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಕೇಂದ್ರ: ಮಾಲ್ಪೆ ಮೀನುಗಾರರ ಸಮುದಾಯ ಭವನ — 1.8 ಕಿ.ಮೀ. ಮಾಲ್ಪೆ ಬಂದರು ರಸ್ತೆ ಬಂದ್ ಆಗಿದೆ.',
      sms_text: 'ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ (ಉಡುಪಿ): ಮಾಲ್ಪೆ ವಲಯದಲ್ಲಿ ಹೆಚ್ಚಿನ ಪ್ರವಾಹ ಅಪಾಯ (ಸಂಜೆ 5:15). ಬಂದರು ರಸ್ತೆಗಳನ್ನು ತಪ್ಪಿಸಿ. ಸುರಕ್ಷಿತ ಆಶ್ರಯ: ಮಾಲ್ಪೆ ಕೇಂದ್ರ (1.8km). ಸಹಾಯವಾಣಿ: 1077.',
      whatsapp_text: '*ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ — ಉಡುಪಿ*\n\n*ವಲಯ:* ಮಾಲ್ಪೆ ಬಂದರು (Zone 01)\n*ಅಪಾಯ ಮಟ್ಟ:* ಹೆಚ್ಚು\n*ನಿರೀಕ್ಷಿತ ಆರಂಭ:* ಸಂಜೆ 5:15 | *ಗರಿಷ್ಠ:* ರಾತ್ರಿ 9:00\n\nತಗ್ಗು ಪ್ರದೇಶದ ನಿವಾಸಿಗಳು ತಕ್ಷಣವೇ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಕೇಂದ್ರಕ್ಕೆ ತೆರಳಲು ಸೂಚಿಸಲಾಗಿದೆ.\n\n*ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಕೇಂದ್ರ:* ಮಾಲ್ಪೆ ಮೀನುಗಾರರ ಸಮುದಾಯ ಭವನ (1.8 ಕಿ.ಮೀ)\n*ರಸ್ತೆ ಸ್ಥಿತಿ:* ಮಾಲ್ಪೆ ಬಂದರು ಮುಖ್ಯ ರಸ್ತೆ ಸಂಚಾರಕ್ಕೆ ಮುಚ್ಚಲಾಗಿದೆ (ನೀರಿನ ಆಳ >= 0.30 ಮೀ).\n*ತುರ್ತು ಸಹಾಯವಾಣಿ:* 1077 / 112\n\n_ಮಾದರಿ ಸಾರ್ವಜನಿಕ ಎಚ್ಚರಿಕೆ — ಉಡುಪಿ ವಿಪತ್ತು ನಿಯಂತ್ರಣ ಕೊಠಡಿ_'
    }
  };
};

export const udupiInfrastructureSummary: InfrastructureSummary = {
  hospitals_at_risk: 0,
  schools_at_risk: 2,
  shelters_active: 3,
  road_segments_affected: 4,
  buildings_affected: 820,
  critical_facilities_at_risk: 2
};
