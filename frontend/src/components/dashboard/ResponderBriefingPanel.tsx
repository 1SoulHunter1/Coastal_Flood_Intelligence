import React from 'react';
import type { ResponderBriefing } from '../../types/ResponderBrief';
import { ShieldCheck, Clock, MapPin, Car, Hospital, CheckCircle, AlertOctagon } from 'lucide-react';

interface ResponderBriefingPanelProps {
  briefing: ResponderBriefing;
  onFocusLocation?: (loc: string) => void;
}

export const ResponderBriefingPanel: React.FC<ResponderBriefingPanelProps> = ({
  briefing,
  onFocusLocation
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm font-mono text-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              RESPONDER BRIEFING — {briefing.zone_id} {briefing.zone_name.toUpperCase()}
            </h3>
            <span className="text-[10px] text-slate-500">
              Model-generated planning draft; routes and facility status are not live-verified
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[10px]">TIMESTAMP: {briefing.generated_timestamp}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            DRAFT • NOT AN OFFICIAL BRIEF
          </span>
        </div>
      </div>

      {/* 4 Pillars: Situation, Access, Critical Facilities, Key Actions (Feature 4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Pillar 1: Situation */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 font-bold text-slate-800 text-[11px] uppercase">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              SITUATION
            </span>
            <span className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 border border-orange-200 text-[10px]">
              {briefing.risk_level} RISK
            </span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-700">
            <div className="font-semibold text-slate-900">{briefing.zone_id} — {briefing.zone_name}</div>
            <div className="flex items-center gap-1 text-[10px] text-slate-600">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Expected onset: <strong className="text-slate-900">{briefing.expected_onset}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-600">
              <Clock className="w-3 h-3 text-red-600" />
              <span>Expected peak: <strong className="text-red-700">{briefing.expected_peak}</strong></span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Access */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 font-bold text-slate-800 text-[11px] uppercase">
            <span className="flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-red-600" />
              ACCESS
            </span>
            <span className={`px-1.5 py-0.2 rounded border text-[10px] ${
              briefing.roads_closed_count > 0
                ? 'bg-red-100 text-red-800 border-red-200'
                : briefing.roads_affected_count > 0
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}>
              {briefing.roads_closed_count > 0
                ? 'CLOSED ROUTES'
                : briefing.roads_affected_count > 0
                  ? 'AT RISK'
                  : 'NO CLOSURE FLAG'}
            </span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-700">
            <div>
              Affected road segments: <strong className="text-slate-900">{briefing.roads_affected_count}</strong>
            </div>
            <div className="text-red-700 font-bold">
              Closed road segments: {briefing.roads_closed_count} (&ge;0.30 m depth)
            </div>
            <div className="text-[10px] text-slate-500">
              Zone-level depth proxy only; road closure reports and route conditions are not connected.
            </div>
          </div>
        </div>

        {/* Pillar 3: Critical Facilities */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 font-bold text-slate-800 text-[11px] uppercase">
            <span className="flex items-center gap-1.5">
              <Hospital className="w-3.5 h-3.5 text-blue-600" />
              CRITICAL FACILITIES
            </span>
            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[10px]">
              VULNERABLE
            </span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-700">
            <div>
              Facilities at risk: <strong className="text-red-700">{briefing.critical_facilities_at_risk_count}</strong>
            </div>
            <div className="text-[10px] text-slate-600">
              Facility-specific sensors/status feeds are not connected.
            </div>
            <div className="text-[10px] text-amber-700 font-semibold">
              Treat as a modelled planning estimate; confirm status with facility operators.
            </div>
          </div>
        </div>
      </div>

      {/* Structured Action Protocol (Feature 4 Actions) */}
      <div className="bg-white border border-slate-200 rounded-md p-3.5">
        <div className="font-bold text-slate-900 uppercase text-[11px] mb-2 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>ORDER OF ACTION PROTOCOL:</span>
        </div>
        <ol className="space-y-1.5 font-mono text-[11px] text-slate-800">
          {briefing.key_actions.map((act, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{act}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Feature 5: Responder-Specific Actions Matrix */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-900 uppercase text-[11px] flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
            <span>RESPONDER-SPECIFIC DIRECTIVES</span>
          </span>
          <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            PLANNING SUGGESTIONS • VERIFY LOCALLY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {briefing.responder_actions.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-md p-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                    {item.category}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    item.priority === 'URGENT'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs my-1">{item.action}</h4>
                <div className="text-[10px] text-slate-600">
                  Target: <strong className="text-slate-800">{item.target_location}</strong>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-semibold">{item.timing || 'Immediate'}</span>
                {onFocusLocation && (
                  <button
                    type="button"
                    onClick={() => onFocusLocation(item.target_location)}
                    className="text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                  >
                    FOCUS MAP
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
