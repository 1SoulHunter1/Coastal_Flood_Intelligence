import React, { useState, useEffect } from 'react';
import type { CriticalFacility, RoadSegment, InfrastructureSummary } from '../types';
import { useStudyArea } from '../context/StudyAreaContext';
import { getInfrastructure } from '../services/api';
import { InfrastructureImpact } from '../components/dashboard/InfrastructureImpact';
import { Server, ShieldAlert, Car, Filter } from 'lucide-react';

export const Infrastructure: React.FC = () => {
  const { studyArea, config, handleZoneSelect } = useStudyArea();
  const [summary, setSummary] = useState<InfrastructureSummary | null>(null);
  const [facilities, setFacilities] = useState<CriticalFacility[]>([]);
  const [roads, setRoads] = useState<RoadSegment[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    getInfrastructure(studyArea).then((data) => {
      setSummary(data.summary);
      setFacilities(data.facilities);
      setRoads(data.roads);
    });
  }, [studyArea]);

  if (!summary) return null;

  const filteredFacilities = facilities.filter((f) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'HOSPITAL') return f.type === 'HOSPITAL';
    if (filterType === 'SHELTER') return f.type === 'SHELTER';
    if (filterType === 'POWER') return f.type === 'POWER_STATION' || f.type === 'DRAIN_PUMP';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 font-mono shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
              <Server className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              CRITICAL INFRASTRUCTURE STATUS
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              {config.displayName.toUpperCase()} • ASSET RESILIENCE REGISTRY
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Operational status of healthcare, power, evacuation shelters and transport networks
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          {['ALL', 'HOSPITAL', 'SHELTER', 'POWER'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                filterType === type
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {type === 'ALL' ? 'ALL ASSETS' : type + 'S'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <InfrastructureImpact summary={summary} />

      {/* Two Column Layout: Critical Facilities and Road Network */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Facilities Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-lg font-mono text-xs shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 uppercase text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Critical Lifeline Facilities ({filteredFacilities.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold">STATUS AUDIT</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] bg-slate-50">
                  <th className="py-2.5 px-3 font-semibold">FACILITY NAME</th>
                  <th className="py-2.5 px-3 font-semibold">ZONE</th>
                  <th className="py-2.5 px-3 font-semibold">TYPE</th>
                  <th className="py-2.5 px-3 font-semibold">ELEVATION</th>
                  <th className="py-2.5 px-3 text-right font-semibold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFacilities.map((facility) => {
                  let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (facility.status === 'CRITICAL') statusBadge = 'bg-red-50 text-red-700 border-red-200 font-bold';
                  if (facility.status === 'AT_RISK') statusBadge = 'bg-orange-50 text-orange-700 border-orange-200 font-bold';
                  if (facility.status === 'UNKNOWN') statusBadge = 'bg-slate-100 text-slate-600 border-slate-300';

                  return (
                    <tr
                      key={facility.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleZoneSelect(facility.zone_id, 'map')}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneSelect(facility.zone_id, 'map'); } }}
                      title={`Inspect ${facility.name} in ${facility.zone_id} on Flood Map`}
                      className="hover:bg-blue-50/60 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{facility.name}</div>
                        {facility.capacity_or_load && (
                          <div className="text-[10px] text-slate-500">{facility.capacity_or_load}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        <span className="font-semibold text-blue-700">{facility.zone_name}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-blue-700 font-semibold">
                          {facility.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{facility.elevation_m}m</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${statusBadge}`}>
                          {facility.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Road & Transit Network Status (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-lg font-mono text-xs shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 uppercase text-xs flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-600" />
              Road Network Inundation ({roads.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold">CORRIDOR ACCESS</span>
          </div>

          <div className="space-y-2.5">
            {roads.map((road) => {
              let statusStyle = 'text-emerald-700 bg-emerald-50 border-emerald-200';
              if (road.status === 'INUNDATED') statusStyle = 'text-red-700 bg-red-50 border-red-200 font-bold';
              if (road.status === 'WATERLOGGED') statusStyle = 'text-orange-700 bg-orange-50 border-orange-200 font-bold';

              return (
                <div
                  key={road.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleZoneSelect(road.zone_id, 'map')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneSelect(road.zone_id, 'map'); } }}
                  title={`Inspect ${road.name} in ${road.zone_id} on Flood Map`}
                  className="p-3 bg-slate-50 hover:bg-blue-50/60 rounded-md border border-slate-200 space-y-1 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{road.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${statusStyle}`}>
                      {road.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                    <span>Zone: <strong className="text-blue-700">{road.zone_name}</strong></span>
                    <span>Water Depth: <strong className={road.water_depth_cm > 30 ? 'text-red-600' : 'text-amber-700'}>{road.water_depth_cm} cm</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
