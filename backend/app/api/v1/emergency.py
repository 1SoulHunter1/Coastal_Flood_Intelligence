"""
CoastGuard-AI API: /emergency/*
Multi-criteria priority ranking and model-generated draft response summaries
"""

from fastapi import APIRouter, Query
from typing import List, Optional
from app.models.schemas import (
    EmergencyPriorityItem, ResponderBriefing, ResponderActionItem, SituationBriefData
)
from app.data.gis_data import get_study_area_zones
from app.services.external_data import get_live_hydrometeo_conditions, get_ist_time_str
from app.services.ml_engine import ml_engine

router = APIRouter()

@router.get("/emergency/priority-table", response_model=List[EmergencyPriorityItem])
def get_emergency_priority_table(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')")
):
    """
    Computes Multi-Criteria Decision Analysis (MCDA) priority rankings
    balancing flood probability, inundation depth, vulnerable population, and critical lifeline assets.
    """
    env = get_live_hydrometeo_conditions(study_area)
    zones = get_study_area_zones(study_area)

    scored_items = []
    for z in zones:
        preds = ml_engine.predict_zone(z, env, study_area=study_area)
        prob = preds["p_flood"]
        depth = preds["q50_depth"]
        pop = z["estimated_population"]
        facs = z["critical_facilities"]

        # MCDA composite calculation
        score = (prob * 0.40) + (min(depth / 0.50, 1.0) * 35.0) + (min(pop / 15000.0, 1.0) * 15.0) + (min(facs / 4.0, 1.0) * 10.0)
        score = round(min(99.0, max(20.0, score)), 1)

        exposure = "VERY HIGH" if pop > 12000 else ("HIGH" if pop > 8000 else "MEDIUM")
        priority = "IMMEDIATE" if score >= 85 else ("URGENT" if score >= 70 else ("HIGH" if score >= 50 else "MONITOR"))

        rationale = (
            f"High estuarine tide coincidence ({env['tide_level_m']}m) and low elevation ({z['elevation_mean']}m) "
            f"threatens {z['affected_roads']} road segments and {facs} critical lifeline facilities."
        )

        scored_items.append({
            "zone_id": z["zone_id"],
            "zone_name": z["zone_name"],
            "risk_level": preds["risk_level"],
            "exposure": exposure,
            "critical_facilities": facs,
            "priority": priority,
            "priority_score": score,
            "rationale": rationale
        })

    # Sort descending by priority score
    scored_items.sort(key=lambda x: x["priority_score"], reverse=True)

    result = []
    for rank, item in enumerate(scored_items, start=1):
        result.append(EmergencyPriorityItem(
            rank=rank,
            **item
        ))

    return result

@router.get("/emergency/responder-briefing", response_model=ResponderBriefing)
def get_responder_briefing(
    zone_id: Optional[str] = Query("Zone 03", description="Target zone ID"),
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')")
):
    """
    Generates actionable tactical responder briefings for Incident Commanders and SDRF units.
    """
    env = get_live_hydrometeo_conditions(study_area)
    zones = get_study_area_zones(study_area)
    clean_zid = (zone_id or "Zone 03").lower().replace("-", " ")

    zone = next((z for z in zones if z["zone_id"].lower() == clean_zid), zones[0])
    preds = ml_engine.predict_zone(zone, env, study_area=study_area)
    is_udupi = (study_area.lower() == "udupi")

    actions = [
        ResponderActionItem(
            category="IMMEDIATE",
            action="Deploy modular flood barriers and high-capacity dewatering pumps",
            target_location="Kottara Chowki underpass & Kulur bridge approach" if not is_udupi else "Malpe Fish Market apron & harbor causeway",
            timing="Immediate",
            priority="URGENT"
        ),
        ResponderActionItem(
            category="TRAFFIC CONTROL",
            action="Divert heavy & light vehicle traffic away from flooded corridors",
            target_location="Main Road 760 intersection" if not is_udupi else "Malpe Main Harbor Approach",
            timing="Before 14:00 IST",
            priority="HIGH"
        ),
        ResponderActionItem(
            category="ROUTE MANAGEMENT",
            action="Signpost and clear alternative emergency bypass corridor",
            target_location="Bendoorwell corridor" if not is_udupi else "Malpe-Kadiyali Link Road",
            timing="Continuous",
            priority="HIGH"
        ),
        ResponderActionItem(
            category="CRITICAL FACILITY",
            action="Verify emergency ambulance access route to primary district hospital",
            target_location="Government Wenlock District Hospital ingress" if not is_udupi else "Udupi District Hospital ingress",
            timing="Continuous monitoring",
            priority="URGENT"
        )
    ]

    key_actions = [
        f"Prioritize {zone['zone_id']} ({zone['zone_name']} coastal sector).",
        "Inspect closed road segments where water depth exceeds 0.30m threshold.",
        "Ensure emergency ambulance ingress to primary healthcare facilities is secured.",
        "Activate designated dry shelters and pre-position inflatable rescue crafts.",
        f"Monitor real-time rainfall rate ({env['observed_rainfall_rate_mm_hr']} mm/hr) and tidal backwater progression."
    ]

    return ResponderBriefing(
        zone_id=zone["zone_id"],
        zone_name=zone["zone_name"],
        headline=f"{zone['zone_id']} — {zone['zone_name']}: {preds['risk_level']} Coastal Flood Advisory",
        risk_level=preds["risk_level"],
        expected_onset="18:40 IST",
        expected_peak="22:15 IST",
        roads_affected_count=zone["affected_roads"],
        roads_closed_count=2 if preds["q50_depth"] >= 0.30 else 0,
        critical_facilities_at_risk_count=zone["critical_facilities"],
        key_actions=key_actions,
        responder_actions=actions,
        generated_timestamp=get_ist_time_str()
    )

