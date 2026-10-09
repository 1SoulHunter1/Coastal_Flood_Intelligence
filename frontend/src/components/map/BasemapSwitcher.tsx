import React from 'react';
import { Map, Globe, Layers } from 'lucide-react';

export type BasemapMode = 'STREET' | 'SATELLITE' | 'HYBRID';

interface BasemapSwitcherProps {
  currentMode: BasemapMode;
  onSelectMode: (mode: BasemapMode) => void;
}

export const BasemapSwitcher: React.FC<BasemapSwitcherProps> = React.memo(({
  currentMode,
  onSelectMode,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-300 rounded-lg p-1.5 shadow-md font-mono flex items-center gap-2 text-xs select-none">
      <div className="flex items-center gap-1 pl-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
        <Layers className="w-3.5 h-3.5 text-blue-600" />
        <span>MAP VIEW:</span>
      </div>

      <div className="inline-flex rounded-md bg-slate-100 p-0.5 border border-slate-200">
        <button
          type="button"
          onClick={() => onSelectMode('STREET')}
          title="Standard Vector Street Map"
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
            currentMode === 'STREET'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          <Map className="w-3 h-3" />
          <span>STREET</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectMode('SATELLITE')}
          title="High-Resolution Satellite Imagery"
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
            currentMode === 'SATELLITE'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          <Globe className="w-3 h-3" />
          <span>SATELLITE</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectMode('HYBRID')}
          title="Satellite Imagery with Road & Place Labels"
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
            currentMode === 'HYBRID'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>HYBRID</span>
        </button>
      </div>
    </div>
  );
});
