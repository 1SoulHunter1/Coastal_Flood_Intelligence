export type StudyAreaId = 'mangaluru' | 'udupi';

export interface StudyAreaConfig {
  id: StudyAreaId;
  name: string;
  displayName: string;
  state: string;
  country: string;
  center: [number, number];
  defaultZoom: number;
  operationsTitle: string;
  defaultZoneId: string;
  basinTitle: string;
  riverName: string;
  weatherStation: string;
}

export const STUDY_AREAS: Record<StudyAreaId, StudyAreaConfig> = {
  mangaluru: {
    id: 'mangaluru',
    name: 'Mangaluru',
    displayName: 'Mangaluru (Mangalore)',
    state: 'Karnataka',
    country: 'India',
    center: [12.8900, 74.8450],
    defaultZoom: 12,
    operationsTitle: 'MANGALURU COASTAL FLOOD OPERATIONS',
    defaultZoneId: 'Zone 03', // Kulur
    basinTitle: 'MANGALURU URBAN ESTUARY BASIN',
    riverName: 'Netravati & Gurupura Rivers',
    weatherStation: 'Mangaluru Old Port Marine Gauge (Station 04)',
  },
  udupi: {
    id: 'udupi',
    name: 'Udupi',
    displayName: 'Udupi',
    state: 'Karnataka',
    country: 'India',
    center: [13.3409, 74.7421], // Malpe / Udupi coastal basin
    defaultZoom: 12,
    operationsTitle: 'UDUPI COASTAL FLOOD OPERATIONS',
    defaultZoneId: 'Zone 01', // Malpe Harbor
    basinTitle: 'UDUPI COASTAL ESTUARY BASIN',
    riverName: 'Swarna & Udyavara Rivers',
    weatherStation: 'Malpe Marine Weather & Tidal Station (Station 07)',
  },
};

export const DEFAULT_STUDY_AREA: StudyAreaId = 'mangaluru';
