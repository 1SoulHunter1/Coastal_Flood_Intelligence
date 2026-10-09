import React, { useState, useEffect } from 'react';
import type { ZoneData } from '../types';
import { useStudyArea } from '../context/StudyAreaContext';
import { getZones } from '../services/api';
import { FloodMap } from '../components/map/FloodMap';
import { SelectedZonePanel } from '../components/dashboard/SelectedZonePanel';
import { RiskDrivers } from '../components/dashboard/RiskDrivers';
import { MapPin, ShieldAlert, Layers } from 'lucide-react';

export const FloodRiskMap: React.FC = () => {
  const { studyArea, config, selectedZoneId, setSelectedZoneId, handleZoneSelect, demoScenario } = useStudyArea();
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [highlightRouteId, setHighlightRouteId] = useState<string | null>(null);

  useEffect(() => {
    getZones(studyArea).then((data) => {
      const demoZones = demoScenario?.zones ?? (demoScenario?.zone ? [demoScenario.zone] : []);
      const displayedZones = data.map((zone) => {
        const prediction = demoZones.find((item) => item.zone_id === zone.zone_id);
        return prediction
          ? {
              ...zone,
              ...prediction,
              expected_onset: 'Synthetic demo scenario',
              expected_peak: 'Synthetic demo scenario',
              road_access_status: prediction.predicted_depth_m >= 0.30
                ? 'DEMO PROXY: CLOSED'
                : prediction.predicted_depth_m >= 0.15
                  ? 'DEMO PROXY: AT RISK'
                  : 'DEMO PROXY: OPEN',
              facility_access_status: prediction.flood_probability >= 80
                ? 'DEMO PROXY: OFFICER REVIEW'
                : 'DEMO PROXY: NO HIGH-RISK FLAG'
            }
          : zone;
      });
      setZones(displayedZones);
      const target =
        displayedZones.find((z) => z.zone_id.toLowerCase() === selectedZoneId.toLowerCase()) ||
        displayedZones.find((z) => z.zone_id.toLowerCase() === config.defaultZoneId.toLowerCase()) ||
        displayedZones[0];
      setSelectedZone(target);
    });
  }, [studyArea, selectedZoneId, config.defaultZoneId, demoScenario]);

  const handleSelectZone = (zone: ZoneData) => {
    setSelectedZone(zone);
    setSelectedZoneId(zone.zone_id);
  };

  if (!selectedZone) {
    return (
      <div className="flex items-center justify-center h-96 font-mono text-slate-500">
        <div className="flex items-center gap-3 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-slate-800">
            LOADING {config.name.toUpperCase()} FLOOD MAP...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 font-mono shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              GIS SPATIAL WORKSTATION
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              {config.basinTitle}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Surrogate risk estimates over static GIS zones; roads and facilities are not live status feeds.
          </p>
        </div>

        {demoScenario && (
          <div role="status" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-950">
            DEMO SCENARIO ACTIVE — every zone is colored from synthetic surrogate estimates; not a live flood observation.
          </div>
        )}

        {/* Zone Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 font-semibold mr-1">ZONE JUMP:</span>
          {zones.map((zone) => {
            const isSelected = selectedZone.zone_id.toLowerCase() === zone.zone_id.toLowerCase();
            return (
              <button
                key={zone.zone_id}
                type="button"
                onClick={() => handleSelectZone(zone)}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {zone.zone_id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map & Spatial Telemetry Inspection */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Map Workspace (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-3">
          <FloodMap
            zones={zones}
            selectedZone={selectedZone}
            onSelectZone={handleSelectZone}
            heightClass="h-[640px]"
            highlightRouteId={highlightRouteId || undefined}
          />
        </div>

        {/* Spatial Intelligence & Flood Operations Sidebar (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          {/* Selected Zone / Flood Operations Panel */}
          <SelectedZonePanel
            zone={selectedZone}
            onViewFullAnalysis={(zoneId, tab) => handleZoneSelect(zoneId, 'zones', tab)}
            onViewImpact={(zoneId) => handleZoneSelect(zoneId, 'zones', 'impact')}
            onViewRoute={() =>
              setHighlightRouteId((prev) =>
                prev ? null : studyArea === 'udupi' ? 'ROUTE-UD-ALT-01' : 'ROUTE-ALT-02'
              )
            }
            onWhatIf={(zoneId) => handleZoneSelect(zoneId, 'zones', 'whatif')}
            onResponderBrief={(zoneId) => handleZoneSelect(zoneId, 'zones', 'brief')}
          />

          {/* Risk Drivers */}
          <RiskDrivers
            factors={selectedZone.risk_drivers}
            zoneName={`${selectedZone.zone_id} — ${selectedZone.zone_name.toUpperCase()}`}
          />

          {/* Additional Geodetic & Technical Specs Card */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold uppercase text-[11px] border-b border-slate-200 pb-2">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>GIS Geodetic Specification</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Centroid Coordinates:</span>
                <span className="text-slate-900 font-bold">
                  {selectedZone.center[0].toFixed(4)}°N, {selectedZone.center[1].toFixed(4)}°E
                </span>
              </div>
              <div className="p-2 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Mean Elevation:</span>
                <span className="text-slate-900 font-bold">{selectedZone.elevation_avg_m} m MSL</span>
              </div>
              <div className="p-2 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Drainage Capacity:</span>
                <span className="text-amber-800 font-bold">{selectedZone.drainage_capacity_rating}</span>
              </div>
              <div className="p-2 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Projection:</span>
                <span className="text-blue-700 font-bold">WGS 84 / UTM 43N</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-[10px] text-amber-900 bg-amber-50 p-2 rounded-md border border-amber-200 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Static GIS zone geometry with live-input model estimates; no observed flood-depth layer is connected.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
