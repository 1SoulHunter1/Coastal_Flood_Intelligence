export interface EmergencyRoute {
  id: string;
  name: string;
  type: 'PRIMARY' | 'ALTERNATIVE';
  status: 'OPEN' | 'CLOSED' | 'AT_RISK';
  origin: string;
  destination: string;
  destination_type: 'HOSPITAL' | 'SHELTER' | 'EVACUATION_POINT';
  detour_minutes?: number;
  travel_time_minutes: number;
  distance_km: number;
  closure_time?: string;
  corridor: string;
  coordinates: [number, number][];
  associated_zone_id: string;
  notes?: string;
}
