import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Marker,
  Popup,
  Tooltip,
  LayerGroup,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import type { ZoneData } from '../../types';
import type { RoadImpactItem } from '../../types/RoadImpact';
import type { EmergencyRoute } from '../../types/Route';
import type { Facility } from '../../types/Facility';
import { useStudyArea } from '../../context/StudyAreaContext';
import { demoGisRivers, demoGisHighways } from '../../data/demo/gisLayers';
import { demoCriticalFacilities } from '../../data/demo/infrastructure';
import { demoRoadImpacts } from '../../data/demo/roadImpact';
import { demoEmergencyRoutes } from '../../data/demo/routes';
import {
  udupiGisRivers,
  udupiGisHighways,
  udupiCriticalFacilities,
  udupiRoadImpacts,
  udupiEmergencyRoutes,
} from '../../data/udupi/udupiData';
import { getRiskColorHex } from '../../utils';
import { MapLegend } from './MapLegend';
import { MapLayerControl, type MapLayerState } from './MapLayerControl';
import { BasemapSwitcher, type BasemapMode } from './BasemapSwitcher';
import { ZonePopup } from './ZonePopup';
import { FacilityMarker } from './FacilityMarker';

// Environment variable overrides for GIS tile providers (non-hardcoded)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const ESRI_API_KEY = import.meta.env.VITE_ESRI_API_KEY;
const getSatelliteTileUrl = (): string => {
  if (MAPBOX_TOKEN) {
    return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;
  }
  const tokenParam = ESRI_API_KEY ? `?token=${ESRI_API_KEY}` : '';
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}${tokenParam}`;
};

const getHybridLabelsTileUrl = (): string => {
  if (MAPBOX_TOKEN) {
    return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;
  }
  const tokenParam = ESRI_API_KEY ? `?token=${ESRI_API_KEY}` : '';
  return `https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}${tokenParam}`;
};

// In-memory icon cache for zone labels to eliminate object recreation
const zoneLabelIconCache = new Map<string, L.DivIcon>();

const getZoneLabelIcon = (zoneId: string, riskLevel: string): L.DivIcon => {
  const cacheKey = `${zoneId}_${riskLevel}`;
  let cached = zoneLabelIconCache.get(cacheKey);
  if (!cached) {
    const isHigh = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
    cached = L.divIcon({
      className: 'custom-zone-label',
      html: `
        <div class="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider shadow-sm border ${
          isHigh ? 'bg-red-900/90 text-white border-red-500' : 'bg-slate-900/80 text-white border-slate-600'
        }">
          ${zoneId}
        </div>
      `,
      iconSize: [60, 20],
      iconAnchor: [30, 10],
    });
    zoneLabelIconCache.set(cacheKey, cached);
  }
  return cached;
};

// Map controller helper to handle zoom & flyTo selected zone, route, or reset view
interface MapControllerProps {
  selectedZone: ZoneData;
  resetTrigger: number;
  highlightRouteId?: string;
  studyAreaId: string;
  center: [number, number];
  defaultZoom: number;
  routes: EmergencyRoute[];
}

const MapController: React.FC<MapControllerProps> = React.memo(({
  selectedZone,
  resetTrigger,
  highlightRouteId,
  studyAreaId,
  center,
  defaultZoom,
  routes
}) => {
  const map = useMap();
  const initialRender = useRef(true);
  const prevZoneIdRef = useRef<string>(selectedZone?.zone_id);
  const prevResetTriggerRef = useRef<number>(0);
  const prevRouteIdRef = useRef<string | undefined>(highlightRouteId);
  const prevAreaIdRef = useRef<string>(studyAreaId);

  // Handle study area change -> fly camera smoothly to the new study area center
  useEffect(() => {
    if (studyAreaId !== prevAreaIdRef.current) {
      prevAreaIdRef.current = studyAreaId;
      prevZoneIdRef.current = selectedZone?.zone_id;
      map.flyTo(center, defaultZoom, { duration: 1.0 });
    }
  }, [studyAreaId, center, defaultZoom, map, selectedZone]);

  // Handle reset view (only if trigger counter incremented)
  useEffect(() => {
    if (resetTrigger > 0 && resetTrigger !== prevResetTriggerRef.current) {
      prevResetTriggerRef.current = resetTrigger;
      map.flyTo(center, defaultZoom, { duration: 0.8 });
    }
  }, [resetTrigger, center, defaultZoom, map]);

  // Handle zone selection zoom & map focus
  useEffect(() => {
    if (!selectedZone || !selectedZone.center) return;

    if (initialRender.current) {
      initialRender.current = false;
      prevZoneIdRef.current = selectedZone.zone_id;
      map.flyTo(selectedZone.center, 13.5, { duration: 0.8 });
      return;
    }

    if (selectedZone.zone_id !== prevZoneIdRef.current) {
      prevZoneIdRef.current = selectedZone.zone_id;
      map.flyTo(selectedZone.center, 13.5, { duration: 0.8 });
    }
  }, [selectedZone, map]);

  // Handle route highlight zoom (only when route id changes)
  useEffect(() => {
    if (highlightRouteId && highlightRouteId !== prevRouteIdRef.current) {
      prevRouteIdRef.current = highlightRouteId;
      const targetRoute = routes.find((r) => r.id === highlightRouteId);
      if (targetRoute && targetRoute.coordinates.length > 0) {
        const midPoint = targetRoute.coordinates[Math.floor(targetRoute.coordinates.length / 2)];
        map.flyTo(midPoint, 14, { duration: 0.8 });
      }
    } else if (!highlightRouteId) {
      prevRouteIdRef.current = undefined;
    }
  }, [highlightRouteId, routes, map]);

  return null;
});

// Demo building footprints for Mangaluru
const demoBuildingFootprints: [number, number][][] = [
  [[12.924, 74.831], [12.925, 74.831], [12.925, 74.832], [12.924, 74.832]],
  [[12.927, 74.833], [12.928, 74.833], [12.928, 74.834], [12.927, 74.834]],
  [[12.929, 74.835], [12.930, 74.835], [12.930, 74.836], [12.929, 74.836]],
  [[12.865, 74.834], [12.866, 74.834], [12.866, 74.835], [12.865, 74.835]],
  [[12.868, 74.837], [12.869, 74.837], [12.869, 74.838], [12.868, 74.838]],
];

// Simulation building footprints for Udupi
const udupiBuildingFootprints: [number, number][][] = [
  [[13.349, 74.706], [13.350, 74.706], [13.350, 74.707], [13.349, 74.707]],
  [[13.352, 74.709], [13.353, 74.709], [13.353, 74.710], [13.352, 74.710]],
  [[13.336, 74.743], [13.337, 74.743], [13.337, 74.744], [13.336, 74.744]],
  [[13.312, 74.736], [13.313, 74.736], [13.313, 74.737], [13.312, 74.737]],
  [[13.338, 74.745], [13.339, 74.745], [13.339, 74.746], [13.338, 74.746]],
];

// =========================================================================
// MEMOIZED INDEPENDENT GIS LAYER COMPONENTS (React.memo)
// =========================================================================

interface BasemapTileLayerProps {
  mode: BasemapMode;
  onTileError: () => void;
}

const BasemapTileLayer: React.FC<BasemapTileLayerProps> = React.memo(({ mode, onTileError }) => {
  if (mode === 'STREET') {
    return (
      <TileLayer
        key="osm-street-basemap"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        className="map-tiles"
      />
    );
  }

  if (mode === 'SATELLITE') {
    return (
      <TileLayer
        key="esri-satellite-basemap"
        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        url={getSatelliteTileUrl()}
        maxZoom={19}
        eventHandlers={{ tileerror: onTileError }}
        className="map-tiles"
      />
    );
  }

  // HYBRID
  return (
    <>
      <TileLayer
        key="hybrid-satellite-base"
        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        url={getSatelliteTileUrl()}
        maxZoom={19}
        eventHandlers={{ tileerror: onTileError }}
        className="map-tiles"
      />
      <TileLayer
        key="hybrid-labels-overlay"
        attribution='&copy; Esri &mdash; Boundaries & Places'
        url={getHybridLabelsTileUrl()}
        maxZoom={19}
        opacity={0.95}
        className="map-tiles"
      />
    </>
  );
});

interface RiversLayerProps {
  rivers: typeof demoGisRivers;
}

const RiversLayer: React.FC<RiversLayerProps> = React.memo(({ rivers }) => {
  return (
    <LayerGroup>
      {rivers.map((river) => (
        <Polyline
          key={river.id}
          positions={river.coordinates}
          pathOptions={{
            color: '#0284C7',
            weight: 5,
            opacity: 0.9,
            dashArray: river.type === 'RIVER' ? '1, 0' : '4, 4'
          }}
        >
          <Tooltip sticky>
            <div className="font-mono text-xs">
              <span className="font-bold">{river.name}</span>
              <div className="text-[10px] text-slate-600">Tidal Estuary Discharge Channel</div>
            </div>
          </Tooltip>
        </Polyline>
      ))}
    </LayerGroup>
  );
});

interface HighwaysLayerProps {
  highways: typeof demoGisHighways;
}

const HighwaysLayer: React.FC<HighwaysLayerProps> = React.memo(({ highways }) => {
  return (
    <LayerGroup>
      {highways.map((highway) => (
        <Polyline
          key={highway.id}
          positions={highway.coordinates}
          pathOptions={{
            color: '#D97706',
            weight: 5,
            opacity: 0.95
          }}
        >
          <Tooltip sticky>
            <div className="font-mono text-xs font-semibold">{highway.name}</div>
          </Tooltip>
        </Polyline>
      ))}
    </LayerGroup>
  );
});

interface RoadsLayerProps {
  roads: RoadImpactItem[];
  zones: ZoneData[];
  demoMode: boolean;
}

const RoadsLayer: React.FC<RoadsLayerProps> = React.memo(({ roads, zones, demoMode }) => {
  return (
    <LayerGroup>
      {roads.map((road) => {
        const zone = zones.find((item) => item.zone_id === road.zone_id);
        const zoneDepth = zone?.depth_q50_m ?? zone?.predicted_depth_m;
        const depth = zoneDepth ?? null;
        const status = depth == null
          ? 'NO MODEL OUTPUT'
          : depth >= 0.30
            ? 'CLOSED'
            : depth >= 0.15
              ? 'AT_RISK'
              : 'OPEN';
        const isClosed = status === 'CLOSED';
        const isAtRisk = status === 'AT_RISK';
        const statusColor = depth == null ? '#64748b' : isClosed ? '#DC2626' : isAtRisk ? '#EA580C' : '#16A34A';

        return (
          <Polyline
            key={road.id}
            positions={road.coordinates}
            pathOptions={{
              color: statusColor,
              weight: isClosed ? 4.5 : isAtRisk ? 3.5 : 3.0,
              dashArray: isClosed ? '6, 6' : undefined,
              opacity: 0.95
            }}
          >
            <Tooltip sticky>
              <div className="font-mono text-xs">
                <span className="font-bold text-slate-900">{road.name}</span>
                <div className="mt-0.5">
                  Zone median depth:{' '}
                  <strong className={depth == null ? 'text-slate-600' : isClosed ? 'text-red-700' : isAtRisk ? 'text-orange-700' : 'text-emerald-700'}>
                    {depth == null ? 'unavailable' : `${depth.toFixed(2)} m`}
                  </strong>
                </div>
                <div>
                  Access Status:{' '}
                  <strong className={depth == null ? 'text-slate-600' : isClosed ? 'text-red-700 uppercase' : isAtRisk ? 'text-orange-700 uppercase' : 'text-emerald-700 uppercase'}>
                    {status}
                  </strong>
                </div>
                {zone && (
                  <div>
                    Zone flood-label probability:{' '}
                    <strong className="text-slate-900">{zone.flood_probability}%</strong>
                  </div>
                )}
                {depth != null ? (
                  <div className="text-[10px] text-slate-600 mt-1 max-w-xs">
                    {`${demoMode ? 'Demo estimate' : 'Model estimate'} uses zone median depth. ${depth < 0.30 ? 'Probability alone does not meet the 0.30 m closure threshold.' : 'Predicted depth meets the 0.30 m closure threshold.'}`}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-600 mt-1 max-w-xs">
                    Static road geometry only; no zone depth prediction is available to estimate access.
                  </div>
                )}
              </div>
            </Tooltip>
          </Polyline>
        );
      })}
    </LayerGroup>
  );
});

interface EmergencyRoutesLayerProps {
  routes: EmergencyRoute[];
  highlightRouteId?: string;
}

const EmergencyRoutesLayer: React.FC<EmergencyRoutesLayerProps> = React.memo(({ routes, highlightRouteId }) => {
  return (
    <LayerGroup>
      {routes.map((route) => {
        const isAlternative = route.type === 'ALTERNATIVE';
        const isHighlighted = highlightRouteId === route.id;

        return (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            pathOptions={{
              color: isAlternative ? '#2563EB' : '#991B1B',
              weight: isHighlighted ? 6.5 : isAlternative ? 5.0 : 3.5,
              opacity: 0.95,
              dashArray: isAlternative ? undefined : '5, 5'
            }}
          >
            <Tooltip sticky>
              <div className="font-mono text-xs">
                <div className="font-bold text-blue-900">{route.name}</div>
                <div className="text-[11px] text-slate-700">
                  Destination: <strong>{route.destination}</strong>
                </div>
                <div className="text-[11px]">
                  Status: <strong className={isAlternative ? 'text-emerald-700' : 'text-red-700'}>{route.status}</strong>
                </div>
                {route.detour_minutes && (
                  <div className="text-[10px] text-blue-700 font-bold">
                    Detour: +{route.detour_minutes} min (Total: {route.travel_time_minutes} min)
                  </div>
                )}
              </div>
            </Tooltip>
          </Polyline>
        );
      })}
    </LayerGroup>
  );
});

interface FloodDepthLayerProps {
  zones: ZoneData[];
  demoMode: boolean;
}

const FloodDepthLayer: React.FC<FloodDepthLayerProps> = React.memo(({ zones, demoMode }) => {
  const zonesWithDepth = zones.filter(
    (zone) => zone.depth_q50_m != null || zone.predicted_depth_m != null
  );

  if (zonesWithDepth.length === 0) return null;
  return (
    <LayerGroup>
      {zonesWithDepth.map((zone) => {
        const depth = zone.depth_q50_m ?? zone.predicted_depth_m ?? 0;
        const color = depth >= 0.30 ? '#7f1d1d' : depth >= 0.15 ? '#c2410c' : '#0369a1';
        return (
        <Polygon
          key={`depth-proxy-${zone.zone_id}`}
          positions={zone.coordinates}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: 0.13,
            weight: 4,
            dashArray: '7, 5'
          }}
        >
          <Tooltip sticky>
            <div className="font-mono text-xs">
              <span className="font-bold">{zone.zone_id} — {zone.zone_name}</span>
              <div>Surrogate median depth: <strong>{depth.toFixed(2)} m</strong></div>
              <div>Flood-label probability: <strong>{zone.flood_probability}%</strong></div>
              <div className="mt-1 max-w-xs text-[10px] text-amber-800">
                {demoMode ? 'Demo-only ' : ''}zone-average proxy; outline is not a mapped inundation boundary and depth varies within the zone.
              </div>
            </div>
          </Tooltip>
        </Polygon>
        );
      })}
    </LayerGroup>
  );
});

interface BuildingsLayerProps {
  footprints: [number, number][][] | [number, number][][][];
}

const BuildingsLayer: React.FC<BuildingsLayerProps> = React.memo(({ footprints }) => {
  return (
    <LayerGroup>
      {footprints.map((footprint, idx) => (
        <Polygon
          key={`bldg-${idx}`}
          positions={footprint as [number, number][]}
          pathOptions={{
            color: '#475569',
            fillColor: '#94A3B8',
            fillOpacity: 0.7,
            weight: 1
          }}
        >
          <Tooltip sticky>
            <span className="font-mono text-xs">Surveyed Building Asset #{idx + 101}</span>
          </Tooltip>
        </Polygon>
      ))}
    </LayerGroup>
  );
});

interface FloodZonesLayerProps {
  zones: ZoneData[];
  selectedZoneId: string;
  onSelectZone: (zone: ZoneData) => void;
}

const FloodZonesLayer: React.FC<FloodZonesLayerProps> = React.memo(({
  zones,
  selectedZoneId,
  onSelectZone
}) => {
  return (
    <LayerGroup>
      {zones.map((zone) => {
        const isSelected = selectedZoneId?.toLowerCase() === zone.zone_id?.toLowerCase();
        const riskColor = getRiskColorHex(zone.risk_level);
        const icon = getZoneLabelIcon(zone.zone_id, zone.risk_level);

        return (
          <React.Fragment key={zone.zone_id}>
            <Polygon
              positions={zone.coordinates}
              pathOptions={{
                color: isSelected ? '#1E3A8A' : riskColor,
                fillColor: riskColor,
                fillOpacity: isSelected ? 0.38 : 0.20,
                weight: isSelected ? 4 : 2,
                dashArray: isSelected ? undefined : '4, 3'
              }}
              eventHandlers={{
                click: () => onSelectZone(zone)
              }}
            >
              <Popup>
                <ZonePopup zone={zone} onSelectZone={onSelectZone} />
              </Popup>
              <Tooltip sticky>
                <div className="font-mono text-xs text-slate-900">
                  <span className="font-bold">{zone.zone_id} — {zone.zone_name}</span>
                  <div className="text-[11px] text-slate-700">
                    Risk: <span className="font-semibold text-orange-600">{zone.risk_level}</span> ({zone.flood_probability}%)
                  </div>
                  {(zone.depth_q50_m != null || zone.predicted_depth_m != null) && (
                    <div className="text-[11px] text-slate-700">
                      Median depth: <strong>{(zone.depth_q50_m ?? zone.predicted_depth_m ?? 0).toFixed(2)} m</strong>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500">
                    Road closures use predicted depth (0.30 m threshold), not probability alone.
                  </div>
                  <div className="text-[10px] text-slate-500">Click to inspect zone intelligence</div>
                </div>
              </Tooltip>
            </Polygon>

            <Marker
              position={zone.center}
              icon={icon}
              eventHandlers={{
                click: () => onSelectZone(zone)
              }}
            />
          </React.Fragment>
        );
      })}
    </LayerGroup>
  );
});

interface FacilitiesLayerProps {
  facilities: Facility[];
}

const FacilitiesLayer: React.FC<FacilitiesLayerProps> = React.memo(({ facilities }) => {
  return (
    <LayerGroup>
      {facilities.map((facility) => (
        <FacilityMarker key={facility.id} facility={facility} />
      ))}
    </LayerGroup>
  );
});

// =========================================================================
// MAIN FLOOD MAP COMPONENT (OPTIMIZED & MULTI-STUDY-AREA AWARE)
// =========================================================================

interface FloodMapProps {
  zones: ZoneData[];
  selectedZone: ZoneData;
  onSelectZone: (zone: ZoneData) => void;
  heightClass?: string;
  highlightRouteId?: string;
}

export const FloodMap: React.FC<FloodMapProps> = React.memo(({
  zones,
  selectedZone,
  onSelectZone,
  heightClass = 'h-[540px]',
  highlightRouteId
}) => {
  const { studyArea, config, demoScenario } = useStudyArea();
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layerState, setLayerState] = useState<MapLayerState>({
    showZones: true,
    showFloodDepth: false,
    showCriticalFacilities: true,
    showHospitals: true,
    showShelters: true,
    showRivers: true,
    showNH66: true,
    showRoads: true,
    showClosedRoads: false,
    showEmergencyRoutes: true,
    showBuildings: false
  });

  const mapRef = useRef<L.Map | null>(null);

  // Basemap switcher state & fallback error handling
  // Preserved across study areas - does NOT reset when changing cities
  const [basemapMode, setBasemapMode] = useState<BasemapMode>('STREET');
  const [basemapError, setBasemapError] = useState<string | null>(null);
  const tileErrorCountRef = useRef(0);

  const handleTileError = useCallback(() => {
    tileErrorCountRef.current += 1;
    // Auto-fallback if satellite tiles fail to load
    if (tileErrorCountRef.current >= 3 && basemapMode !== 'STREET') {
      setBasemapMode('STREET');
      setBasemapError('Satellite tiles unavailable. Reverted to Street basemap.');
      tileErrorCountRef.current = 0;
    }
  }, [basemapMode]);

  const handleSelectBasemapMode = useCallback((mode: BasemapMode) => {
    tileErrorCountRef.current = 0;
    setBasemapError(null);
    setBasemapMode(mode);
  }, []);

  const toggleLayer = useCallback((layerKey: keyof MapLayerState) => {
    setLayerState((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  }, []);

  const handleResetView = useCallback(() => {
    setResetTrigger((prev) => prev + 1);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Update map canvas size smoothly when toggling full screen
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Dynamic datasets per study area
  const currentRivers = useMemo(() => {
    return studyArea === 'udupi' ? udupiGisRivers : demoGisRivers;
  }, [studyArea]);

  const currentHighways = useMemo(() => {
    return studyArea === 'udupi' ? udupiGisHighways : demoGisHighways;
  }, [studyArea]);

  const allFacilities = useMemo(() => {
    return studyArea === 'udupi' ? (udupiCriticalFacilities as Facility[]) : (demoCriticalFacilities as Facility[]);
  }, [studyArea]);

  const allRoads = useMemo(() => {
    return studyArea === 'udupi' ? udupiRoadImpacts : demoRoadImpacts;
  }, [studyArea]);

  const currentRoutes = useMemo(() => {
    return studyArea === 'udupi' ? udupiEmergencyRoutes : demoEmergencyRoutes;
  }, [studyArea]);

  const currentBuildings = useMemo(() => {
    return studyArea === 'udupi' ? udupiBuildingFootprints : demoBuildingFootprints;
  }, [studyArea]);

  // Memoized facilities calculation
  const visibleFacilities = useMemo(() => {
    return allFacilities.filter((facility) => {
      if (facility.type === 'HOSPITAL' && !layerState.showHospitals) return false;
      if (facility.type === 'SHELTER' && !layerState.showShelters) return false;
      if (
        (facility.type === 'POWER_STATION' ||
          facility.type === 'DRAIN_PUMP' ||
          facility.type === 'GOV_CENTER' ||
          facility.type === 'FIRE_STATION' ||
          facility.type === 'POLICE_STATION') &&
        !layerState.showCriticalFacilities
      ) {
        return false;
      }
      return true;
    });
  }, [allFacilities, layerState.showHospitals, layerState.showShelters, layerState.showCriticalFacilities]);

  // Memoized roads calculation based on closed filter
  const visibleRoads = useMemo(() => {
    return layerState.showClosedRoads
      ? allRoads.filter((road) => {
          const zone = zones.find((item) => item.zone_id === road.zone_id);
          const depth = zone?.depth_q50_m ?? zone?.predicted_depth_m;
          return depth != null && depth >= 0.30;
        })
      : allRoads;
  }, [allRoads, layerState.showClosedRoads, zones]);

  return (
    <div
      className={`transition-all duration-200 border border-slate-300 bg-slate-100 shadow-sm ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] rounded-none w-screen h-screen'
          : `relative w-full ${heightClass} rounded-lg overflow-hidden`
      }`}
    >
      {/* Top Banner Notice */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md border border-blue-500 px-3 py-1 rounded-md text-xs font-mono font-bold tracking-wider text-blue-700 shadow-sm">
          {demoScenario ? 'DEMO SCENARIO ACTIVE' : 'STATIC GIS REFERENCE LAYERS'}
        </div>
        <div className="hidden sm:block bg-white/95 backdrop-blur-md border border-slate-300 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-700 shadow-sm">
          {config.basinTitle} · roads, facilities & routes are reference geometry
        </div>
      </div>

      {/* Floating GIS Controls (Top Right) */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-2">
        <BasemapSwitcher
          currentMode={basemapMode}
          onSelectMode={handleSelectBasemapMode}
        />
        <MapLayerControl
          layers={layerState}
          onToggleLayer={toggleLayer}
          onResetView={handleResetView}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />
      </div>

      {/* Non-blocking Basemap Error Notification */}
      {basemapError && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1001] bg-amber-900/95 text-amber-100 text-[11px] font-mono px-3 py-1.5 rounded-md border border-amber-500 shadow-md flex items-center gap-2 animate-fadeIn">
          <span>⚠️ {basemapError}</span>
          <button
            type="button"
            onClick={() => setBasemapError(null)}
            className="text-amber-200 hover:text-white cursor-pointer ml-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating GIS Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[1000]">
        <MapLegend />
      </div>

      {/* Leaflet Map Canvas */}
      <MapContainer
        center={config.center}
        zoom={config.defaultZoom}
        scrollWheelZoom={true}
        className="h-full w-full"
        ref={mapRef}
      >
        <MapController
          selectedZone={selectedZone}
          resetTrigger={resetTrigger}
          highlightRouteId={highlightRouteId}
          studyAreaId={studyArea}
          center={config.center}
          defaultZoom={config.defaultZoom}
          routes={currentRoutes}
        />

        {/* Dynamic Basemap Layer (Stable instance - zero reload on zone change) */}
        <BasemapTileLayer
          mode={basemapMode}
          onTileError={handleTileError}
        />

        {/* Provisional static reference layers; these are not live GIS feeds. */}
        {layerState.showRivers && <RiversLayer rivers={currentRivers} />}

        {/* NH-66 Highway Layer (Mounted only when active) */}
        {layerState.showNH66 && <HighwaysLayer highways={currentHighways} />}

        {/* Road Network Layer (Mounted only when active) */}
        {layerState.showRoads && (
          <RoadsLayer roads={visibleRoads} zones={zones} demoMode={Boolean(demoScenario)} />
        )}

        {/* Emergency Routes Layer (Mounted only when active) */}
        {layerState.showEmergencyRoutes && (
          <EmergencyRoutesLayer
            routes={currentRoutes}
            highlightRouteId={highlightRouteId}
          />
        )}

        {/* Buildings Layer (Mounted only when active) */}
        {layerState.showBuildings && <BuildingsLayer footprints={currentBuildings} />}

        {/* Flood Risk Zones Layer (Mounted only when active) */}
        {layerState.showZones && (
          <FloodZonesLayer
            zones={zones}
            selectedZoneId={selectedZone?.zone_id}
            onSelectZone={onSelectZone}
          />
        )}

        {/* This is a zone-level model proxy, not a spatially resolved flood extent. */}
        {layerState.showFloodDepth && (
          <FloodDepthLayer zones={zones} demoMode={Boolean(demoScenario)} />
        )}

        {/* Critical Facilities, Hospitals & Shelters (Mounted only when active) */}
        <FacilitiesLayer facilities={visibleFacilities} />
      </MapContainer>
    </div>
  );
});
