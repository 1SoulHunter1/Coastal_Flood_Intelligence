export interface ZoneFloodDepth {
  zone_id: string;
  zone_name: string;
  baseline_depth_m: number;
  max_depth_m: number;
  mean_depth_m: number;
  depth_polygons?: [number, number][][];
  critical_depth_threshold_m: number;
  area_inundated_sq_km: number;
}
