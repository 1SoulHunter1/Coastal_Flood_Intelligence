import type { ForecastPoint } from '../../types';

export const demoForecastTimeline: ForecastPoint[] = [
  {
    time_label: 'NOW',
    timestamp: '17:30 IST',
    flood_probability: 45,
    rainfall_rate_mm_hr: 48.5,
    tide_level_m: 1.95,
    storm_surge_m: 0.42,
    notes: 'Current observation baseline. Active monitoring underway.'
  },
  {
    time_label: '+3H',
    timestamp: '20:30 IST',
    flood_probability: 72,
    rainfall_rate_mm_hr: 62.0,
    tide_level_m: 2.15,
    storm_surge_m: 0.55,
    is_onset: true,
    notes: 'EXPECTED ONSET (18:40 - 20:30 IST). Sluice back-pressure and initial culvert overflow in Kulur.'
  },
  {
    time_label: '+6H',
    timestamp: '23:30 IST',
    flood_probability: 88,
    rainfall_rate_mm_hr: 78.4,
    tide_level_m: 2.38,
    storm_surge_m: 0.68,
    is_peak: true,
    notes: 'EXPECTED PEAK (22:15 - 23:30 IST). Coinciding maximum astronomical spring tide and upstream Netravati surge.'
  },
  {
    time_label: '+9H',
    timestamp: '02:30 IST',
    flood_probability: 80,
    rainfall_rate_mm_hr: 54.2,
    tide_level_m: 1.80,
    storm_surge_m: 0.50,
    notes: 'Persistent standing water in low-lying corridors. Tidal recession begins.'
  },
  {
    time_label: '+12H',
    timestamp: '05:30 IST',
    flood_probability: 63,
    rainfall_rate_mm_hr: 38.0,
    tide_level_m: 1.25,
    storm_surge_m: 0.35,
    notes: 'Moderate runoff clearance along arterial roads during ebb tide cycle.'
  },
  {
    time_label: '+18H',
    timestamp: '11:30 IST',
    flood_probability: 42,
    rainfall_rate_mm_hr: 22.5,
    tide_level_m: 1.45,
    storm_surge_m: 0.22,
    notes: 'Post-peak recovery phase. Secondary mid-day tide manageable.'
  },
  {
    time_label: '+24H',
    timestamp: '17:30 IST',
    flood_probability: 28,
    rainfall_rate_mm_hr: 14.0,
    tide_level_m: 1.10,
    storm_surge_m: 0.15,
    notes: 'Return to baseline drainage conditions expected.'
  }
];
