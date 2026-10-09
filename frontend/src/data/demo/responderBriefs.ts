import type { ResponderBriefing } from '../../types/ResponderBrief';

export const demoResponderBriefings: Record<string, ResponderBriefing> = {
  'Zone 03': {
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    headline: 'High flood risk across low-lying Gurupura river approach',
    risk_level: 'HIGH',
    expected_onset: '18:40 IST',
    expected_peak: '22:15 IST',
    roads_affected_count: 7,
    roads_closed_count: 2,
    critical_facilities_at_risk_count: 3,
    key_actions: [
      'Prioritize Zone 03 response deployment.',
      'Inspect closed road segments on Main Road 760 & NH-66 approach.',
      'Verify critical facility access and power status at 110kV Substation.',
      'Prepare alternative routes via Bendoorwell elevated corridor.',
      'Monitor incoming spring tide peak through 22:15 IST.'
    ],
    responder_actions: [
      {
        category: 'IMMEDIATE',
        action: 'Deploy temporary demountable flood barriers',
        target_location: 'Kottara Chowki / NH-66 Underpass',
        timing: 'Before 13:00 IST',
        priority: 'URGENT'
      },
      {
        category: 'TRAFFIC CONTROL',
        action: 'Divert heavy vehicular transit',
        target_location: 'Main Road 760 (Kulur Industrial Corridor)',
        timing: 'Starting 13:30 IST',
        priority: 'HIGH'
      },
      {
        category: 'ROUTE MANAGEMENT',
        action: 'Activate emergency ambulance detour',
        target_location: 'Bendoorwell Elevated Corridor (+8 min detour)',
        timing: 'Active Now',
        priority: 'HIGH'
      },
      {
        category: 'CRITICAL FACILITY',
        action: 'Verify generator and dry ramp access',
        target_location: 'Wenlock Hospital Emergency Wing',
        timing: 'Before 14:00 IST',
        priority: 'URGENT'
      },
      {
        category: 'MONITORING',
        action: 'Track astronomical tide height & Netravati discharge',
        target_location: 'INCOIS Panambur Gauge / CWC Netravati',
        timing: 'Continuous 15-min intervals',
        priority: 'STANDARD'
      }
    ],
    generated_timestamp: '17:30 IST'
  },
  'Zone 05': {
    zone_id: 'Zone 05',
    zone_name: 'Bunder',
    headline: 'Tidal surge back-pressure affecting port wharves',
    risk_level: 'CRITICAL',
    expected_onset: '19:15 IST',
    expected_peak: '22:45 IST',
    roads_affected_count: 5,
    roads_closed_count: 1,
    critical_facilities_at_risk_count: 2,
    key_actions: [
      'Prioritize evacuation of coastal fishing settlements.',
      'Inspect flap gates at Old Port Marine Fishery Wharf.',
      'Close Bunder Marine Wharf road to civilian traffic.',
      'Stage rescue inflatable craft at Pandeshwar Fire Station.'
    ],
    responder_actions: [
      {
        category: 'IMMEDIATE',
        action: 'Stage flood evacuation rescue craft',
        target_location: 'Bunder Marine Fishery Wharf',
        timing: 'Immediate',
        priority: 'URGENT'
      },
      {
        category: 'TRAFFIC CONTROL',
        action: 'Close Old Port access lane',
        target_location: 'Bunder Approach Road',
        timing: '19:00 IST',
        priority: 'HIGH'
      }
    ],
    generated_timestamp: '17:30 IST'
  }
};

export const getResponderBriefingForZone = (zoneId: string): ResponderBriefing => {
  return demoResponderBriefings[zoneId] || demoResponderBriefings['Zone 03'];
};
