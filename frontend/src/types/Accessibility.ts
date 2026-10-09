export interface HospitalAccessibility {
  id: string;
  name: string;
  zone_id: string;
  zone_name: string;
  facility_flood_status: 'DRY' | 'WATERLOGGED' | 'INUNDATED';
  access_status: 'OPEN' | 'AT_RISK' | 'CLOSED';
  reason: string;
  primary_route: {
    name: string;
    corridor: string;
    status: 'OPEN' | 'AT_RISK' | 'CLOSED';
    closure_time?: string;
  };
  alternative_route?: {
    name: string;
    corridor: string;
    status: 'OPEN';
    detour_minutes: number;
    travel_time_minutes: number;
    route_id: string;
    coordinates?: [number, number][];
  };
  contact: string;
  coordinates: [number, number];
}

export interface ShelterAccessibility {
  id: string;
  name: string;
  zone_id: string;
  zone_name: string;
  capacity: number;
  occupied?: number;
  flood_status: 'DRY' | 'WATERLOGGED';
  road_accessibility: 'OPEN' | 'AT_RISK' | 'CLOSED';
  distance_km: number;
  travel_time_minutes: number;
  route_status: 'OPEN ACCESS' | 'NOT ACCESSIBLE' | 'RESTRICTED';
  is_recommended: boolean;
  route_id?: string;
  coordinates: [number, number];
}

export interface SystemAccessSummary {
  roads_closed_count: number;
  roads_at_risk_count: number;
  hospitals_accessible_ratio: string; // e.g. "2 / 3"
  shelters_reachable_ratio: string; // e.g. "3 / 4"
  critical_facilities_count: number;
  access_status_headline: string;
}
