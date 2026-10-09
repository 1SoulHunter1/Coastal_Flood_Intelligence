import React, { useState, useEffect } from 'react';
import type { ForecastPoint } from '../types';
import { useStudyArea } from '../context/StudyAreaContext';
import { getFloodTimeline } from '../services/api';
import { ForecastChart } from '../components/dashboard/ForecastChart';
import { Clock, Play, Pause, FastForward, RotateCcw, AlertTriangle, Waves, CloudRain } from 'lucide-react';

export const Timeline: React.FC = () => {
  const { studyArea, config } = useStudyArea();
  const [timeline, setTimeline] = useState<ForecastPoint[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const refreshTimeline = () => {
      getFloodTimeline(studyArea).then((data) => {
        if (!active) return;
        setTimeline(data);
        setLoadError(null);
      }).catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : 'Unknown live API error.');
        }
      });
    };
    refreshTimeline();
    const timer = window.setInterval(refreshTimeline, 180000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [studyArea]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying && timeline.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % timeline.length);
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeline.length]);

  if (timeline.length === 0) {
    if (loadError) {
      return <div role="alert" className="m-6 rounded-lg border border-rose-300 bg-rose-50 p-6 text-rose-900">Live forecast is unavailable: {loadError}</div>;
    }
    return <div role="status" className="m-6 rounded-lg border border-slate-200 bg-white p-6 text-slate-600">Loading live model forecast…</div>;
  }

  const currentPoint = timeline[currentIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 font-mono shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              24-HOUR SURROGATE FLOOD FORECAST
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              {config.displayName.toUpperCase()} • HYDRODYNAMIC TIMESTEP
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Step through temporal flood inundation progression across the tidal cycle
          </p>
        </div>

        {/* Timeline Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white font-bold'
                : 'bg-blue-600 hover:bg-blue-700 text-white font-bold'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY FORECAST'}</span>
          </button>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % timeline.length)}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
            title="Next Step"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(0);
            }}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
            title="Reset to NOW"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Selector Slider Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg font-mono shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-600">
          <span className="font-semibold">PROGRESSION SLIDER</span>
          <span className="text-slate-900 font-bold">
            TIMESTEP: {currentPoint.time_label} ({currentPoint.timestamp})
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {timeline.map((item, idx) => {
            const isActive = idx === currentIndex;
            const isMilestone = item.is_onset || item.is_peak;

            return (
              <button
                key={item.time_label}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsPlaying(false);
                }}
                className={`p-2 rounded-md text-center transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-sm'
                    : isMilestone
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold">{item.time_label}</div>
                <div className="text-[10px] opacity-80">{item.timestamp.split(' ')[0]}</div>
                {item.is_onset && <div className="text-[9px] text-amber-800 font-bold mt-0.5">ONSET</div>}
                {item.is_peak && <div className="text-[9px] text-red-700 font-bold mt-0.5">PEAK</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Timestep Telemetry Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">FLOOD PROBABILITY</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-3xl font-extrabold text-orange-600">
            {currentPoint.flood_probability}%
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            System Risk Threshold: <span className="font-semibold">{currentPoint.flood_probability >= 70 ? 'CRITICAL' : 'ELEVATED'}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">RAINFALL INTENSITY</span>
            <CloudRain className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-700">
            {currentPoint.rainfall_rate_mm_hr} <span className="text-sm font-normal text-slate-500">mm/hr</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            Hydro Runoff Rate: <span className="font-semibold">{currentPoint.rainfall_rate_mm_hr > 50 ? 'Severe Downpour' : 'Moderate'}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">ESTUARY TIDE LEVEL</span>
            <Waves className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">
            +{currentPoint.tide_level_m} <span className="text-sm font-normal text-slate-500">m MSL</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            Storm Surge Component: <span className="font-semibold">+{currentPoint.storm_surge_m} m</span>
          </div>
        </div>
      </div>

      {/* Forecast Chart Component */}
      <ForecastChart data={timeline} zoneTitle="SYSTEM TIMELINE" />
    </div>
  );
};
