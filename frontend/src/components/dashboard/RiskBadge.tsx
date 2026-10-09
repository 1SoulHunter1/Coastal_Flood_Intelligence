import type { RiskLevel } from '../../types';
import { getRiskBgClass } from '../../utils';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  showSuffix?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className = '', showSuffix = true }) => {
  const badgeClasses = getRiskBgClass(level);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold tracking-wide uppercase ${badgeClasses} ${className}`}>
      {level} {showSuffix ? 'RISK' : ''}
    </span>
  );
};
