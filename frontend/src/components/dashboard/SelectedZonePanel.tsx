import React from 'react';
import type { ZoneData } from '../../types';
import { RiskBadge } from './RiskBadge';
import {
  ArrowRight,
  Building,
  Car,
  ShieldAlert,
  Clock,
  AlertCircle,
  Users,
  Waves,
  Navigation,
  Sliders,
  FileText,
  Home
} from 'lucide-react';
import { formatNumber } from '../../utils';

interface SelectedZonePanelProps {
  zone: ZoneData;
  onViewFullAnalysis: (zoneId: string, targetTab?: string) => void;
  onViewImpact?: (zoneId: string) => void;
  onViewRoute?: (zoneId: string) => void;
  onWhatIf?: (zoneId: string) => void;
  onResponderBrief?: (zoneId: string) => void;
}

export const SelectedZonePanel: React.FC<SelectedZonePanelProps> = ({
  zone,
  onViewFullAnalysis,
  onViewImpact,
  onViewRoute,
  onWhatIf,
  onResponderBrief
}) => {
  const population = zone.estimated_population || zone.population_at_risk || 12400;
  const buildings = zone.affected_buildings || zone.estimated_impact?.buildings || 1240;
  const roads = zone.affected_roads || zone.estimated_impact?.road_segments || 7;
  const facilities = zone.critical_facilities || zone.estimated_impact?.critical_facilities || 3;

  // Study-area aware metrics
  const predictedDepth = zone.predicted_depth_m == null
    ? 'Unavailable'
    : `${zone.predicted_depth_m.toFixed(2)} m`;
  const roadAccessText = zone.road_access_status || 'Unavailable';
  const facilityAccessText = zone.facility_access_status || 'Unavailable';
  const nearestShelterText = zone.nearest_shelter_text || 'Unavailable';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between shadow-sm font-mono text-xs">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] tracking-wider text-slate-500 uppercase block font-semibold">
              SELECTED ZONE
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-wide">
              {zone.zone_id} — {zone.zone_name.toUpperCase()}
            </h2>
          </div>
          <RiskBadge level={zone.risk_level} />
        </div>

        {/* Probability & Severity Metric Card + Flood Depth (Feature 12) */}
        <div className="my-3 bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-extrabold text-orange-600">
                {zone.flood_probability}%
              </span>
              <span className="text-[11px] text-slate-600 block font-medium">
                Flood Probability
              </span>
            </div>

            <div className="text-center px-3 border-x border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">
                Flood Depth
              </span>
              <span className="text-sm font-extrabold text-blue-700 flex items-center gap-1 justify-center">
                <Waves className="w-3.5 h-3.5 text-blue-600" />
                <span>{predictedDepth}</span>
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">
                Severity
              </span>
              <span className="text-sm font-bold text-red-600 uppercase">
                {zone.severity}
              </span>
            </div>
          </div>
        </div>

        {/* Timing Information */}
        <div className="grid grid-cols-2 gap-2 my-2.5 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-md p-2">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-medium">
              <Clock className="w-3 h-3 text-blue-600" />
              <span>Expected Onset</span>
            </div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              {zone.expected_onset}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-md p-2">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-medium">
              <AlertCircle className="w-3 h-3 text-red-600" />
              <span>Expected Peak</span>
            </div>
            <div className="text-xs font-bold text-red-600 mt-0.5">
              {zone.expected_peak}
            </div>
          </div>
        </div>

        {/* Feature 12 Advanced Access & Routing Indicators */}
        <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded-md my-2.5 space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Road Access Status:</span>
            <span className="font-bold text-red-700">{roadAccessText}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Facility Ingress/Egress:</span>
            <span className="font-semibold text-slate-900">{facilityAccessText}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-blue-100">
            <span className="text-slate-600 flex items-center gap-1">
              <Home className="w-3 h-3 text-emerald-600" />
              <span>Nearest Dry Shelter:</span>
            </span>
            <span className="font-bold text-emerald-800">{nearestShelterText}</span>
          </div>
        </div>

        {/* Estimated Impact Box */}
        <div className="my-2.5">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            ESTIMATED IMPACT
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-600 flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-600" />
                <span>Pop:</span>
              </span>
              <span className="font-bold text-slate-900">{formatNumber(population)}</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-600 flex items-center gap-1">
                <Building className="w-3 h-3 text-blue-600" />
                <span>Bldg:</span>
              </span>
              <span className="font-bold text-slate-900">{formatNumber(buildings)}</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-600 flex items-center gap-1">
                <Car className="w-3 h-3 text-amber-600" />
                <span>Roads:</span>
              </span>
              <span className="font-bold text-slate-900">{roads}</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-600 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-red-600" />
                <span>Fac:</span>
              </span>
              <span className="font-bold text-red-600">{facilities}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 12 Action Buttons Grid */}
      <div className="pt-2 border-t border-slate-200 space-y-2 mt-1">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => (onViewImpact ? onViewImpact(zone.zone_id) : onViewFullAnalysis(zone.zone_id, 'impact'))}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] border border-slate-300 transition-colors uppercase cursor-pointer"
          >
            <Car className="w-3 h-3 text-blue-600" />
            <span>VIEW IMPACT</span>
          </button>
          <button
            type="button"
            onClick={() => (onViewRoute ? onViewRoute(zone.zone_id) : onViewFullAnalysis(zone.zone_id, 'access'))}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] border border-slate-300 transition-colors uppercase cursor-pointer"
          >
            <Navigation className="w-3 h-3 text-blue-600" />
            <span>VIEW ROUTE</span>
          </button>
          <button
            type="button"
            onClick={() => (onWhatIf ? onWhatIf(zone.zone_id) : onViewFullAnalysis(zone.zone_id, 'whatif'))}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] border border-slate-300 transition-colors uppercase cursor-pointer"
          >
            <Sliders className="w-3 h-3 text-amber-600" />
            <span>WHAT-IF ANALYSIS</span>
          </button>
          <button
            type="button"
            onClick={() => (onResponderBrief ? onResponderBrief(zone.zone_id) : onViewFullAnalysis(zone.zone_id, 'brief'))}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] border border-slate-300 transition-colors uppercase cursor-pointer"
          >
            <FileText className="w-3 h-3 text-red-600" />
            <span>RESPONDER BRIEF</span>
          </button>
        </div>

        {/* Primary View Full Zone Analysis */}
        <button
          type="button"
          onClick={() => onViewFullAnalysis(zone.zone_id)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] tracking-wider transition-colors shadow-2xs uppercase cursor-pointer"
        >
          <span>VIEW FULL ZONE ANALYSIS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
