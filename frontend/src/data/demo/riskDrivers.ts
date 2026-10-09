import type { RiskDriverFactor } from '../../types';

export const demoRiskDriversZone03: RiskDriverFactor[] = [
  {
    factor: 'Heavy Rainfall',
    percentage: 42,
    impact_description: 'Monsoonal precipitation intensity (48.5 mm/hr) exceeding stormwater canal throughput'
  },
  {
    factor: 'High Tide',
    percentage: 28,
    impact_description: 'Astronomical high tide (+1.95m MSL) causing tidal lock in Gurupura river mouth'
  },
  {
    factor: 'Low Elevation',
    percentage: 18,
    impact_description: 'Floodplain bathymetry and natural topographic depression (2.6m avg elevation)'
  },
  {
    factor: 'Drainage Congestion',
    percentage: 12,
    impact_description: 'Culvert constriction and marine sediment accumulation along NH-66 bridge corridors'
  },
  {
    factor: 'Land Use',
    percentage: 7,
    impact_description: 'Paved industrial and transport infrastructure limiting surface percolation'
  }
];

export const demoZoneRiskDriversMap: Record<string, RiskDriverFactor[]> = {
  'Zone 03': demoRiskDriversZone03,
  'Zone 05': [
    { factor: 'High Tide Surge', percentage: 38, impact_description: 'Estuarine sea water breach over old wharf bulkheads' },
    { factor: 'Heavy Rainfall', percentage: 32, impact_description: 'Dense commercial runoff accumulation' },
    { factor: 'Low Elevation', percentage: 20, impact_description: 'Wharf level 1.4m above mean high water spring' },
    { factor: 'Drainage Congestion', percentage: 10, impact_description: 'Old storm channels restricted by marine siltation' },
    { factor: 'Land Use', percentage: 5, impact_description: 'Impervious wharf and port apron' }
  ],
  'Zone 01': [
    { factor: 'Coastal Wave Action', percentage: 40, impact_description: 'Severe coastal erosion and shoreline wave overwash' },
    { factor: 'High Tide', percentage: 30, impact_description: 'Netravati southern estuary bank overflow' },
    { factor: 'Heavy Rainfall', percentage: 20, impact_description: 'Localized precipitation ponding in sand-ridge basins' },
    { factor: 'Drainage Congestion', percentage: 10, impact_description: 'Natural dune barrier inhibiting gravity drainage' },
    { factor: 'Land Use', percentage: 6, impact_description: 'Dense coastal settlements on low spit' }
  ],
  'Zone 02': [
    { factor: 'High Tide & Estuary Spill', percentage: 36, impact_description: 'Confluence backflow from Netravati & Gurupura confluence' },
    { factor: 'Heavy Rainfall', percentage: 34, impact_description: 'Surface runoff from Jeppu ridge slopes' },
    { factor: 'Low Elevation', percentage: 20, impact_description: 'Low-lying river bank boat jetties' },
    { factor: 'Drainage Congestion', percentage: 10, impact_description: 'Tidal back-pressure on local storm sluices' },
    { factor: 'Land Use', percentage: 5, impact_description: 'Old riverfront godowns and boatyards' }
  ],
  'Zone 04': [
    { factor: 'Intense Runoff', percentage: 48, impact_description: 'Impervious paved commercial footprint causing swift runoff accumulation' },
    { factor: 'Drainage Congestion', percentage: 32, impact_description: 'Raja Kaluve bottleneck near central railway underpasses' },
    { factor: 'Rainfall Volume', percentage: 14, impact_description: 'Sustained rain filling retention points' },
    { factor: 'Topographic Dip', percentage: 6, impact_description: 'Localized roadway depressions near clock tower' },
    { factor: 'Land Use', percentage: 8, impact_description: 'Ultra-dense central business district' }
  ],
  'Zone 06': [
    { factor: 'Urban Runoff', percentage: 52, impact_description: 'Commercial surface runoff directed towards Pumpwell junction' },
    { factor: 'Drainage Inadequacy', percentage: 28, impact_description: 'Culvert capacity stress at major highway intersections' },
    { factor: 'Rainfall Peak', percentage: 15, impact_description: 'Short-duration convective thunderstorm burst' },
    { factor: 'Topography', percentage: 5, impact_description: 'Mild depression around Pumpwell flyover approach' },
    { factor: 'Land Use', percentage: 4, impact_description: 'Healthcare and commercial zone' }
  ],
  'Zone 07': [
    { factor: 'Localized Ponding', percentage: 55, impact_description: 'Minor roadside ditch overflow in non-paved segments' },
    { factor: 'Heavy Rainfall', percentage: 30, impact_description: 'Monsoon showers with quick lateral watershed dispersion' },
    { factor: 'Topography', percentage: 10, impact_description: 'High laterite plateau prevents riverine backwater' },
    { factor: 'Drainage', percentage: 5, impact_description: 'Rapid natural slope drainage towards surrounding valleys' },
    { factor: 'Land Use', percentage: 3, impact_description: 'Campus open green expanses' }
  ]
};
