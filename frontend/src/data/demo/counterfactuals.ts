import type { CounterfactualInputs, CounterfactualScenario } from '../../types/Counterfactual';

export const calculateCounterfactualScenario = (
  zoneId: string = 'Zone 03',
  inputs: CounterfactualInputs,
  studyArea: string = 'mangaluru'
): CounterfactualScenario => {
  // Baseline values based on study area
  const isUdupi = studyArea.toLowerCase() === 'udupi';
  const baselineTide = isUdupi ? 1.88 : 1.95;
  const baselineRainfall = isUdupi ? 32.4 : 48.5;
  const baselineSurge = isUdupi ? 0.38 : 0.42;
  const baselineDepth = isUdupi ? 0.36 : 0.35;
  const baselineProb = isUdupi ? 84 : 82;
  const baselineRisk = 'HIGH';

  // Deterministic physical response model proxy:
  // - Tide change impact: ~0.67m depth per 1m tide change
  // - Rainfall change impact: ~0.003m depth per % change in rainfall
  // - Surge change impact: ~0.50m depth per 1m surge change
  const tideImpact = inputs.tide_offset_m * 0.675;
  const rainfallOffset = inputs.rainfall_offset_mm_hr ?? 0;
  const rainImpact = ((inputs.rainfall_percent_change / 100) * 0.12)
    + (rainfallOffset * 0.004);
  const surgeImpact = inputs.storm_surge_offset_m * 0.50;

  const rawSimulatedDepth = baselineDepth + tideImpact + rainImpact + surgeImpact;
  const simulatedDepth = Math.max(0.02, Math.min(1.20, Number(rawSimulatedDepth.toFixed(2))));

  // Simulated probability & risk level shift
  let simulatedProb = Math.round(baselineProb + (simulatedDepth - baselineDepth) * 140);
  simulatedProb = Math.max(15, Math.min(98, simulatedProb));

  let simulatedRisk = 'MODERATE';
  if (simulatedDepth >= 0.30) {
    simulatedRisk = simulatedDepth >= 0.50 ? 'CRITICAL' : 'HIGH';
  } else if (simulatedDepth < 0.15) {
    simulatedRisk = 'LOW';
  }

  const depthDelta = Number((simulatedDepth - baselineDepth).toFixed(2));
  const riskShift = `${baselineRisk} → ${simulatedRisk}`;

  let explanation = '';
  if (depthDelta < -0.15) {
    explanation =
      'Under this simulated lower-tide scenario, predicted flood depth decreases substantially below the vehicle-access threshold.';
  } else if (depthDelta < -0.05) {
    explanation =
      'Under this scenario, simulated flood depth shows moderate reduction, lowering overall corridor risk.';
  } else if (depthDelta > 0.15) {
    explanation =
      'Simulated adverse conditions produce widespread severe inundation with multiple critical corridor cutoffs.';
  } else if (depthDelta > 0.05) {
    explanation =
      'Increased tidal and rainfall parameters elevate backflow pressure, moderately increasing predicted water depth.';
  } else {
    explanation =
      'Simulated conditions remain closely aligned with current baseline hydrodynamic observations.';
  }

  return {
    zone_id: zoneId,
    baseline: {
      tide_m: baselineTide,
      rainfall_rate_mm_hr: baselineRainfall,
      storm_surge_m: baselineSurge,
      predicted_depth_m: baselineDepth,
      risk_level: baselineRisk,
      probability: baselineProb
    },
    simulated: {
      tide_m: Number((baselineTide + inputs.tide_offset_m).toFixed(2)),
      rainfall_rate_mm_hr: Number(
        Math.max(
          0,
          baselineRainfall * (1 + inputs.rainfall_percent_change / 100) + rainfallOffset
        ).toFixed(1)
      ),
      storm_surge_m: Number((baselineSurge + inputs.storm_surge_offset_m).toFixed(2)),
      predicted_depth_m: simulatedDepth,
      risk_level: simulatedRisk,
      probability: simulatedProb
    },
    depth_delta_m: depthDelta,
    risk_shift: riskShift,
    explanation
  };
};

export const demoDefaultCounterfactual = calculateCounterfactualScenario('Zone 03', {
  tide_offset_m: -0.40,
  rainfall_percent_change: 0,
  storm_surge_offset_m: 0
});
