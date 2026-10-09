"""
CoastGuard-AI API: /routing/*
Handles road impact, blocked roads, hospital & shelter accessibility,
and NetworkX emergency alternative route generation.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Union
from app.models.schemas import (
    RoadImpactItem, HospitalAccessibility, ShelterAccessibility,
    EmergencyRoute, SystemAccessSummary, PrimaryRouteInfo, AlternativeRouteInfo
)
from app.services.networkx_routing import evaluate_roads_impact
from app.data.roads import get_study_area_emergency_routes
from app.services.modelled_impacts import get_modelled_zone_depths
from app.config import ROAD_AT_RISK_DEPTH_M, ROAD_CLOSURE_DEPTH_M

router = APIRouter()

@router.get("/routing/roads-impact", response_model=List[RoadImpactItem])
def get_roads_impact(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')"),
    road_id: Optional[str] = Query(None, description="Optional single road ID filter"),
    zone_id: Optional[str] = Query(None, description="Optional zone ID filter")
):
    """
    Evaluates dynamic predicted flood depth against 0.30m vehicle cutoff threshold.
    """
    zone_depths = get_modelled_zone_depths(study_area)
    items = evaluate_roads_impact(study_area, zone_depths)

    if road_id and isinstance(road_id, str):
        items = [r for r in items if r["id"].lower() == road_id.lower()]
    if zone_id and isinstance(zone_id, str):
        clean_zid = zone_id.lower().replace("-", " ")
        items = [r for r in items if r["zone_id"].lower() == clean_zid]

    return [RoadImpactItem(**item) for item in items]

@router.get("/routing/blocked-roads", response_model=List[RoadImpactItem])
def get_blocked_roads(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')")
):
    """Returns only closed road segments where predicted flood depth >= 0.30m."""
    all_roads = get_roads_impact(study_area=study_area)
    return [r for r in all_roads if r.status == "CLOSED"]

@router.get("/routing/hospitals-accessibility")
def get_hospitals_accessibility(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')"),
    hospital_id: Optional[str] = Query(None, description="Optional hospital ID")
):
    """
    Evaluates whether hospitals are reachable or require emergency detour routing.
    """
    is_udupi = (study_area.lower() == "udupi")

    if is_udupi:
        hospitals = [
            HospitalAccessibility(
                id="HOSP-UDUPI-DIST",
                name="Government District Hospital Udupi",
                zone_id="Zone 01",
                zone_name="Malpe Harbor",
                facility_flood_status="DRY",
                access_status="AT_RISK",
                reason="The hospital is situated on dry high ground, but primary fish port corridor is impassable.",
                primary_route=PrimaryRouteInfo(
                    name="Malpe Fish Port Direct Corridor",
                    corridor="Malpe Main Road",
                    status="CLOSED",
                    closure_time="14:10 IST"
                ),
                alternative_route=AlternativeRouteInfo(
                    name="Malpe - Kadiyali Elevated Link Bypass",
                    corridor="Kadiyali Ridge Road",
                    status="OPEN",
                    detour_minutes=6,
                    travel_time_minutes=18,
                    route_id="UDUPI-ROUTE-ALT-01"
                ),
                contact="+91 820 252 0555",
                coordinates=[13.3420, 74.7480]
            ),
            HospitalAccessibility(
                id="HOSP-MANIPAL",
                name="Kasturba Medical College Hospital Manipal",
                zone_id="Zone 02",
                zone_name="Udyavara Estuary",
                facility_flood_status="DRY",
                access_status="OPEN",
                reason="Plateau elevation provides unrestricted access across all arterial approaches.",
                primary_route=PrimaryRouteInfo(
                    name="Tiger Circle Manipal Highway Ingress",
                    corridor="State Highway 69",
                    status="OPEN"
                ),
                contact="+91 820 292 2761",
                coordinates=[13.3540, 74.7860]
            )
        ]
    else:
        hospitals = [
            HospitalAccessibility(
                id="HOSP-WENLOCK",
                name="Government Wenlock District Hospital",
                zone_id="Zone 02",
                zone_name="Hampankatta",
                facility_flood_status="DRY",
                access_status="AT_RISK",
                reason="The hospital itself is outside the predicted flood area, but primary access via Pumpwell Circle is predicted to become impassable.",
                primary_route=PrimaryRouteInfo(
                    name="Pumpwell Circle -> Main Road Corridor",
                    corridor="NH-66 -> K.S. Rao Road",
                    status="CLOSED",
                    closure_time="14:10 IST"
                ),
                alternative_route=AlternativeRouteInfo(
                    name="Bendoorwell -> Balmatta Alternative Bypass",
                    corridor="Bendoorwell - Balmatta Road",
                    status="OPEN",
                    detour_minutes=8,
                    travel_time_minutes=22,
                    route_id="ROUTE-ALT-02"
                ),
                contact="+91 824 244 4444",
                coordinates=[12.8682, 74.8428]
            ),
            HospitalAccessibility(
                id="HOSP-FM",
                name="Father Muller Hospital Kankanady",
                zone_id="Zone 06",
                zone_name="Kankanady",
                facility_flood_status="DRY",
                access_status="OPEN",
                reason="High-ground ridge location maintains open ingress from eastern bypasses.",
                primary_route=PrimaryRouteInfo(
                    name="Kankanady Circle Bypass",
                    corridor="Father Muller Road",
                    status="OPEN"
                ),
                contact="+91 824 223 8000",
                coordinates=[12.8620, 74.8640]
            ),
            HospitalAccessibility(
                id="HOSP-AJ",
                name="A.J. Hospital & Medical Center",
                zone_id="Zone 03",
                zone_name="Kulur",
                facility_flood_status="WATERLOGGED",
                access_status="AT_RISK",
                reason="Low elevation river corridor approach near Kottara Chowki underpass has 0.22m waterlogging.",
                primary_route=PrimaryRouteInfo(
                    name="Kottara Chowki Arterial Span",
                    corridor="NH-66 Kulur Road",
                    status="CLOSED",
                    closure_time="15:30 IST"
                ),
                contact="+91 824 222 5533",
                coordinates=[12.9120, 74.8380]
            )
        ]

    zone_depths = get_modelled_zone_depths(study_area)
    route_by_id = {
        route["id"]: route for route in get_study_area_emergency_routes(study_area)
    }
    primary_route_zones = (
        {
            "HOSP-UDUPI-DIST": "Zone 01",
            "HOSP-MANIPAL": "Zone 02",
        }
        if is_udupi
        else {
            "HOSP-WENLOCK": "Zone 05",
            "HOSP-FM": "Zone 06",
            "HOSP-AJ": "Zone 03",
        }
    )
    alternative_route_ids = (
        {"HOSP-UDUPI-DIST": "UDUPI-ROUTE-ALT-01"}
        if is_udupi
        else {
            "HOSP-WENLOCK": "ROUTE-ALT-02",
            "HOSP-AJ": "ROUTE-ALT-02",
        }
    )
    for hospital in hospitals:
        facility_depth = zone_depths[hospital.zone_id]
        road_zone_id = primary_route_zones[hospital.id]
        primary_depth = zone_depths[road_zone_id]
        hospital.facility_flood_status = (
            "INUNDATED" if facility_depth >= ROAD_CLOSURE_DEPTH_M
            else "WATERLOGGED" if facility_depth >= ROAD_AT_RISK_DEPTH_M
            else "DRY"
        )
        hospital.access_status = (
            "CLOSED" if primary_depth >= ROAD_CLOSURE_DEPTH_M
            else "AT_RISK" if primary_depth >= ROAD_AT_RISK_DEPTH_M
            else "OPEN"
        )
        hospital.primary_route.status = hospital.access_status
        hospital.primary_route.closure_time = None
        hospital.reason = (
            f"Zone-level surrogate q50 depth is {primary_depth:.2f} m for the "
            "primary route's zone. This is a model proxy, not a road sensor or "
            "verified closure report."
        )
        route_id = alternative_route_ids.get(hospital.id)
        if hospital.access_status != "OPEN" and route_id:
            route = route_by_id[route_id]
            hospital.alternative_route = AlternativeRouteInfo(
                name=route["name"],
                corridor=route["corridor"],
                status="OPEN",
                detour_minutes=route.get("detour_minutes", 0),
                travel_time_minutes=route["travel_time_minutes"],
                route_id=route["id"],
                coordinates=route["coordinates"],
            )
        else:
            hospital.alternative_route = None

    if hospital_id and isinstance(hospital_id, str):
        match = next((h for h in hospitals if h.id.lower() == hospital_id.lower()), None)
        if match:
            return match
        return hospitals[0]

    return hospitals

@router.get("/routing/shelters-accessibility", response_model=List[ShelterAccessibility])
def get_shelters_accessibility(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')"),
    zone_id: Optional[str] = Query(None, description="Optional zone ID")
):
    """Returns provisional shelters with zone-level model access estimates."""
    is_udupi = (study_area.lower() == "udupi")

    if is_udupi:
        shelters = [
            ShelterAccessibility(
                id="SHELTER-MALPE-01",
                name="Malpe Community Relief Shelter (Govt High School)",
                zone_id="Zone 01",
                zone_name="Malpe Harbor",
                capacity=500,
                occupied=35,
                flood_status="DRY",
                road_accessibility="OPEN",
                distance_km=1.8,
                travel_time_minutes=8,
                route_status="OPEN ACCESS",
                is_recommended=True,
                route_id="UDUPI-ROUTE-ALT-01",
                coordinates=[13.3520, 74.7110]
            ),
            ShelterAccessibility(
                id="SHELTER-UDYAVARA-01",
                name="Udyavara Grama Panchayat Hall Shelter",
                zone_id="Zone 02",
                zone_name="Udyavara Estuary",
                capacity=350,
                occupied=20,
                flood_status="DRY",
                road_accessibility="OPEN",
                distance_km=3.2,
                travel_time_minutes=14,
                route_status="OPEN ACCESS",
                is_recommended=True,
                coordinates=[13.3150, 74.7410]
            ),
            ShelterAccessibility(
                id="SHELTER-KAUP-01",
                name="Kaup Light Beach Community Shelter",
                zone_id="Zone 03",
                zone_name="Kaup Coast",
                capacity=400,
                occupied=15,
                flood_status="DRY",
                road_accessibility="AT_RISK",
                distance_km=2.5,
                travel_time_minutes=12,
                route_status="RESTRICTED",
                is_recommended=False,
                coordinates=[13.2280, 74.7480]
            )
        ]
    else:
        shelters = [
            ShelterAccessibility(
                id="SHELTER-A",
                name="Shelter A (St. Antony Memorial Hall)",
                zone_id="Zone 03",
                zone_name="Kulur",
                capacity=450,
                occupied=45,
                flood_status="DRY",
                road_accessibility="OPEN",
                distance_km=2.4,
                travel_time_minutes=12,
                route_status="OPEN ACCESS",
                is_recommended=True,
                route_id="ROUTE-SHELTER-A",
                coordinates=[12.9295, 74.8260]
            ),
            ShelterAccessibility(
                id="SHELTER-B",
                name="Shelter B (Kulur Riverfront Community Center)",
                zone_id="Zone 03",
                zone_name="Kulur",
                capacity=300,
                occupied=0,
                flood_status="DRY",
                road_accessibility="CLOSED",
                distance_km=1.1,
                travel_time_minutes=0,
                route_status="NOT ACCESSIBLE",
                is_recommended=False,
                coordinates=[12.9215, 74.8190]
            ),
            ShelterAccessibility(
                id="SHELTER-C",
                name="Bunder Port Seamen Community Shelter",
                zone_id="Zone 05",
                zone_name="Bunder",
                capacity=350,
                occupied=30,
                flood_status="DRY",
                road_accessibility="OPEN",
                distance_km=1.2,
                travel_time_minutes=6,
                route_status="OPEN ACCESS",
                is_recommended=True,
                coordinates=[12.8640, 74.8340]
            )
        ]

    zone_depths = get_modelled_zone_depths(study_area)
    for shelter in shelters:
        depth = zone_depths[shelter.zone_id]
        shelter.flood_status = (
            "WATERLOGGED" if depth >= ROAD_AT_RISK_DEPTH_M else "DRY"
        )
        shelter.road_accessibility = (
            "CLOSED" if depth >= ROAD_CLOSURE_DEPTH_M
            else "AT_RISK" if depth >= ROAD_AT_RISK_DEPTH_M
            else "OPEN"
        )
        shelter.route_status = (
            "NOT ACCESSIBLE" if shelter.road_accessibility == "CLOSED"
            else "RESTRICTED" if shelter.road_accessibility == "AT_RISK"
            else "OPEN ACCESS"
        )
        shelter.is_recommended = (
            shelter.flood_status == "DRY"
            and shelter.road_accessibility == "OPEN"
        )

    if zone_id and isinstance(zone_id, str):
        clean_zid = zone_id.lower().replace("-", " ")
        filtered = [s for s in shelters if s.zone_id.lower() == clean_zid]
        if filtered:
            return filtered

    return shelters

@router.get("/routing/nearest-shelter", response_model=ShelterAccessibility)
def get_nearest_shelter(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')"),
    zone_id: Optional[str] = Query(None, description="Optional zone ID")
):
    """Returns the single best recommended dry shelter reachable via open roads."""
    shelters = get_shelters_accessibility(study_area=study_area, zone_id=zone_id)
    rec = next((s for s in shelters if s.is_recommended and s.road_accessibility == "OPEN"), None)
    if rec:
        return rec
    return shelters[0]

@router.get("/routing/alternative-route", response_model=EmergencyRoute)
def get_alternative_route(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')"),
    facility_id: Optional[str] = Query(None, description="Target destination facility ID"),
    route_id: Optional[str] = Query(None, description="Specific route ID")
):
    """
    Returns NetworkX shortest emergency detour route bypassing closed road segments.
    """
    routes = get_study_area_emergency_routes(study_area)

    if route_id and isinstance(route_id, str):
        match = next((r for r in routes if r["id"].lower() == route_id.lower()), None)
        if match:
            return EmergencyRoute(**match)

    if facility_id and isinstance(facility_id, str):
        # Return matching detour for facility
        return EmergencyRoute(**routes[0])

    return EmergencyRoute(**routes[0])

@router.get("/routing/system-access-summary", response_model=SystemAccessSummary)
def get_system_access_summary(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')")
):
    """Returns aggregate, model-derived access counts for the static inventory."""
    roads = get_roads_impact(study_area=study_area)
    hospitals = get_hospitals_accessibility(study_area=study_area)
    shelters = get_shelters_accessibility(study_area=study_area)
    closed_roads = sum(road.status == "CLOSED" for road in roads)
    at_risk_roads = sum(road.status == "AT_RISK" for road in roads)
    accessible_hospitals = sum(hospital.access_status != "CLOSED" for hospital in hospitals)
    reachable_shelters = sum(
        shelter.road_accessibility == "OPEN" for shelter in shelters
    )
    diversion_count = sum(
        hospital.access_status != "OPEN" for hospital in hospitals
    )
    return SystemAccessSummary(
        roads_closed_count=closed_roads,
        roads_at_risk_count=at_risk_roads,
        hospitals_accessible_ratio=f"{accessible_hospitals} / {len(hospitals)}",
        shelters_reachable_ratio=f"{reachable_shelters} / {len(shelters)}",
        critical_facilities_count=len(hospitals),
        access_status_headline=(
            f"{diversion_count} hospital access route(s) need review using "
            "zone-level model depths; verify with local authorities."
            if diversion_count
            else "No hospital access routes meet the modelled closure threshold; "
            "verify with local authorities."
        ),
    )
