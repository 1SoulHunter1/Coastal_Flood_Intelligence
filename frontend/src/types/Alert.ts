import type { RiskLevel } from './Zone';

export interface AlertItem {
  id: string;
  zone_id: string;
  zone_name: string;
  risk_level: RiskLevel | 'INFO';
  flood_probability?: number;
  expected_onset: string;
  expected_peak?: string;
  headline?: string;
  drivers: string;
  action_summary?: string;
  issued_at: string;
  evacuation_advised?: boolean;
}
