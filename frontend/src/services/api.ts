import type {
  ZoneData,
  EnvironmentConditions,
  ForecastPoint,
  InfrastructureSummary,
  CriticalFacility,
  RoadSegment,
  AlertItem,
  EmergencyPriorityItem,
  SituationBriefData,
  RoadImpactItem,
  HospitalAccessibility,
  ShelterAccessibility,
  SystemAccessSummary,
  EmergencyRoute,
  CounterfactualInputs,
  CounterfactualScenario,
  ResponderBriefing,
  PublicAlertTemplate,
  DemoOfficerAlert
} from '../types';

import * as mangaluru from '../data/mangaluru';
import * as udupi from '../data/udupi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
const DEMO_FALLBACK_ENABLED = import.meta.env.VITE_ENABLE_DEMO_FALLBACK === 'true';
const API_TIMEOUT_MS = 35000;

/**
 * JSON request helper. Demo data is available only when explicitly enabled.
 */
async function requestJson<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...init,
      signal: controller.signal
    });
    if (!res.ok) {
      const body = await res.text();
      let message = body || res.statusText;
      try {
        const parsed = JSON.parse(body) as { detail?: unknown };
        if (typeof parsed.detail === 'string') message = parsed.detail;
      } catch {
        // Keep the response body as the error detail when it is not JSON.
      }
      throw new Error(`API ${res.status} on ${endpoint}: ${message}`);
    }
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`API request timed out on ${endpoint}.`);
    }
    if (error instanceof Error) throw error;
    throw new Error(`API request failed on ${endpoint}.`);
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithFallback<T>(endpoint: string, fallback: () => Promise<T>): Promise<T> {
  try {
    return await requestJson<T>(endpoint);
  } catch (error) {
    if (!DEMO_FALLBACK_ENABLED) throw error;
    console.warn(`[CoastGuard-AI] API unavailable; explicit demo fallback is enabled.`, error);
    return fallback();
  }
}

async function postWithFallback<T, B>(endpoint: string, body: B, fallback: () => Promise<T>): Promise<T> {
  try {
    return await requestJson<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (error) {
    if (!DEMO_FALLBACK_ENABLED) throw error;
    console.warn(`[CoastGuard-AI] API unavailable; explicit demo fallback is enabled.`, error);
    return fallback();
  }
}

// Helper to determine active dataset
const isUdupi = (area?: string) => area?.toLowerCase() === 'udupi';

export const triggerDemoOfficerAlert = async (studyArea: string): Promise<DemoOfficerAlert> => {
  return requestJson<DemoOfficerAlert>(
    `/demo/trigger-officer-alert?study_area=${encodeURIComponent(studyArea)}`,
    { method: 'POST' }
  );
};

export const getDemoOfficerInbox = async (): Promise<DemoOfficerAlert[]> => {
  return requestJson<DemoOfficerAlert[]>('/demo/officer-inbox?limit=10');
};

export const getDemoCounterfactualScenario = async (
  zoneId: string,
  inputs: CounterfactualInputs,
  studyArea: string
): Promise<CounterfactualScenario> => {
  return requestJson<CounterfactualScenario>('/demo/what-if', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zone_id: zoneId, study_area: studyArea, ...inputs })
  });
};

export const getEnvironmentConditions = async (studyArea: string = 'mangaluru'): Promise<EnvironmentConditions> => {
  return fetchWithFallback(
    `/environment/current?study_area=${encodeURIComponent(studyArea)}`,
    () => Promise.resolve(isUdupi(studyArea) ? udupi.udupiEnvironmentConditions : mangaluru.demoEnvironmentConditions)
  );
};

export const getZones = async (studyArea: string = 'mangaluru'): Promise<ZoneData[]> => {
  return fetchWithFallback(
    `/zones?study_area=${encodeURIComponent(studyArea)}`,
    () => Promise.resolve(isUdupi(studyArea) ? udupi.udupiZones : mangaluru.demoZones)
  );
};

export const getZoneDetails = async (zoneId: string, studyArea: string = 'mangaluru'): Promise<ZoneData> => {
  return fetchWithFallback(
    `/zones/${encodeURIComponent(zoneId)}?study_area=${encodeURIComponent(studyArea)}`,
    () => {
      const list = isUdupi(studyArea) ? udupi.udupiZones : mangaluru.demoZones;
      const found = list.find((z) => z.zone_id.toLowerCase() === zoneId.toLowerCase()) || list[0];
      return Promise.resolve(found);
    }
  );
};

