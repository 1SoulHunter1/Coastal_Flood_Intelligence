import React, { useEffect } from 'react';
import { CircleMarker, MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet';
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet';

interface AlternativeRouteMiniMapProps {
  coordinates: [number, number][];
  label: string;
}

const FitRouteBounds: React.FC<{ coordinates: [number, number][] }> = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 1) {
      map.fitBounds(coordinates as LatLngBoundsExpression, { padding: [16, 16] });
    }
  }, [coordinates, map]);

  return null;
};

export const AlternativeRouteMiniMap: React.FC<AlternativeRouteMiniMapProps> = ({
  coordinates,
  label
}) => {
  if (coordinates.length < 2) return null;

  const points = coordinates as LatLngExpression[];
  return (
    <div className="overflow-hidden rounded border border-blue-200">
      <div className="bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase text-blue-800">
        {label} • illustrative static route
      </div>
      <MapContainer
        center={points[0]}
        zoom={13}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="h-40 w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitRouteBounds coordinates={coordinates} />
        <Polyline positions={points} pathOptions={{ color: '#2563eb', weight: 5 }} />
        <CircleMarker center={points[0]} radius={5} pathOptions={{ color: '#16a34a', fillOpacity: 1 }} />
        <CircleMarker
          center={points[points.length - 1]}
          radius={5}
          pathOptions={{ color: '#dc2626', fillOpacity: 1 }}
        />
      </MapContainer>
    </div>
  );
};
