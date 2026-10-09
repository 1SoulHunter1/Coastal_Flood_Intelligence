import React, { useState, useEffect } from 'react';
import type {
  EnvironmentConditions,
  ZoneData,
  ForecastPoint,
  InfrastructureSummary,
  AlertItem,
  EmergencyPriorityItem,
  SituationBriefData,
  SystemAccessSummary,
  RiskDriverFactor
} from '../types';
import { useStudyArea } from '../context/StudyAreaContext';
import {
  getEnvironmentConditions,
  getZones,
  getFloodTimeline,
  getInfrastructure,
  getAlerts,
  getEmergencyPriority,
  getSituationBrief,
  getSystemAccessSummary
} from '../services/api';
import { EnvironmentSection } from '../components/dashboard/EnvironmentSection';
import { FloodMap } from '../components/map/FloodMap';
import { SelectedZonePanel } from '../components/dashboard/SelectedZonePanel';
import { RiskDrivers } from '../components/dashboard/RiskDrivers';
import { ForecastChart } from '../components/dashboard/ForecastChart';
import { InfrastructureImpact } from '../components/dashboard/InfrastructureImpact';
import { AccessImpactCard } from '../components/dashboard/AccessImpactCard';
import { EmergencyPriorityTable } from '../components/dashboard/EmergencyPriorityTable';
import { AlertPanel } from '../components/dashboard/AlertPanel';
import { CurrentSituation } from '../components/dashboard/CurrentSituation';
import { RecommendedResponse } from '../components/dashboard/RecommendedResponse';
import { Navigation, X } from 'lucide-react';

