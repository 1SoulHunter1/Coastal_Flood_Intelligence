import React from 'react';
import type { RiskLevel } from '../../types';
import { getRiskBgClass } from '../../utils';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className = '' }) => {
  const badgeClasses = getRiskBgClass(level);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold tracking-wide uppercase ${badgeClasses} ${className}`}>
      {level} RISK
    </span>
  );
};

interface StatusBadgeProps {
  label: string;
  variant?: 'operational' | 'simulation' | 'active' | 'warning' | 'critical';
  pulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'operational',
  pulse = false,
  className = ''
}) => {
  let style = 'bg-slate-50 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (variant === 'operational') {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (variant === 'simulation') {
    style = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-600';
  } else if (variant === 'active') {
    style = 'bg-cyan-50 text-cyan-800 border-cyan-200';
    dotColor = 'bg-cyan-600';
  } else if (variant === 'warning') {
    style = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (variant === 'critical') {
    style = 'bg-red-50 text-red-700 border-red-200';
    dotColor = 'bg-red-600';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono tracking-wider uppercase border font-semibold ${style} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${pulse ? 'status-dot-pulse' : ''}`} />
      {label}
    </span>
  );
};
