import type { ZoneFloodDepth } from '../../types/FloodDepth';

export const demoZoneFloodDepths: Record<string, ZoneFloodDepth> = {
  'Zone 03': {
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    baseline_depth_m: 0.35,
    max_depth_m: 0.65,
    mean_depth_m: 0.28,
    critical_depth_threshold_m: 0.30,
    area_inundated_sq_km: 1.42,
    depth_polygons: [
      // Primary deep inundation polygon along Gurupura river bend
      [
        [12.9230, 74.8250],
        [12.9270, 74.8290],
        [12.9310, 74.8320],
        [12.9280, 74.8360],
        [12.9240, 74.8320],
        [12.9210, 74.8270]
      ]
    ]
  },
  'Zone 05': {
    zone_id: 'Zone 05',
    zone_name: 'Bunder',
    baseline_depth_m: 0.42,
    max_depth_m: 0.78,
    mean_depth_m: 0.34,
    critical_depth_threshold_m: 0.30,
    area_inundated_sq_km: 1.15
  },
  'Zone 01': {
    zone_id: 'Zone 01',
    zone_name: 'Ullal',
    baseline_depth_m: 0.24,
    max_depth_m: 0.45,
    mean_depth_m: 0.18,
    critical_depth_threshold_m: 0.30,
    area_inundated_sq_km: 0.88
  },
  'Zone 02': {
    zone_id: 'Zone 02',
    zone_name: 'Bolar',
    baseline_depth_m: 0.26,
    max_depth_m: 0.48,
    mean_depth_m: 0.20,
    critical_depth_threshold_m: 0.30,
    area_inundated_sq_km: 0.72
  },
  'Zone 04': {
    zone_id: 'Zone 04',
    zone_name: 'Hampankatta',
    baseline_depth_m: 0.18,
    max_depth_m: 0.32,
    mean_depth_m: 0.12,
    critical_depth_threshold_m: 0.30,
    area_inundated_sq_km: 0.45
  },
  'Zone 06': {
    zone_id: 'Zone 06',
    zone_name: 'Kankanady',
    baseline_depth_m: 0.08,
    max_depth_m: 0.18,
    mean_depth_m: 0.05,
    critical_depth_threshold_m: 0.30,
    area_inundated_sq_km: 0.22
  },
  'Zone 07': {
    zone_id: 'Zone 07',
    zone_name: 'Deralakatte',
    baseline_depth_m: 0.04,
    max_depth_m: 0.10,
    mean_depth_m: 0.02,
    critical_depth_threshold_m: 0.30,
    area_inundated_sq_km: 0.08
  }
};

export const getFloodDepthForZone = (zoneId: string): ZoneFloodDepth => {
  return demoZoneFloodDepths[zoneId] || demoZoneFloodDepths['Zone 03'];
};
