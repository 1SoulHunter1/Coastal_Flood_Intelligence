import React, { useState, useEffect } from 'react';
import type { ZoneData, RoadImpactItem, HospitalAccessibility, ShelterAccessibility, ResponderBriefing, PublicAlertTemplate, DemoZonePrediction, RiskDriverFactor } from '../types';
import { useStudyArea } from '../context/StudyAreaContext';
import {
  getZones,
  checkRoadAccessibility,
  checkFacilityAccessibility,
  getReachableShelters,
  getResponderBriefing,
  getPublicAlert
} from '../services/api';
import { RiskBadge } from '../components/dashboard/RiskBadge';
import { RiskDrivers } from '../components/dashboard/RiskDrivers';
import { RoadImpactAnalysis } from '../components/dashboard/RoadImpactAnalysis';
import { FacilityAccessibilityPanel } from '../components/dashboard/FacilityAccessibilityPanel';
import { WhatIfAnalysis } from '../components/dashboard/WhatIfAnalysis';
import { ResponderBriefingPanel } from '../components/dashboard/ResponderBriefingPanel';
import { PublicAlertGenerator } from '../components/dashboard/PublicAlertGenerator';
import {
  Layers,
  Activity,
  Car,
  Sliders,
  FileText,
  Megaphone,
  Hospital,
  Waves
} from 'lucide-react';
import { formatNumber } from '../utils';

interface ZoneAnalysisProps {
  initialZoneId?: string;
  initialTab?: string;
}

