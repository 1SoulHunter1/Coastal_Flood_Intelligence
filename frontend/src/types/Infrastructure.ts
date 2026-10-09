import type { Facility, CriticalFacility } from './Facility';

export type { Facility, CriticalFacility };

export interface InfrastructureSummary {
  hospitals_at_risk: number | null;
  schools_at_risk: number | null;
  shelters_active: number;
  road_segments_affected: number;
  buildings_affected: number;
  critical_facilities_at_risk: number;
}


export interface RoadSegment {
  id: string;
  name: string;
  category: 'NH-66' | 'STATE_HIGHWAY' | 'ARTERIAL' | 'BRIDGE_CORRIDOR';
  zone_id: string;
  zone_name: string;
  status: 'PASSABLE' | 'WATERLOGGED' | 'INUNDATED' | 'CLOSED';
  water_depth_cm: number;
  coordinates: [number, number][];
}
