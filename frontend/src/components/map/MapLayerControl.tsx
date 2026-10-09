import React from 'react';
import { Layers, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

export interface MapLayerState {
  showZones: boolean;
  showFloodDepth: boolean;
  showCriticalFacilities: boolean;
  showHospitals: boolean;
  showShelters: boolean;
  showRivers: boolean;
  showNH66: boolean;
  showRoads: boolean;
  showClosedRoads: boolean;
  showEmergencyRoutes: boolean;
  showBuildings: boolean;
}

interface MapLayerControlProps {
  layers: MapLayerState;
  onToggleLayer: (layerKey: keyof MapLayerState) => void;
  onResetView: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const MapLayerControl: React.FC<MapLayerControlProps> = React.memo(({
  layers,
  onToggleLayer,
  onResetView,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-300 rounded-lg p-3 text-xs font-mono select-none shadow-md w-60 text-slate-800">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>GIS LAYERS</span>
        </div>
        <div className="flex items-center gap-1">
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit Full Screen' : 'Full Screen Map'}
              className="p-1 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 transition-colors cursor-pointer"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3 h-3 text-blue-600" />
              ) : (
                <Maximize2 className="w-3 h-3 text-blue-600" />
              )}
            </button>
          )}
          <button
            onClick={onResetView}
            title="Reset Map to Mangaluru Centroid"
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-blue-600" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      <div className="space-y-1 text-[11px] max-h-72 overflow-y-auto pr-1">
        <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 px-1 rounded transition-colors">
          <span className="text-slate-800">Flood Risk Zones</span>
          <input
            type="checkbox"
            checked={layers.showZones}
            onChange={() => onToggleLayer('showZones')}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 px-1 rounded transition-colors">
          <span className="text-blue-900 font-bold">Zone Depth Proxy</span>
          <input
            type="checkbox"
            checked={layers.showFloodDepth}
            onChange={() => onToggleLayer('showFloodDepth')}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 px-1 rounded transition-colors">
          <span className="text-slate-800">Critical Facilities</span>
          <input
            type="checkbox"
            checked={layers.showCriticalFacilities}
            onChange={() => onToggleLayer('showCriticalFacilities')}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 px-1 rounded transition-colors">
          <span className="text-slate-800">Hospitals</span>
          <input
            type="checkbox"
            checked={layers.showHospitals}
            onChange={() => onToggleLayer('showHospitals')}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 px-1 rounded transition-colors">
          <span className="text-slate-800">Emergency Shelters</span>
          <input
            type="checkbox"
            checked={layers.showShelters}
            onChange={() => onToggleLayer('showShelters')}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 px-1 rounded transition-colors">
          <span className="text-slate-800">Rivers & Estuary</span>
          <input
            type="checkbox"
            checked={layers.showRivers}
            onChange={() => onToggleLayer('showRivers')}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 px-1 rounded transition-colors">
          <span className="text-slate-800">NH-66 Highway</span>
          <input
            type="checkbox"
            checked={layers.showNH66}
            onChange={() => onToggleLayer('showNH66')}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 px-1 rounded transition-colors">
          <span className="text-slate-800">Road Network</span>
          <input
            type="checkbox"
            checked={layers.showRoads}
            onChange={() => onToggleLayer('showRoads')}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 px-1 rounded transition-colors">
          <span className="text-red-700 font-bold">Closed Roads Highlight</span>
          <input
            type="checkbox"
            checked={layers.showClosedRoads}
            onChange={() => onToggleLayer('showClosedRoads')}
            className="rounded border-slate-300 text-red-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 px-1 rounded transition-colors">
          <span className="text-blue-700 font-bold">Emergency Routes</span>
          <input
            type="checkbox"
            checked={layers.showEmergencyRoutes}
            onChange={() => onToggleLayer('showEmergencyRoutes')}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 px-1 rounded transition-colors">
          <span className="text-slate-600">Buildings</span>
          <input
            type="checkbox"
            checked={layers.showBuildings}
            onChange={() => onToggleLayer('showBuildings')}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
          />
        </label>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
        GIS vectors are static reference geometry. Road/facility conditions are not live feeds; depth shading is zone-average only.
      </div>
    </div>
  );
});
