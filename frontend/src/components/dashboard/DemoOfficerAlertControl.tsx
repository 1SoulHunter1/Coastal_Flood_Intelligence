import React, { useEffect, useState } from 'react';
import { BellRing, LoaderCircle, RotateCcw, TriangleAlert, X } from 'lucide-react';
import type { DemoOfficerAlert } from '../../types';
import { useStudyArea } from '../../context/StudyAreaContext';
import { getDemoOfficerInbox } from '../../services/api';

interface DemoOfficerAlertControlProps {
  onClose: () => void;
  loading: boolean;
  error: string | null;
}

export const DemoOfficerAlertControl: React.FC<DemoOfficerAlertControlProps> = ({
  onClose,
  loading,
  error
}) => {
  const { demoScenario: scenario, setDemoScenario, setSelectedZoneId, config } = useStudyArea();
  const [inbox, setInbox] = useState<DemoOfficerAlert[]>([]);
  const [inboxError, setInboxError] = useState<string | null>(null);
  const displayedInbox = scenario
    ? [scenario, ...inbox.filter((item) => item.id !== scenario.id)]
    : inbox;

  useEffect(() => {
    let active = true;

    const loadInbox = async () => {
      try {
        const alerts = await getDemoOfficerInbox();
        if (active) setInbox(alerts);
      } catch (reason) {
        if (active) {
          setInboxError(reason instanceof Error ? reason.message : 'Could not load officer inbox.');
        }
      }
    };

    void loadInbox();
    const intervalId = window.setInterval(() => void loadInbox(), 60_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-label="Demo officer alert"
      className="fixed right-5 top-[4.75rem] z-[1000] w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-amber-300 bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-950">
          <BellRing className="h-4 w-4" />
          Demo officer alert
          <span className="rounded border border-amber-400 bg-amber-100 px-1.5 py-0.5 text-[9px] uppercase">
            Synthetic
          </span>
        </div>
        <div className="flex items-center gap-1">
          {scenario && (
            <button
              type="button"
              onClick={() => {
                setDemoScenario(null);
                setSelectedZoneId(config.defaultZoneId);
              }}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold text-amber-900 hover:bg-amber-100"
            >
              <RotateCcw className="h-3 w-3" />
              RESET
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close demo alert popup"
            className="rounded p-1 text-slate-500 hover:bg-amber-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[min(34rem,calc(100vh-7rem))] space-y-3 overflow-y-auto p-4 text-xs">
        <p className="text-slate-600">
          Synthetic inputs run through the flood surrogate update the zone map and analysis tabs. This is an officer-only demo; no public alert or SACHET/CBS broadcast is sent.
        </p>

        {loading && (
          <div role="status" className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 p-3 text-amber-900">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Running the demo scenario and notifying the officer inbox…
          </div>
        )}
        {(error || inboxError) && (
          <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-red-800">
            {error || inboxError}
          </p>
        )}
        {scenario && (
          <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50/60 p-3 text-slate-800">
            <div className="font-bold text-amber-950">
              {scenario.study_area} — {scenario.zones?.filter((zone) => zone.risk_level === 'HIGH' || zone.risk_level === 'CRITICAL').length ?? 1} zones elevated in demo
            </div>
            <p>
              Highest: {scenario.zone_name} — {scenario.risk_level}, {scenario.p_flood}% model probability, {scenario.q50_depth_m.toFixed(2)} m median depth.
            </p>
            <p className="text-slate-600">
              Officer: {scenario.recipient} · {scenario.channel} · {scenario.status}
            </p>
            {scenario.external_email_sent === false && (
              <div className="flex items-center gap-1.5 text-amber-800">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                External email is not configured; the message is saved in the persistent inbox.
              </div>
            )}
          </div>
        )}

        <div className="border-t border-slate-200 pt-2">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
            Duty officer inbox
          </div>
          {displayedInbox.length === 0 ? (
            <p className="text-slate-500">No officer messages recorded.</p>
          ) : (
            <ul className="space-y-1.5">
              {displayedInbox.slice(0, 4).map((alert) => (
                <li key={alert.id} className="rounded bg-slate-50 px-2 py-1.5 text-slate-700">
                  <strong>{alert.demo_only ? 'DEMO' : 'LIVE MODEL REVIEW'}</strong>
                  {' · '}{alert.study_area} / {alert.zone_name} · {alert.p_flood}% · {alert.status}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};
