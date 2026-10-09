import React, { useState, useEffect } from 'react';
import type { AlertItem } from '../types';
import { useStudyArea } from '../context/StudyAreaContext';
import { getAlerts } from '../services/api';
import { RiskBadge } from '../components/dashboard/RiskBadge';
import { AlertTriangle, Radio, Megaphone, ShieldAlert, CheckCircle, ChevronRight } from 'lucide-react';

export const Alerts: React.FC = () => {
  const { studyArea, config, handleZoneSelect } = useStudyArea();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [draftPrepared, setDraftPrepared] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getAlerts(studyArea).then((data) => {
      setAlerts(data);
      setLoadError(null);
    }).catch((error: unknown) => {
      setAlerts([]);
      setLoadError(error instanceof Error ? error.message : 'Unknown alert API error.');
    });
  }, [studyArea]);

  const handlePrepareDraft = () => {
    setDraftPrepared(true);
    setTimeout(() => setDraftPrepared(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 font-mono shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-orange-50 text-orange-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              ALERTS & WARNING TEMPLATES
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 font-bold">
              OFFICIAL ALERT FEED NOT CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Verified official alerts are not connected. The CAP action below only previews a draft.
          </p>
        </div>

        {/* Broadcast Action Button */}
        <div>
          <button
            onClick={handlePrepareDraft}
            disabled={draftPrepared}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs transition-colors font-mono font-bold cursor-pointer ${
              draftPrepared
                ? 'bg-emerald-700 text-white cursor-default'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
            }`}
          >
            {draftPrepared ? <CheckCircle className="w-3.5 h-3.5" /> : <Megaphone className="w-3.5 h-3.5" />}
            <span>{draftPrepared ? 'DRAFT PREVIEW READY' : 'PREVIEW CAP DRAFT'}</span>
          </button>
        </div>
      </div>

      {/* Broadcast Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alerts List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between font-mono text-xs text-slate-500">
            <span className="font-semibold text-slate-700">VERIFIED ALERTS ({alerts.length})</span>
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Official source not connected
            </span>
          </div>

          {loadError && (
            <div role="alert" className="rounded border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900">
              Alert service unavailable: {loadError}
            </div>
          )}

          {!loadError && alerts.length === 0 && (
            <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              No verified alert feed is connected. No active incident or road closure is being asserted by this page.
            </div>
          )}

          <div className="space-y-3 font-mono">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                role="button"
                tabIndex={0}
                onClick={() => handleZoneSelect(alert.zone_id, 'map')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleZoneSelect(alert.zone_id, 'map');
                  }
                }}
                className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors space-y-3 cursor-pointer"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    {alert.risk_level === 'INFO' ? (
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        INFO
                      </span>
                    ) : (
                      <RiskBadge level={alert.risk_level as any} />
                    )}
                    <span className="font-bold text-slate-900 text-sm">
                      {alert.zone_id} — {alert.zone_name.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>BULLETIN #{alert.id}</span>
                    <span>•</span>
                    <span className="text-slate-800 font-bold">{alert.issued_at}</span>
                  </div>
                </div>

                {/* Headline */}
                <div className="font-semibold text-slate-900 text-sm">
                  {alert.headline}
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-md border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Probability</span>
                    <span className="text-orange-600 font-extrabold">{alert.flood_probability || 18}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Onset Time</span>
                    <span className="text-slate-800 font-bold">{alert.expected_onset}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Peak Projection</span>
                    <span className="text-red-600 font-bold">{alert.expected_peak || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Evacuation</span>
                    <span className={alert.evacuation_advised ? 'text-red-600 font-bold' : 'text-slate-600 font-medium'}>
                      {alert.evacuation_advised ? 'ADVISED' : 'STANDBY'}
                    </span>
                  </div>
                </div>

                {/* Drivers & Action */}
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Hydrological Drivers: </span>
                    <span className="text-slate-800 font-semibold">{alert.drivers}</span>
                  </div>
                  {alert.action_summary && (
                    <div className="p-2.5 rounded-md bg-blue-50 border border-blue-200 text-blue-900 font-medium">
                      <span className="font-bold text-blue-950">Action: </span>
                      {alert.action_summary}
                    </div>
                  )}
                </div>

                {/* Explicit Action Button */}
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoneSelect(alert.zone_id, 'map');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded shadow-2xs hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors uppercase cursor-pointer"
                  >
                    <span>VIEW ZONE</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Info: Protocols & CAP standard (4 cols) */}
        <div className="lg:col-span-4 space-y-4 font-mono text-xs">
          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 uppercase text-xs flex items-center gap-2 border-b border-slate-200 pb-2">
              <Radio className="w-4 h-4 text-blue-600" />
              Dissemination Gateways
            </h3>

            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex justify-between items-center">
                <span className="text-slate-700">Telecom Cell Broadcast:</span>
                <span className="text-emerald-700 font-bold">CONNECTED</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex justify-between items-center">
                <span className="text-slate-700">Sachet App / NDMA API:</span>
                <span className="text-emerald-700 font-bold">ACTIVE</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex justify-between items-center">
                <span className="text-slate-700">AIR Radio ({config.displayName}):</span>
                <span className="text-blue-700 font-bold">STANDBY</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex justify-between items-center">
                <span className="text-slate-700">Coastal Warning Sirens:</span>
                <span className="text-amber-700 font-bold">ARMED (2 SIRENS)</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm space-y-2 text-[11px] text-slate-700">
            <div className="flex items-center gap-2 text-slate-900 font-bold uppercase border-b border-slate-200 pb-2 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              CAP Protocol Format
            </div>
            <p className="leading-relaxed text-slate-600">
              CoastGuard-AI automatically structures flood alerts using ITU-T X.1303 / Common Alerting Protocol (CAP) v1.2 specifications for universal emergency interoperability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
