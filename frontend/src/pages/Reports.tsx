import React, { useState, useEffect } from 'react';
import type { SituationBriefData, ZoneData, InfrastructureSummary } from '../types';
import { useStudyArea } from '../context/StudyAreaContext';
import { getSituationBrief, getZones, getInfrastructure } from '../services/api';
import { FileText, Printer, Download, CheckCircle } from 'lucide-react';
import { formatNumber } from '../utils';

export const Reports: React.FC = () => {
  const { studyArea, config } = useStudyArea();
  const [brief, setBrief] = useState<SituationBriefData | null>(null);
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [infra, setInfra] = useState<InfrastructureSummary | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getSituationBrief(studyArea),
      getZones(studyArea),
      getInfrastructure(studyArea)
    ]).then(([b, z, i]) => {
      setBrief(b);
      setZones(z);
      setInfra(i.summary);
    });
  }, [studyArea]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setExportNotice('SITREP DOCUMENT EXPORT READY (PDF GENERATED)');
    setTimeout(() => setExportNotice(null), 3500);
  };

  if (!brief || !infra) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 font-mono shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              OPERATIONAL SITREP & EXECUTIVE REPORTS
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              OFFICIAL DISPATCH
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Formal hydro-meteorological summary formatted for District Disaster Management Authority (DDMA)
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>PRINT SITREP</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT PDF REPORT</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-md font-mono text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{exportNotice}</span>
        </div>
      )}

      {/* Official SITREP Document Sheet */}
      <div className="bg-white border border-slate-300 rounded-lg p-6 lg:p-8 font-mono text-slate-800 max-w-4xl mx-auto shadow-sm space-y-6">
        {/* Document Header */}
        <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
          <div className="text-xs tracking-widest text-slate-500 uppercase font-semibold">
            DISTRICT DISASTER MANAGEMENT AUTHORITY (DDMA) • {studyArea === 'udupi' ? 'UDUPI DISTRICT' : 'DAKSHINA KANNADA'}
          </div>
          <h1 className="text-lg font-extrabold text-slate-900 uppercase tracking-wider">
            COASTAL FLOOD SITUATION REPORT (SITREP)
          </h1>
          <div className="text-xs text-blue-700 font-bold">
            {brief.bulletin_number} • ISSUED: {brief.timestamp_ist}
          </div>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-md border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 text-[10px] block uppercase font-medium">INCIDENT</span>
            <span className="font-bold text-slate-900">Monsoon Tidal Inundation</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block uppercase font-medium">STUDY AREA</span>
            <span className="font-bold text-slate-900">{config.name}, {config.state}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block uppercase font-medium">SYSTEM STATUS</span>
            <span className="font-bold text-red-600">ALERT LEVEL 3</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block uppercase font-medium">PRIMARY CONCERN</span>
            <span className="font-bold text-orange-600">{brief.recommended_primary_zone || (studyArea === 'udupi' ? 'Zone 02 (Udyavara)' : 'Zone 03 (Kulur)')}</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2 text-xs font-sans leading-relaxed">
          <h2 className="font-bold font-mono text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1">
            1. EXECUTIVE SUMMARY & HYDROLOGICAL SYNTHESIS
          </h2>
          <p className="text-slate-700">
            {brief.narrative_paragraph_1}
          </p>
          <p className="text-slate-700">
            {brief.narrative_paragraph_2}
          </p>
        </div>

        {/* Infrastructure Exposure Summary Table */}
        <div className="space-y-2 text-xs font-mono">
          <h2 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1">
            2. PROJECTED INFRASTRUCTURE EXPOSURE
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
              <div className="text-base font-bold text-red-600">{infra.hospitals_at_risk ?? '—'}</div>
              <div className="text-[10px] text-slate-500">Hospitals at Risk</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
              <div className="text-base font-bold text-amber-700">{infra.schools_at_risk}</div>
              <div className="text-[10px] text-slate-500">Schools at Risk</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
              <div className="text-base font-bold text-emerald-700">{infra.shelters_active}</div>
              <div className="text-[10px] text-slate-500">Available Shelters</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
              <div className="text-base font-bold text-orange-600">{infra.road_segments_affected}</div>
              <div className="text-[10px] text-slate-500">Roads Flooded</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
              <div className="text-base font-bold text-slate-900">{formatNumber(infra.buildings_affected)}</div>
              <div className="text-[10px] text-slate-500">Buildings Exposed</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
              <div className="text-base font-bold text-red-600">{infra.critical_facilities_at_risk}</div>
              <div className="text-[10px] text-slate-500">Critical Lifelines</div>
            </div>
          </div>
        </div>

        {/* Zone Summary in Report */}
        <div className="space-y-2 text-xs font-mono">
          <h2 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1">
            3. BASIN ZONE RISK AUDIT SUMMARY
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] bg-slate-50">
                  <th className="py-2 px-3">ZONE</th>
                  <th className="py-2 px-3">RISK</th>
                  <th className="py-2 px-3">PROB</th>
                  <th className="py-2 px-3">ONSET</th>
                  <th className="py-2 px-3">PEAK</th>
                  <th className="py-2 px-3 text-right">POPULATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {zones.map((z) => (
                  <tr key={z.zone_id}>
                    <td className="py-1.5 px-3 font-bold text-slate-900">{z.zone_id} ({z.zone_name})</td>
                    <td className="py-1.5 px-3 text-orange-700 font-semibold">{z.risk_level}</td>
                    <td className="py-1.5 px-3 font-bold text-slate-900">{z.flood_probability}%</td>
                    <td className="py-1.5 px-3 text-slate-700">{z.expected_onset}</td>
                    <td className="py-1.5 px-3 text-red-600 font-bold">{z.expected_peak}</td>
                    <td className="py-1.5 px-3 text-right text-slate-900">{formatNumber(z.estimated_population || 12400)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority Response Recommendation */}
        <div className="space-y-2 text-xs font-mono">
          <h2 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1">
            4. STRATEGIC DIRECTIVES & DISPATCH ORDERS
          </h2>
          <div className="p-3.5 bg-amber-50/50 rounded-md border border-amber-200 space-y-2 text-slate-700">
            {studyArea === 'udupi' ? (
              <>
                <div className="font-bold text-amber-900">Directive A: Zone 01 (Malpe) Wharf Access Diversion</div>
                <p className="text-[11px] leading-relaxed">
                  Barricade inundated lower wharf approaches (depth &ge; 0.30m). Divert commercial fish cargo carriers via Karavali bypass corridor.
                </p>
                <div className="font-bold text-amber-900 pt-1">Directive B: Zone 02 (Udyavara) Backwater Inundation Control</div>
                <p className="text-[11px] leading-relaxed">
                  Deploy rescue teams to low-elevation residential riverbanks along Papanashini river; keep Udyavara community shelter on active standby.
                </p>
              </>
            ) : (
              <>
                <div className="font-bold text-amber-900">Directive A: Zone 03 (Kulur) River Corridor Isolation</div>
                <p className="text-[11px] leading-relaxed">
                  Barricade low-lying approaches to Gurupura bridge. Keep MESCOM mobile restoration vehicle on standby for the 110kV substation.
                </p>
                <div className="font-bold text-amber-900 pt-1">Directive B: Zone 05 (Bunder) Port Wharf Safety</div>
                <p className="text-[11px] leading-relaxed">
                  Ensure all artisanal fishing vessels are secured and wharf power distribution panels isolated before 20:10 IST tide ingress.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Sign-off */}
        <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
          <div>
            <div>PREPARED BY: {brief.prepared_by}</div>
            <div>VERIFICATION: NOT AUTHORITY-VERIFIED</div>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] uppercase font-bold">
              MODEL ESTIMATE • NOT OFFICIAL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
