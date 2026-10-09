import type { ZoneData } from '../../types';

export const demoZones: ZoneData[] = [
  {
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    risk_level: 'HIGH',
    flood_probability: 82,
    severity: 'HIGH',
    expected_onset: '18:40 IST',
    expected_peak: '22:15 IST',
    risk_drivers: [
      { factor: 'Heavy Rainfall', percentage: 42, impact_description: 'Monsoonal cloudburst intensity exceeding stormwater capacity' },
      { factor: 'High Tide', percentage: 28, impact_description: 'Gurupura river estuary backflow during astronomical peak' },
      { factor: 'Low Elevation', percentage: 18, impact_description: 'Riverine floodplain elevation under 2.8m above MSL' },
      { factor: 'Drainage Congestion', percentage: 12, impact_description: 'Siltation around NH-66 bridge abutments and culverts' },
      { factor: 'Land Use', percentage: 7, impact_description: 'Paved industrial and transit corridor runoff' }
    ],
    estimated_population: 12400,
    affected_buildings: 1240,
    affected_roads: 7,
    critical_facilities: 3,
    population_at_risk: 12400,
    estimated_impact: {
      buildings: 1240,
      road_segments: 7,
      critical_facilities: 3,
      schools: 5,
      shelters: 4,
      hospitals: 3
    },
    elevation_avg_m: 2.6,
    center: [12.9285, 74.8320],
    coordinates: [
      [12.9180, 74.8210],
      [12.9380, 74.8190],
      [12.9460, 74.8350],
      [12.9390, 74.8490],
      [12.9210, 74.8440],
      [12.9180, 74.8210]
    ],
    priority_rank: 1,
    priority_status: 'IMMEDIATE',
    priority_score: 94.2,
    drainage_capacity_rating: 'SEVERELY CONGESTED',
    key_observation: 'Critical choke point along Gurupura river confluence with NH-66 bridge corridor. Rapid backwater ponding.'
  },
  {
    zone_id: 'Zone 05',
    zone_name: 'Bunder',
    risk_level: 'HIGH',
    flood_probability: 78,
    severity: 'HIGH',
    expected_onset: '20:10 IST',
    expected_peak: '23:30 IST',
    risk_drivers: [
      { factor: 'High Tide Surge', percentage: 38, impact_description: 'Estuarine sea water breach over old wharf bulkheads' },
      { factor: 'Heavy Rainfall', percentage: 32, impact_description: 'Dense commercial runoff accumulation' },
      { factor: 'Low Elevation', percentage: 20, impact_description: 'Wharf level 1.4m above mean high water spring' },
      { factor: 'Drainage Congestion', percentage: 10, impact_description: 'Old storm channels restricted by marine siltation' },
      { factor: 'Land Use', percentage: 5, impact_description: 'Impervious wharf and port apron' }
    ],
    estimated_population: 9800,
    affected_buildings: 920,
    affected_roads: 5,
    critical_facilities: 2,
    population_at_risk: 9800,
    estimated_impact: {
      buildings: 920,
      road_segments: 5,
      critical_facilities: 2,
      schools: 2,
      shelters: 2,
      hospitals: 1
    },
    elevation_avg_m: 1.8,
    center: [12.8680, 74.8360],
    coordinates: [
      [12.8590, 74.8290],
      [12.8760, 74.8310],
      [12.8790, 74.8430],
      [12.8640, 74.8460],
      [12.8580, 74.8380],
      [12.8590, 74.8290]
    ],
    priority_rank: 2,
    priority_status: 'URGENT',
    priority_score: 87.5,
    drainage_capacity_rating: 'SEVERELY CONGESTED',
    key_observation: 'Old port and fish market apron vulnerable to tidal lock. Evacuation staging required for wharf workers.'
  },
  {
    zone_id: 'Zone 01',
    zone_name: 'Ullal',
    risk_level: 'HIGH',
    flood_probability: 75,
    severity: 'HIGH',
    expected_onset: '19:15 IST',
    expected_peak: '22:45 IST',
    risk_drivers: [
      { factor: 'Coastal Wave Action', percentage: 40, impact_description: 'Severe coastal erosion and shoreline wave overwash' },
      { factor: 'High Tide', percentage: 30, impact_description: 'Netravati southern estuary bank overflow' },
      { factor: 'Heavy Rainfall', percentage: 20, impact_description: 'Localized precipitation ponding in sand-ridge basins' },
      { factor: 'Drainage Congestion', percentage: 10, impact_description: 'Natural dune barrier inhibiting gravity drainage' },
      { factor: 'Land Use', percentage: 6, impact_description: 'Dense coastal settlements on low spit' }
    ],
    estimated_population: 11200,
    affected_buildings: 860,
    affected_roads: 4,
    critical_facilities: 2,
    population_at_risk: 11200,
    estimated_impact: {
      buildings: 860,
      road_segments: 4,
      critical_facilities: 2,
      schools: 3,
      shelters: 3,
      hospitals: 1
    },
    elevation_avg_m: 2.1,
    center: [12.8120, 74.8480],
    coordinates: [
      [12.7980, 74.8390],
      [12.8250, 74.8410],
      [12.8340, 74.8580],
      [12.8190, 74.8690],
      [12.8020, 74.8550],
      [12.7980, 74.8390]
    ],
    priority_rank: 3,
    priority_status: 'URGENT',
    priority_score: 83.1,
    drainage_capacity_rating: 'STRESSED',
    key_observation: 'Coastal barrier spit with persistent sea erosion vulnerability. Fishermen settlements along shore need monitoring.'
  },
  {
    zone_id: 'Zone 02',
    zone_name: 'Bolar',
    risk_level: 'MODERATE',
    flood_probability: 64,
    severity: 'MODERATE',
    expected_onset: '21:00 IST',
    expected_peak: '00:15 IST',
    risk_drivers: [
      { factor: 'High Tide & Estuary Spill', percentage: 36, impact_description: 'Confluence backflow from Netravati & Gurupura confluence' },
      { factor: 'Heavy Rainfall', percentage: 34, impact_description: 'Surface runoff from Jeppu ridge slopes' },
      { factor: 'Low Elevation', percentage: 20, impact_description: 'Low-lying river bank boat jetties' },
      { factor: 'Drainage Congestion', percentage: 10, impact_description: 'Tidal back-pressure on local storm sluices' },
      { factor: 'Land Use', percentage: 5, impact_description: 'Old riverfront godowns and boatyards' }
    ],
    estimated_population: 7400,
    affected_buildings: 640,
    affected_roads: 3,
    critical_facilities: 2,
    population_at_risk: 7400,
    estimated_impact: {
      buildings: 640,
      road_segments: 3,
      critical_facilities: 2,
      schools: 2,
      shelters: 2,
      hospitals: 1
    },
    elevation_avg_m: 3.4,
    center: [12.8490, 74.8410],
    coordinates: [
      [12.8410, 74.8330],
      [12.8590, 74.8320],
      [12.8620, 74.8470],
      [12.8480, 74.8520],
      [12.8410, 74.8430],
      [12.8410, 74.8330]
    ],
    priority_rank: 4,
    priority_status: 'HIGH',
    priority_score: 72.8,
    drainage_capacity_rating: 'STRESSED',
    key_observation: 'River mouth confluence area. Low-lying ferry points and riverfront properties vulnerable during high tide.'
  },
  {
    zone_id: 'Zone 04',
    zone_name: 'Hampankatta',
    risk_level: 'MODERATE',
    flood_probability: 42,
    severity: 'MODERATE',
    expected_onset: '22:30 IST',
    expected_peak: '01:45 IST',
    risk_drivers: [
      { factor: 'Intense Runoff', percentage: 48, impact_description: 'Impervious paved commercial footprint causing swift runoff accumulation' },
      { factor: 'Drainage Congestion', percentage: 32, impact_description: 'Raja Kaluve bottleneck near central railway underpasses' },
      { factor: 'Rainfall Volume', percentage: 14, impact_description: 'Sustained rain filling retention points' },
      { factor: 'Topographic Dip', percentage: 6, impact_description: 'Localized roadway depressions near clock tower' },
      { factor: 'Land Use', percentage: 8, impact_description: 'Ultra-dense central business district' }
    ],
    estimated_population: 5200,
    affected_buildings: 380,
    affected_roads: 3,
    critical_facilities: 1,
    population_at_risk: 5200,
    estimated_impact: {
      buildings: 380,
      road_segments: 3,
      critical_facilities: 1,
      schools: 1,
      shelters: 1,
      hospitals: 1
    },
    elevation_avg_m: 14.5,
    center: [12.8730, 74.8480],
    coordinates: [
      [12.8660, 74.8430],
      [12.8830, 74.8430],
      [12.8850, 74.8590],
      [12.8710, 74.8590],
      [12.8660, 74.8490],
      [12.8660, 74.8430]
    ],
    priority_rank: 5,
    priority_status: 'MONITOR',
    priority_score: 54.3,
    drainage_capacity_rating: 'STRESSED',
    key_observation: 'Central commercial district. Flash waterlogging near underpasses, but elevated terrain prevents severe catastrophic inundation.'
  },
  {
    zone_id: 'Zone 06',
    zone_name: 'Kankanady',
    risk_level: 'LOW',
    flood_probability: 35,
    severity: 'LOW',
    expected_onset: '23:45 IST',
    expected_peak: '02:30 IST',
    risk_drivers: [
      { factor: 'Urban Runoff', percentage: 52, impact_description: 'Commercial surface runoff directed towards Pumpwell junction' },
      { factor: 'Drainage Inadequacy', percentage: 28, impact_description: 'Culvert capacity stress at major highway intersections' },
      { factor: 'Rainfall Peak', percentage: 15, impact_description: 'Short-duration convective thunderstorm burst' },
      { factor: 'Topography', percentage: 5, impact_description: 'Mild depression around Pumpwell flyover approach' },
      { factor: 'Land Use', percentage: 4, impact_description: 'Healthcare and commercial zone' }
    ],
    estimated_population: 3100,
    affected_buildings: 180,
    affected_roads: 2,
    critical_facilities: 1,
    population_at_risk: 3100,
    estimated_impact: {
      buildings: 180,
      road_segments: 2,
      critical_facilities: 1,
      schools: 1,
      shelters: 1,
      hospitals: 1
    },
    elevation_avg_m: 19.8,
    center: [12.8640, 74.8690],
    coordinates: [
      [12.8550, 74.8580],
      [12.8750, 74.8590],
      [12.8780, 74.8790],
      [12.8610, 74.8820],
      [12.8530, 74.8690],
      [12.8550, 74.8580]
    ],
    priority_rank: 6,
    priority_status: 'LOW',
    priority_score: 38.6,
    drainage_capacity_rating: 'ADEQUATE',
    key_observation: 'Major hospital and transit zone. Pumpwell flyover base prone to minor waterlogging; primary hospital campuses elevated safely.'
  },
  {
    zone_id: 'Zone 07',
    zone_name: 'Deralakatte',
    risk_level: 'LOW',
    flood_probability: 18,
    severity: 'LOW',
    expected_onset: '01:00 IST',
    expected_peak: '03:15 IST',
    risk_drivers: [
      { factor: 'Localized Ponding', percentage: 55, impact_description: 'Minor roadside ditch overflow in non-paved segments' },
      { factor: 'Heavy Rainfall', percentage: 30, impact_description: 'Monsoon showers with quick lateral watershed dispersion' },
      { factor: 'Topography', percentage: 10, impact_description: 'High laterite plateau prevents riverine backwater' },
      { factor: 'Drainage', percentage: 5, impact_description: 'Rapid natural slope drainage towards surrounding valleys' },
      { factor: 'Land Use', percentage: 3, impact_description: 'Campus open green expanses' }
    ],
    estimated_population: 1400,
    affected_buildings: 60,
    affected_roads: 1,
    critical_facilities: 0,
    population_at_risk: 1400,
    estimated_impact: {
      buildings: 60,
      road_segments: 1,
      critical_facilities: 0,
      schools: 0,
      shelters: 1,
      hospitals: 0
    },
    elevation_avg_m: 38.2,
    center: [12.8250, 74.8850],
    coordinates: [
      [12.8110, 74.8690],
      [12.8360, 74.8720],
      [12.8420, 74.8980],
      [12.8220, 74.9050],
      [12.8100, 74.8850],
      [12.8110, 74.8690]
    ],
    priority_rank: 7,
    priority_status: 'LOW',
    priority_score: 19.4,
    drainage_capacity_rating: 'ADEQUATE',
    key_observation: 'Inland upland medical & university hub. High elevation offers safe staging and emergency relocation territory.'
  }
];

export const getZoneById = (id: string): ZoneData => {
  return demoZones.find(z => z.zone_id.toLowerCase() === id.toLowerCase()) || demoZones[0];
};
