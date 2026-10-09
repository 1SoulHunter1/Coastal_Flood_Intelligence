import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Facility } from '../../types/Facility';

const iconCache = new Map<string, L.DivIcon>();

export const createFacilityDivIcon = (type: Facility['type'], status: Facility['status']) => {
  const cacheKey = `${type}_${status}`;
  const existing = iconCache.get(cacheKey);
  if (existing) return existing;

  let bgColor = '#1D4ED8'; // Blue default
  let symbol = '●';

  if (type === 'HOSPITAL') {
    bgColor = '#DC2626'; // Red
    symbol = '+';
  } else if (type === 'SHELTER') {
    bgColor = '#16A34A'; // Green
    symbol = '▲';
  } else if (type === 'POWER_STATION') {
    bgColor = '#D97706'; // Amber
    symbol = '⚡';
  } else if (type === 'DRAIN_PUMP') {
    bgColor = '#0284C7'; // Cyan
    symbol = '⚙';
  } else if (type === 'FIRE_STATION') {
    bgColor = '#EA580C'; // Orange
    symbol = '🚒';
  } else if (type === 'POLICE_STATION') {
    bgColor = '#1E3A8A'; // Navy
    symbol = '★';
  }

  const borderClass = status === 'CRITICAL'
    ? 'border-2 border-red-500 animate-pulse'
    : status === 'UNKNOWN'
      ? 'border-2 border-slate-400'
      : 'border-2 border-white';

  const icon = L.divIcon({
    className: 'custom-facility-marker',
    html: `
      <div style="background-color: ${bgColor};" class="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-md ${borderClass}">
        ${symbol}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

  iconCache.set(cacheKey, icon);
  return icon;
};

interface FacilityMarkerProps {
  facility: Facility;
}

export const FacilityMarker: React.FC<FacilityMarkerProps> = React.memo(({ facility }) => {
  const icon = createFacilityDivIcon(facility.type, facility.status);

  return (
    <Marker position={facility.coordinates} icon={icon}>
      <Popup>
        <div className="font-mono text-xs min-w-48 text-slate-900">
          <div className="font-bold border-b border-slate-200 pb-1 mb-1 text-slate-900">
            {facility.name}
          </div>
          <div className="text-[11px] text-slate-600">
            Facility Type: <span className="font-semibold text-blue-700">{facility.type.replace('_', ' ')}</span>
          </div>
          <div className="text-[11px] text-slate-600">
            Associated Zone: <span className="text-slate-800 font-semibold">{facility.zone_name} ({facility.zone_id})</span>
          </div>
          <div className="text-[11px] text-slate-600">
            Risk Status:{' '}
            <span
              className={`font-bold ${
                facility.status === 'UNKNOWN'
                  ? 'text-slate-600'
                  : facility.status === 'CRITICAL'
                  ? 'text-red-600'
                  : facility.status === 'AT_RISK'
                  ? 'text-orange-600'
                  : 'text-emerald-600'
              }`}
            >
              {facility.status}
            </span>
          </div>
          {facility.capacity_or_load && (
            <div className="text-[10px] text-slate-500 mt-1">
              Capacity: {facility.capacity_or_load}
            </div>
          )}
          {facility.contact && (
            <div className="text-[10px] text-slate-500">
              Contact: {facility.contact}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
});
