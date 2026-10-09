import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  stationOrSource?: string;
  value: string;
  unit?: string;
  subValue?: string;
  subLabel?: string;
  statusText?: string;
  statusVariant?: 'rising' | 'high' | 'moderate' | 'neutral' | 'critical';
  icon: LucideIcon;
  extraDetail?: string;
  sparklinePoints?: number[];
  sparklineColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  stationOrSource,
  value,
  unit,
  subValue,
  subLabel,
  statusText,
  statusVariant = 'neutral',
  icon: Icon,
  extraDetail,
  sparklinePoints,
  sparklineColor = '#2563EB'
}) => {
  let statusBadgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  if (statusVariant === 'rising' || statusVariant === 'critical') {
    statusBadgeStyle = 'bg-red-50 text-red-700 border-red-200 font-bold';
  } else if (statusVariant === 'high') {
    statusBadgeStyle = 'bg-orange-50 text-orange-700 border-orange-200 font-bold';
  } else if (statusVariant === 'moderate') {
    statusBadgeStyle = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
  }

  // Generate subtle sparkline SVG path if provided
  let sparklinePath = '';
  if (sparklinePoints && sparklinePoints.length > 1) {
    const min = Math.min(...sparklinePoints);
    const max = Math.max(...sparklinePoints);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    const step = width / (sparklinePoints.length - 1);
    
    sparklinePath = sparklinePoints.map((pt, i) => {
      const x = i * step;
      const y = height - ((pt - min) / range) * (height - 6) - 3;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 relative flex flex-col justify-between shadow-sm hover:border-blue-400 hover:shadow-md transition-all">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 mt-0.5">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-800 uppercase block leading-tight">
              {title}
            </span>
            {stationOrSource && (
              <span className="text-[10px] font-mono text-slate-500 font-medium block mt-0.5">
                {stationOrSource}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Main Metric Row with subtle sparkline */}
      <div className="my-2 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold font-mono tracking-tight text-slate-900">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-mono text-slate-500 font-medium">
              {unit}
            </span>
          )}
        </div>

        {/* Subtle mini sparkline */}
        {sparklinePath && (
          <div className="opacity-80">
            <svg width="80" height="24" className="overflow-visible">
              <path
                d={sparklinePath}
                fill="none"
                stroke={sparklineColor}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Footer / Submetrics */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
        <div>
          {subLabel && subValue ? (
            <div>
              <span className="text-slate-500 text-[11px] block">{subLabel}</span>
              <span className="text-slate-800 font-semibold">{subValue}</span>
            </div>
          ) : null}
          {extraDetail && (
            <span className="text-[10px] text-slate-500 block">{extraDetail}</span>
          )}
        </div>

        {statusText && (
          <span className={`px-2 py-0.5 rounded text-[10px] uppercase border tracking-wider ${statusBadgeStyle}`}>
            {statusText}
          </span>
        )}
      </div>
    </div>
  );
};