export const getFloodRisk = async (studyArea: string = 'mangaluru'): Promise<{
  zones: ZoneData[];
  highRiskZonesCount: number;
  totalPopulationAtRisk: number;
  overallSystemRisk: string;
}> => {
  return fetchWithFallback(
    `/zones/summary?study_area=${encodeURIComponent(studyArea)}`,
    () => {
      const list = isUdupi(studyArea) ? udupi.udupiZones : mangaluru.demoZones;
      const highRiskCount = list.filter(z => z.risk_level === 'HIGH' || z.risk_level === 'CRITICAL').length;
      const totalPop = list.reduce((acc, z) => acc + (z.estimated_population || z.population_at_risk || 0), 0);
      return Promise.resolve({
        zones: list,
        highRiskZonesCount: highRiskCount,
        totalPopulationAtRisk: totalPop,
        overallSystemRisk: isUdupi(studyArea)
          ? 'ELEVATED - MALPE HARBOR & SWARNA ESTUARY SURGE'
          : 'ELEVATED - ACTIVE TIDE & RAIN INTERFERENCE'
      });
    }
  );
};

export const getFloodTimeline = async (studyArea: string = 'mangaluru', zoneId?: string): Promise<ForecastPoint[]> => {
  const query = `?study_area=${encodeURIComponent(studyArea)}${zoneId ? `&zone_id=${encodeURIComponent(zoneId)}` : ''}`;
  return fetchWithFallback(
    `/forecast/timeline${query}`,
    () => Promise.resolve(isUdupi(studyArea) ? udupi.udupiForecastTimeline : mangaluru.demoForecastTimeline)
  );
};

export const getInfrastructure = async (studyArea: string = 'mangaluru', zoneId?: string): Promise<{
  summary: InfrastructureSummary;
  facilities: CriticalFacility[];
  roads: RoadSegment[];
}> => {
  const query = `?study_area=${encodeURIComponent(studyArea)}${zoneId ? `&zone_id=${encodeURIComponent(zoneId)}` : ''}`;
  return fetchWithFallback(
    `/infrastructure/summary${query}`,
    () => {
      if (isUdupi(studyArea)) {
        return Promise.resolve({
          summary: udupi.udupiInfrastructureSummary,
          facilities: udupi.udupiCriticalFacilities,
          roads: []
        });
      }
      return Promise.resolve({
        summary: mangaluru.demoInfrastructureSummary,
        facilities: mangaluru.demoCriticalFacilities,
        roads: mangaluru.demoRoadSegments
      });
    }
  );
};

export const getAlerts = async (studyArea: string = 'mangaluru'): Promise<AlertItem[]> => {
  return fetchWithFallback(
    `/alerts/active?study_area=${encodeURIComponent(studyArea)}`,
    () => Promise.resolve(isUdupi(studyArea) ? udupi.udupiActiveAlerts : mangaluru.demoActiveAlerts)
  );
};

export const getEmergencyPriority = async (studyArea: string = 'mangaluru'): Promise<EmergencyPriorityItem[]> => {
  return fetchWithFallback(
    `/emergency/priority-table?study_area=${encodeURIComponent(studyArea)}`,
    () => Promise.resolve(isUdupi(studyArea) ? udupi.udupiEmergencyPriorityTable : mangaluru.demoEmergencyPriorityTable)
  );
};

export const getSituationBrief = async (studyArea: string = 'mangaluru'): Promise<SituationBriefData> => {
  return fetchWithFallback(
    `/emergency/situation-brief?study_area=${encodeURIComponent(studyArea)}`,
    () => Promise.resolve(isUdupi(studyArea) ? udupi.udupiSituationBrief : mangaluru.demoSituationBrief)
  );
};

export const getFacilities = async (studyArea: string = 'mangaluru'): Promise<CriticalFacility[]> => {
  return fetchWithFallback(
    `/infrastructure/facilities?study_area=${encodeURIComponent(studyArea)}`,
    () => Promise.resolve(isUdupi(studyArea) ? udupi.udupiCriticalFacilities : mangaluru.demoCriticalFacilities)
  );
};

