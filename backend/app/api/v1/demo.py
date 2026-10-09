"""Explicitly simulated demo alert workflow; never dispatches to the public."""

import os
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import CounterfactualInputs, CounterfactualScenario, CounterfactualState

from app.data.gis_data import get_study_area_zones
from app.services.demo_officer_inbox import get_demo_alerts, store_demo_alert
from app.services.ml_engine import ml_engine


router = APIRouter()

DEMO_ENVIRONMENT = {
    "rain_1h": 50.0,
    "rain_3h": 100.0,
    "rain_6h": 200.0,
    "rain_24h": 400.0,
    "antecedent_mm": 200.0,
    "tide_m": 2.0,
    "surge_m": 1.0,
    "rain_tide_product": 150.0,
}


@router.get("/demo/officer-inbox")
def read_demo_officer_inbox(limit: int = Query(10, ge=1, le=50)):
    """Read messages sent to the local demonstration inbox."""
    return get_demo_alerts(limit)


@router.post("/demo/trigger-officer-alert")
def trigger_demo_officer_alert(
    study_area: str = Query("mangaluru", description="Study area to simulate")
) -> dict[str, Any]:
    """Run an explicitly synthetic high-risk scenario and deliver its alert in-app."""
    if study_area.lower() not in {"mangaluru", "udupi"}:
        raise HTTPException(status_code=400, detail="Unsupported study area.")

    zones = get_study_area_zones(study_area)
    predictions = [
        (
            zone,
            ml_engine.predict_zone(zone, DEMO_ENVIRONMENT, study_area=study_area),
        )
        for zone in zones
    ]
    zone, prediction = max(
        predictions,
        key=lambda item: (item[1]["p_flood"], item[1]["q50_depth"]),
    )
    if prediction["p_flood"] < 80 and prediction["q50_depth"] < 0.38:
        raise HTTPException(
            status_code=503,
            detail=(
                "The surrogate did not reach the demo high-risk threshold for this area; "
                "no officer message was created."
            ),
        )

    recipient = os.environ.get(
        "COASTGUARD_MONITORING_OFFICER_NAME", "Duty Monitoring Officer"
    )
    message = (
        f"DEMO ONLY — {study_area.title()} / {zone['zone_id']} ({zone['zone_name']}) "
        f"surrogate estimates {prediction['p_flood']}% flood-label probability, "
        f"{prediction['q50_depth']:.2f} m median depth, risk {prediction['risk_level']}. "
        "Synthetic high-rain/tide inputs used; verify independently. No public alert sent."
    )
    alert = store_demo_alert(
        {
            "recipient": recipient,
            "study_area": study_area.lower(),
            "zone_id": zone["zone_id"],
            "zone_name": zone["zone_name"],
            "p_flood": prediction["p_flood"],
            "risk_level": prediction["risk_level"],
            "q50_depth_m": prediction["q50_depth"],
            "message": message,
            "demo_only": True,
            "public_broadcast_sent": False,
        }
    )
    return {
        **alert,
        "zones": [
            {
                "zone_id": candidate_zone["zone_id"],
                "zone_name": candidate_zone["zone_name"],
                "flood_probability": candidate_prediction["p_flood"],
                "risk_level": candidate_prediction["risk_level"],
                "severity": candidate_prediction["severity"],
                "predicted_depth_m": candidate_prediction["q50_depth"],
                "depth_q10_m": candidate_prediction["q10_depth"],
                "depth_q50_m": candidate_prediction["q50_depth"],
                "depth_q90_m": candidate_prediction["q90_depth"],
            }
            for candidate_zone, candidate_prediction in predictions
        ],
        "zone": {
            "zone_id": zone["zone_id"],
            "zone_name": zone["zone_name"],
            "flood_probability": prediction["p_flood"],
            "risk_level": prediction["risk_level"],
            "severity": prediction["severity"],
            "predicted_depth_m": prediction["q50_depth"],
            "depth_q10_m": prediction["q10_depth"],
            "depth_q50_m": prediction["q50_depth"],
            "depth_q90_m": prediction["q90_depth"],
        },
        "synthetic_inputs": DEMO_ENVIRONMENT,
    }


