import type { RiskLevel, PriorityStatus } from '../types';

export const getRiskColorHex = (risk: RiskLevel): string => {
  switch (risk) {
    case 'CRITICAL':
      return '#DC2626'; // Red
    case 'HIGH':
      return '#EA580C'; // Orange
    case 'MODERATE':
      return '#D97706'; // Yellow/Amber
    case 'LOW':
      return '#16A34A'; // Green
    default:
      return '#2563EB';
  }
};

export const getRiskBgClass = (risk: RiskLevel | 'INFO'): string => {
  switch (risk) {
    case 'CRITICAL':
      return 'bg-red-50 text-red-700 border border-red-200 font-bold';
    case 'HIGH':
      return 'bg-orange-50 text-orange-700 border border-orange-200 font-bold';
    case 'MODERATE':
      return 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold';
    case 'LOW':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold';
    case 'INFO':
      return 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
};

export const getPriorityClass = (priority: PriorityStatus): string => {
  switch (priority) {
    case 'IMMEDIATE':
      return 'bg-red-50 text-red-700 border border-red-200 font-bold';
    case 'URGENT':
      return 'bg-orange-50 text-orange-700 border border-orange-200 font-bold';
    case 'HIGH':
      return 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold';
    case 'MONITOR':
      return 'bg-blue-50 text-blue-700 border border-blue-200 font-medium';
    case 'LOW':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};
