import type { EnvironmentConditions } from '../../types';

export const demoEnvironmentConditions: EnvironmentConditions = {
  observed_rainfall_rate_mm_hr: 48.5,
  rainfall_24h_total_mm: 164.2,
  rainfall_status: 'RISING',
  tide_level_m: 1.95,
  tide_status: 'HIGH TIDE',
  storm_surge_m: 0.42,
  wind_speed_kmh: 38,
  wind_direction: 'WNW (290°)',
  river_discharge_m3s: 1420,
  weather_source: 'Explicit demo fixture — not live data',
  marine_source: 'Explicit demo fixture — not live data',
  river_source: 'Explicit demo fixture — not live data',
  feed_timestamp_ist: 'Demo fixture — no provider timestamp',
};
