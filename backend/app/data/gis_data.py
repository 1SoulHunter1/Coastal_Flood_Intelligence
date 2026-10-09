"""
CoastGuard-AI: Static GIS Terrain & Zone Attributes
Contains provisional zone geometry and exposure attributes. Terrain and
land-cover model features are loaded from the persisted source-derived GIS store.
"""

from copy import deepcopy

from app.data.static_gis_store import load_static_features

MANGALURU_ZONES_GIS = [
    {
        "zone_id": "Zone 03",
        "zone_name": "Kulur",
        "estimated_population": 12400,
        "affected_buildings": 1240,
        "affected_roads": 7,
        "critical_facilities": 3,
        "center": [12.9285, 74.8320],
        "coordinates": [
            [12.9180, 74.8210],
            [12.9380, 74.8190],
            [12.9460, 74.8350],
            [12.9390, 74.8490],
            [12.9210, 74.8440],
            [12.9180, 74.8210]
        ],
        "drainage_capacity_rating": "SEVERELY CONGESTED",
        "key_observation": "Critical choke point along Gurupura river confluence with NH-66 bridge corridor. Rapid backwater ponding.",
        "priority_rank": 1,
        "priority_status": "IMMEDIATE"
    },
    {
        "zone_id": "Zone 05",
        "zone_name": "Bunder",
        "estimated_population": 9800,
        "affected_buildings": 920,
        "affected_roads": 5,
        "critical_facilities": 2,
        "center": [12.8680, 74.8360],
        "coordinates": [
            [12.8590, 74.8290],
            [12.8760, 74.8310],
            [12.8790, 74.8430],
            [12.8640, 74.8460],
            [12.8580, 74.8380],
            [12.8590, 74.8290]
        ],
        "drainage_capacity_rating": "SEVERELY CONGESTED",
        "key_observation": "Old port and fish market apron vulnerable to tidal lock. Evacuation staging required for wharf workers.",
        "priority_rank": 2,
        "priority_status": "URGENT"
    },
    {
        "zone_id": "Zone 01",
        "zone_name": "Ullal",
        "estimated_population": 14200,
        "affected_buildings": 1350,
        "affected_roads": 6,
        "critical_facilities": 2,
        "center": [12.8050, 74.8510],
        "coordinates": [
            [12.7920, 74.8400],
            [12.8180, 74.8430],
            [12.8220, 74.8620],
            [12.8010, 74.8650],
            [12.7920, 74.8400]
        ],
        "drainage_capacity_rating": "STRESSED",
        "key_observation": "High energy coastal sandspit facing wave overtopping and Netravati estuary mouth backflow.",
        "priority_rank": 3,
        "priority_status": "URGENT"
    },
    {
        "zone_id": "Zone 04",
        "zone_name": "Bolar",
        "estimated_population": 8900,
        "affected_buildings": 810,
        "affected_roads": 4,
        "critical_facilities": 1,
        "center": [12.8520, 74.8450],
        "coordinates": [
            [12.8420, 74.8380],
            [12.8610, 74.8400],
            [12.8620, 74.8530],
            [12.8460, 74.8520],
            [12.8420, 74.8380]
        ],
        "drainage_capacity_rating": "STRESSED",
        "key_observation": "Estuarine bank settlement directly opposite Netravati river confluence.",
        "priority_rank": 4,
        "priority_status": "HIGH"
    },
    {
        "zone_id": "Zone 02",
        "zone_name": "Hampankatta",
        "estimated_population": 16500,
        "affected_buildings": 1680,
        "affected_roads": 8,
        "critical_facilities": 4,
        "center": [12.8710, 74.8430],
        "coordinates": [
            [12.8640, 74.8390],
            [12.8790, 74.8390],
            [12.8810, 74.8520],
            [12.8670, 74.8520],
            [12.8640, 74.8390]
        ],
        "drainage_capacity_rating": "STRESSED",
        "key_observation": "High economic density commercial center. Flash waterlogging along transit subways.",
        "priority_rank": 5,
        "priority_status": "MONITOR"
    },
    {
        "zone_id": "Zone 06",
        "zone_name": "Kankanady",
        "estimated_population": 11200,
        "affected_buildings": 1050,
        "affected_roads": 5,
        "critical_facilities": 3,
        "center": [12.8670, 74.8620],
        "coordinates": [
            [12.8580, 74.8530],
            [12.8750, 74.8540],
            [12.8770, 74.8720],
            [12.8600, 74.8710],
            [12.8580, 74.8530]
        ],
        "drainage_capacity_rating": "ADEQUATE",
        "key_observation": "Elevated ridge with localized depressions. Secondary diversion hub for medical facilities.",
        "priority_rank": 6,
        "priority_status": "MONITOR"
    },
    {
        "zone_id": "Zone 07",
        "zone_name": "Deralakatte",
        "estimated_population": 7600,
        "affected_buildings": 640,
        "affected_roads": 3,
        "critical_facilities": 2,
        "center": [12.8210, 74.8870],
        "coordinates": [
            [12.8100, 74.8750],
            [12.8310, 74.8780],
            [12.8340, 74.8990],
            [12.8140, 74.8980],
            [12.8100, 74.8750]
        ],
        "drainage_capacity_rating": "ADEQUATE",
        "key_observation": "Elevated plateau safe from estuarine backwater. High capacity medical staging reserve.",
        "priority_rank": 7,
        "priority_status": "LOW"
    }
]