export const ZoneAnalysis: React.FC<ZoneAnalysisProps> = ({
  initialZoneId = 'Zone 03',
  initialTab = 'overview'
}) => {
  const { studyArea, config, setSelectedZoneId, demoScenario } = useStudyArea();
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Advanced data state
  const [roads, setRoads] = useState<RoadImpactItem[]>([]);
  const [hospitals, setHospitals] = useState<HospitalAccessibility[]>([]);
  const [shelters, setShelters] = useState<ShelterAccessibility[]>([]);
  const [responderBrief, setResponderBrief] = useState<ResponderBriefing | null>(null);
  const [publicAlert, setPublicAlert] = useState<PublicAlertTemplate | null>(null);

  useEffect(() => {
    Promise.all([
      getZones(studyArea),
      checkRoadAccessibility(undefined, studyArea),
      checkFacilityAccessibility(undefined, studyArea),
      getReachableShelters(studyArea),
      getResponderBriefing(initialZoneId, studyArea),
      getPublicAlert(initialZoneId, studyArea)
    ]).then(([zList, rList, hList, sList, briefData, alertData]) => {
      setZones(zList);
      const target =
        zList.find((z) => z.zone_id.toLowerCase() === initialZoneId.toLowerCase()) ||
        zList.find((z) => z.zone_id.toLowerCase() === config.defaultZoneId.toLowerCase()) ||
        zList[0];
      setSelectedZone(target);
      setRoads(rList);
      setHospitals(Array.isArray(hList) ? hList : [hList]);
      setShelters(sList);
      setResponderBrief(briefData);
      setPublicAlert(alertData);
    });
  }, [initialZoneId, studyArea, config.defaultZoneId]);

  const handleSelectZone = async (zone: ZoneData) => {
    setSelectedZone(zone);
    setSelectedZoneId(zone.zone_id);
    const [briefData, alertData] = await Promise.all([
      getResponderBriefing(zone.zone_id, studyArea),
      getPublicAlert(zone.zone_id, studyArea)
    ]);
    setResponderBrief(briefData);
    setPublicAlert(alertData);
  };

  if (!selectedZone || !responderBrief || !publicAlert) return null;

  const demoZones = demoScenario?.zones ?? (demoScenario?.zone ? [demoScenario.zone] : []);
  const demoInputs = demoScenario?.synthetic_inputs;
  const demoDriverInputs: Array<[string, number]> = [
    ['Recent rainfall', Math.min((demoInputs?.rain_24h ?? 400) / 400, 1)],
    ['High tide level', Math.min((demoInputs?.tide_m ?? 2) / 2, 1)],
    ['Storm surge', Math.min((demoInputs?.surge_m ?? 1) / 1, 1)],
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
  const displayedZones = zones.map((zone) => {
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
          facility_access_status: prediction.flood_probability >= 80
            ? 'DEMO PROXY: OFFICER REVIEW'
            : 'DEMO PROXY: NO HIGH-RISK FLAG'
        }
      : zone;
  });
  const displayedSelectedZone = displayedZones.find(
    (zone) => zone.zone_id === selectedZone.zone_id
  ) ?? selectedZone;
  const predictionFor = (zoneId: string): DemoZonePrediction | undefined =>
    demoZones.find((prediction) => prediction.zone_id === zoneId);
  const displayedRoads: RoadImpactItem[] = demoScenario
    ? roads.map((road) => {
        const prediction = predictionFor(road.zone_id);
        if (!prediction) return road;
        const depth = prediction.predicted_depth_m;
        const status = depth >= 0.30 ? 'CLOSED' : depth >= 0.15 ? 'AT_RISK' : 'OPEN';
        return {
          ...road,
          predicted_depth_m: depth,
          water_depth_cm: Math.round(depth * 100),
          status,
          closure_reason: `Demo-only surrogate q50 ${depth.toFixed(2)} m; not a verified road report.`
        };
      })
    : roads;
  const displayedHospitals: HospitalAccessibility[] = demoScenario
    ? hospitals.map((hospital) => {
        const prediction = predictionFor(hospital.zone_id);
        if (!prediction) return hospital;
        const depth = prediction.predicted_depth_m;
        const routeStatus = depth >= 0.30 ? 'CLOSED' : depth >= 0.15 ? 'AT_RISK' : 'OPEN';
        const accessStatus = routeStatus === 'CLOSED'
          ? 'CLOSED'
          : routeStatus === 'AT_RISK' || prediction.flood_probability >= 80
            ? 'AT_RISK'
            : 'OPEN';
        return {
          ...hospital,
          facility_flood_status: depth >= 0.30 ? 'INUNDATED' : depth >= 0.15 ? 'WATERLOGGED' : 'DRY',
          access_status: accessStatus,
          reason: `Demo-only surrogate estimate: ${prediction.flood_probability}% flood-label probability and ${depth.toFixed(2)} m median depth; verify facility and routes.`,
          primary_route: { ...hospital.primary_route, status: routeStatus }
        };
      })
    : hospitals;
  const displayedShelters: ShelterAccessibility[] = demoScenario
    ? shelters.map((shelter) => {
        const prediction = predictionFor(shelter.zone_id);
        if (!prediction) return shelter;
        const depth = prediction.predicted_depth_m;
        const road_accessibility = depth >= 0.30
          ? 'CLOSED'
          : depth >= 0.15 || prediction.flood_probability >= 80
            ? 'AT_RISK'
            : 'OPEN';
        return {
          ...shelter,
          road_accessibility,
          route_status: road_accessibility === 'CLOSED'
            ? 'NOT ACCESSIBLE'
            : road_accessibility === 'AT_RISK'
              ? 'RESTRICTED'
              : 'OPEN ACCESS'
        };
      })
    : shelters;
  const selectedDemoPrediction = predictionFor(displayedSelectedZone.zone_id);
  const displayedBrief: ResponderBriefing = demoScenario && selectedDemoPrediction
    ? {
        ...responderBrief,
        zone_id: displayedSelectedZone.zone_id,
        zone_name: displayedSelectedZone.zone_name,
        headline: `DEMO ONLY — ${selectedDemoPrediction.risk_level} surrogate scenario; officer verification required`,
        risk_level: selectedDemoPrediction.risk_level,
        expected_onset: 'Synthetic demo scenario',
        expected_peak: 'Synthetic demo scenario',
        roads_affected_count: displayedRoads.filter(
          (road) => road.zone_id === displayedSelectedZone.zone_id && road.status !== 'OPEN'
        ).length,
        roads_closed_count: displayedRoads.filter(
          (road) => road.zone_id === displayedSelectedZone.zone_id && road.status === 'CLOSED'
        ).length,
        critical_facilities_at_risk_count: displayedHospitals.filter(
          (hospital) => hospital.zone_id === displayedSelectedZone.zone_id && hospital.access_status !== 'OPEN'
        ).length,
        key_actions: [
          'DEMO ONLY: duty officer to verify conditions before any public warning.',
          `Review ${selectedDemoPrediction.flood_probability}% surrogate probability and ${selectedDemoPrediction.predicted_depth_m.toFixed(2)} m median depth.`,
          'Confirm road access and facility status directly; no live field reports are connected.'
        ],
        responder_actions: [
          {
            category: 'IMMEDIATE',
            action: 'Duty officer to independently verify the synthetic high-risk model output.',
            target_location: displayedSelectedZone.zone_name,
            timing: 'Before any public dispatch',
            priority: 'URGENT'
          },
          {
            category: 'ROUTE MANAGEMENT',
            action: 'Check route conditions with local authorities; this view only uses a zone-level depth proxy.',
            target_location: displayedSelectedZone.zone_name,
            timing: 'Before responder movement',
            priority: 'HIGH'
          },
          {
            category: 'MONITORING',
            action: 'Use this scenario for demonstration only; do not treat it as an observed flood.',
            target_location: displayedSelectedZone.zone_name,
            timing: 'Ongoing',
            priority: 'STANDARD'
          }
        ]
      }
    : responderBrief;
  const displayedPublicAlert: PublicAlertTemplate = demoScenario && selectedDemoPrediction
    ? {
        ...publicAlert,
        zone_id: displayedSelectedZone.zone_id,
        zone_name: displayedSelectedZone.zone_name,
        risk_level: selectedDemoPrediction.risk_level,
        expected_onset: 'Synthetic demo scenario',
        expected_peak: 'Synthetic demo scenario',
        english: {
          ...publicAlert.english,
          title: `DEMO ONLY — ${selectedDemoPrediction.risk_level} RISK SCENARIO`,
          body: `Synthetic scenario for ${displayedSelectedZone.zone_name}: the surrogate estimates ${selectedDemoPrediction.flood_probability}% flood-label probability and ${selectedDemoPrediction.predicted_depth_m.toFixed(2)} m median depth. This is not an observation or an official warning. Do not distribute.`,
          advisory: 'Internal demonstration only. Verify conditions; no public alert has been sent.',
          sms_text: `DEMO ONLY: ${displayedSelectedZone.zone_name} surrogate probability ${selectedDemoPrediction.flood_probability}%, median depth ${selectedDemoPrediction.predicted_depth_m.toFixed(2)} m. Not an official warning. Do not distribute.`,
          whatsapp_text: `DEMO ONLY — ${displayedSelectedZone.zone_name}: synthetic surrogate estimate ${selectedDemoPrediction.flood_probability}% probability, ${selectedDemoPrediction.predicted_depth_m.toFixed(2)} m median depth. Verify independently; no public broadcast sent.`
        },
        kannada: {
          ...publicAlert.kannada,
          title: `ಡೆಮೋ ಮಾತ್ರ — ${selectedDemoPrediction.risk_level} ಅಪಾಯ ಸನ್ನಿವೇಶ`,
          body: `ಡೆಮೋ ಮಾತ್ರ: ${displayedSelectedZone.zone_name} ಗಾಗಿ ಕೃತಕ ಸನ್ನಿವೇಶ. ಮಾದರಿಯ ಪ್ರವಾಹ ಸಾಧ್ಯತೆ ${selectedDemoPrediction.flood_probability}% ಮತ್ತು ಮಧ್ಯಮ ಆಳ ${selectedDemoPrediction.predicted_depth_m.toFixed(2)} ಮೀ. ಇದು ಅಧಿಕೃತ ಎಚ್ಚರಿಕೆ ಅಲ್ಲ. ಸಾರ್ವಜನಿಕರಿಗೆ ಹಂಚಬೇಡಿ.`,
          advisory: 'ಆಂತರಿಕ ಡೆಮೋ ಮಾತ್ರ. ಪರಿಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ; ಸಾರ್ವಜನಿಕ ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಿಲ್ಲ.',
          sms_text: `ಡೆಮೋ ಮಾತ್ರ: ${displayedSelectedZone.zone_name}, ಮಾದರಿ ಸಾಧ್ಯತೆ ${selectedDemoPrediction.flood_probability}%, ಮಧ್ಯಮ ಆಳ ${selectedDemoPrediction.predicted_depth_m.toFixed(2)} ಮೀ. ಅಧಿಕೃತ ಎಚ್ಚರಿಕೆ ಅಲ್ಲ.`,
          whatsapp_text: `ಡೆಮೋ ಮಾತ್ರ — ${displayedSelectedZone.zone_name} ಗಾಗಿ ಕೃತಕ ಮಾದರಿ ಅಂದಾಜು: ${selectedDemoPrediction.flood_probability}% ಸಾಧ್ಯತೆ, ${selectedDemoPrediction.predicted_depth_m.toFixed(2)} ಮೀ ಮಧ್ಯಮ ಆಳ. ಪರಿಶೀಲಿಸಿ; ಸಾರ್ವಜನಿಕ ಪ್ರಸಾರ ಇಲ್ಲ.`
        }
      }
    : publicAlert;

  const tabs = [
    { id: 'overview', label: 'OVERVIEW', icon: Layers },
    { id: 'impact', label: 'ROAD IMPACT', icon: Car },
    { id: 'access', label: 'FACILITY ACCESS', icon: Hospital },
    { id: 'explanation', label: 'EXPLANATION', icon: Activity },
    { id: 'whatif', label: 'WHAT-IF ANALYSIS', icon: Sliders },
    { id: 'brief', label: 'RESPONDER BRIEF', icon: FileText },
    { id: 'alerts', label: 'PUBLIC ALERTS', icon: Megaphone },
  ];

  const population = displayedSelectedZone.estimated_population || displayedSelectedZone.population_at_risk || 12400;
  const buildings = displayedSelectedZone.affected_buildings || displayedSelectedZone.estimated_impact?.buildings || 1240;
  const predictedDepth = displayedSelectedZone.predicted_depth_m == null
    ? 'Unavailable'
    : `${displayedSelectedZone.predicted_depth_m.toFixed(2)} m`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 font-mono shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              ZONE INTELLIGENCE & IMPACT WORKSTATION
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              OPERATIONAL ANALYSIS
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Access-aware hydrodynamic intelligence, counterfactual exploration and response dispatch
          </p>
        </div>

        {/* Zone Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-500 font-bold mr-1">SELECT ZONE:</span>
          {displayedZones.map((zone) => {
            const isSelected = displayedSelectedZone.zone_id === zone.zone_id;
            return (
              <button
                key={zone.zone_id}
                onClick={() => handleSelectZone(zone)}
                className={`px-3 py-1.5 rounded-md text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{zone.zone_id}</span>
                <span className="text-[10px] opacity-80">({zone.zone_name})</span>
              </button>
            );
          })}
        </div>
      </div>

      {demoScenario && (
        <div role="status" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-950">
          DEMO SCENARIO ACTIVE — zone probabilities, road/facility proxies, explanation, what-if baseline, responder brief, and alert draft reflect synthetic inputs. No public alert was sent.
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2 font-mono">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            {/* Metric 1 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                Risk Classification
              </span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900">{displayedSelectedZone.zone_id}</span>
                <RiskBadge level={displayedSelectedZone.risk_level} />
              </div>
              <div className="text-[11px] text-slate-600 mt-2">
                Probability: <strong className="text-orange-600">{displayedSelectedZone.flood_probability}%</strong>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                Predicted Flood Depth
              </span>
              <div className="text-2xl font-extrabold text-blue-700 flex items-center gap-1.5">
                <Waves className="w-5 h-5 text-blue-600" />
                <span>{predictedDepth}</span>
              </div>
              <div className="text-[10px] text-red-600 font-bold mt-2">
                Vehicle threshold: &ge;0.30m CLOSED
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                Onset & Peak Window
              </span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Onset:</span>
                  <span className="font-bold text-slate-900">{displayedSelectedZone.expected_onset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Peak:</span>
                  <span className="font-bold text-red-700">{displayedSelectedZone.expected_peak}</span>
                </div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                Population & Structures
              </span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Population:</span>
                  <span className="font-bold text-slate-900">{formatNumber(population)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Buildings:</span>
                  <span className="font-bold text-slate-900">{formatNumber(buildings)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Overview Split: Contributing Factors + Quick Access Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <RiskDrivers
                factors={selectedDemoPrediction ? demoRiskDrivers : displayedSelectedZone.risk_drivers}
                zoneName={`${displayedSelectedZone.zone_id} — ${displayedSelectedZone.zone_name.toUpperCase()}`}
              />
            </div>
            <div className="lg:col-span-6">
              <ResponderBriefingPanel briefing={displayedBrief} />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: ROAD IMPACT (Feature 1A & 1B) */}
      {activeTab === 'impact' && (
        <div className="space-y-4">
          <RoadImpactAnalysis
            roads={displayedRoads}
            selectedZoneId={displayedSelectedZone.zone_id}
          />
        </div>
      )}

      {/* Tab 3: FACILITY & ACCESS (Feature 1D, 1E, 8) */}
      {activeTab === 'access' && (
        <div className="space-y-4">
          <FacilityAccessibilityPanel
            hospitals={displayedHospitals}
            shelters={displayedShelters}
          />
        </div>
      )}

      {/* Tab 4: EXPLANATION (SHAP Plain-English) (Feature 2) */}
      {activeTab === 'explanation' && (
        <div className="space-y-4">
          <RiskDrivers
            factors={selectedDemoPrediction ? demoRiskDrivers : displayedSelectedZone.risk_drivers}
            zoneName={`${displayedSelectedZone.zone_id} — ${displayedSelectedZone.zone_name.toUpperCase()}`}
          />
        </div>
      )}

      {/* Tab 5: WHAT-IF ANALYSIS (Feature 3) */}
      {activeTab === 'whatif' && (
        <div className="space-y-4">
          <WhatIfAnalysis
            zoneId={displayedSelectedZone.zone_id}
            zoneName={displayedSelectedZone.zone_name}
            demoMode={Boolean(demoScenario)}
          />
        </div>
      )}

      {/* Tab 6: RESPONDER BRIEF (Feature 4 & 5) */}
      {activeTab === 'brief' && (
        <div className="space-y-4">
          <ResponderBriefingPanel briefing={displayedBrief} />
        </div>
      )}

      {/* Tab 7: PUBLIC ALERTS (Feature 6 & 7) */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <PublicAlertGenerator alert={displayedPublicAlert} demoMode={Boolean(demoScenario)} />
        </div>
      )}
    </div>
  );
};
