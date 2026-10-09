"""
CoastGuard-AI: Road Network Segments and Emergency Routes
Includes coordinates, graph topological nodes, baseline travel times, and detour definitions.
"""

MANGALURU_ROADS = [
    {
        "id": "ROAD-MR760",
        "name": "Main Road 760 (Kottara-Kulur Link)",
        "zone_id": "Zone 03",
        "zone_name": "Kulur",
        "category": "ARTERIAL",
        "start_node": "Kottara_Junction",
        "end_node": "Kulur_Bridge",
        "length_km": 2.2,
        "travel_time_min": 6,
        "coordinates": [
            [12.9220, 74.8210],
            [12.9270, 74.8235],
            [12.9310, 74.8255]
        ],
        "alternative_route_available": True,
        "alternative_route_id": "ROUTE-ALT-02"
    },
    {
        "id": "ROAD-SEG-12",
        "name": "Road Segment 12 (Kavoor Cross)",
        "zone_id": "Zone 03",
        "zone_name": "Kulur",
        "category": "ARTERIAL",
        "start_node": "Kulur_Bridge",
        "end_node": "Kavoor_Junction",
        "length_km": 1.8,
        "travel_time_min": 5,
        "coordinates": [
            [12.9280, 74.8250],
            [12.9320, 74.8280]
        ],
        "alternative_route_available": True,
        "alternative_route_id": "ROUTE-ALT-02"
    },
    {
        "id": "ROAD-SEG-18",
        "name": "Road Segment 18 (Upper Kulur Heights)",
        "zone_id": "Zone 03",
        "zone_name": "Kulur",
        "category": "ARTERIAL",
        "start_node": "Kavoor_Junction",
        "end_node": "Kulur_Heights",
        "length_km": 1.4,
        "travel_time_min": 4,
        "coordinates": [
            [12.9330, 74.8310],
            [12.9360, 74.8340]
        ],
        "alternative_route_available": True
    },
    {
        "id": "ROAD-PUMPWELL-APP",
        "name": "Pumpwell Circle Ingress Corridor",
        "zone_id": "Zone 05",
        "zone_name": "Bunder",
        "category": "NH-66",
        "start_node": "Pumpwell_Circle",
        "end_node": "Wenlock_Ingress",
        "length_km": 3.4,
        "travel_time_min": 14,
        "coordinates": [
            [12.8610, 74.8620],
            [12.8655, 74.8520],
            [12.8682, 74.8428]
        ],
        "alternative_route_available": True,
        "alternative_route_id": "ROUTE-ALT-02"
    },
    {
        "id": "ROAD-KOTTARA-CHOWKI",
        "name": "Kottara Chowki Underpass Span",
        "zone_id": "Zone 03",
        "zone_name": "Kulur",
        "category": "NH-66",
        "start_node": "Kottara_Chowki",
        "end_node": "Kottara_Junction",
        "length_km": 1.1,
        "travel_time_min": 3,
        "coordinates": [
            [12.9150, 74.8240],
            [12.9220, 74.8210]
        ],
        "alternative_route_available": True,
        "alternative_route_id": "ROUTE-ALT-02"
    },
    {
        "id": "ROAD-BUNDER-WHARF",
        "name": "Old Port Wharf Access Road",
        "zone_id": "Zone 05",
        "zone_name": "Bunder",
        "category": "ARTERIAL",
        "start_node": "Bunder_Gate",
        "end_node": "Old_Wharf",
        "length_km": 0.9,
        "travel_time_min": 3,
        "coordinates": [
            [12.8620, 74.8380],
            [12.8650, 74.8320]
        ],
        "alternative_route_available": False
    },
    {
        "id": "ROAD-ULLAL-BRIDGE",
        "name": "Netravati Bridge Southern Ingress",
        "zone_id": "Zone 01",
        "zone_name": "Ullal",
        "category": "NH-66",
        "start_node": "Ullal_Town",
        "end_node": "Netravati_Bridge",
        "length_km": 2.5,
        "travel_time_min": 6,
        "coordinates": [
            [12.8120, 74.8500],
            [12.8350, 74.8520]
        ],
        "alternative_route_available": True
    },
    {
        "id": "ROAD-BENDOORWELL",
        "name": "Bendoorwell - Balmatta Bypass Corridor",
        "zone_id": "Zone 02",
        "zone_name": "Hampankatta",
        "category": "ARTERIAL",
        "start_node": "Kadri_Station",
        "end_node": "Wenlock_Ingress",
        "length_km": 6.8,
        "travel_time_min": 22,
        "coordinates": [
            [12.8750, 74.8550],
            [12.8740, 74.8510],
            [12.8720, 74.8475],
            [12.8700, 74.8450],
            [12.8682, 74.8428]
        ],
        "alternative_route_available": True,
        "alternative_route_id": "ROUTE-ALT-02"
    }
]

