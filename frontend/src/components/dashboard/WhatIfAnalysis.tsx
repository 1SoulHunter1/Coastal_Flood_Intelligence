import React, { useEffect, useState } from 'react';
import { Sliders, RotateCcw, AlertTriangle, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { useStudyArea } from '../../context/StudyAreaContext';
import { getCounterfactualScenario, getDemoCounterfactualScenario } from '../../services/api';
import type { CounterfactualInputs, CounterfactualScenario } from '../../types/Counterfactual';

interface WhatIfAnalysisProps {
  zoneId?: string;
  zoneName?: string;
  demoMode?: boolean;
}

export const WhatIfAnalysis: React.FC<WhatIfAnalysisProps> = ({
  zoneId = 'Zone 03',
  zoneName = 'Kulur',
  demoMode = false
}) => {
  const { studyArea, demoScenario } = useStudyArea();
  const [inputs, setInputs] = useState<CounterfactualInputs>({
    tide_offset_m: -0.40,
    rainfall_percent_change: 0,
    rainfall_offset_mm_hr: 0,
    storm_surge_offset_m: 0
  });
  const [scenario, setScenario] = useState<CounterfactualScenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setScenario(null);
      setIsLoading(true);
      setLoadError(null);
      (demoMode
        ? getDemoCounterfactualScenario(zoneId, inputs, studyArea)
        : getCounterfactualScenario(zoneId, inputs, studyArea))
        .then((result) => {
          if (active) setScenario(result);
        })
        .catch((error: unknown) => {
          if (active) {
            setLoadError(error instanceof Error ? error.message : 'Unknown live API error.');
          }
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [zoneId, inputs, studyArea, demoMode]);

  const handleReset = () => {
    setInputs({
      tide_offset_m: 0,
      rainfall_percent_change: 0,
      rainfall_offset_mm_hr: 0,
      storm_surge_offset_m: 0
    });
  };

  const handleApplyPresetLowerTide = () => {
    setInputs({
      tide_offset_m: -0.40,
      rainfall_percent_change: 0,
      rainfall_offset_mm_hr: 0,
      storm_surge_offset_m: 0
    });
  };

  const handleApplyPresetWorstCase = () => {
    setInputs({
      tide_offset_m: 0.35,
      rainfall_percent_change: 0,
      rainfall_offset_mm_hr: 20,
      storm_surge_offset_m: 0.20
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              WHAT-IF ANALYSIS — {zoneId} {zoneName.toUpperCase()}
            </h3>
            <span className="text-[10px] text-slate-500 block">
              Counterfactual sensitivity to astronomical tide, rainfall intensity and storm surge
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors uppercase cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET BASELINE</span>
          </button>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            SIMULATION WHAT-IF ANALYSIS
          </span>
        </div>
      </div>

      {demoMode && (
        <div className="mb-3 rounded border border-amber-300 bg-amber-50 p-2.5 text-[11px] text-amber-900">
          Demo active: the baseline and counterfactual below both run the surrogate using synthetic officer-alert inputs.
          {demoScenario?.synthetic_inputs && (
            <span className="ml-1">
              Baseline rain {demoScenario.synthetic_inputs.rain_1h} mm/h, tide {demoScenario.synthetic_inputs.tide_m} m, surge {demoScenario.synthetic_inputs.surge_m} m.
            </span>
          )}
        </div>
      )}

      {/* Preset Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px]">
        <span className="text-slate-500 font-semibold mr-1">QUICK SCENARIOS:</span>
        <button
          type="button"
          onClick={handleApplyPresetLowerTide}
          className={`px-3 py-1 rounded border transition-colors cursor-pointer ${
            inputs.tide_offset_m === -0.40 && inputs.rainfall_percent_change === 0
              ? 'bg-blue-600 text-white font-bold border-blue-700'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
          }`}
        >
          Ebb Tide Recess (-0.40 m)
        </button>
        <button
          type="button"
          onClick={handleApplyPresetWorstCase}
          className={`px-3 py-1 rounded border transition-colors cursor-pointer ${
            inputs.tide_offset_m > 0 && (inputs.rainfall_offset_mm_hr ?? 0) > 0
              ? 'bg-red-600 text-white font-bold border-red-700'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
          }`}
        >
          High Tide + Heavy Rain (+0.35m / +20 mm/h)
        </button>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Tide Control */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-[11px]">Tide Level Shift</span>
            <span className="font-bold text-blue-700 text-xs">
              {inputs.tide_offset_m > 0 ? `+${inputs.tide_offset_m.toFixed(2)}` : inputs.tide_offset_m.toFixed(2)} m
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputs((prev) => ({ ...prev, tide_offset_m: Math.max(-0.60, prev.tide_offset_m - 0.10) }))}
              className="px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 font-bold cursor-pointer"
            >
              -0.10
            </button>
            <input
              type="range"
              min="-0.60"
              max="0.60"
              step="0.05"
              value={inputs.tide_offset_m}
              onChange={(e) => setInputs((prev) => ({ ...prev, tide_offset_m: parseFloat(e.target.value) }))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setInputs((prev) => ({ ...prev, tide_offset_m: Math.min(0.60, prev.tide_offset_m + 0.10) }))}
              className="px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 font-bold cursor-pointer"
            >
              +0.10
            </button>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>-0.60 m (Low)</span>
            <span>Current: {scenario ? `${scenario.baseline.tide_m.toFixed(2)} m` : '—'}</span>
            <span>+0.60 m (Surge)</span>
          </div>
        </div>

        {/* Rainfall Control */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-[11px]">Rainfall Intensity Change</span>
            <span className="font-bold text-blue-700 text-xs">
              {(inputs.rainfall_offset_mm_hr ?? 0) > 0
                ? `+${(inputs.rainfall_offset_mm_hr ?? 0).toFixed(0)} mm/h`
                : `${(inputs.rainfall_offset_mm_hr ?? 0).toFixed(0)} mm/h`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputs((prev) => ({
                ...prev,
                rainfall_percent_change: 0,
                rainfall_offset_mm_hr: Math.max(-20, (prev.rainfall_offset_mm_hr ?? 0) - 5)
              }))}
              className="px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 font-bold cursor-pointer"
            >
              -5
            </button>
            <input
              type="range"
              min="-20"
              max="30"
              step="5"
              value={inputs.rainfall_offset_mm_hr ?? 0}
              aria-label="Rainfall intensity change in millimeters per hour"
              onChange={(e) => setInputs((prev) => ({
                ...prev,
                rainfall_percent_change: 0,
                rainfall_offset_mm_hr: parseFloat(e.target.value)
              }))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setInputs((prev) => ({
                ...prev,
                rainfall_percent_change: 0,
                rainfall_offset_mm_hr: Math.min(30, (prev.rainfall_offset_mm_hr ?? 0) + 5)
              }))}
              className="px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 font-bold cursor-pointer"
            >
              +5
            </button>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>-20 mm/h</span>
            <span>Baseline: {scenario ? `${scenario.baseline.rainfall_rate_mm_hr} mm/h` : '—'}</span>
            <span>+30 mm/h</span>
          </div>
        </div>

        {/* Storm Surge Control */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-[11px]">Storm Surge Shift</span>
            <span className="font-bold text-blue-700 text-xs">
              {inputs.storm_surge_offset_m > 0 ? `+${inputs.storm_surge_offset_m.toFixed(2)}` : inputs.storm_surge_offset_m.toFixed(2)} m
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputs((prev) => ({ ...prev, storm_surge_offset_m: Math.max(-0.30, prev.storm_surge_offset_m - 0.05) }))}
              className="px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 font-bold cursor-pointer"
            >
              -0.05
            </button>
            <input
              type="range"
              min="-0.30"
              max="0.30"
              step="0.05"
              value={inputs.storm_surge_offset_m}
              onChange={(e) => setInputs((prev) => ({ ...prev, storm_surge_offset_m: parseFloat(e.target.value) }))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setInputs((prev) => ({ ...prev, storm_surge_offset_m: Math.min(0.30, prev.storm_surge_offset_m + 0.05) }))}
              className="px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 font-bold cursor-pointer"
            >
              +0.05
            </button>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>-0.30 m</span>
            <span>Current: {scenario ? `${scenario.baseline.storm_surge_m.toFixed(2)} m` : '—'}</span>
            <span>+0.30 m</span>
          </div>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="mb-3 rounded border border-rose-300 bg-rose-50 p-3 text-rose-900">
          Live what-if analysis failed: {loadError}
        </div>
      )}
      {!scenario && !loadError && (
        <div role="status" className="mb-3 rounded border border-slate-200 bg-slate-50 p-3 text-slate-600">
          {isLoading ? 'Running the live surrogate scenario…' : 'Waiting for model results.'}
        </div>
      )}

      {scenario && (
        <>
      {/* Comparison Results Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
        {/* Baseline Card */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="font-bold text-slate-700 text-[11px] uppercase">CURRENT BASELINE</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
              {scenario.baseline.risk_level} RISK
            </span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-600">Astronomical Tide:</span>
              <span className="font-semibold text-slate-900">+{scenario.baseline.tide_m.toFixed(2)} m MSL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Rainfall Rate:</span>
              <span className="font-semibold text-slate-900">{scenario.baseline.rainfall_rate_mm_hr} mm/hr</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
              <span className="text-slate-800">Median Flood Depth (q50):</span>
              <span className="text-red-700 text-sm">{scenario.baseline.predicted_depth_m.toFixed(2)} m</span>
            </div>
            {scenario.baseline.depth_q10_m != null && scenario.baseline.depth_q90_m != null && (
              <div className="flex justify-between">
                <span className="text-slate-600">Model depth range (q10–q90):</span>
                <span className="text-slate-900 font-semibold">
                  {scenario.baseline.depth_q10_m.toFixed(2)}–{scenario.baseline.depth_q90_m.toFixed(2)} m
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">Flood Probability:</span>
              <span className="text-slate-900 font-bold">{scenario.baseline.probability}%</span>
            </div>
          </div>
        </div>

        {/* What-If Card */}
        <div className={`rounded-lg p-3.5 space-y-2 border ${
          scenario.simulated.predicted_depth_m < scenario.baseline.predicted_depth_m
            ? 'bg-emerald-50/60 border-emerald-300'
            : 'bg-red-50/60 border-red-300'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="font-bold text-slate-900 text-[11px] uppercase flex items-center gap-1.5">
              <span>SIMULATED WHAT-IF</span>
              {scenario.simulated.predicted_depth_m < scenario.baseline.predicted_depth_m ? (
                <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 text-red-700" />
              )}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              scenario.simulated.risk_level === 'LOW'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : scenario.simulated.risk_level === 'MODERATE'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-red-100 text-red-800 border-red-300'
            }`}>
              {scenario.simulated.risk_level} RISK
            </span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-600">Simulated Tide:</span>
              <span className="font-semibold text-slate-900">+{scenario.simulated.tide_m.toFixed(2)} m MSL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Simulated Rainfall:</span>
              <span className="font-semibold text-slate-900">{scenario.simulated.rainfall_rate_mm_hr} mm/hr</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
              <span className="text-slate-800">Median Flood Depth (q50):</span>
              <span className={`text-sm ${
                scenario.simulated.predicted_depth_m < scenario.baseline.predicted_depth_m
                  ? 'text-emerald-800'
                  : 'text-red-700'
              }`}>
                {scenario.simulated.predicted_depth_m.toFixed(2)} m
              </span>
            </div>
            {scenario.simulated.depth_q10_m != null && scenario.simulated.depth_q90_m != null && (
              <div className="flex justify-between">
                <span className="text-slate-600">Model depth range (q10–q90):</span>
                <span className="text-slate-900 font-semibold">
                  {scenario.simulated.depth_q10_m.toFixed(2)}–{scenario.simulated.depth_q90_m.toFixed(2)} m
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">Simulated Probability:</span>
              <span className="text-slate-900 font-bold">{scenario.simulated.probability}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delta Banner & Plain English Operational Conclusion (Feature 3B) */}
      <div className="bg-white border border-slate-300 p-3 rounded-md space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 uppercase">DEPTH SHIFT:</span>
            <span className="text-slate-900">{scenario.baseline.predicted_depth_m.toFixed(2)} m</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
            <span className={scenario.depth_delta_m < 0 ? 'text-emerald-700 font-extrabold' : 'text-red-700 font-extrabold'}>
              {scenario.simulated.predicted_depth_m.toFixed(2)} m ({scenario.depth_delta_m > 0 ? `+${scenario.depth_delta_m}` : scenario.depth_delta_m} m)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 uppercase">RISK TRANSITION:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800">
              {scenario.risk_shift}
            </span>
          </div>
        </div>
        {scenario.depth_q90_delta_m != null && (
          <div className="text-[11px] text-slate-700">
            Upper model depth estimate (q90) shift:{' '}
            <strong className={scenario.depth_q90_delta_m > 0 ? 'text-red-700' : scenario.depth_q90_delta_m < 0 ? 'text-emerald-700' : 'text-slate-800'}>
              {scenario.depth_q90_delta_m > 0 ? '+' : ''}{scenario.depth_q90_delta_m.toFixed(2)} m
            </strong>
          </div>
        )}

        <p className="font-sans text-[11px] text-slate-700 leading-relaxed pt-1 border-t border-slate-100">
          <strong>Operational Assessment:</strong> &ldquo;{scenario.explanation}&rdquo;
        </p>
        <p className="font-sans text-[10px] text-slate-500">
          When model quantiles are available, the median is q50 and may stay the same between scenarios; compare the q10–q90 range and flood probability too. Depth values are rounded to 0.01 m.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mt-2.5 flex items-center gap-2 text-[10px] text-slate-500">
        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
        <span>Surrogate outputs reproduce physics-simulator labels; validation against observed flood events is still required.</span>
      </div>
        </>
      )}
    </div>
  );
};
