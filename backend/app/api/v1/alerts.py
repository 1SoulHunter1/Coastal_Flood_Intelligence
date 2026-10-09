"""
CoastGuard-AI API: /alerts/*
Active public alerts and bilingual dispatch templates
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from app.models.schemas import AlertItem, PublicAlertTemplate
from app.data.gis_data import get_study_area_zones
from app.services.external_data import get_live_hydrometeo_conditions, get_ist_time_str
from app.services.ml_engine import ml_engine
from app.services.alert_service import generate_bilingual_public_alert

router = APIRouter()

@router.get("/alerts/active", response_model=List[AlertItem])
def get_active_alerts(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')")
):
    """No verified official alert feed is currently connected."""
    if study_area.lower() not in {"mangaluru", "udupi"}:
        raise HTTPException(status_code=400, detail="Unsupported study area.")
    return []

@router.get("/alerts/public-template", response_model=PublicAlertTemplate)
def get_public_alert_template(
    zone_id: Optional[str] = Query("Zone 03", description="Target zone ID"),
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')")
):
    """
    Returns dynamically generated bilingual public alert templates
    ready for SMS, WhatsApp, and CAP broadcast.
    """
    env = get_live_hydrometeo_conditions(study_area)
    zones = get_study_area_zones(study_area)
    clean_zid = (zone_id or "Zone 03").lower().replace("-", " ")
    zone = next((z for z in zones if z["zone_id"].lower() == clean_zid), zones[0])

    preds = ml_engine.predict_zone(zone, env, study_area=study_area)
    is_udupi = (study_area.lower() == "udupi")

    shelter_name = "Malpe Community Relief Shelter" if is_udupi else "Shelter A (St. Antony Memorial Hall)"
    shelter_dist = 1.8 if is_udupi else 2.4
    closed_road = "Malpe Main Wharf Road" if is_udupi else "Main Road 760"

    alert_dict = generate_bilingual_public_alert(
        zone_id=zone["zone_id"],
        zone_name=zone["zone_name"],
        risk_level=preds["risk_level"],
        expected_onset="18:40 IST",
        expected_peak="22:15 IST",
        nearest_shelter_name=shelter_name,
        nearest_shelter_distance_km=shelter_dist,
        closed_road_name=closed_road
    )

    return PublicAlertTemplate(**alert_dict)
