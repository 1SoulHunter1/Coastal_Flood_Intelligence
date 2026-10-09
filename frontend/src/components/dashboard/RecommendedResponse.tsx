import React from 'react';
import { CheckSquare, AlertTriangle, ArrowRight } from 'lucide-react';
import { useStudyArea } from '../../context/StudyAreaContext';

interface RecommendedResponseProps {
  onFocusZone?: (zoneId: string) => void;
}

export const RecommendedResponse: React.FC<RecommendedResponseProps> = ({ onFocusZone }) => {
  const { studyArea, demoScenario } = useStudyArea();

  const steps = demoScenario
    ? (demoScenario.zones ?? (demoScenario.zone ? [demoScenario.zone] : []))
        .filter((zone) => zone.risk_level === 'HIGH' || zone.risk_level === 'CRITICAL')
        .sort((a, b) => b.flood_probability - a.flood_probability)
        .slice(0, 5)
        .map((zone, index) => ({
          num: index + 1,
          text: `Review ${zone.zone_id} — ${zone.zone_name}`,
          actionable: index === 0,
          zoneId: zone.zone_id,
          detail: `DEMO ONLY: ${zone.flood_probability}% surrogate probability, ${zone.predicted_depth_m.toFixed(2)} m median depth. Verify independently.`
        }))
    : studyArea === 'udupi' ? [
    {
      num: 1,
      text: 'Prioritize Zone 02 — Udyavara Estuary',
      actionable: true,
      zoneId: 'Zone 02',
      detail: 'Projected highest severity and estuarine mangrove backwater exposure'
    },
    {
      num: 2,
      text: 'Enforce Malpe wharf road diversions',
      actionable: false,
      detail: 'Port wharf road closed (depth >= 0.30m); traffic routed to Karavali bypass'
    },
    {
      num: 3,
      text: 'Verify District Hospital access corridors',
      actionable: false,
      detail: 'Ajjarakad arterial access clear; ambulances on standby readiness'
    },
    {
      num: 4,
      text: 'Stage Malpe emergency shelter facility',
      actionable: false,
      detail: 'Malpe Fishermen Auction Community Center on active standby'
    },
    {
      num: 5,
      text: 'Monitor Swarna discharge and tidal surge',
      actionable: false,
      detail: 'High spring tide peak (+1.88m CD) forecast for 21:00 IST'
    }
  ] : [
    {
      num: 1,
      text: 'Prioritize Zone 03 — Kulur',
      actionable: true,
      zoneId: 'Zone 03',
      detail: 'Projected highest severity and population exposure'
    },
    {
      num: 2,
      text: 'Inspect affected road segments',
      actionable: false,
      detail: '7 segments in low-elevation estuarine approach'
    },
    {
      num: 3,
      text: 'Check nearby critical facilities',
      actionable: false,
      detail: 'Substation and Urban Health Centre vulnerability'
    },
    {
      num: 4,
      text: 'Prepare nearby emergency shelter capacity',
      actionable: false,
      detail: 'St. Antony Memorial & Fisheries High School on standby'
    },
    {
      num: 5,
      text: 'Continue monitoring rainfall and tide conditions',
      actionable: false,
      detail: 'Next high tide peak approaching at 22:15 IST'
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
            <CheckSquare className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold font-mono text-slate-900 tracking-wide uppercase">
            RECOMMENDED RESPONSE
          </h3>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold uppercase">
          <span>{demoScenario ? 'DEMO ONLY • VERIFY BEFORE ACTION' : 'MODEL-GENERATED DRAFT • NOT OFFICIAL ADVICE'}</span>
        </div>
      </div>

      {/* 5 Action Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
        {steps.map((step) => (
          <div
            key={step.num}
            className={`p-3 rounded-md border flex flex-col justify-between transition-all ${
              step.actionable
                ? 'bg-blue-50/50 border-blue-300 hover:border-blue-500 hover:shadow-xs'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
                  {step.num}
                </span>
                {step.actionable && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1 rounded uppercase">
                    HIGH PRIORITY
                  </span>
                )}
              </div>
              <h4 className="font-bold text-slate-900 text-xs my-1 leading-snug">
                {step.text}
              </h4>
              <p className="text-[11px] text-slate-500 font-sans leading-tight mt-1">
                {step.detail}
              </p>
            </div>

            {step.actionable && onFocusZone && step.zoneId && (
              <button
                type="button"
                onClick={() => onFocusZone(step.zoneId!)}
                className="mt-2.5 pt-2 border-t border-blue-200 flex items-center justify-between text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
              >
                <span>FOCUS ZONE</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-200 flex items-center gap-2 text-[11px] font-mono text-slate-500">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>Decision-support draft only. Verify conditions and routes with local authorities before taking action.</span>
      </div>
    </div>
  );
};
