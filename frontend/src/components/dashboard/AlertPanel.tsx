import React from 'react';
import type { AlertItem } from '../../types';
import { RiskBadge } from './RiskBadge';
import { BellRing, ChevronRight } from 'lucide-react';

interface AlertPanelProps {
  alerts: AlertItem[];
  onSelectZone?: (zoneId: string) => void;
  onViewAllAlerts?: () => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  alerts,
  onSelectZone,
  onViewAllAlerts
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-orange-50 text-orange-700">
              <BellRing className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold font-mono text-slate-900 tracking-wide uppercase">
              ACTIVE FLOOD ALERTS
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 uppercase font-bold">
            {alerts.length} ISSUED
          </span>
        </div>

        {/* Alerts List */}
        <div className="space-y-2.5 font-mono">
          {alerts.map((alert) => {
            const isHigh = alert.risk_level === 'HIGH' || alert.risk_level === 'CRITICAL';
            const isInfo = alert.risk_level === 'INFO';

            return (
              <div
                key={alert.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectZone && alert.zone_id && onSelectZone(alert.zone_id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onSelectZone && alert.zone_id) onSelectZone(alert.zone_id);
                  }
                }}
                className={`p-3.5 rounded-md border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isHigh
                    ? 'bg-orange-50/50 border-orange-200 hover:border-orange-400'
                    : isInfo
                    ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    : 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                }`}
              >
                {/* Top Badge & Zone */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {isInfo ? (
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        INFO
                      </span>
                    ) : (
                      <RiskBadge level={alert.risk_level as any} />
                    )}
                    <span className="text-xs font-bold text-slate-900 uppercase">
                      {alert.zone_id} — {alert.zone_name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {alert.issued_at}
                  </span>
                </div>

                {/* Headline */}
                {alert.headline && (
                  <div className="text-xs font-semibold text-slate-800 my-1">
                    {alert.headline}
                  </div>
                )}

                {/* Expected onset if applicable */}
                {alert.expected_onset && alert.expected_onset !== 'Standby' && (
                  <div className="text-xs text-slate-600 my-0.5">
                    <span>Expected onset: </span>
                    <strong className="text-slate-900">{alert.expected_onset}</strong>
                  </div>
                )}

                {/* Drivers */}
                <div className="text-xs text-slate-600 mt-1">
                  <span className="text-slate-500 font-medium">Drivers: </span>
                  <span className="text-slate-800 font-semibold">{alert.drivers}</span>
                </div>

                {/* Explicit VIEW ZONE button */}
                {alert.zone_id && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectZone) onSelectZone(alert.zone_id);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded shadow-2xs hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors uppercase cursor-pointer"
                    >
                      <span>VIEW ZONE</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer / View All */}
      {onViewAllAlerts && (
        <div className="pt-3 mt-3 border-t border-slate-200">
          <button
            onClick={onViewAllAlerts}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-mono font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
          >
            <span>DISPATCH BULLETIN ARCHIVE</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
