import React, { useState, useEffect } from 'react';
import { Radio, MapPin, RefreshCw, BellRing } from 'lucide-react';
import { useStudyArea } from '../../context/StudyAreaContext';
import { DemoOfficerAlertControl } from '../dashboard/DemoOfficerAlertControl';
import { triggerDemoOfficerAlert } from '../../services/api';

interface HeaderProps {
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh }) => {
  const {
    studyArea,
    config,
    setStudyArea,
    isLoadingStudyArea,
    setDemoScenario,
    setSelectedZoneId
  } = useStudyArea();
  const [timeStr, setTimeStr] = useState<string>('');
  const [demoPopupOpen, setDemoPopupOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const handleDemoAlert = async () => {
    const requestedArea = studyArea;
    setDemoPopupOpen(true);
    setDemoLoading(true);
    setDemoError(null);
    try {
      const alert = await triggerDemoOfficerAlert(requestedArea);
      if (requestedArea === studyArea) {
        setDemoScenario(alert);
        if (alert.zone) setSelectedZoneId(alert.zone.zone_id);
      }
    } catch (reason) {
      setDemoError(reason instanceof Error ? reason.message : 'Demo alert could not be delivered.');
    } finally {
      setDemoLoading(false);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata'
      };
      setTimeStr(new Intl.DateTimeFormat('en-IN', options).format(now) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="min-h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between select-none z-20 shadow-sm">
      {/* Left Title, Badge, and Subtitle */}
      <div className="flex items-center gap-4">
        <div className="h-9 w-1.5 bg-blue-600 rounded-full" />
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-bold text-slate-900 tracking-wide font-mono uppercase">
              {config.operationsTitle}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
              {isLoadingStudyArea ? `SWITCHING TO ${config.name.toUpperCase()}...` : 'LIVE API INPUTS · MODEL ESTIMATES'}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {config.name}, {config.state} | Live environment APIs; static GIS/inventory; model estimates
          </p>
          {studyArea === 'udupi' && (
            <p className="text-[10px] text-amber-700">
              Udupi uses the Mangaluru-trained surrogate; regional transfer is not validated.
            </p>
          )}
        </div>
      </div>

      {/* Right Side Status & Region */}
      <div className="flex items-center gap-5">
        {/* Study Area Selector */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold">
            STUDY AREA
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={studyArea}
              onChange={(e) => setStudyArea(e.target.value as 'mangaluru' | 'udupi')}
              disabled={demoLoading}
              aria-label="Select Coastal Study Area"
              className="bg-slate-50 hover:bg-slate-100 text-slate-900 font-mono font-bold text-xs border border-slate-300 rounded px-2.5 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs transition-colors"
            >
              <option value="mangaluru">Mangaluru</option>
              <option value="udupi">Udupi</option>
            </select>
          </div>
        </div>

        {/* System Status */}
        <div className="hidden sm:flex flex-col items-end pl-4 border-l border-slate-200">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold">
            SYSTEM STATUS
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 status-dot-pulse"></span>
            <span>Operational</span>
          </div>
        </div>

        {/* Current Time (IST) */}
        <div className="flex flex-col items-end pl-4 border-l border-slate-200">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-bold">
            TIME
          </span>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>{timeStr || '17:30:00 IST'}</span>
          </div>
        </div>

        {/* Refresh provider data */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDemoAlert}
            disabled={demoLoading}
            title="Run demo officer alert"
            aria-label="Run demo officer alert"
            className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-900 shadow-sm transition-colors hover:bg-amber-100"
          >
            <BellRing className="h-3.5 w-3.5" />
            <span className="hidden md:inline">DEMO ALERT</span>
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh live provider data"
              className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors shadow-sm ml-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {demoPopupOpen && (
        <DemoOfficerAlertControl
          onClose={() => setDemoPopupOpen(false)}
          loading={demoLoading}
          error={demoError}
        />
      )}
    </header>
  );
};
