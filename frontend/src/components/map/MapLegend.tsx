import React from 'react';

export const MapLegend: React.FC = React.memo(() => {
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-300 rounded-lg p-3 text-xs font-mono select-none shadow-md text-slate-800 w-64 max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200">
        <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
          FLOOD RISK & ACCESS
        </span>
        <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
          MODEL ESTIMATE
        </span>
      </div>

      {/* Flood Risk Levels Grid */}
      <div className="mb-2">
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
          FLOOD RISK LEVEL
        </span>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-red-500/60 border border-red-600"></span>
            <span className="text-slate-700">Critical &gt;85%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-orange-500/60 border border-orange-600"></span>
            <span className="text-slate-700">High 65–85%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-400/60 border border-amber-500"></span>
            <span className="text-slate-700">Moderate 35–65%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500/60 border border-emerald-600"></span>
            <span className="text-slate-700">Low &lt;35%</span>
          </div>
        </div>
      </div>

      {/* Feature 1A: Road Access Status (0.30m rule) */}
      <div className="pt-2 border-t border-slate-200 mb-2">
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
          ROAD ACCESS STATUS
        </span>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-emerald-600 rounded-sm"></span>
            <span className="text-slate-700 font-medium">Open (&lt; 0.15 m)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-orange-500 rounded-sm"></span>
            <span className="text-slate-700 font-medium">At Risk (0.15–0.29 m)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-red-600 rounded-sm border-t border-b border-dashed border-red-800"></span>
            <span className="text-red-700 font-bold">Closed (&ge; 0.30 m)</span>
          </div>
        </div>
      </div>

      {/* Feature 9: Emergency Routing Lines */}
      <div className="pt-2 border-t border-slate-200 mb-2">
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
          EMERGENCY ROUTING
        </span>
        <div className="space-y-1 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 bg-blue-600 rounded-sm"></span>
            <span className="text-blue-900 font-bold">Alternative Route (Open)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 bg-red-500/80 rounded-sm border-dashed"></span>
            <span className="text-red-700 font-semibold">Primary Corridor (Blocked)</span>
          </div>
        </div>
      </div>

      {/* Critical Facilities */}
      <div className="pt-2 border-t border-slate-200">
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
          FACILITIES & HYDROLOGY
        </span>
        <div className="grid grid-cols-2 gap-1 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white"></span>
            <span className="text-slate-700">Hospital</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white"></span>
            <span className="text-slate-700">Shelter</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-cyan-500 rounded-sm"></span>
            <span className="text-slate-700">River/Estuary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-amber-500 rounded-sm"></span>
            <span className="text-slate-700">NH-66</span>
          </div>
        </div>
      </div>
    </div>
  );
});
