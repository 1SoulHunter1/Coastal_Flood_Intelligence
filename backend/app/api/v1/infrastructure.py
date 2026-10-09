"""
CoastGuard-AI API: /infrastructure/summary, /infrastructure/facilities, /infrastructure/roads
"""

from fastapi import APIRouter, Query
from typing import List, Optional
from app.models.schemas import InfrastructureResponse, InfrastructureSummary, CriticalFacility, RoadSegment
from app.data.facilities import get_study_area_facilities
from app.data.roads import get_study_area_roads
from app.data.gis_data import get_study_area_zones
from app.services.modelled_impacts import get_modelled_zone_depths
from app.config import ROAD_AT_RISK_DEPTH_M, ROAD_CLOSURE_DEPTH_M

router = APIRouter()

@router.get("/infrastructure/facilities", response_model=List[CriticalFacility])
def get_facilities(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')")
):
    """Returns all critical lifeline facilities in the basin."""
    zone_depths = get_modelled_zone_depths(study_area)
    facilities = []
    for raw in get_study_area_facilities(study_area):
        depth = zone_depths.get(raw["zone_id"])
        if depth is None:
            status = "UNKNOWN"
        elif depth >= ROAD_CLOSURE_DEPTH_M:
            status = "CRITICAL"
        elif depth >= ROAD_AT_RISK_DEPTH_M:
            status = "AT_RISK"
        else:
            status = "UNKNOWN"
        facilities.append(CriticalFacility(**{**raw, "status": status}))
    return facilities

@router.get("/infrastructure/roads", response_model=List[RoadSegment])
def get_roads(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')")
):
    """Returns provisional road overlays using each road zone's q50 depth proxy."""
    raw = get_study_area_roads(study_area)
    zone_depths = get_modelled_zone_depths(study_area)
    roads_out = []
    for r in raw:
        depth_m = zone_depths[r["zone_id"]]
        status = (
            "CLOSED" if depth_m >= ROAD_CLOSURE_DEPTH_M
            else "WATERLOGGED" if depth_m >= ROAD_AT_RISK_DEPTH_M
            else "PASSABLE"
        )
        roads_out.append(RoadSegment(
            id=r["id"],
            name=r["name"],
            category=r.get("category", "ARTERIAL"),
            zone_id=r.get("zone_id", "Zone 03"),
            zone_name=r.get("zone_name", "Kulur"),
            status=status,
            water_depth_cm=int(round(depth_m * 100)),
            coordinates=r.get("coordinates", [])
        ))
    return roads_out

@router.get("/infrastructure/summary", response_model=InfrastructureResponse)
def get_infrastructure_summary(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')"),
    zone_id: Optional[str] = Query(None, description="Optional zone filter")
):
    """
    Returns complete infrastructure registry: summary KPI counts, facility markers, and road segments.
    """
    zone_depths = get_modelled_zone_depths(study_area)
    facs = get_facilities(study_area)
    roads = get_roads(study_area)
    raw_zones = get_study_area_zones(study_area)

    if zone_id and isinstance(zone_id, str):
        clean_zid = zone_id.lower().replace("-", " ")
        facs = [f for f in facs if f.zone_id.lower() == clean_zid]
        roads = [r for r in roads if r.zone_id.lower() == clean_zid]
        raw_zones = [
            zone for zone in raw_zones
            if zone["zone_id"].lower() == clean_zid
        ]

    at_risk_zone_ids = {
        zone_id
        for zone_id, depth in zone_depths.items()
        if depth >= ROAD_AT_RISK_DEPTH_M
    }
    at_risk_facilities = [
        facility for facility in facs if facility.zone_id in at_risk_zone_ids
    ]
    summary = InfrastructureSummary(
        hospitals_at_risk=sum(
            facility.type == "HOSPITAL" for facility in at_risk_facilities
        ),
        schools_at_risk=None,
        shelters_active=sum(facility.type == "SHELTER" for facility in facs),
        road_segments_affected=sum(road.status != "PASSABLE" for road in roads),
        buildings_affected=sum(
            zone["affected_buildings"]
            for zone in raw_zones
            if zone["zone_id"] in at_risk_zone_ids
        ),
        critical_facilities_at_risk=len(at_risk_facilities),
    )

    return InfrastructureResponse(
        summary=summary,
        facilities=facs,
        roads=roads
    )
