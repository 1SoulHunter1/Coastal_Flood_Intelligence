import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import type { ForecastPoint } from '../../types';
import { TrendingUp, Info } from 'lucide-react';

interface ForecastChartProps {
  data: ForecastPoint[];
  zoneTitle?: string;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ data, zoneTitle = 'ZONE 03' }) => {
  const onsetPoint = data.find((point) => point.is_onset);
  const peakPoint = data.find((point) => point.is_peak);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold font-mono text-slate-900 tracking-wide uppercase">
            24-HOUR FLOOD FORECAST — {zoneTitle}
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase font-semibold">
            SURROGATE ESTIMATE
          </span>
        </div>

        {/* Milestone Markers Indicators */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          {onsetPoint && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>MODEL THRESHOLD ({onsetPoint.time_label} / {onsetPoint.timestamp})</span>
            </div>
          )}
          {peakPoint && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-50 border border-red-300 text-red-800 font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>MODEL PEAK ({peakPoint.time_label} / {peakPoint.timestamp})</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 15, right: 25, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="probGradientLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EA580C" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#EA580C" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />

            <XAxis
              dataKey="time_label"
              stroke="#64748B"
              tick={{ fill: '#475569', fontSize: 11 }}
              tickLine={{ stroke: '#CBD5E1' }}
            />

            {/* Left Y Axis for Probability (%) */}
            <YAxis
              yAxisId="left"
              domain={[0, 100]}
              stroke="#EA580C"
              tick={{ fill: '#C2410C', fontSize: 10 }}
              tickLine={{ stroke: '#FED7AA' }}
              label={{
                value: 'Prob (%)',
                angle: -90,
                position: 'insideLeft',
                fill: '#C2410C',
                fontSize: 10
              }}
            />

            {/* Right Y Axis for Rainfall & Tide */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              stroke="#0284C7"
              tick={{ fill: '#0369A1', fontSize: 10 }}
              tickLine={{ stroke: '#BAE6FD' }}
              label={{
                value: 'Rain (mm) / Tide (x10)',
                angle: 90,
                position: 'insideRight',
                fill: '#0369A1',
                fontSize: 10
              }}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as ForecastPoint;
                  return (
                    <div className="bg-white border border-slate-300 p-3 rounded-md shadow-lg text-xs font-mono text-slate-800">
                      <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5 flex justify-between gap-4">
                        <span>TIMELINE: {label}</span>
                        <span className="text-blue-600">{pt.timestamp}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-orange-700 font-semibold">Flood Probability:</span>
                          <span className="font-bold text-slate-900">{pt.flood_probability}%</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-sky-700 font-semibold">Rainfall Rate:</span>
                          <span className="text-slate-900">{pt.rainfall_rate_mm_hr} mm/hr</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-emerald-700 font-semibold">Tide Level:</span>
                          <span className="text-slate-900">+{pt.tide_level_m} m MSL</span>
                        </div>
                        {pt.notes && (
                          <div className="pt-1 mt-1 border-t border-slate-100 text-[10px] text-amber-800 font-medium">
                            {pt.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend
              wrapperStyle={{ paddingTop: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
            />

            {/* Reference Markers */}
            {onsetPoint && (
              <ReferenceLine
                x={onsetPoint.time_label}
                yAxisId="left"
                stroke="#D97706"
                strokeDasharray="4 3"
                strokeWidth={1.8}
                label={{
                  value: `THRESHOLD ${onsetPoint.timestamp}`,
                  position: 'top',
                  fill: '#B45309',
                  fontSize: 10,
                  fontWeight: 'bold'
                }}
              />
            )}
            {peakPoint && (
              <ReferenceLine
                x={peakPoint.time_label}
                yAxisId="left"
                stroke="#DC2626"
                strokeDasharray="4 3"
                strokeWidth={1.8}
                label={{
                  value: `PEAK ${peakPoint.timestamp}`,
                  position: 'top',
                  fill: '#B91C1C',
                  fontSize: 10,
                  fontWeight: 'bold'
                }}
              />
            )}

            {/* Rainfall Bars */}
            <Bar
              yAxisId="right"
              dataKey="rainfall_rate_mm_hr"
              name="Rainfall (mm/hr)"
              fill="#0284C7"
              opacity={0.65}
              radius={[3, 3, 0, 0]}
            />

            {/* Flood Probability Area */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="flood_probability"
              name="Flood Probability (%)"
              stroke="#EA580C"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#probGradientLight)"
            />

            {/* Tide Level Line (scaled x10 for clear visual comparison) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={(d: ForecastPoint) => d.tide_level_m * 10}
              name="Tide Level (x10 m)"
              stroke="#16A34A"
              strokeWidth={2}
              dot={{ r: 3, fill: '#16A34A' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          Surrogate estimate driven by weather and marine provider forecasts; not validated against observed flood events
        </span>
        <span className="text-slate-500">Interval: 3-hour timesteps</span>
      </div>
    </div>
  );
};
