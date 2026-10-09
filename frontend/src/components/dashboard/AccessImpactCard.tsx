import React from 'react';
import { ShieldAlert, AlertTriangle, Hospital, Home, Navigation, CheckCircle2 } from 'lucide-react';
import type { SystemAccessSummary } from '../../types/Accessibility';

interface AccessImpactCardProps {
  summary: SystemAccessSummary;
  onViewRouteDetails?: () => void;
  demoMode?: boolean;
}

export const AccessImpactCard: React.FC<AccessImpactCardProps> = ({
  summary,
  onViewRouteDetails,
  demoMode = false
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm font-mono text-xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-red-50 text-red-700">
              <Navigation className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              ACCESS & IMPACT
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            {demoMode ? 'DEMO MODEL PROXY • STATIC GIS' : 'MODELLED IMPACT • STATIC GIS BASELINE'}
          </span>
        </div>

        {/* 5 Compact Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 my-3">
          {/* Roads Closed */}
          <div className="bg-red-50/70 border border-red-200 rounded-md p-2.5">
            <div className="flex items-center justify-between text-red-700 mb-1">
              <span className="text-[11px] font-bold">Roads Closed</span>
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-extrabold text-red-700">
              {summary.roads_closed_count}
            </div>
            <span className="text-[9px] text-red-600 block mt-0.5">≥0.30m threshold</span>
          </div>

          {/* Roads At Risk */}
          <div className="bg-orange-50/70 border border-orange-200 rounded-md p-2.5">
            <div className="flex items-center justify-between text-orange-700 mb-1">
              <span className="text-[11px] font-bold">Roads At Risk</span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-extrabold text-orange-700">
              {summary.roads_at_risk_count}
            </div>
            <span className="text-[9px] text-orange-600 block mt-0.5">0.15 - 0.29m depth</span>
          </div>

          {/* Hospitals Accessible */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
            <div className="flex items-center justify-between text-slate-700 mb-1">
              <span className="text-[11px] font-bold">Hospitals</span>
              <Hospital className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {summary.hospitals_accessible_ratio}
            </div>
            <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5">
              {demoMode ? 'Not verified' : 'Accessible'}
            </span>
          </div>

          {/* Shelters Reachable */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
            <div className="flex items-center justify-between text-slate-700 mb-1">
              <span className="text-[11px] font-bold">Shelters</span>
              <Home className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {summary.shelters_reachable_ratio}
            </div>
            <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5">
              {demoMode ? 'Not verified' : 'Dry & Reachable'}
            </span>
          </div>

          {/* Critical Facilities */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
            <div className="flex items-center justify-between text-slate-700 mb-1">
              <span className="text-[11px] font-bold">Facilities</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {summary.critical_facilities_count}
            </div>
            <span className="text-[9px] text-amber-700 font-semibold block mt-0.5">
              {demoMode ? 'Exposure estimate' : 'At Risk / Surveyed'}
            </span>
          </div>
        </div>

        {/* Operational Access Status Headline */}
        <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-md flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
            <div>
              <span className="font-bold text-[11px] uppercase mr-1">ACCESS STATUS:</span>
              <span className="font-medium text-slate-800">{summary.access_status_headline}</span>
            </div>
          </div>
          {onViewRouteDetails && (
            <button
              type="button"
              onClick={onViewRouteDetails}
              className="shrink-0 px-2.5 py-1 text-[10px] font-bold bg-white text-blue-700 border border-blue-300 rounded hover:bg-blue-50 transition-colors uppercase cursor-pointer"
            >
              ROUTING DETAILS
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
