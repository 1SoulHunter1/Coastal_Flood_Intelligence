import React from 'react';
import type { EmergencyPriorityItem } from '../../types';
import { RiskBadge } from './RiskBadge';
import { ShieldCheck, Info } from 'lucide-react';

interface EmergencyPriorityTableProps {
  items: EmergencyPriorityItem[];
  onSelectZone?: (zoneId: string) => void;
  selectedZoneId?: string;
}

export const EmergencyPriorityTable: React.FC<EmergencyPriorityTableProps> = ({
  items,
  onSelectZone,
  selectedZoneId,
}) => {
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'IMMEDIATE':
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'URGENT':
        return 'bg-orange-50 text-orange-700 border-orange-200 font-bold';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      case 'MONITOR':
        return 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
      case 'LOW':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-200 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-red-50 text-red-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold font-mono text-slate-900 tracking-wide uppercase">
              EMERGENCY RESPONSE PRIORITY
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase font-bold">
              MODEL + EXPOSURE PRIORITY
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Rank</th>
                <th className="py-2.5 px-3 font-semibold">Zone</th>
                <th className="py-2.5 px-3 font-semibold">Risk</th>
                <th className="py-2.5 px-3 font-semibold">Exposure</th>
                <th className="py-2.5 px-3 font-semibold text-center">Critical Facilities</th>
                <th className="py-2.5 px-3 font-semibold text-right">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const isSelected = selectedZoneId?.toLowerCase() === item.zone_id?.toLowerCase();
                const priorityBadge = getPriorityBadgeClass(item.priority);

                return (
                  <tr
                    key={item.zone_id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectZone && onSelectZone(item.zone_id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (onSelectZone) onSelectZone(item.zone_id);
                      }
                    }}
                    title={`Focus ${item.zone_id} on Flood Map`}
                    className={`transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isSelected
                        ? 'bg-blue-50 font-semibold border-l-4 border-blue-600'
                        : 'hover:bg-blue-50/60'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 inline-flex items-center justify-center font-bold text-slate-700 text-[11px]">
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <span>{item.zone_id} — {item.zone_name}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <RiskBadge level={item.risk_level.toUpperCase() as any} showSuffix={false} />
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      <span className={item.exposure.toUpperCase() === 'VERY HIGH' ? 'text-red-700 font-bold' : item.exposure.toUpperCase() === 'HIGH' ? 'text-orange-700 font-semibold' : ''}>
                        {item.exposure}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-bold">
                        {item.critical_facilities}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] tracking-wider uppercase border ${priorityBadge}`}>
                        {item.priority}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rationale Explanation Box */}
      <div className="pt-3 mt-3 border-t border-slate-200 flex items-start gap-2 text-[11px] font-mono text-slate-600 bg-slate-50 p-3 rounded-md">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span>Weighted score: model probability and median depth, plus static population and facility counts. It is not the model probability or a live accessibility assessment. </span>
          <span className="font-semibold text-slate-700">This is NOT an official government ranking.</span>
        </div>
      </div>
    </div>
  );
};
