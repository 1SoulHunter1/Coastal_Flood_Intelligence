import type { AlertItem } from '../../types';

export const demoActiveAlerts: AlertItem[] = [
  {
    id: 'ALT-101',
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    risk_level: 'HIGH',
    flood_probability: 82,
    expected_onset: '18:40 IST',
    expected_peak: '22:15 IST',
    headline: 'Flood risk increasing.',
    drivers: 'Heavy rainfall + high tide',
    action_summary: 'Pre-position SDRF boat team at Kulur bridge. Standby auxiliary pumps at MESCOM substation.',
    issued_at: '17:15 IST',
    evacuation_advised: true
  },
  {
    id: 'ALT-102',
    zone_id: 'Zone 05',
    zone_name: 'Bunder',
    risk_level: 'MODERATE',
    flood_probability: 78,
    expected_onset: '20:10 IST',
    expected_peak: '23:30 IST',
    headline: 'Tidal wharf overflow advisory.',
    drivers: 'Tide + low elevation',
    action_summary: 'Secure low-level fish landing platforms. Close flap sluice 2 to impede estuarine backflow.',
    issued_at: '17:20 IST',
    evacuation_advised: false
  },
  {
    id: 'ALT-103',
    zone_id: 'Zone 02',
    zone_name: 'Bolar',
    risk_level: 'MODERATE',
    flood_probability: 64,
    expected_onset: '21:00 IST',
    expected_peak: '00:15 IST',
    headline: 'Confluence backflow watch.',
    drivers: 'Rainfall + drainage congestion',
    action_summary: 'Halt passenger ferry operations across Gurupura-Netravati junction starting 18:30 IST.',
    issued_at: '16:50 IST',
    evacuation_advised: false
  },
  {
    id: 'ALT-104',
    zone_id: 'Zone 07',
    zone_name: 'Deralakatte',
    risk_level: 'INFO',
    flood_probability: 18,
    expected_onset: 'Standby',
    expected_peak: 'N/A',
    headline: 'Monitoring conditions.',
    drivers: 'Normal watershed dispersion',
    action_summary: 'Designated secondary reception and safe medical evacuation staging point.',
    issued_at: '16:30 IST',
    evacuation_advised: false
  }
];
