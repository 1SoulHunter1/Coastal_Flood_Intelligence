import { ROAD_CLOSURE_DEPTH_M, calculateRoadStatus } from '../../types/RoadImpact';
import type { RoadImpactItem } from '../../types/RoadImpact';

export const demoRoadImpacts: RoadImpactItem[] = [
  {
    id: 'ROAD-08',
    name: 'Main Road 760 (Kulur Industrial Corridor)',
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    category: 'ARTERIAL',
    predicted_depth_m: 0.34,
    water_depth_cm: 34,
    status: calculateRoadStatus(0.34),
    closure_reason: `Flood depth exceeds ${ROAD_CLOSURE_DEPTH_M.toFixed(2)} m vehicle-access threshold.`,
    predicted_closure_time: '13:30 IST',
    coordinates: [
      [12.9240, 74.8290],
      [12.9290, 74.8320],
      [12.9330, 74.8350]
    ],
    alternative_route_available: true,
    alternative_route_id: 'ROUTE-ALT-02'
  },
  {
    id: 'ROAD-01',
    name: 'NH-66 Kulur River Bridge & Northern Approach',
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    category: 'NH-66',
    predicted_depth_m: 0.45,
    water_depth_cm: 45,
    status: calculateRoadStatus(0.45),
    closure_reason: `Flood depth exceeds ${ROAD_CLOSURE_DEPTH_M.toFixed(2)} m vehicle-access threshold. Sluice backflow active.`,
    predicted_closure_time: '18:40 IST',
    coordinates: [
      [12.9220, 74.8250],
      [12.9270, 74.8290],
      [12.9340, 74.8320],
      [12.9410, 74.8350]
    ],
    alternative_route_available: true,
    alternative_route_id: 'ROUTE-ALT-01'
  },
  {
    id: 'ROAD-02',
    name: 'Kulur-Kavoor Connecting Arterial Road (Segment 12)',
    zone_id: 'Zone 03',
    zone_name: 'Kulur',
    category: 'ARTERIAL',
    predicted_depth_m: 0.18,
    water_depth_cm: 18,
    status: calculateRoadStatus(0.18),
    closure_reason: 'Approaching vehicle-access threshold; heavy surface runoff.',
    coordinates: [
      [12.9310, 74.8320],
      [12.9360, 74.8410],
      [12.9400, 74.8460]
    ],
    alternative_route_available: true
  },
  {
    id: 'ROAD-09',
    name: 'Pumpwell Circle to Wenlock Hospital Primary Access Corridor',
    zone_id: 'Zone 04',
    zone_name: 'Hampankatta',
    category: 'ARTERIAL',
    predicted_depth_m: 0.35,
    water_depth_cm: 35,
    status: calculateRoadStatus(0.35),
    closure_reason: `Primary access route predicted to become impassable (depth exceeds ${ROAD_CLOSURE_DEPTH_M.toFixed(2)} m). Closed after 14:10 IST.`,
    predicted_closure_time: '14:10 IST',
    coordinates: [
      [12.8670, 74.8470],
      [12.8690, 74.8465],
      [12.8710, 74.8465]
    ],
    alternative_route_available: true,
    alternative_route_id: 'ROUTE-ALT-02'
  },
  {
    id: 'ROAD-10',
    name: 'Bendoorwell Corridor (Alternative Hospital Access Road)',
    zone_id: 'Zone 04',
    zone_name: 'Hampankatta',
    category: 'ARTERIAL',
    predicted_depth_m: 0.06,
    water_depth_cm: 6,
    status: calculateRoadStatus(0.06),
    closure_reason: 'Elevated topography; open for emergency and ambulance routing.',
    coordinates: [
      [12.8680, 74.8560],
      [12.8700, 74.8520],
      [12.8710, 74.8465]
    ],
    alternative_route_available: true
  },
  {
    id: 'ROAD-03',
    name: 'Bunder Marine Wharf Approach Road',
    zone_id: 'Zone 05',
    zone_name: 'Bunder',
    category: 'ARTERIAL',
    predicted_depth_m: 0.38,
    water_depth_cm: 38,
    status: calculateRoadStatus(0.38),
    closure_reason: `Tidal inundation exceeds ${ROAD_CLOSURE_DEPTH_M.toFixed(2)} m vehicle-access threshold.`,
    predicted_closure_time: '19:15 IST',
    coordinates: [
      [12.8620, 74.8320],
      [12.8680, 74.8350],
      [12.8730, 74.8380]
    ],
    alternative_route_available: false
  },
  {
    id: 'ROAD-04',
    name: 'NH-66 Netravati Bridge & Ullal Junction Ramp',
    zone_id: 'Zone 01',
    zone_name: 'Ullal',
    category: 'NH-66',
    predicted_depth_m: 0.20,
    water_depth_cm: 20,
    status: calculateRoadStatus(0.20),
    coordinates: [
      [12.8280, 74.8480],
      [12.8220, 74.8510],
      [12.8150, 74.8540]
    ],
    alternative_route_available: true
  },
  {
    id: 'ROAD-05',
    name: 'Bolar Hoige Bazar Riverfront Road',
    zone_id: 'Zone 02',
    zone_name: 'Bolar',
    category: 'ARTERIAL',
    predicted_depth_m: 0.22,
    water_depth_cm: 22,
    status: calculateRoadStatus(0.22),
    coordinates: [
      [12.8440, 74.8360],
      [12.8490, 74.8390],
      [12.8550, 74.8420]
    ],
    alternative_route_available: true
  },
  {
    id: 'ROAD-06',
    name: 'Hampankatta Central Railway Underpass',
    zone_id: 'Zone 04',
    zone_name: 'Hampankatta',
    category: 'ARTERIAL',
    predicted_depth_m: 0.18,
    water_depth_cm: 18,
    status: calculateRoadStatus(0.18),
    coordinates: [
      [12.8690, 74.8450],
      [12.8720, 74.8490]
    ],
    alternative_route_available: true
  },
  {
    id: 'ROAD-07',
    name: 'Pumpwell Highway Underpass Bypass (Segment 18)',
    zone_id: 'Zone 06',
    zone_name: 'Kankanady',
    category: 'NH-66',
    predicted_depth_m: 0.08,
    water_depth_cm: 8,
    status: calculateRoadStatus(0.08),
    coordinates: [
      [12.8610, 74.8630],
      [12.8660, 74.8680],
      [12.8710, 74.8720]
    ],
    alternative_route_available: true
  }
];

export const getRoadImpactsForZone = (zoneId: string): RoadImpactItem[] => {
  return demoRoadImpacts.filter((r) => r.zone_id.toLowerCase() === zoneId.toLowerCase());
};

export const getBlockedRoads = (): RoadImpactItem[] => {
  return demoRoadImpacts.filter((r) => r.status === 'CLOSED');
};
