export interface ResponderActionItem {
  category: 'IMMEDIATE' | 'TRAFFIC CONTROL' | 'ROUTE MANAGEMENT' | 'CRITICAL FACILITY' | 'MONITORING';
  action: string;
  target_location: string;
  timing?: string;
  priority: 'HIGH' | 'URGENT' | 'STANDARD';
}

export interface ResponderBriefing {
  zone_id: string;
  zone_name: string;
  headline: string;
  risk_level: string;
  expected_onset: string;
  expected_peak: string;
  roads_affected_count: number;
  roads_closed_count: number;
  critical_facilities_at_risk_count: number;
  key_actions: string[];
  responder_actions: ResponderActionItem[];
  generated_timestamp: string;
}
