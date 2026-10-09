import React from 'react';
import type { ZoneData } from '../../types';
import { RiskBadge } from '../dashboard/RiskBadge';

interface ZonePopupProps {
  zone: ZoneData;
  onSelectZone?: (zone: ZoneData) => void;
}

export const ZonePopup: React.FC<ZonePopupProps> = React.memo(({ zone, onSelectZone }) => {
  return (
    <div className="font-mono text-xs text-slate-900 min-w-56 p-1">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
        <span className="font-bold text-sm tracking-wide text-slate-900">
          {zone.zone_id} — {zone.zone_name.toUpperCase()}
        </span>
        <RiskBadge level={zone.risk_level} />
      </div>

      {/* Probability and Severity */}
      <div className="grid grid-cols-2 gap-2 my-2 bg-slate-50 p-2.5 rounded-md border border-slate-200">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-medium">Flood Probability</span>
          <span className="text-base font-extrabold text-orange-600">
            {zone.flood_probability}%
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-medium">Severity</span>
          <span className="text-sm font-bold text-red-600">
            {zone.severity}
          </span>
        </div>
      </div>

      {/* Onset and Peak */}
      <div className="space-y-1.5 my-2 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Expected Onset:</span>
          <span className="text-slate-900 font-bold">{zone.expected_onset}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Expected Peak:</span>
          <span className="text-red-600 font-bold">{zone.expected_peak}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Avg Elevation:</span>
          <span className="text-slate-700">{zone.elevation_avg_m} m MSL</span>
        </div>
      </div>

      {/* Estimated Impact */}
      <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-600 flex justify-between font-semibold">
        <span>Impact: {zone.affected_buildings || zone.estimated_impact?.buildings} Bldgs</span>
        <span>{zone.critical_facilities} Critical Fac.</span>
      </div>

      {onSelectZone && (
        <button
          onClick={() => onSelectZone(zone)}
          className="mt-2.5 w-full py-1.5 text-center bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold tracking-wider transition-colors uppercase shadow-xs cursor-pointer"
        >
          Select Zone Intelligence
        </button>
      )}
    </div>
  );
});
