import React from 'react';
import type { InfrastructureSummary } from '../../types';
import { Hospital, GraduationCap, Home, Car, Building2, ShieldAlert } from 'lucide-react';
import { formatNumber } from '../../utils';

interface InfrastructureImpactProps {
  summary: InfrastructureSummary;
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
}

export const InfrastructureImpact: React.FC<InfrastructureImpactProps> = ({
  summary,
  onSelectCategory,
  selectedCategory
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-50 text-amber-700">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold font-mono text-slate-900 tracking-wide uppercase">
            MODELLED INFRASTRUCTURE EXPOSURE
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase font-semibold">
          ZONE 03 + SYSTEM WIDE
        </span>
      </div>

      {/* 6 Grid Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        {/* Hospitals */}
        <button
          type="button"
          onClick={() => onSelectCategory && onSelectCategory('hospitals')}
          className={`text-left bg-slate-50 border rounded-md p-3 relative transition-all cursor-pointer ${
            selectedCategory === 'hospitals'
              ? 'border-red-500 ring-2 ring-red-300 bg-red-50/40'
              : 'border-red-200 hover:border-red-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-700 font-semibold">Hospitals in risk zones</span>
            <Hospital className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {summary.hospitals_at_risk ?? '—'}
          </div>
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase">
            {summary.hospitals_at_risk == null ? 'NO DEMO FACILITY INPUT' : 'MODELLED EXPOSURE'}
          </span>
        </button>

        {/* Schools */}
        <button
          type="button"
          onClick={() => onSelectCategory && onSelectCategory('schools')}
          className={`text-left bg-slate-50 border rounded-md p-3 relative transition-all cursor-pointer ${
            selectedCategory === 'schools'
              ? 'border-amber-500 ring-2 ring-amber-300 bg-amber-50/40'
              : 'border-amber-200 hover:border-amber-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-700 font-semibold">Schools tracked</span>
            <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {summary.schools_at_risk ?? '—'}
          </div>
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
          {summary.schools_at_risk == null ? 'NO INVENTORY FEED' : 'MODELLED AT RISK'}
          </span>
        </button>

        {/* Shelters */}
        <button
          type="button"
          onClick={() => onSelectCategory && onSelectCategory('shelters')}
          className={`text-left bg-slate-50 border rounded-md p-3 relative transition-all cursor-pointer ${
            selectedCategory === 'shelters'
              ? 'border-emerald-500 ring-2 ring-emerald-300 bg-emerald-50/40'
              : 'border-emerald-200 hover:border-emerald-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-700 font-semibold">Shelters listed</span>
            <Home className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {summary.shelters_active}
          </div>
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
          STATIC INVENTORY
          </span>
        </button>

        {/* Road Segments */}
        <button
          type="button"
          onClick={() => onSelectCategory && onSelectCategory('roads')}
          className={`text-left bg-slate-50 border rounded-md p-3 relative transition-all cursor-pointer ${
            selectedCategory === 'roads'
              ? 'border-orange-500 ring-2 ring-orange-300 bg-orange-50/40'
              : 'border-orange-200 hover:border-orange-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-700 font-semibold">Roads in risk zones</span>
            <Car className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {summary.road_segments_affected}
          </div>
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 uppercase">
            MODELLED
          </span>
        </button>

        {/* Buildings */}
        <button
          type="button"
          onClick={() => onSelectCategory && onSelectCategory('buildings')}
          className={`text-left bg-slate-50 border rounded-md p-3 relative transition-all cursor-pointer ${
            selectedCategory === 'buildings'
              ? 'border-red-500 ring-2 ring-red-300 bg-red-50/40'
              : 'border-red-200 hover:border-red-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-700 font-semibold">Buildings in risk zones</span>
            <Building2 className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {formatNumber(summary.buildings_affected)}
          </div>
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase">
            EXPOSURE ESTIMATE
          </span>
        </button>

        {/* Critical Facilities */}
        <button
          type="button"
          onClick={() => onSelectCategory && onSelectCategory('facilities')}
          className={`text-left bg-slate-50 border rounded-md p-3 relative transition-all cursor-pointer ${
            selectedCategory === 'facilities'
              ? 'border-red-500 ring-2 ring-red-300 bg-red-50/40'
              : 'border-red-200 hover:border-red-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-700 font-semibold">Facilities in risk zones</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {summary.critical_facilities_at_risk}
          </div>
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase">
            MODELLED EXPOSURE
          </span>
        </button>
      </div>
      <p className="mt-2 text-[10px] font-mono text-slate-500">
        Road/facility exposure uses zone-level surrogate depth proxies. Building counts are static estimates; no live road, facility, school, or damage feed is connected.
      </p>
    </div>
  );
};
