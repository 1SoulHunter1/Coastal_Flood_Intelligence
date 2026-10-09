export interface ForecastPoint {
  time_label: string; // 'NOW', '+3H', '+6H', etc.
  timestamp: string;
  flood_probability: number;
  rainfall_rate_mm_hr: number;
  tide_level_m: number;
  storm_surge_m?: number;
  is_onset?: boolean;
  is_peak?: boolean;
  notes?: string;
}
