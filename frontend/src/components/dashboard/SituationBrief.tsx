import React from 'react';
import type { SituationBriefData } from '../../types';
import { FileText, Cpu, AlertCircle } from 'lucide-react';

interface SituationBriefProps {
  brief: SituationBriefData;
}

export const SituationBrief: React.FC<SituationBriefProps> = ({ brief }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm relative">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-200 gap-2 font-mono">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
            SITUATION BRIEF
          </h3>
          <span className="text-slate-500 text-xs hidden sm:inline">
            • {brief.bulletin_number}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500">
            ISSUED: <strong className="text-slate-800">{brief.timestamp_ist}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] uppercase font-bold">
            OPERATIONAL SITREP
          </span>
        </div>
      </div>

      {/* Main Narrative Body */}
      <div className="space-y-3 font-sans text-sm text-slate-700 leading-relaxed">
        <div className="font-semibold text-slate-800 font-mono text-xs tracking-wide bg-slate-50 p-3 rounded-md border border-slate-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{brief.headline}</span>
        </div>

        <p className="text-slate-700 text-sm">
          {brief.narrative_paragraph_1}
        </p>

        <p className="text-slate-700 text-sm">
          {brief.narrative_paragraph_2}
        </p>
      </div>

      {/* Meteorological Summary Badges & Mandatory Bottom Label */}
      <div className="mt-4 pt-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-600 text-[11px]">
          <span className="font-semibold text-slate-800">Primary Focus:</span>
          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold">
            {brief.recommended_primary_zone}
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-600 font-medium">Trigger: {brief.key_meteorological_trigger}</span>
        </div>

        {/* Mandatory Bottom Label */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-50 border border-slate-300 text-[11px] font-bold text-slate-700 tracking-wider uppercase">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span>MODEL ESTIMATE • NOT OFFICIAL</span>
        </div>
      </div>
    </div>
  );
};