@router.post("/demo/what-if", response_model=CounterfactualScenario)
def run_demo_what_if(inputs: CounterfactualInputs):
    """Run a counterfactual from the synthetic officer-demo baseline."""
    study_area = (inputs.study_area or "mangaluru").lower()
    if study_area not in {"mangaluru", "udupi"}:
        raise HTTPException(status_code=400, detail="Unsupported study area.")

    zones = get_study_area_zones(study_area)
    clean_zone_id = (inputs.zone_id or "Zone 03").lower().replace("-", " ")
    zone = next(
        (item for item in zones if item["zone_id"].lower() == clean_zone_id),
        zones[0],
    )
    baseline = ml_engine.predict_zone(zone, DEMO_ENVIRONMENT, study_area=study_area)
    tide_m = round(max(0.2, DEMO_ENVIRONMENT["tide_m"] + inputs.tide_offset_m), 2)
    rainfall_factor = max(0.0, 1.0 + inputs.rainfall_percent_change / 100.0)
    rainfall_offset = inputs.rainfall_offset_mm_hr
    rain_rate = round(
        max(0.0, DEMO_ENVIRONMENT["rain_1h"] * rainfall_factor + rainfall_offset),
        1,
    )
    surge_m = round(
        max(0.0, DEMO_ENVIRONMENT["surge_m"] + inputs.storm_surge_offset_m), 2
    )
    simulated_environment = {
        **DEMO_ENVIRONMENT,
        "rain_1h": rain_rate,
        "rain_3h": round(
            max(
                0.0,
                DEMO_ENVIRONMENT["rain_3h"] * rainfall_factor + rainfall_offset * 3,
            ),
            2,
        ),
        "rain_6h": round(
            max(
                0.0,
                DEMO_ENVIRONMENT["rain_6h"] * rainfall_factor + rainfall_offset * 6,
            ),
            2,
        ),
        "rain_24h": round(
            max(
                0.0,
                DEMO_ENVIRONMENT["rain_24h"] * rainfall_factor + rainfall_offset * 24,
            ),
            2,
        ),
        "tide_m": tide_m,
        "surge_m": surge_m,
        "tide_height": tide_m,
        "storm_surge": surge_m,
        "rain_tide_product": rain_rate * (tide_m + surge_m),
    }
    simulated = ml_engine.predict_zone(
        zone, simulated_environment, study_area=study_area
    )
    delta = round(simulated["q50_depth"] - baseline["q50_depth"], 2)
    return CounterfactualScenario(
        zone_id=zone["zone_id"],
        baseline=CounterfactualState(
            tide_m=DEMO_ENVIRONMENT["tide_m"],
            rainfall_rate_mm_hr=DEMO_ENVIRONMENT["rain_1h"],
            storm_surge_m=DEMO_ENVIRONMENT["surge_m"],
            predicted_depth_m=baseline["q50_depth"],
            depth_q10_m=baseline["q10_depth"],
            depth_q90_m=baseline["q90_depth"],
            risk_level=baseline["risk_level"],
            probability=baseline["p_flood"],
        ),
        simulated=CounterfactualState(
            tide_m=tide_m,
            rainfall_rate_mm_hr=rain_rate,
            storm_surge_m=surge_m,
            predicted_depth_m=simulated["q50_depth"],
            depth_q10_m=simulated["q10_depth"],
            depth_q90_m=simulated["q90_depth"],
            risk_level=simulated["risk_level"],
            probability=simulated["p_flood"],
        ),
        depth_delta_m=delta,
        depth_q90_delta_m=round(
            simulated["q90_depth"] - baseline["q90_depth"],
            2,
        ),
        risk_shift=f"{baseline['risk_level']} -> {simulated['risk_level']}",
        explanation=(
            "Synthetic demonstration baseline; this counterfactual also uses the surrogate "
            "and is not a verified forecast."
        ),
    )
