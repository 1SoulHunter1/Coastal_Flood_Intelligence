export interface GisGeoJsonLine {
  id: string;
  name: string;
  type: 'RIVER' | 'HIGHWAY' | 'COASTLINE';
  coordinates: [number, number][];
}

// Mangaluru Estuary and River Polylines
export const demoGisRivers: GisGeoJsonLine[] = [
  {
    id: 'RIV-NETRAVATI',
    name: 'Netravati River & Estuary',
    type: 'RIVER',
    coordinates: [
      [12.8680, 75.0200], // Upstream Bantwal direction
      [12.8630, 74.9650],
      [12.8590, 74.9120],
      [12.8510, 74.8780],
      [12.8460, 74.8550], // Jeppu / Bolar
      [12.8420, 74.8380], // River mouth confluence
      [12.8390, 74.8320]  // Estuary mouth to Arabian Sea
    ]
  },
  {
    id: 'RIV-GURUPURA',
    name: 'Gurupura (Phalguni) River',
    type: 'RIVER',
    coordinates: [
      [12.9600, 74.9350], // Upstream Gurupura
      [12.9520, 74.8820],
      [12.9380, 74.8520],
      [12.9280, 74.8310], // Kulur Bridge crossing
      [12.8950, 74.8260], // Bengre spit inside channel
      [12.8650, 74.8310], // Bunder Old Port
      [12.8420, 74.8380]  // Confluence with Netravati
    ]
  }
];

// National Highway 66 (Major transport lifeline through Mangaluru)
export const demoGisHighways: GisGeoJsonLine[] = [
  {
    id: 'HWY-NH66',
    name: 'National Highway 66 (Panambur - Kulur - Pumpwell - Netravati - Ullal)',
    type: 'HIGHWAY',
    coordinates: [
      [12.9550, 74.8180], // Panambur port gate
      [12.9380, 74.8260], // Baikampady / Kulur north
      [12.9270, 74.8310], // Kulur Bridge
      [12.9050, 74.8460], // Kottara Chowki
      [12.8870, 74.8560], // Kuntikan
      [12.8640, 74.8690], // Pumpwell Junction
      [12.8450, 74.8610], // Netravati Bridge
      [12.8250, 74.8520], // Thokkottu / Ullal
      [12.8050, 74.8500]  // Kotekar
    ]
  }
];