interface OverviewProps {
  onNavigateToZoneAnalysis?: (zoneId?: string, initialTab?: string) => void;
  onNavigateToAlerts?: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  onNavigateToAlerts
}) => {
  const { studyArea, config, selectedZoneId, setSelectedZoneId, handleZoneSelect, demoScenario } = useStudyArea();
  const [conditions, setConditions] = useState<EnvironmentConditions | null>(null);
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [infrastructureSummary, setInfrastructureSummary] = useState<InfrastructureSummary | null>(null);
  const [priorityItems, setPriorityItems] = useState<EmergencyPriorityItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [brief, setBrief] = useState<SituationBriefData | null>(null);
  const [accessSummary, setAccessSummary] = useState<SystemAccessSummary | null>(null);
  const [highlightRouteId, setHighlightRouteId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          envData,
          zonesData,
          forecastData,
          infraData,
          priorityData,
          alertsData,
          briefData,
          accessData
        ] = await Promise.all([
          getEnvironmentConditions(studyArea),
          getZones(studyArea),
          getFloodTimeline(studyArea),
          getInfrastructure(studyArea),
          getEmergencyPriority(studyArea),
          getAlerts(studyArea),
          getSituationBrief(studyArea),
          getSystemAccessSummary(studyArea)
        ]);

        setConditions(envData);
        const demoZones = demoScenario?.zones ?? (demoScenario?.zone ? [demoScenario.zone] : []);
        const demoDriverInputs: Array<[string, number]> = [
          ['Recent rainfall', Math.min((demoScenario?.synthetic_inputs?.rain_24h ?? 400) / 400, 1)],
          ['High tide level', Math.min((demoScenario?.synthetic_inputs?.tide_m ?? 2) / 2, 1)],
          ['Storm surge', Math.min((demoScenario?.synthetic_inputs?.surge_m ?? 1) / 1, 1)],
          ['Low ground elevation', 0.5]
        ];
        const driverTotal = demoDriverInputs.reduce((total, [, value]) => total + value, 0);
        const demoRiskDrivers: RiskDriverFactor[] = demoDriverInputs.map(([factor, value], index) => ({
          factor,
          percentage: index === demoDriverInputs.length - 1
            ? 100 - demoDriverInputs.slice(0, -1).reduce(
                (total, [, previous]) => total + Math.round((previous / driverTotal) * 100),
                0
              )
            : Math.round((value / driverTotal) * 100),
          impact_description: 'Heuristic contribution for synthetic demo inputs'
        }));
        const displayedZones = zonesData.map((zone) => {
          const prediction = demoZones.find((item) => item.zone_id === zone.zone_id);
          return prediction
            ? {
                ...zone,
                ...prediction,
                risk_drivers: demoRiskDrivers,
                expected_onset: 'Synthetic demo scenario',
                expected_peak: 'Synthetic demo scenario',
                road_access_status: prediction.predicted_depth_m >= 0.30
                  ? 'DEMO PROXY: CLOSED'
                  : prediction.predicted_depth_m >= 0.15
                    ? 'DEMO PROXY: AT RISK'
                    : 'DEMO PROXY: OPEN',
                facility_access_status: prediction.predicted_depth_m >= 0.15
                  ? 'DEMO PROXY: REVIEW'
                  : 'DEMO PROXY: NO DEPTH THRESHOLD',
              }
            : zone;
        });
        setZones(displayedZones);
        const initialZone =
          displayedZones.find((z) => z.zone_id.toLowerCase() === selectedZoneId.toLowerCase()) ||
          displayedZones.find((z) => z.zone_id.toLowerCase() === config.defaultZoneId.toLowerCase()) ||
          displayedZones[0];
        setSelectedZone(initialZone);
        setForecast(forecastData);
        const demoAtRiskZones = displayedZones.filter(
          (zone) => zone.risk_level === 'HIGH' || zone.risk_level === 'CRITICAL'
        );
        setInfrastructureSummary(demoScenario
          ? {
              ...infraData.summary,
              hospitals_at_risk: null,
              schools_at_risk: null,
              road_segments_affected: displayedZones.reduce(
                (total, zone) => total + (zone.predicted_depth_m != null && zone.predicted_depth_m >= 0.15 ? zone.affected_roads : 0),
                0
              ),
              buildings_affected: demoAtRiskZones.reduce((total, zone) => total + zone.affected_buildings, 0),
              critical_facilities_at_risk: demoAtRiskZones.reduce((total, zone) => total + zone.critical_facilities, 0),
            }
          : infraData.summary);
        setPriorityItems(demoScenario
          ? priorityData
              .map((item) => {
                const prediction = demoZones.find((zone) => zone.zone_id === item.zone_id);
                return prediction
                  ? {
                      ...item,
                      risk_level: prediction.risk_level,
                      priority_score: prediction.flood_probability,
                      priority: prediction.risk_level === 'CRITICAL'
                        ? 'IMMEDIATE'
                        : prediction.risk_level === 'HIGH'
                          ? 'URGENT'
                          : prediction.risk_level === 'MODERATE'
                            ? 'HIGH'
                            : 'MONITOR',
                      rationale: `Synthetic demo surrogate probability ${prediction.flood_probability}%; not a verified observation.`
                    }
                  : item;
              })
              .sort((a, b) => b.priority_score - a.priority_score)
              .map((item, index) => ({ ...item, rank: index + 1 }))
          : priorityData);
        setAlerts(alertsData);
        const primaryDemoZone = demoZones.find((zone) => zone.zone_id === demoScenario?.zone_id);
        setBrief(demoScenario && primaryDemoZone
          ? {
              ...briefData,
              title: 'Synthetic officer alert demonstration',
              headline: `DEMO ONLY — ${primaryDemoZone.risk_level} model scenario for ${primaryDemoZone.zone_name}.`,
              narrative_paragraph_1: `Synthetic rainfall and tide inputs produce a surrogate flood-label probability of ${primaryDemoZone.flood_probability}% and median depth of ${primaryDemoZone.predicted_depth_m.toFixed(2)} m.`,
              narrative_paragraph_2: 'These estimates are for demonstration and officer review only. Verify actual conditions before any public warning.',
              recommended_primary_zone: `${primaryDemoZone.zone_id} — ${primaryDemoZone.zone_name}`,
              key_meteorological_trigger: 'Synthetic demo inputs; not live observations'
            }
          : briefData);
        const roadsClosed = displayedZones.reduce(
          (total, zone) => total + (zone.predicted_depth_m != null && zone.predicted_depth_m >= 0.30 ? zone.affected_roads : 0),
          0
        );
        const roadsAtRisk = displayedZones.reduce(
          (total, zone) => total + (zone.predicted_depth_m != null && zone.predicted_depth_m >= 0.15 && zone.predicted_depth_m < 0.30 ? zone.affected_roads : 0),
          0
        );
        setAccessSummary(demoScenario
          ? {
              ...accessData,
              roads_closed_count: roadsClosed,
              roads_at_risk_count: roadsAtRisk,
              hospitals_accessible_ratio: 'Not verified',
              shelters_reachable_ratio: 'Not verified',
              critical_facilities_count: demoAtRiskZones.reduce((total, zone) => total + zone.critical_facilities, 0),
              access_status_headline: 'DEMO ONLY — field access has not been verified.'
            }
          : accessData);
        setLoadError(null);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Unknown live API error.');
      }
    };

    loadData();
  }, [studyArea, selectedZoneId, config.defaultZoneId, refreshToken, demoScenario]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRefreshToken((token) => token + 1);
    }, 180000);
    return () => window.clearInterval(timer);
  }, []);

  if (!conditions || !selectedZone || !infrastructureSummary || !brief) {
    if (loadError) {
      return (
        <div role="alert" className="m-6 rounded-lg border border-rose-300 bg-rose-50 p-6 text-rose-900">
          <h2 className="font-bold">Live operations data is unavailable</h2>
          <p className="mt-2 text-sm">{loadError}</p>
          <button
            className="mt-4 rounded bg-rose-800 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setRefreshToken((token) => token + 1)}
          >
            Retry live data
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-96 font-mono text-slate-500">
        <div className="flex items-center gap-3 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-slate-800">
            LOADING {config.name.toUpperCase()} OPERATIONS INTELLIGENCE...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          Live refresh failed; displayed values may be stale. {loadError}
          <button
            className="ml-3 font-bold underline"
            onClick={() => setRefreshToken((token) => token + 1)}
          >
            Retry
          </button>
        </div>
      )}
      {demoScenario && (
        <div role="status" className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-950">
          DEMO SCENARIO ACTIVE — map, zone estimates, priority ranking, responder draft, and alert preview reflect synthetic model inputs. Environmental observations remain live; no public alert was sent.
        </div>
      )}
      {/* SECTION 1 — ENVIRONMENT CONDITIONS */}
      <section aria-label="Environment Conditions">
        <EnvironmentSection conditions={conditions} />
      </section>

      {/* SECTION 2 & 3 & 4 — MAIN FLOOD MAP + SELECTED ZONE INTELLIGENCE + RISK DRIVERS */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Main Flood Map */}
        <div className="xl:col-span-8 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs"></span>
              <h2 className="text-sm font-bold font-mono tracking-wider text-slate-900 uppercase">
                COASTAL FLOOD RISK GIS MAP
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {highlightRouteId && (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-blue-50 border border-blue-300 text-blue-900 text-[11px] font-mono animate-pulse">
                  <Navigation className="w-3.5 h-3.5 text-blue-700" />
                  <span className="font-bold">ACTIVE ROUTE: {highlightRouteId} (Bypass Corridor)</span>
                  <button
                    onClick={() => setHighlightRouteId(null)}
                    className="ml-1 p-0.5 hover:bg-blue-200 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
                    title="Clear route highlight"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                Interactive Leaflet GIS • {config.displayName} Estuary System
              </span>
            </div>
          </div>

          <FloodMap
            zones={zones}
            selectedZone={selectedZone}
            onSelectZone={(zone) => {
              setSelectedZone(zone);
              setSelectedZoneId(zone.zone_id);
            }}
            heightClass="h-[560px]"
            highlightRouteId={highlightRouteId || undefined}
          />
        </div>

        {/* Right Column (4 cols): Selected Zone Intelligence + Why Zone is At Risk */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          {/* SECTION 3 — SELECTED ZONE INTELLIGENCE */}
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

          {/* SECTION 4 — WHY THIS ZONE IS AT RISK */}
          <RiskDrivers
            factors={selectedZone.risk_drivers}
            zoneName={`${selectedZone.zone_id} — ${selectedZone.zone_name.toUpperCase()}`}
          />
        </div>
      </section>

      {/* SECTION 5 & 6 — FLOOD FORECAST + INFRASTRUCTURE IMPACT & ACCESS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SECTION 5: 24-HOUR FLOOD FORECAST */}
        <div className="lg:col-span-7">
          <ForecastChart
            data={forecast}
            zoneTitle={`${selectedZone.zone_id} — ${selectedZone.zone_name.toUpperCase()}`}
          />
        </div>

        {/* SECTION 6: EXPECTED INFRASTRUCTURE IMPACT & ACCESS */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {accessSummary && (
            <AccessImpactCard
              summary={accessSummary}
              demoMode={Boolean(demoScenario)}
              onViewRouteDetails={() => handleZoneSelect(selectedZone.zone_id, 'zones', 'access')}
            />
          )}
          <InfrastructureImpact summary={infrastructureSummary} />
        </div>
      </section>

      {/* SECTION 7 & 8 — EMERGENCY RESPONSE PRIORITY + ACTIVE ALERTS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION 7: EMERGENCY RESPONSE PRIORITY TABLE */}
        <div className="lg:col-span-7">
          <EmergencyPriorityTable
            items={priorityItems}
            onSelectZone={(zoneId) => handleZoneSelect(zoneId, 'map')}
            selectedZoneId={selectedZone.zone_id}
          />
        </div>

        {/* SECTION 8: ACTIVE ALERTS */}
        <div className="lg:col-span-5">
          <AlertPanel
            alerts={alerts}
            onSelectZone={(zoneId) => handleZoneSelect(zoneId, 'map')}
            onViewAllAlerts={onNavigateToAlerts}
          />
        </div>
      </section>

      {/* SECTION 9 — CURRENT SITUATION */}
      <section aria-label="Current Situation">
        <CurrentSituation brief={brief} />
      </section>

      {/* SECTION 10 — RECOMMENDED RESPONSE */}
      <section aria-label="Recommended Response">
        <RecommendedResponse onFocusZone={(zoneId) => handleZoneSelect(zoneId, 'map')} />
      </section>
    </div>
  );
};
