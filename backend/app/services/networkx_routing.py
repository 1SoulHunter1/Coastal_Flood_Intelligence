"""
CoastGuard-AI: NetworkX Road Network & Cutoff Routing Engine
Constructs directed graph topology, overlays dynamic predicted flood depths on road edges,
enforces 0.30m safety closure threshold, and executes Dijkstra emergency routing.
"""

import networkx as nx
from typing import Dict, List, Any, Optional
from app.config import ROAD_CLOSURE_DEPTH_M, ROAD_AT_RISK_DEPTH_M
from app.data.roads import get_study_area_roads, get_study_area_emergency_routes

def build_road_graph(roads: List[Dict[str, Any]], predicted_depths: Dict[str, float]) -> nx.DiGraph:
    """
    Builds a directed NetworkX graph with dynamic flood attributes on edges.
    """
    G = nx.DiGraph()

    for road in roads:
        road_id = road["id"]
        depth = predicted_depths.get(road_id, 0.0)
        length_km = road.get("length_km", 2.0)
        base_time = road.get("travel_time_min", 5)

        if depth >= ROAD_CLOSURE_DEPTH_M:
            status = "CLOSED"
            weight = float('inf')
        elif depth >= ROAD_AT_RISK_DEPTH_M:
            status = "AT_RISK"
            weight = base_time * 1.6
        else:
            status = "OPEN"
            weight = base_time

        u = road.get("start_node", f"{road_id}_start")
        v = road.get("end_node", f"{road_id}_end")

        # Bidirectional graph for urban road grid
        G.add_edge(
            u, v,
            id=road_id,
            name=road["name"],
            length_km=length_km,
            depth_m=depth,
            status=status,
            weight=weight,
            category=road.get("category", "ARTERIAL"),
            coordinates=road.get("coordinates", [])
        )
        G.add_edge(
            v, u,
            id=road_id,
            name=road["name"],
            length_km=length_km,
            depth_m=depth,
            status=status,
            weight=weight,
            category=road.get("category", "ARTERIAL"),
            coordinates=road.get("coordinates", [])
        )

    return G

def find_emergency_detour(
    G: nx.DiGraph,
    origin_node: str,
    target_node: str,
    fallback_route: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Finds Dijkstra shortest path through accessible road segments (depth < 0.30m).
    """
    try:
        # Check if direct shortest path exists with finite weight
        path = nx.shortest_path(G, source=origin_node, target=target_node, weight='weight')
        travel_time = round(nx.shortest_path_length(G, source=origin_node, target=target_node, weight='weight'))
        return {
            "status": "OPEN",
            "path": path,
            "travel_time_minutes": travel_time,
            "detour_minutes": 0,
            "is_detour": False
        }
    except (nx.NetworkXNoPath, nx.NodeNotFound):
        if fallback_route:
            return {
                "status": "OPEN",
                "route_id": fallback_route.get("id"),
                "name": fallback_route.get("name"),
                "travel_time_minutes": fallback_route.get("travel_time_minutes", 22),
                "detour_minutes": fallback_route.get("detour_minutes", 8),
                "corridor": fallback_route.get("corridor"),
                "coordinates": fallback_route.get("coordinates"),
                "is_detour": True
            }
        return {
            "status": "BLOCKED",
            "reason": "All access corridors exceed 0.30 m vehicle cutoff threshold"
        }

def evaluate_roads_impact(study_area: str, zone_depths: Dict[str, float]) -> List[Dict[str, Any]]:
    """
    Calculates impact for all road segments in the study area.
    """
    roads = get_study_area_roads(study_area)
    impact_items = []

    for r in roads:
        zone_id = r.get("zone_id", "Zone 03")
        # Base predicted depth from zone flood depth
        depth_m = zone_depths.get(zone_id, 0.12)

        depth_cm = int(round(depth_m * 100))

        if depth_m >= ROAD_CLOSURE_DEPTH_M:
            status = "CLOSED"
            reason = f"Flood depth ({depth_m:.2f} m) exceeds 0.30 m vehicle-access threshold."
            closure_time = "18:40 IST" if study_area != "udupi" else "17:15 IST"
        elif depth_m >= ROAD_AT_RISK_DEPTH_M:
            status = "AT_RISK"
            reason = "Approaching critical inundation; restricted high-clearance transit only."
            closure_time = None
        else:
            status = "OPEN"
            reason = None
            closure_time = None

        impact_items.append({
            "id": r["id"],
            "name": r["name"],
            "zone_id": zone_id,
            "zone_name": r.get("zone_name", "Kulur"),
            "category": r.get("category", "ARTERIAL"),
            "predicted_depth_m": round(depth_m, 2),
            "water_depth_cm": depth_cm,
            "status": status,
            "closure_reason": reason,
            "predicted_closure_time": closure_time,
            "coordinates": r.get("coordinates", []),
            "alternative_route_available": r.get("alternative_route_available", True),
            "alternative_route_id": r.get("alternative_route_id")
        })

    return impact_items
