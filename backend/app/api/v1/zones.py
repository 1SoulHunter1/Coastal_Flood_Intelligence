"""
CoastGuard-AI API: /zones, /zones/{zone_id}, /zones/summary
"""

from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from app.models.schemas import ZoneData, ZoneSummaryResponse, EstimatedImpact
from app.data.gis_data import get_study_area_zones
from app.services.external_data import get_live_hydrometeo_conditions
from app.services.ml_engine import ml_engine
from app.services.explainability import compute_zone_attributions, generate_risk_drivers_list
from app.data.roads import get_study_area_roads
from app.data.facilities import get_study_area_facilities
from app.config import ROAD_AT_RISK_DEPTH_M, ROAD_CLOSURE_DEPTH_M

router = APIRouter()

def _enrich_zone_with_live_inference(zone_raw: dict, env_data: dict, is_udupi: bool) -> ZoneData:
    preds = ml_engine.predict_zone(
        zone_raw,
        env_data,
        study_area="udupi" if is_udupi else "mangaluru",
    )
    attributions = compute_zone_attributions(preds["feature_inputs"], preds["p_flood"], preds["q50_depth"])
    drivers = generate_risk_drivers_list(attributions)

    q50 = preds["q50_depth"]
    zone_roads = [
        road for road in get_study_area_roads("udupi" if is_udupi else "mangaluru")
        if road["zone_id"] == zone_raw["zone_id"]
    ]
    closed_roads = sum(q50 >= ROAD_CLOSURE_DEPTH_M for _ in zone_roads)
    at_risk_roads = sum(
        ROAD_AT_RISK_DEPTH_M <= q50 < ROAD_CLOSURE_DEPTH_M
        for _ in zone_roads
    )
    road_status_summary = (
        f"{closed_roads} MODELLED CLOSED • {at_risk_roads} MODELLED AT RISK"
    )
    zone_facilities = [
        facility
        for facility in get_study_area_facilities(
            "udupi" if is_udupi else "mangaluru"
        )
        if facility["zone_id"] == zone_raw["zone_id"]
    ]
    accessible_facilities = sum(q50 < ROAD_CLOSURE_DEPTH_M for _ in zone_facilities)
    facility_status_summary = (
        f"{accessible_facilities} / {len(zone_facilities)} ZONE-LEVEL ACCESS ESTIMATE"
    )

    # Nearest dry shelter recommendation
    if is_udupi:
        if zone_raw["zone_id"] == "Zone 01":
            nearest_shelter = "Malpe Community Shelter (1.8 km)"
        elif zone_raw["zone_id"] == "Zone 02":
            nearest_shelter = "Udyavara Hall Shelter (3.2 km)"
        else:
            nearest_shelter = "Kaup Beach Community Shelter (2.5 km)"
    else:
        if zone_raw["zone_id"] == "Zone 03":
            nearest_shelter = "Shelter A (St. Antony Memorial) (2.4 km)"
        elif zone_raw["zone_id"] == "Zone 05":
            nearest_shelter = "Bunder Port Seamen Shelter (1.2 km)"
        else:
            nearest_shelter = "Kadri Community Shelter (3.1 km)"

    pop = zone_raw["estimated_population"]
    bldgs = zone_raw["affected_buildings"]
    roads = zone_raw["affected_roads"]
    facs = zone_raw["critical_facilities"]

    # Priority score
    base_score = (preds["p_flood"] * 0.45) + (min(q50 / 0.5, 1.0) * 35) + (min(pop / 20000.0, 1.0) * 20)
    priority_score = round(min(99.0, max(15.0, base_score)), 1)

    return ZoneData(
        zone_id=zone_raw["zone_id"],
        zone_name=zone_raw["zone_name"],
        risk_level=preds["risk_level"],
        flood_probability=preds["p_flood"],
        severity=preds["severity"],
        expected_onset="18:40 IST" if preds["p_flood"] >= 60 else "21:00 IST",
        expected_peak="22:15 IST" if preds["p_flood"] >= 60 else "23:45 IST",
        risk_drivers=drivers,
        estimated_population=pop,
        affected_buildings=bldgs,
        affected_roads=roads,
        critical_facilities=facs,
        population_at_risk=pop,
        estimated_impact=EstimatedImpact(
            buildings=bldgs,
            road_segments=roads,
            critical_facilities=facs,
            schools=None,
            shelters=2,
            hospitals=1
        ),
        elevation_avg_m=zone_raw["elevation_mean"],
        coordinates=zone_raw["coordinates"],
        center=zone_raw["center"],
        priority_rank=zone_raw.get("priority_rank", 1),
        priority_status=zone_raw.get("priority_status", "IMMEDIATE"),
        priority_score=priority_score,
        drainage_capacity_rating=zone_raw.get("drainage_capacity_rating", "STRESSED"),
        key_observation=zone_raw["key_observation"],
        predicted_depth_m=q50,
        depth_q10_m=preds["q10_depth"],
        depth_q50_m=preds["q50_depth"],
        depth_q90_m=preds["q90_depth"],
        road_access_status=road_status_summary,
        facility_access_status=facility_status_summary,
        nearest_shelter_text=nearest_shelter
    )

def _get_zones_impl(study_area: str = "mangaluru", risk_level: Optional[str] = None) -> List[ZoneData]:
    env = get_live_hydrometeo_conditions(study_area)
    is_udupi = (study_area.lower() == "udupi")
    raw_zones = get_study_area_zones(study_area)

    enriched = [_enrich_zone_with_live_inference(z, env, is_udupi) for z in raw_zones]

    if risk_level and isinstance(risk_level, str):
        enriched = [z for z in enriched if z.risk_level.upper() == risk_level.upper()]

    return enriched

@router.get("/zones", response_model=List[ZoneData])
def get_zones(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')"),
    risk_level: Optional[str] = Query(None, description="Optional filter by risk level")
):
    """
    Returns spatial and hydrodynamic intelligence for all zones in the basin.
    """
    return _get_zones_impl(study_area=study_area, risk_level=risk_level)

@router.get("/zones/summary", response_model=ZoneSummaryResponse)
def get_zones_summary(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')")
):
    """
    Returns aggregate basin risk summary, total population at risk, and high-risk count.
    """
    zones_list = _get_zones_impl(study_area=study_area)
    high_risk_count = sum(1 for z in zones_list if z.risk_level in ["HIGH", "CRITICAL"])
    total_pop = sum(z.estimated_population for z in zones_list)

    if study_area.lower() == "udupi":
        system_risk = "ELEVATED - MALPE HARBOR & SWARNA ESTUARY SURGE"
    else:
        system_risk = "ELEVATED - ACTIVE TIDE & RAIN INTERFERENCE"

    return ZoneSummaryResponse(
        zones=zones_list,
        highRiskZonesCount=high_risk_count,
        totalPopulationAtRisk=total_pop,
        overallSystemRisk=system_risk
    )

@router.get("/zones/{zone_id}", response_model=ZoneData)
def get_zone_by_id(
    zone_id: str,
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')")
):
    """
    Returns detailed single zone status, quantile depths, and risk drivers.
    """
    all_zones = _get_zones_impl(study_area=study_area)
    cleaned_id = zone_id.lower().replace("-", " ").replace("_", " ")

    for z in all_zones:
        if z.zone_id.lower() == cleaned_id or z.zone_id.lower() == zone_id.lower():
            return z

    # Fallback to first zone
    if all_zones:
        return all_zones[0]

    raise HTTPException(status_code=404, detail=f"Zone {zone_id} not found in {study_area}")
