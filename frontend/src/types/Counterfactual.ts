export interface CounterfactualInputs {
  tide_offset_m: number; // e.g. -0.40 to +0.40
  rainfall_percent_change: number; // e.g. -20 to +20
  rainfall_offset_mm_hr?: number;
  storm_surge_offset_m: number; // e.g. -0.20 to +0.20
}

export interface CounterfactualScenario {
  zone_id: string;
  baseline: {
    tide_m: number;
    rainfall_rate_mm_hr: number;
    storm_surge_m: number;
    predicted_depth_m: number;
    depth_q10_m?: number;
    depth_q90_m?: number;
    risk_level: string;
    probability: number;
  };
  simulated: {
    tide_m: number;
    rainfall_rate_mm_hr: number;
    storm_surge_m: number;
    predicted_depth_m: number;
    depth_q10_m?: number;
    depth_q90_m?: number;
    risk_level: string;
    probability: number;
  };
  depth_delta_m: number;
  depth_q90_delta_m?: number;
  risk_shift: string;
  explanation: string;
}
