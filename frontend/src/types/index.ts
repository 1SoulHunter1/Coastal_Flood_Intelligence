export * from './Zone';
export * from './Alert';
export * from './Forecast';
export * from './Infrastructure';
export * from './RoadImpact';
export * from './FloodDepth';
export * from './Route';
export * from './Accessibility';
export * from './Counterfactual';
export * from './ResponderBrief';
export * from './PublicAlert';
export * from './DemoOfficerAlert';

export interface EnvironmentConditions {
  observed_rainfall_rate_mm_hr: number;
  rainfall_24h_total_mm: number;
  rainfall_status: 'RISING' | 'STEADY' | 'RECEDING';
  tide_level_m: number;
  tide_status: 'HIGH TIDE' | 'LOW TIDE' | 'SLACK TIDE' | 'EBB TIDE';
  storm_surge_m: number;
  wind_speed_kmh: number;
  wind_direction: string;
  river_discharge_m3s: number;
  weather_source: string;
  marine_source: string;
  river_source: string;
  feed_timestamp_ist: string;
}

export interface EmergencyPriorityItem {
  rank: number;
  zone_id: string;
  zone_name: string;
  risk_level: string;
  exposure: string;
  critical_facilities: number;
  priority: string;
  priority_score: number;
  rationale: string;
}

export interface SituationBriefData {
  title: string;
  bulletin_number: string;
  timestamp_ist: string;
  headline: string;
  narrative_paragraph_1: string;
  narrative_paragraph_2: string;
  recommended_primary_zone: string;
  key_meteorological_trigger: string;
  prepared_by: string;
}

export interface GeoJsonRiver {
  name: string;
  coordinates: [number, number][];
}
