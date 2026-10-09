export type FacilityType =
  | 'HOSPITAL'
  | 'SHELTER'
  | 'FIRE_STATION'
  | 'POLICE_STATION'
  | 'POWER_STATION'
  | 'DRAIN_PUMP'
  | 'GOV_CENTER'
  | 'PORT';

export type FacilityRiskStatus = 'OPERATIONAL' | 'AT_RISK' | 'CRITICAL' | 'STANDBY' | 'UNKNOWN';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  zone_id: string;
  zone_name: string;
  status: FacilityRiskStatus;
  coordinates: [number, number];
  capacity_or_load?: string;
  contact?: string;
  elevation_m: number;
}

// Alias for backwards compatibility
export type CriticalFacility = Facility;
