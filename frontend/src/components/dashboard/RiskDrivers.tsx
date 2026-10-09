import React from 'react';
import type { RiskDriverFactor } from '../../types';
import { Cpu, HelpCircle } from 'lucide-react';

interface RiskDriversProps {
  factors: RiskDriverFactor[];
  zoneName?: string;
}

// Convert technical SHAP/model feature names into human-readable labels
export const formatShapFeatureName = (feature: string): string => {
  const normalized = feature.toLowerCase().trim();
  if (normalized.includes('tide')) return 'High tide level';
  if (normalized.includes('elevation')) return 'Low ground elevation';
  if (normalized.includes('rain')) return 'Recent rainfall';
  if (normalized.includes('drain')) return 'Drainage conditions';
  if (normalized.includes('surge')) return 'Storm surge';
  if (normalized.includes('land')) return 'Impervious land cover';
  return feature;
};

// Deterministic rule-based template generation for plain-English driver summary
export const generatePlainEnglishDriverExplanation = (factors: RiskDriverFactor[]): string => {
  if (!factors || factors.length === 0) {
    return 'Flood risk is driven by combined hydrodynamic and rainfall runoff conditions.';
  }

  // Sort descending by percentage
  const sorted = [...factors].sort((a, b) => b.percentage - a.percentage);
  const primary = sorted[0];
  const secondary = sorted[1];

  const primaryLabel = formatShapFeatureName(primary.factor);
  const secondaryLabel = secondary ? formatShapFeatureName(secondary.factor) : '';

  if (primary.percentage >= 60 && secondary) {
    return `Flood risk is mainly driven by the ${primaryLabel.toLowerCase()} (${primary.percentage}%), with ${secondaryLabel.toLowerCase()} (${secondary.percentage}%) providing an additional contribution.`;
  } else if (primary.percentage >= 40 && secondary) {
    return `${primaryLabel} is the primary contributing factor (${primary.percentage}%), while ${secondaryLabel.toLowerCase()} (${secondary.percentage}%) further amplifies backflow pressure.`;
  } else if (secondary) {
    return `Flood risk is co-driven by ${primaryLabel.toLowerCase()} (${primary.percentage}%) and ${secondaryLabel.toLowerCase()} (${secondary.percentage}%), creating compounding runoff in low-lying corridors.`;
  }

  return `The heuristic driver ranking is led by ${primaryLabel.toLowerCase()} under the current provider inputs.`;
};

export const RiskDrivers: React.FC<RiskDriversProps> = ({ factors, zoneName = 'ZONE 03' }) => {
  const plainEnglishSummary = generatePlainEnglishDriverExplanation(factors);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between font-mono">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] tracking-wider text-slate-500 uppercase block font-semibold">
              {zoneName} ATTRIBUTION
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              WHY IS THIS ZONE AT RISK?
            </h3>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
            <Cpu className="w-3 h-3 text-blue-600" />
            <span>HEURISTIC DRIVER RANKING</span>
          </div>
        </div>

        {/* Feature 2B: Plain-English Operational Driver Box */}
        <div className="my-3 p-3 bg-blue-50/60 border border-blue-200 rounded-md">
          <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[11px] mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>OPERATIONAL EXPLANATION:</span>
          </div>
          <p className="font-sans text-xs text-slate-800 font-medium leading-relaxed">
            &ldquo;{plainEnglishSummary}&rdquo;
          </p>
        </div>

        {/* Factors Horizontal Bars */}
        <div className="my-3 space-y-2.5">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            HEURISTIC INPUT WEIGHTS (NOT SHAP)
          </span>
          {factors.map((item) => {
            const displayName = formatShapFeatureName(item.factor);
            let barColor = 'bg-blue-600';
            let textColor = 'text-blue-700';

            if (item.percentage >= 40) {
              barColor = 'bg-red-500';
              textColor = 'text-red-700';
            } else if (item.percentage >= 25) {
              barColor = 'bg-orange-500';
              textColor = 'text-orange-700';
            } else if (item.percentage >= 15) {
              barColor = 'bg-amber-500';
              textColor = 'text-amber-700';
            }

            return (
              <div key={item.factor} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-800 font-semibold">
                    {displayName}
                  </span>
                  <span className={`font-bold ${textColor}`}>
                    {item.percentage}%
                  </span>
                </div>

                {/* Horizontal Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Deterministic rule-based templates prepared for SHAP tree integration</span>
        <span className="text-slate-400">DEMO VALUES</span>
      </div>
    </div>
  );
};
