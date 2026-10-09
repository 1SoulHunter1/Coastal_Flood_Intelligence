export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export type PriorityStatus = 'IMMEDIATE' | 'URGENT' | 'HIGH' | 'MONITOR' | 'LOW';

export type ExposureLevel = 'VERY HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskDriverFactor {
  factor: string;
  percentage: number;
  impact_description?: string;
}

export interface ZoneData {
  zone_id: string;
  zone_name: string;
  risk_level: RiskLevel;
  flood_probability: number; // 0 - 100%
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  expected_onset: string;
  expected_peak: string;
  risk_drivers: RiskDriverFactor[];
  estimated_population: number;
  affected_buildings: number;
  affected_roads: number;
  critical_facilities: number;
  // Compatibility fields
  population_at_risk?: number;
  estimated_impact?: {
    buildings: number;
    road_segments: number;
    critical_facilities: number;
    schools: number | null;
    shelters: number;
    hospitals: number;
  };
  elevation_avg_m: number;
  coordinates: [number, number][]; // Polygon vertices [lat, lng]
  center: [number, number];
  priority_rank: number;
  priority_status: PriorityStatus;
  priority_score: number; // 0 - 100
  drainage_capacity_rating: 'ADEQUATE' | 'STRESSED' | 'SEVERELY CONGESTED';
  key_observation: string;
  // Real-time model fields from live backend
  predicted_depth_m?: number;
  depth_q10_m?: number;
  depth_q50_m?: number;
  depth_q90_m?: number;
  road_access_status?: string;
  facility_access_status?: string;
  nearest_shelter_text?: string;
}
