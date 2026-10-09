import { useState, useEffect, useCallback } from 'react';
import type {
  ZoneData,
  EnvironmentConditions,
  ForecastPoint,
  InfrastructureSummary,
  AlertItem,
  EmergencyPriorityItem,
  SituationBriefData
} from '../types';
import {
  getEnvironmentConditions,
  getZones,
  getFloodTimeline,
  getInfrastructure,
  getEmergencyPriority,
  getAlerts,
  getSituationBrief
} from '../services/api';

export const useFloodIntelligence = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [conditions, setConditions] = useState<EnvironmentConditions | null>(null);
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [infrastructureSummary, setInfrastructureSummary] = useState<InfrastructureSummary | null>(null);
  const [priorityItems, setPriorityItems] = useState<EmergencyPriorityItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [brief, setBrief] = useState<SituationBriefData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        envData,
        zonesData,
        forecastData,
        infraData,
        priorityData,
        alertsData,
        briefData
      ] = await Promise.all([
        getEnvironmentConditions(),
        getZones(),
        getFloodTimeline(),
        getInfrastructure(),
        getEmergencyPriority(),
        getAlerts(),
        getSituationBrief()
      ]);

      setConditions(envData);
      setZones(zonesData);
      setSelectedZone((prev) => prev || zonesData.find((z) => z.zone_id === 'Zone 03') || zonesData[0]);
      setForecast(forecastData);
      setInfrastructureSummary(infraData.summary);
      setPriorityItems(priorityData);
      setAlerts(alertsData);
      setBrief(briefData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    conditions,
    zones,
    selectedZone,
    setSelectedZone,
    forecast,
    infrastructureSummary,
    priorityItems,
    alerts,
    brief,
    refresh: fetchData
  };
};
