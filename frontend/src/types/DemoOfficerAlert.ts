export interface DemoZonePrediction {
  zone_id: string;
  zone_name: string;
  flood_probability: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  predicted_depth_m: number;
  depth_q10_m: number;
  depth_q50_m: number;
  depth_q90_m: number;
}

export interface DemoOfficerAlert {
  id: string;
  recipient: string;
  study_area: string;
  zone_id: string;
  zone_name: string;
  p_flood: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  q50_depth_m: number;
  message: string;
  demo_only: boolean;
  public_broadcast_sent: false;
  status: string;
  channel: string;
  external_email_sent: boolean;
  created_at_utc: string;
  zone?: DemoZonePrediction;
  zones?: DemoZonePrediction[];
  synthetic_inputs?: Record<string, number>;
}