// Advanced Routing & NetworkX-ready interfaces
export const getBlockedRoads = async (studyArea: string = 'mangaluru'): Promise<RoadImpactItem[]> => {
  return fetchWithFallback(
    `/routing/blocked-roads?study_area=${encodeURIComponent(studyArea)}`,
    () => {
      const list = isUdupi(studyArea) ? udupi.udupiRoadImpacts : mangaluru.demoRoadImpacts;
      return Promise.resolve(list.filter((r) => r.status === 'CLOSED'));
    }
  );
};

export const checkRoadAccessibility = async (roadId?: string, studyArea: string = 'mangaluru'): Promise<RoadImpactItem[]> => {
  const query = `?study_area=${encodeURIComponent(studyArea)}${roadId ? `&road_id=${encodeURIComponent(roadId)}` : ''}`;
  return fetchWithFallback(
    `/routing/roads-impact${query}`,
    () => {
      const list = isUdupi(studyArea) ? udupi.udupiRoadImpacts : mangaluru.demoRoadImpacts;
      if (roadId) {
        return Promise.resolve(list.filter((r) => r.id === roadId));
      }
      return Promise.resolve(list);
    }
  );
};

export const checkFacilityAccessibility = async (
  facilityId?: string,
  studyArea: string = 'mangaluru'
): Promise<HospitalAccessibility | HospitalAccessibility[]> => {
  const query = `?study_area=${encodeURIComponent(studyArea)}${facilityId ? `&hospital_id=${encodeURIComponent(facilityId)}` : ''}`;
  return fetchWithFallback<HospitalAccessibility | HospitalAccessibility[]>(
    `/routing/hospitals-accessibility${query}`,
    () => {
      const list = isUdupi(studyArea) ? udupi.udupiHospitalsAccessibility : mangaluru.demoHospitalsAccessibility;
      if (facilityId) {
        const hospital = list.find((h) => h.id === facilityId) || list[0];
        return Promise.resolve(hospital);
      }
      return Promise.resolve(list);
    }
  );
};

export const findAlternativeRoute = async (facilityId?: string, studyArea: string = 'mangaluru'): Promise<EmergencyRoute | undefined> => {
  const query = `?study_area=${encodeURIComponent(studyArea)}${facilityId ? `&facility_id=${encodeURIComponent(facilityId)}` : ''}`;
  return fetchWithFallback(
    `/routing/alternative-route${query}`,
    () => {
      if (isUdupi(studyArea)) {
        return Promise.resolve(udupi.udupiEmergencyRoutes[0]);
      }
      if (facilityId === 'HOSP-WENLOCK' || !facilityId) {
        return Promise.resolve(mangaluru.demoEmergencyRoutes.find((r) => r.id === 'ROUTE-ALT-02'));
      }
      return Promise.resolve(mangaluru.demoEmergencyRoutes.find((r) => r.status === 'OPEN'));
    }
  );
};

export const getReachableShelters = async (studyArea: string = 'mangaluru'): Promise<ShelterAccessibility[]> => {
  return fetchWithFallback(
    `/routing/shelters-accessibility?study_area=${encodeURIComponent(studyArea)}`,
    () => {
      const list = isUdupi(studyArea) ? udupi.udupiSheltersAccessibility : mangaluru.demoSheltersAccessibility;
      return Promise.resolve(list.filter((s) => s.road_accessibility === 'OPEN'));
    }
  );
};

export const getReachableHospitals = async (studyArea: string = 'mangaluru'): Promise<HospitalAccessibility[]> => {
  return fetchWithFallback(
    `/routing/hospitals-accessibility?study_area=${encodeURIComponent(studyArea)}`,
    () => {
      const list = isUdupi(studyArea) ? udupi.udupiHospitalsAccessibility : mangaluru.demoHospitalsAccessibility;
      return Promise.resolve(list.filter((h) => h.access_status !== 'CLOSED'));
    }
  );
};

export const getNearestReachableShelter = async (zoneId?: string, studyArea: string = 'mangaluru'): Promise<ShelterAccessibility> => {
  const query = `?study_area=${encodeURIComponent(studyArea)}${zoneId ? `&zone_id=${encodeURIComponent(zoneId)}` : ''}`;
  return fetchWithFallback(
    `/routing/nearest-shelter${query}`,
    () => {
      const list = isUdupi(studyArea) ? udupi.udupiSheltersAccessibility : mangaluru.demoSheltersAccessibility;
      const shelter =
        list.find((s) => s.is_recommended) ||
        list.find((s) => s.road_accessibility === 'OPEN') ||
        list[0];
      return Promise.resolve(shelter);
    }
  );
};

