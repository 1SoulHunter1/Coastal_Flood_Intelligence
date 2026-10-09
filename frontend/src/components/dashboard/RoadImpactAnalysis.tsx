import React from 'react';
import { ROAD_CLOSURE_DEPTH_M } from '../../types/RoadImpact';
import type { RoadImpactItem } from '../../types/RoadImpact';
import { ShieldAlert, AlertTriangle, CheckCircle2, Car, Navigation } from 'lucide-react';

interface RoadImpactAnalysisProps {
  roads: RoadImpactItem[];
  selectedZoneId?: string;
  onSelectRoad?: (road: RoadImpactItem) => void;
}

export const RoadImpactAnalysis: React.FC<RoadImpactAnalysisProps> = ({
  roads,
  selectedZoneId,
  onSelectRoad
}) => {
  const filteredRoads = selectedZoneId
    ? roads.filter((r) => r.zone_id.toLowerCase() === selectedZoneId.toLowerCase())
    : roads;

  const displayList = filteredRoads.length > 0 ? filteredRoads : roads;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm font-mono text-xs">
      {/* Header */}
      <p className="mb-3 rounded border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
        Road depths use the associated zone's surrogate median depth as a proxy, not road sensors or verified closure reports.
      </p>
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-red-50 text-red-700">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              ROAD IMPACT ANALYSIS
            </h3>
            <span className="text-[10px] text-slate-500 block">
              Vehicle-access threshold: <strong className="text-red-700">≥{ROAD_CLOSURE_DEPTH_M.toFixed(2)} m</strong> = CLOSED
            </span>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
          MODELLED IMPACT • STATIC ROAD BASELINE
        </span>
      </div>

      {/* Threshold Rule Banner */}
      <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 mb-3 flex items-center justify-between text-[11px] text-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          <span><strong>Rule:</strong> Depth &ge; 0.30 m &rarr; <strong>CLOSED</strong> | 0.15–0.29 m &rarr; <strong>AT RISK</strong> | &lt; 0.15 m &rarr; <strong>OPEN</strong></span>
        </div>
        <span className="text-slate-500 text-[10px] hidden sm:inline">NETWORKX ATTRIBUTE</span>
      </div>

      {/* Roads Table / Card List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-[11px] bg-slate-50">
              <th className="py-2 px-3 font-semibold">Corridor / Segment</th>
              <th className="py-2 px-3 font-semibold">Zone</th>
              <th className="py-2 px-3 font-semibold text-center">Depth (m)</th>
              <th className="py-2 px-3 font-semibold text-center">Access Status</th>
              <th className="py-2 px-3 font-semibold">Operational Reason</th>
              <th className="py-2 px-3 font-semibold text-right">Detour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayList.map((road) => {
              const isClosed = road.status === 'CLOSED';
              const isAtRisk = road.status === 'AT_RISK';

              return (
                <tr
                  key={road.id}
                  onClick={() => onSelectRoad && onSelectRoad(road)}
                  className={`transition-colors ${
                    onSelectRoad ? 'hover:bg-slate-50 cursor-pointer' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{road.name}</div>
                    <div className="text-[10px] text-slate-500">{road.category} • ID: {road.id}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                    {road.zone_name}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`font-bold ${isClosed ? 'text-red-700' : isAtRisk ? 'text-orange-700' : 'text-slate-700'}`}>
                      {road.predicted_depth_m.toFixed(2)} m
                    </span>
                    <span className="text-[10px] text-slate-500 block">({road.water_depth_cm} cm)</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border tracking-wider ${
                        isClosed
                          ? 'bg-red-50 text-red-700 border-red-300'
                          : isAtRisk
                          ? 'bg-orange-50 text-orange-700 border-orange-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      }`}
                    >
                      {isClosed ? (
                        <ShieldAlert className="w-3 h-3" />
                      ) : isAtRisk ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      <span>{road.status}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-700 max-w-xs">
                    {road.closure_reason || 'Normal surface drainage conditions; navigable for civilian & emergency traffic.'}
                    {road.predicted_closure_time && (
                      <span className="block text-[10px] text-red-600 font-semibold mt-0.5">
                        Est. Closure: {road.predicted_closure_time}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {road.alternative_route_available ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        <Navigation className="w-3 h-3" />
                        <span>AVAILABLE</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">None</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
