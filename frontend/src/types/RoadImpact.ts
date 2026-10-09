export const ROAD_CLOSURE_DEPTH_M = 0.30;

export type RoadAccessStatus = 'OPEN' | 'AT_RISK' | 'CLOSED';

export interface RoadImpactItem {
  id: string;
  name: string;
  zone_id: string;
  zone_name: string;
  category: 'NH-66' | 'STATE_HIGHWAY' | 'ARTERIAL' | 'BRIDGE_CORRIDOR';
  predicted_depth_m: number;
  water_depth_cm: number;
  status: RoadAccessStatus;
  closure_reason?: string;
  predicted_closure_time?: string;
  coordinates: [number, number][];
  alternative_route_available: boolean;
  alternative_route_id?: string;
}

export const calculateRoadStatus = (depthM: number): RoadAccessStatus => {
  if (depthM >= ROAD_CLOSURE_DEPTH_M) return 'CLOSED';
  if (depthM >= 0.15) return 'AT_RISK';
  return 'OPEN';
};