export const getSystemAccessSummary = async (studyArea: string = 'mangaluru'): Promise<SystemAccessSummary> => {
  return fetchWithFallback(
    `/routing/system-access-summary?study_area=${encodeURIComponent(studyArea)}`,
    () => Promise.resolve(isUdupi(studyArea) ? udupi.udupiSystemAccessSummary : mangaluru.demoSystemAccessSummary)
  );
};

export const getCounterfactualScenario = async (
  zoneId: string = 'Zone 03',
  inputs: CounterfactualInputs = { tide_offset_m: -0.4, rainfall_percent_change: 0, storm_surge_offset_m: 0 },
  studyArea: string = 'mangaluru'
): Promise<CounterfactualScenario> => {
  return postWithFallback(
    '/analysis/what-if',
    { zone_id: zoneId, study_area: studyArea, ...inputs },
    () => {
      if (isUdupi(studyArea)) {
        // Deterministic sensitivity for Udupi
        const baseDepth = 0.36;
        const rainfallOffset = inputs.rainfall_offset_mm_hr ?? 0;
        const delta = (inputs.tide_offset_m * 0.65)
          + ((inputs.rainfall_percent_change / 100) * 0.20)
          + (rainfallOffset * 0.004)
          + (inputs.storm_surge_offset_m * 0.50);
        const simDepth = Math.max(0.05, Math.min(1.50, Number((baseDepth + delta).toFixed(2))));
        const simRainfall = Number(
          Math.max(0, 32.4 * (1 + inputs.rainfall_percent_change / 100) + rainfallOffset).toFixed(1)
        );
        return Promise.resolve({
          zone_id: zoneId || 'Zone 01',
          baseline: {
            tide_m: 1.88,
            rainfall_rate_mm_hr: 32.4,
            storm_surge_m: 0.38,
            predicted_depth_m: baseDepth,
            risk_level: 'HIGH',
            probability: 84
          },
          simulated: {
            tide_m: Number((1.88 + inputs.tide_offset_m).toFixed(2)),
            rainfall_rate_mm_hr: simRainfall,
            storm_surge_m: Number((0.38 + inputs.storm_surge_offset_m).toFixed(2)),
            predicted_depth_m: simDepth,
            risk_level: simDepth >= 0.30 ? 'HIGH' : 'LOW',
            probability: simDepth >= 0.30 ? 80 : 30
          },
          depth_delta_m: Number(delta.toFixed(2)),
          risk_shift: simDepth >= 0.30 ? 'HIGH -> HIGH' : 'HIGH -> LOW',
          explanation: 'Under this simulated lower-tide scenario in Udupi, predicted flood depth at Malpe harbor decreases substantially.'
        });
      }
      return Promise.resolve(mangaluru.calculateCounterfactualScenario(zoneId, inputs));
    }
  );
};

export const getResponderBriefing = async (
  zoneId: string = 'Zone 03',
  studyArea: string = 'mangaluru'
): Promise<ResponderBriefing> => {
  const query = `?study_area=${encodeURIComponent(studyArea)}&zone_id=${encodeURIComponent(zoneId)}`;
  return fetchWithFallback(
    `/emergency/responder-briefing${query}`,
    () => Promise.resolve(isUdupi(studyArea) ? udupi.getUdupiResponderBriefing(zoneId) : mangaluru.getResponderBriefingForZone(zoneId))
  );
};

export const getPublicAlert = async (
  zoneId: string = 'Zone 03',
  studyArea: string = 'mangaluru'
): Promise<PublicAlertTemplate> => {
  const query = `?study_area=${encodeURIComponent(studyArea)}&zone_id=${encodeURIComponent(zoneId)}`;
  return fetchWithFallback(
    `/alerts/public-template${query}`,
    () => Promise.resolve(isUdupi(studyArea) ? udupi.getUdupiPublicAlert(zoneId) : mangaluru.getPublicAlertForZone(zoneId))
  );
};