UDUPI_ROADS = [
    {
        "id": "UDUPI-RD-01",
        "name": "Malpe Harbor Fish Port Approach",
        "zone_id": "Zone 01",
        "zone_name": "Malpe Harbor",
        "category": "ARTERIAL",
        "start_node": "Malpe_Gate",
        "end_node": "Malpe_Wharf",
        "length_km": 1.5,
        "travel_time_min": 4,
        "coordinates": [
            [13.3440, 74.7080],
            [13.3490, 74.7040]
        ],
        "alternative_route_available": True,
        "alternative_route_id": "UDUPI-ROUTE-ALT-01"
    },
    {
        "id": "UDUPI-RD-02",
        "name": "Malpe - Kadiyali Elevated Link Road",
        "zone_id": "Zone 01",
        "zone_name": "Malpe Harbor",
        "category": "ARTERIAL",
        "start_node": "Malpe_Gate",
        "end_node": "District_Hospital",
        "length_km": 5.2,
        "travel_time_min": 18,
        "coordinates": [
            [13.3440, 74.7080],
            [13.3430, 74.7250],
            [13.3420, 74.7480]
        ],
        "alternative_route_available": True,
        "alternative_route_id": "UDUPI-ROUTE-ALT-01"
    },
    {
        "id": "UDUPI-RD-03",
        "name": "Udyavara Estuary Causeway",
        "zone_id": "Zone 02",
        "zone_name": "Udyavara Estuary",
        "category": "ARTERIAL",
        "start_node": "Udyavara_West",
        "end_node": "Udyavara_East",
        "length_km": 2.1,
        "travel_time_min": 6,
        "coordinates": [
            [13.3100, 74.7300],
            [13.3150, 74.7420]
        ],
        "alternative_route_available": True
    },
    {
        "id": "UDUPI-RD-04",
        "name": "NH-66 Udyavara Highway Bypass",
        "zone_id": "Zone 02",
        "zone_name": "Udyavara Estuary",
        "category": "NH-66",
        "start_node": "Udyavara_Bypass_South",
        "end_node": "Udyavara_Bypass_North",
        "length_km": 4.0,
        "travel_time_min": 5,
        "coordinates": [
            [13.3000, 74.7450],
            [13.3300, 74.7470]
        ],
        "alternative_route_available": True
    },
    {
        "id": "UDUPI-RD-05",
        "name": "Kaup Lighthouse Beach Ingress",
        "zone_id": "Zone 03",
        "zone_name": "Kaup Coast",
        "category": "ARTERIAL",
        "start_node": "Kaup_Town",
        "end_node": "Kaup_Light",
        "length_km": 1.8,
        "travel_time_min": 4,
        "coordinates": [
            [13.2200, 74.7500],
            [13.2250, 74.7420]
        ],
        "alternative_route_available": True
    }
]

EMERGENCY_ROUTES = {
    "mangaluru": [
        {
            "id": "ROUTE-ALT-02",
            "name": "Bendoorwell Alternative Bypass Corridor",
            "type": "ALTERNATIVE",
            "status": "OPEN",
            "origin": "Kadri Fire Station / Pumpwell Junction",
            "destination": "Government Wenlock District Hospital",
            "destination_type": "HOSPITAL",
            "detour_minutes": 8,
            "travel_time_minutes": 22,
            "distance_km": 6.8,
            "corridor": "Kadri -> Mallikatta -> Bendoorwell -> Balmatta -> Wenlock",
            "coordinates": [
                [12.8750, 74.8550],
                [12.8740, 74.8510],
                [12.8720, 74.8475],
                [12.8700, 74.8450],
                [12.8682, 74.8428]
            ],
            "associated_zone_id": "Zone 02",
            "notes": "Recommended emergency detour bypassing impassable Pumpwell Circle (depth >= 0.30m)."
        },
        {
            "id": "ROUTE-SHELTER-A",
            "name": "Kulur Safe Evacuation Route to Shelter A",
            "type": "PRIMARY",
            "status": "OPEN",
            "origin": "Kulur Riverfront Lowlands",
            "destination": "Shelter A (St. Antony Memorial Hall)",
            "destination_type": "SHELTER",
            "travel_time_minutes": 12,
            "distance_km": 2.4,
            "corridor": "Kottara Heights Ridge Corridor -> St. Antony Memorial",
            "coordinates": [
                [12.9220, 74.8210],
                [12.9260, 74.8240],
                [12.9295, 74.8260]
            ],
            "associated_zone_id": "Zone 03",
            "notes": "Safe high-ground evacuation path avoiding flooded culverts."
        }
    ],
    "udupi": [
        {
            "id": "UDUPI-ROUTE-ALT-01",
            "name": "Malpe-Kadiyali High Ridge Emergency Bypass",
            "type": "ALTERNATIVE",
            "status": "OPEN",
            "origin": "Malpe Coastal Police Base",
            "destination": "Government District Hospital Udupi",
            "destination_type": "HOSPITAL",
            "detour_minutes": 6,
            "travel_time_minutes": 18,
            "distance_km": 5.2,
            "corridor": "Malpe Gate -> Kadiyali Ridge -> District Hospital",
            "coordinates": [
                [13.3480, 74.7060],
                [13.3440, 74.7200],
                [13.3420, 74.7480]
            ],
            "associated_zone_id": "Zone 01",
            "notes": "Clear emergency ambulance corridor bypassing waterlogged Malpe fish market."
        }
    ]
}

def get_study_area_roads(study_area: str):
    if study_area.lower() == "udupi":
        return UDUPI_ROADS
    return MANGALURU_ROADS

def get_study_area_emergency_routes(study_area: str):
    if study_area.lower() == "udupi":
        return EMERGENCY_ROUTES["udupi"]
    return EMERGENCY_ROUTES["mangaluru"]
