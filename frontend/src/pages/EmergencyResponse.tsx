import React, { useState, useEffect } from 'react';
import type { EmergencyPriorityItem } from '../types';
import { useStudyArea } from '../context/StudyAreaContext';
import { getEmergencyPriority } from '../services/api';
import { EmergencyPriorityTable } from '../components/dashboard/EmergencyPriorityTable';
import { ShieldAlert, Truck, Radio, CheckCircle, PhoneCall } from 'lucide-react';

export const EmergencyResponse: React.FC = () => {
  const { studyArea, config, selectedZoneId, handleZoneSelect } = useStudyArea();
  const [priorityItems, setPriorityItems] = useState<EmergencyPriorityItem[]>([]);

  useEffect(() => {
    getEmergencyPriority(studyArea).then((data) => {
      setPriorityItems(data);
    });
  }, [studyArea]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 font-mono shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-red-50 text-red-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              EMERGENCY RESPONSE DISPATCH CONSOLE
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold">
              {config.displayName.toUpperCase()} • DDMA COORDINATION
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Resource staging, task dispatch priority and inter-agency field deployment
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-md bg-red-50 border border-red-200 text-red-700 font-bold flex items-center gap-2 shadow-2xs">
            <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>ALERT LEVEL 3 ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Priority Table Section */}
      <EmergencyPriorityTable
        items={priorityItems}
        onSelectZone={(zoneId) => handleZoneSelect(zoneId, 'map')}
        selectedZoneId={selectedZoneId}
      />

      {/* Field Deployment Status & Agency Coordination */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* Card 1: Staging Units */}
        <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900 uppercase flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" />
              Response Fleet Staging
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">READY</span>
          </div>

          <div className="space-y-2.5 text-[11px]">
            {studyArea === 'udupi' ? (
              <>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleZoneSelect('Zone 01', 'map')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneSelect('Zone 01', 'map'); } }}
                  className="p-3 bg-slate-50 hover:bg-blue-50/70 cursor-pointer rounded-md border border-slate-200 transition-colors flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Focus Zone 01 (Malpe) on Flood Map"
                >
                  <div>
                    <div className="font-bold text-slate-900">SDRF Rescue Unit (Malpe — Zone 01)</div>
                    <div className="text-[10px] text-slate-500">3 Rescue Skiffs • 12 Personnel</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">DEPLOYED</span>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleZoneSelect('Zone 01', 'map')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneSelect('Zone 01', 'map'); } }}
                  className="p-3 bg-slate-50 hover:bg-blue-50/70 cursor-pointer rounded-md border border-slate-200 transition-colors flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Focus Zone 01 (Malpe) on Flood Map"
                >
                  <div>
                    <div className="font-bold text-slate-900">Coastal Security Police (Malpe — Zone 01)</div>
                    <div className="text-[10px] text-slate-500">2 All-Terrain Jet Boats</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold">STAGED</span>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleZoneSelect('Zone 02', 'map')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneSelect('Zone 02', 'map'); } }}
                  className="p-3 bg-slate-50 hover:bg-blue-50/70 cursor-pointer rounded-md border border-slate-200 transition-colors flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Focus Zone 02 (Udyavara) on Flood Map"
                >
                  <div>
                    <div className="font-bold text-slate-900">Fire & Emergency Bannanje (Zone 02)</div>
                    <div className="text-[10px] text-slate-500">4 Submersible Dewatering Pumps</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">READY</span>
                </div>
              </>
            ) : (
              <>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleZoneSelect('Zone 03', 'map')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneSelect('Zone 03', 'map'); } }}
                  className="p-3 bg-slate-50 hover:bg-blue-50/70 cursor-pointer rounded-md border border-slate-200 transition-colors flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Focus Zone 03 (Kulur) on Flood Map"
                >
                  <div>
                    <div className="font-bold text-slate-900">SDRF Team Alpha (Kulur — Zone 03)</div>
                    <div className="text-[10px] text-slate-500">4 Inflatable Boats • 16 Rescuers</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">DEPLOYED</span>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleZoneSelect('Zone 05', 'map')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneSelect('Zone 05', 'map'); } }}
                  className="p-3 bg-slate-50 hover:bg-blue-50/70 cursor-pointer rounded-md border border-slate-200 transition-colors flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Focus Zone 05 (Bunder) on Flood Map"
                >
                  <div>
                    <div className="font-bold text-slate-900">NDRF 10th Bn Team B (Bunder — Zone 05)</div>
                    <div className="text-[10px] text-slate-500">Wharf Search & Rescue Unit</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold">STAGED</span>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleZoneSelect('Zone 03', 'map')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneSelect('Zone 03', 'map'); } }}
                  className="p-3 bg-slate-50 hover:bg-blue-50/70 cursor-pointer rounded-md border border-slate-200 transition-colors flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Focus Zone 03 (Kulur) on Flood Map"
                >
                  <div>
                    <div className="font-bold text-slate-900">Fire & Emergency Services Team C (Zone 03)</div>
                    <div className="text-[10px] text-slate-500">6 High-Capacity Dewatering Pumps</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">READY</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Inter-Agency Hotlines */}
        <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900 uppercase flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              Inter-Agency Command Grid
            </span>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">HOTLINE</span>
          </div>

          <div className="space-y-2 text-[11px]">
            {studyArea === 'udupi' ? (
              <>
                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">Udupi DDMA Control:</span>
                  <strong className="text-slate-900">1077 / 0820-2574924</strong>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">Coastal Police (Malpe):</span>
                  <strong className="text-slate-900">112 / 0820-2538100</strong>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">District Hospital EOC:</span>
                  <strong className="text-slate-900">0820-2520200</strong>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">MESCOM Power Outage:</span>
                  <strong className="text-slate-900">1912</strong>
                </div>
              </>
            ) : (
              <>
                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">DK DDMA Control:</span>
                  <strong className="text-slate-900">1077 / 0824-2442590</strong>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">Coast Guard (Panambur):</span>
                  <strong className="text-slate-900">1554 / 0824-2405266</strong>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">Mangaluru Police EOC:</span>
                  <strong className="text-slate-900">112 / 0824-2220800</strong>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">MESCOM Power Outage:</span>
                  <strong className="text-slate-900">1912</strong>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Evacuation Checklist */}
        <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-900 uppercase flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              Operational Protocol Checklist
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">SOP DISPATCH</span>
          </div>

          <div className="space-y-2 text-[11px] text-slate-700">
            {studyArea === 'udupi' ? (
              <>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleZoneSelect('Zone 02', 'map')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneSelect('Zone 02', 'map'); } }}
                  className="flex items-start gap-2 p-2 bg-slate-50 hover:bg-blue-50/70 cursor-pointer rounded-md border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Focus Zone 02 (Udyavara) on Flood Map"
                >
                  <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <span>Evacuate low-lying riverside households in Zone 02 Udyavara before 17:40 IST onset.</span>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleZoneSelect('Zone 01', 'map')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneSelect('Zone 01', 'map'); } }}
                  className="flex items-start gap-2 p-2 bg-slate-50 hover:bg-blue-50/70 cursor-pointer rounded-md border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Focus Zone 01 (Malpe) on Flood Map"
                >
                  <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <span>Barricade Malpe harbor lower wharf approach (predicted depth &ge; 0.30m).</span>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleZoneSelect('Zone 03', 'map')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneSelect('Zone 03', 'map'); } }}
                  className="flex items-start gap-2 p-2 bg-slate-50 hover:bg-blue-50/70 cursor-pointer rounded-md border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Focus Zone 03 (Manipal/Parkala) on Flood Map"
                >
                  <span className="w-4 h-4 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">!</span>
                  <span>Maintain emergency access corridor along Karavali bypass to District Hospital.</span>
                </div>
              </>
            ) : (
              <>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleZoneSelect('Zone 03', 'map')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneSelect('Zone 03', 'map'); } }}
                  className="flex items-start gap-2 p-2 bg-slate-50 hover:bg-blue-50/70 cursor-pointer rounded-md border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Focus Zone 03 (Kulur) on Flood Map"
                >
                  <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <span>Evacuate vulnerable riverside settlements in Zone 03 Kulur before 18:40 IST onset.</span>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleZoneSelect('Zone 03', 'map')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneSelect('Zone 03', 'map'); } }}
                  className="flex items-start gap-2 p-2 bg-slate-50 hover:bg-blue-50/70 cursor-pointer rounded-md border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Focus Zone 03 (Kulur) on Flood Map"
                >
                  <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <span>Barricade NH-66 Kulur bridge underpasses to prevent heavy vehicle water stall.</span>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleZoneSelect('Zone 03', 'map')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneSelect('Zone 03', 'map'); } }}
                  className="flex items-start gap-2 p-2 bg-slate-50 hover:bg-blue-50/70 cursor-pointer rounded-md border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Focus Zone 03 (Kulur) on Flood Map"
                >
                  <span className="w-4 h-4 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">!</span>
                  <span>Standby mobile backup diesel generators at Kulur health center and substation.</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
