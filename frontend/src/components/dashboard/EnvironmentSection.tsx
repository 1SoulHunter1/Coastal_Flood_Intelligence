import React from 'react';
import { CloudRain, Waves, Wind, Activity } from 'lucide-react';
import { KpiCard } from './KpiCard';
import type { EnvironmentConditions } from '../../types';

interface EnvironmentSectionProps {
  conditions: EnvironmentConditions;
}

export const EnvironmentSection: React.FC<EnvironmentSectionProps> = ({ conditions }) => {
  const rainfallStatusVariant = conditions.rainfall_status === 'RISING'
    ? 'rising'
    : conditions.rainfall_status === 'RECEDING'
      ? 'moderate'
      : 'neutral';

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="RAINFALL (LAST HOUR)"
          stationOrSource={conditions.weather_source}
          value={conditions.observed_rainfall_rate_mm_hr.toFixed(1)}
          unit="mm"
          subLabel="24h Total:"
          subValue={`${conditions.rainfall_24h_total_mm.toFixed(1)} mm`}
          statusText={conditions.rainfall_status}
          statusVariant={rainfallStatusVariant}
          icon={CloudRain}
        />

        <KpiCard
          title="TIDE LEVEL (MSL)"
          stationOrSource={conditions.marine_source}
          value={`+${conditions.tide_level_m.toFixed(2)}`}
          unit="m"
          statusText={conditions.tide_status}
          statusVariant="neutral"
          icon={Waves}
        />

        <KpiCard
          title="SURGE ESTIMATE & WIND"
          stationOrSource={`${conditions.weather_source} - surge derived from pressure/wind`}
          value={`+${conditions.storm_surge_m.toFixed(2)}`}
          unit="m surge"
          subLabel={`Wind: ${conditions.wind_speed_kmh} km/h`}
          subValue={`Direction: ${conditions.wind_direction}`}
          statusText="DERIVED ESTIMATE"
          statusVariant="neutral"
          icon={Wind}
        />

        <KpiCard
          title="RIVER DISCHARGE GRID"
          stationOrSource={conditions.river_source}
          value={conditions.river_discharge_m3s.toLocaleString()}
          unit="m³/s"
          subLabel="Provider product"
          subValue="Daily grid forecast, not a gauge"
          icon={Activity}
        />
      </div>
      <p className="mt-2 text-right text-[10px] font-mono text-slate-500">
        Provider time: {conditions.feed_timestamp_ist}. Weather/marine are nearest-grid estimates, not station observations; tide datum conversion is not configured.
      </p>
    </>
  );
};
