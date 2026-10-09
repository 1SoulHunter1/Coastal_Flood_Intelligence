"""
CoastGuard-AI API: /analysis/what-if
Counterfactual scenario exploration engine
"""

from fastapi import APIRouter
from app.models.schemas import (
    CounterfactualInputs, CounterfactualScenario, CounterfactualState
)
from app.services.external_data import get_live_hydrometeo_conditions
from app.data.gis_data import get_study_area_zones
from app.services.ml_engine import ml_engine

router = APIRouter()

@router.post("/analysis/what-if", response_model=CounterfactualScenario)
def run_what_if_analysis(inputs: CounterfactualInputs):
    """
    Computes sensitivity delta under counterfactual tidal elevations,
    rainfall rate perturbations, and storm surge offsets.
    """
    study_area = inputs.study_area or "mangaluru"
    zone_id = inputs.zone_id or "Zone 03"
    is_udupi = (study_area.lower() == "udupi")

    # Fetch live baseline conditions
    env = get_live_hydrometeo_conditions(study_area)
    zones = get_study_area_zones(study_area)

    clean_zid = zone_id.lower().replace("-", " ")
    zone_gis = next((z for z in zones if z["zone_id"].lower() == clean_zid), zones[0])

    # 1. Baseline prediction
    base_preds = ml_engine.predict_zone(zone_gis, env, study_area=study_area)
    base_depth = base_preds["q50_depth"]
    base_prob = base_preds["p_flood"]
    base_risk = base_preds["risk_level"]

    # 2. Simulated environmental condition
    sim_tide = round(max(0.2, env["tide_level_m"] + inputs.tide_offset_m), 2)
    rainfall_factor = max(0.0, 1.0 + inputs.rainfall_percent_change / 100.0)
    rainfall_offset = inputs.rainfall_offset_mm_hr
    sim_rain = round(
        max(0.0, env["rain_1h"] * rainfall_factor + rainfall_offset),
        1,
    )
    sim_surge = round(max(0.0, env["storm_surge_m"] + inputs.storm_surge_offset_m), 2)

    sim_env = {
        **env,
        "rain_1h": sim_rain,
        "rain_3h": round(
            max(0.0, env["rain_3h"] * rainfall_factor + rainfall_offset * 3),
            2,
        ),
        "rain_6h": round(
            max(0.0, env["rain_6h"] * rainfall_factor + rainfall_offset * 6),
            2,
        ),
        "rain_24h": round(
            max(0.0, env["rain_24h"] * rainfall_factor + rainfall_offset * 24),
            2,
        ),
        "antecedent_mm": env["antecedent_mm"],
        "tide_height": sim_tide,
        "storm_surge": sim_surge,
        "tide_m": sim_tide,
        "surge_m": sim_surge,
        "tide_rain_interaction": round(sim_rain * sim_tide, 2),
        "rain_tide_product": round(sim_rain * (sim_tide + sim_surge), 2),
    }

    sim_preds = ml_engine.predict_zone(zone_gis, sim_env, study_area=study_area)
    sim_depth = sim_preds["q50_depth"]
    sim_prob = sim_preds["p_flood"]
    sim_risk = sim_preds["risk_level"]

    depth_delta = round(sim_depth - base_depth, 2)
    risk_shift = f"{base_risk} -> {sim_risk}"

    if depth_delta < -0.10:
        explanation = (
            f"Under this counterfactual scenario ({inputs.tide_offset_m:+.2f}m tide, {sim_rain:.1f} mm/h rain), "
            f"predicted inundation in {zone_gis['zone_name']} drops substantially from {base_depth:.2f} m to {sim_depth:.2f} m, "
            f"restoring full vehicle access across primary arterial corridors."
        )
    elif depth_delta > 0.10:
        explanation = (
            f"Under this escalated scenario ({inputs.tide_offset_m:+.2f}m tide, {sim_rain:.1f} mm/h rain), "
            f"inundation deepens by +{abs(depth_delta):.2f} m to {sim_depth:.2f} m, causing extensive road cutoffs and isolating lower sectors."
        )
    else:
        explanation = (
            f"Under this marginal delta scenario, flood depth remains relatively stable at {sim_depth:.2f} m ({risk_shift})."
        )

    return CounterfactualScenario(
        zone_id=zone_gis["zone_id"],
        baseline=CounterfactualState(
            tide_m=env["tide_level_m"],
            rainfall_rate_mm_hr=env["observed_rainfall_rate_mm_hr"],
            storm_surge_m=env["storm_surge_m"],
            predicted_depth_m=base_depth,
            depth_q10_m=base_preds["q10_depth"],
            depth_q90_m=base_preds["q90_depth"],
            risk_level=base_risk,
            probability=base_prob
        ),
        simulated=CounterfactualState(
            tide_m=sim_tide,
            rainfall_rate_mm_hr=sim_rain,
            storm_surge_m=sim_surge,
            predicted_depth_m=sim_depth,
            depth_q10_m=sim_preds["q10_depth"],
            depth_q90_m=sim_preds["q90_depth"],
            risk_level=sim_risk,
            probability=sim_prob
        ),
        depth_delta_m=depth_delta,
        depth_q90_delta_m=round(
            sim_preds["q90_depth"] - base_preds["q90_depth"],
            2,
        ),
        risk_shift=risk_shift,
        explanation=explanation
    )