UDUPI_ZONES_GIS = [
    {
        "zone_id": "Zone 01",
        "zone_name": "Malpe Harbor",
        "estimated_population": 11500,
        "affected_buildings": 1120,
        "affected_roads": 6,
        "critical_facilities": 3,
        "center": [13.3490, 74.7040],
        "coordinates": [
            [13.3380, 74.6930],
            [13.3610, 74.6960],
            [13.3650, 74.7140],
            [13.3420, 74.7160],
            [13.3380, 74.6930]
        ],
        "drainage_capacity_rating": "SEVERELY CONGESTED",
        "key_observation": "Major fishing harbor apron vulnerable to combined high tide lock and sea swell overwash.",
        "priority_rank": 1,
        "priority_status": "IMMEDIATE"
    },
    {
        "zone_id": "Zone 02",
        "zone_name": "Udyavara Estuary",
        "estimated_population": 8200,
        "affected_buildings": 790,
        "affected_roads": 5,
        "critical_facilities": 2,
        "center": [13.3120, 74.7360],
        "coordinates": [
            [13.2980, 74.7210],
            [13.3250, 74.7240],
            [13.3280, 74.7480],
            [13.3030, 74.7490],
            [13.2980, 74.7210]
        ],
        "drainage_capacity_rating": "SEVERELY CONGESTED",
        "key_observation": "Udyavara river tidal estuary prone to backflow inundation of adjacent residential hamlets.",
        "priority_rank": 2,
        "priority_status": "URGENT"
    },
    {
        "zone_id": "Zone 03",
        "zone_name": "Kaup Coast",
        "estimated_population": 9400,
        "affected_buildings": 870,
        "affected_roads": 4,
        "critical_facilities": 2,
        "center": [13.2240, 74.7430],
        "coordinates": [
            [13.2080, 74.7310],
            [13.2380, 74.7330],
            [13.2420, 74.7550],
            [13.2120, 74.7570],
            [13.2080, 74.7310]
        ],
        "drainage_capacity_rating": "STRESSED",
        "key_observation": "Lighthouse littoral strip vulnerable to high tide wave energy and beach access cutoff.",
        "priority_rank": 3,
        "priority_status": "HIGH"
    },
    {
        "zone_id": "Zone 04",
        "zone_name": "Brahmavara River Delta",
        "estimated_population": 6800,
        "affected_buildings": 610,
        "affected_roads": 3,
        "critical_facilities": 1,
        "center": [13.4350, 74.7480],
        "coordinates": [
            [13.4180, 74.7350],
            [13.4510, 74.7380],
            [13.4540, 74.7620],
            [13.4220, 74.7610],
            [13.4180, 74.7350]
        ],
        "drainage_capacity_rating": "STRESSED",
        "key_observation": "Swarna-Sita delta confluence channel spillover affecting low agricultural plains.",
        "priority_rank": 4,
        "priority_status": "MONITOR"
    },
    {
        "zone_id": "Zone 05",
        "zone_name": "Padubidri Coast",
        "estimated_population": 7300,
        "affected_buildings": 680,
        "affected_roads": 4,
        "critical_facilities": 2,
        "center": [13.1360, 74.7780],
        "coordinates": [
            [13.1200, 74.7650],
            [13.1520, 74.7680],
            [13.1550, 74.7920],
            [13.1240, 74.7910],
            [13.1200, 74.7650]
        ],
        "drainage_capacity_rating": "ADEQUATE",
        "key_observation": "Blue Flag beach corridor and industrial coastal buffer with localized storm runoff.",
        "priority_rank": 5,
        "priority_status": "MONITOR"
    }
]

def get_study_area_zones(study_area: str):
    normalized_area = study_area.lower()
    if normalized_area == "udupi":
        zones = UDUPI_ZONES_GIS
    elif normalized_area == "mangaluru":
        zones = MANGALURU_ZONES_GIS
    else:
        raise ValueError(f"Unsupported study area: {study_area}")

    static_features = load_static_features(normalized_area)
    result = deepcopy(zones)
    for zone in result:
        try:
            zone.update(static_features[zone["zone_id"]])
        except KeyError as error:
            raise RuntimeError(
                f"Static GIS store is missing zone {normalized_area}/{zone['zone_id']}."
            ) from error
    return result
