import React from 'react';
import type { HospitalAccessibility, ShelterAccessibility } from '../../types/Accessibility';
import { Hospital, Home, Navigation, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { AlternativeRouteMiniMap } from './AlternativeRouteMiniMap';

interface FacilityAccessibilityPanelProps {
  hospitals: HospitalAccessibility[];
  shelters: ShelterAccessibility[];
  onShowRoute?: (routeId: string) => void;
}

export const FacilityAccessibilityPanel: React.FC<FacilityAccessibilityPanelProps> = ({
  hospitals,
  shelters,
  onShowRoute
}) => {
  const recommendedShelter = shelters.find((s) => s.is_recommended) || shelters[0];

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* SECTION 1: CRITICAL FACILITY / HOSPITAL ACCESSIBILITY */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-200 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
              <Hospital className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                CRITICAL FACILITY ACCESSIBILITY
              </h3>
              <span className="text-[10px] text-slate-500">
                Corridor ingress/egress analysis & alternative route dispatch
              </span>
            </div>
            <p className="mb-3 text-[10px] text-slate-500">
              Status is inferred from zone-level surrogate depth; facility and road sensors are not connected.
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            MODELLED DEPTH • STATIC NETWORK
          </span>
        </div>

        {/* Hospitals List */}
        <div className="space-y-3">
          {hospitals.map((hospital) => {
            const isAtRisk = hospital.access_status === 'AT_RISK';
            const isClosed = hospital.access_status === 'CLOSED';

            return (
              <div
                key={hospital.id}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5"
              >
                {/* Hospital Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{hospital.name}</h4>
                    <span className="text-[10px] text-slate-500">
                      Zone: {hospital.zone_name} ({hospital.zone_id}) • {hospital.contact}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                      Facility: {hospital.facility_flood_status}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        isClosed
                          ? 'bg-red-50 text-red-700 border-red-300'
                          : isAtRisk
                          ? 'bg-orange-50 text-orange-700 border-orange-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      }`}
                    >
                      Access: {hospital.access_status}
                    </span>
                  </div>
                </div>

                {/* Plain-English Access Reason */}
                <p className="text-[11px] text-slate-700 leading-relaxed font-sans bg-white p-2.5 rounded border border-slate-200">
                  {hospital.reason}
                </p>

                {/* Primary & Alternative Routes Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {/* Primary Route */}
                  <div className="bg-red-50/50 border border-red-200 p-2.5 rounded text-[11px]">
                    <div className="flex items-center justify-between font-bold text-red-700 mb-1">
                      <span>PRIMARY ROUTE</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 border border-red-200">
                        {hospital.primary_route.status}
                      </span>
                    </div>
                    <div className="text-slate-800 font-semibold">{hospital.primary_route.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{hospital.primary_route.corridor}</div>
                  </div>

                  {/* Alternative Route */}
                  {hospital.alternative_route ? (
                    <div className="bg-blue-50/50 border border-blue-200 p-2.5 rounded text-[11px] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between font-bold text-blue-700 mb-1">
                          <span>ALTERNATIVE ROUTE</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {hospital.alternative_route.status}
                          </span>
                        </div>
                        <div className="text-slate-800 font-semibold">{hospital.alternative_route.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{hospital.alternative_route.corridor}</div>
                        <div className="text-[10px] text-slate-600 mt-0.5">
                          Estimated Detour: <strong className="text-blue-700">+{hospital.alternative_route.detour_minutes} min</strong> • Total: {hospital.alternative_route.travel_time_minutes} min
                        </div>
                      </div>

                      {onShowRoute && (
                        <div className="pt-2 mt-2 border-t border-blue-200 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onShowRoute(hospital.alternative_route!.route_id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors uppercase cursor-pointer"
                          >
                            <span>SHOW ROUTE ON MAP</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-100 border border-slate-200 p-2.5 rounded text-[11px] text-slate-500 flex items-center justify-center">
                      No designated bypass corridor
                    </div>
                  )}
                </div>
                {hospital.primary_route.status === 'CLOSED' &&
                  hospital.alternative_route?.coordinates && (
                    <AlternativeRouteMiniMap
                      coordinates={hospital.alternative_route.coordinates}
                      label={`${hospital.alternative_route.name} bypass`}
                    />
                  )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: SHELTER ACCESSIBILITY & NEAREST SAFE SHELTER (FEATURE 1E & 8) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-200 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                EMERGENCY SHELTER ACCESSIBILITY
              </h3>
              <span className="text-[10px] text-slate-500">
                Evacuation destination verification & route clearance
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            MODELLED ACCESS • NOT LIVE STATUS
          </span>
        </div>

        {/* Feature 8: Recommended Dry Shelter Highlight Card */}
        {recommendedShelter && (
          <div className="bg-emerald-50/60 border border-emerald-300 rounded-lg p-3.5 mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-800 tracking-wider uppercase block">
                ★ RECOMMENDED DRY SHELTER
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                {recommendedShelter.name}
              </h4>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-700 mt-1">
                <span>Distance: <strong>{recommendedShelter.distance_km} km</strong></span>
                <span>•</span>
                <span>Travel Time: <strong>{recommendedShelter.travel_time_minutes} min</strong></span>
                <span>•</span>
                <span>Available Capacity: <strong className="text-emerald-700">{recommendedShelter.capacity} persons</strong></span>
                <span>•</span>
                <span className="text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                  {recommendedShelter.route_status}
                </span>
              </div>
            </div>

            {onShowRoute && (
              <button
                type="button"
                onClick={() => onShowRoute(recommendedShelter.route_id || 'ROUTE-SHELTER-A')}
                className="px-3.5 py-2 text-xs font-bold bg-emerald-700 text-white rounded hover:bg-emerald-800 transition-colors shadow-xs flex items-center gap-1.5 uppercase cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>SHOW ROUTE</span>
              </button>
            )}
          </div>
        )}

        {/* All Shelters Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] bg-slate-50">
                <th className="py-2 px-3 font-semibold">Shelter Facility</th>
                <th className="py-2 px-3 font-semibold">Zone</th>
                <th className="py-2 px-3 font-semibold text-center">Capacity</th>
                <th className="py-2 px-3 font-semibold text-center">Flood Status</th>
                <th className="py-2 px-3 font-semibold text-center">Road Access</th>
                <th className="py-2 px-3 font-semibold text-right">Distance</th>
                <th className="py-2 px-3 font-semibold text-right">Route Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shelters.map((shelter) => {
                const isBlocked = shelter.road_accessibility === 'CLOSED';
                return (
                  <tr key={shelter.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {shelter.is_recommended && <span className="text-emerald-600">★</span>}
                        <span>{shelter.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">ID: {shelter.id}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{shelter.zone_name}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                      {shelter.capacity}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 uppercase">
                        {shelter.flood_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          isBlocked
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        }`}
                      >
                        {isBlocked ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        <span>{shelter.road_accessibility}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                      {shelter.distance_km} km
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {!isBlocked && onShowRoute ? (
                        <button
                          type="button"
                          onClick={() => onShowRoute(shelter.route_id || 'ROUTE-SHELTER-A')}
                          className="px-2 py-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          SHOW ROUTE
                        </button>
                      ) : (
                        <span className="text-[10px] text-red-600 font-bold">BLOCKED</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