@router.get("/emergency/situation-brief", response_model=SituationBriefData)
def get_situation_brief(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')")
):
    """Returns a model-generated draft; this is not an official SITREP or alert."""
    env = get_live_hydrometeo_conditions(study_area)
    is_udupi = (study_area.lower() == "udupi")
    now_str = get_ist_time_str()
    zones = get_study_area_zones(study_area)
    primary_zone, primary_prediction = max(
        (
            (zone, ml_engine.predict_zone(zone, env, study_area=study_area))
            for zone in zones
        ),
        key=lambda item: item[1]["p_flood"],
    )
    model_headline = (
        f"{primary_zone['zone_name']}: {primary_prediction['risk_level']} "
        f"surrogate estimate ({primary_prediction['p_flood']}%); not observed flood status."
    )

    if is_udupi:
        return SituationBriefData(
            title="COASTAL FLOOD MODEL ASSESSMENT — UDUPI",
            bulletin_number="MODEL-DRAFT-UDUPI",
            timestamp_ist=now_str,
            headline=model_headline,
            narrative_paragraph_1=(
                f"Open-Meteo weather-grid rainfall for the past hour is "
                f"{env['observed_rainfall_rate_mm_hr']:.1f} mm; Open-Meteo Marine sea level is "
                f"+{env['tide_level_m']:.2f} m MSL; pressure/wind-derived surge estimate is "
                f"+{env['storm_surge_m']:.2f} m; Open-Meteo Flood API daily grid discharge is "
                f"{env['river_discharge_m3s']:.1f} m3/s. These are provider estimates, not local gauge observations."
            ),
            narrative_paragraph_2=(
                "The surrogate was evaluated on Mangaluru physics-simulator labels, not observed flood events; "
                "using it in Udupi is an unvalidated regional transfer. Terrain, population, roads, and facilities "
                "are static GIS/inventory data. This draft is not an official alert, and live road status is not connected."
            ),
            recommended_primary_zone=f"{primary_zone['zone_id']} — {primary_zone['zone_name']}",
            key_meteorological_trigger=f"Rainfall: {env['observed_rainfall_rate_mm_hr']} mm/hr • Tide: +{env['tide_level_m']}m MSL • Surge: +{env['storm_surge_m']}m",
            prepared_by="CoastGuard-AI model service (automated draft; not DDMA)"
        )

    return SituationBriefData(
        title="COASTAL FLOOD MODEL ASSESSMENT — MANGALURU",
        bulletin_number="MODEL-DRAFT-MANGALURU",
        timestamp_ist=now_str,
        headline=model_headline,
        narrative_paragraph_1=(
            f"Open-Meteo weather-grid rainfall for the past hour is "
            f"{env['observed_rainfall_rate_mm_hr']:.1f} mm; Open-Meteo Marine sea level is "
            f"+{env['tide_level_m']:.2f} m MSL; pressure/wind-derived surge estimate is "
            f"+{env['storm_surge_m']:.2f} m; Open-Meteo Flood API daily grid discharge is "
            f"{env['river_discharge_m3s']:.1f} m3/s. These are provider estimates, not local gauge observations."
        ),
        narrative_paragraph_2=(
            "The surrogate was evaluated against Mangaluru physics-simulator labels, not observed flood events. "
            "Terrain, population, roads, and facilities are static GIS/inventory data. This draft is not an official "
            "alert, and live road/facility status is not connected."
        ),
        recommended_primary_zone=f"{primary_zone['zone_id']} — {primary_zone['zone_name']}",
        key_meteorological_trigger=f"Rainfall: {env['observed_rainfall_rate_mm_hr']} mm/hr • Tide: +{env['tide_level_m']}m MSL • River Flow: {env['river_discharge_m3s']} m³/s",
        prepared_by="CoastGuard-AI model service (automated draft; not DDMA)"
    )
