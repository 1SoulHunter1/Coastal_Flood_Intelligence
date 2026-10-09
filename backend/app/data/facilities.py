"""
CoastGuard-AI: Critical Infrastructure Facilities
Hospitals, Shelters, Fire Stations, Emergency Ports for Mangaluru and Udupi
"""

MANGALURU_FACILITIES = [
    {
        "id": "HOSP-WENLOCK",
        "name": "Government Wenlock District Hospital",
        "type": "HOSPITAL",
        "zone_id": "Zone 02",
        "zone_name": "Hampankatta",
        "status": "OPERATIONAL",
        "coordinates": [12.8682, 74.8428],
        "capacity_or_load": "1000 Beds • 95% Occupancy",
        "contact": "+91 824 244 4444",
        "elevation_m": 8.5
    },
    {
        "id": "HOSP-AJ",
        "name": "A.J. Hospital & Medical Center",
        "type": "HOSPITAL",
        "zone_id": "Zone 03",
        "zone_name": "Kulur",
        "status": "AT_RISK",
        "coordinates": [12.9120, 74.8380],
        "capacity_or_load": "850 Beds • 88% Occupancy",
        "contact": "+91 824 222 5533",
        "elevation_m": 4.2
    },
    {
        "id": "HOSP-FM",
        "name": "Father Muller Hospital Kankanady",
        "type": "HOSPITAL",
        "zone_id": "Zone 06",
        "zone_name": "Kankanady",
        "status": "OPERATIONAL",
        "coordinates": [12.8620, 74.8640],
        "capacity_or_load": "1250 Beds • 92% Occupancy",
        "contact": "+91 824 223 8000",
        "elevation_m": 11.2
    },
    {
        "id": "SHELTER-A",
        "name": "Shelter A (St. Antony Memorial Hall)",
        "type": "SHELTER",
        "zone_id": "Zone 03",
        "zone_name": "Kulur",
        "status": "OPERATIONAL",
        "coordinates": [12.9295, 74.8260],
        "capacity_or_load": "Capacity: 450 • 45 Occupied",
        "contact": "+91 824 245 0011",
        "elevation_m": 5.8
    },
    {
        "id": "SHELTER-B",
        "name": "Shelter B (Kulur Riverfront Community Center)",
        "type": "SHELTER",
        "zone_id": "Zone 03",
        "zone_name": "Kulur",
        "status": "AT_RISK",
        "coordinates": [12.9215, 74.8190],
        "capacity_or_load": "Capacity: 300 • 0 Occupied",
        "contact": "+91 824 245 0022",
        "elevation_m": 2.1
    },
    {
        "id": "SHELTER-C",
        "name": "Bunder Port Seamen Community Shelter",
        "type": "SHELTER",
        "zone_id": "Zone 05",
        "zone_name": "Bunder",
        "status": "OPERATIONAL",
        "coordinates": [12.8640, 74.8340],
        "capacity_or_load": "Capacity: 350 • 30 Occupied",
        "contact": "+91 824 242 1100",
        "elevation_m": 3.4
    },
    {
        "id": "FIRE-KADRI",
        "name": "Kadri Fire & Emergency Station",
        "type": "FIRE_STATION",
        "zone_id": "Zone 02",
        "zone_name": "Hampankatta",
        "status": "OPERATIONAL",
        "coordinates": [12.8750, 74.8550],
        "capacity_or_load": "6 Rapid Response Engines",
        "contact": "101 / +91 824 221 1101",
        "elevation_m": 12.0
    },
    {
        "id": "FIRE-PANDE",
        "name": "Pandeshwar Central Fire Station",
        "type": "FIRE_STATION",
        "zone_id": "Zone 05",
        "zone_name": "Bunder",
        "status": "OPERATIONAL",
        "coordinates": [12.8590, 74.8410],
        "capacity_or_load": "4 High Capacity Dewatering Pumps",
        "contact": "101 / +91 824 242 1101",
        "elevation_m": 4.8
    },
    {
        "id": "PUMP-KOTTARA",
        "name": "Kottara High Capacity Dewatering Pump Station",
        "type": "DRAIN_PUMP",
        "zone_id": "Zone 03",
        "zone_name": "Kulur",
        "status": "CRITICAL",
        "coordinates": [12.9190, 74.8290],
        "capacity_or_load": "3500 L/sec • 100% Load",
        "contact": "+91 824 245 9900",
        "elevation_m": 1.9
    },
    {
        "id": "PORT-OLD",
        "name": "Mangaluru Old Wharf & Marine Fisheries Jetty",
        "type": "PORT",
        "zone_id": "Zone 05",
        "zone_name": "Bunder",
        "status": "AT_RISK",
        "coordinates": [12.8620, 74.8320],
        "capacity_or_load": "Active Maritime Patrol Base",
        "contact": "+91 824 242 3344",
        "elevation_m": 1.4
    }
]

UDUPI_FACILITIES = [
    {
        "id": "HOSP-UDUPI-DIST",
        "name": "Government District Hospital Udupi",
        "type": "HOSPITAL",
        "zone_id": "Zone 01",
        "zone_name": "Malpe Harbor",
        "status": "OPERATIONAL",
        "coordinates": [13.3420, 74.7480],
        "capacity_or_load": "550 Beds • 90% Occupancy",
        "contact": "+91 820 252 0555",
        "elevation_m": 7.4
    },
    {
        "id": "HOSP-TMA-PAI",
        "name": "Dr. TMA Pai Rotary Hospital Udupi",
        "type": "HOSPITAL",
        "zone_id": "Zone 01",
        "zone_name": "Malpe Harbor",
        "status": "OPERATIONAL",
        "coordinates": [13.3380, 74.7510],
        "capacity_or_load": "250 Beds • 82% Occupancy",
        "contact": "+91 820 252 0333",
        "elevation_m": 8.1
    },
    {
        "id": "HOSP-MANIPAL",
        "name": "Kasturba Medical College Hospital Manipal",
        "type": "HOSPITAL",
        "zone_id": "Zone 02",
        "zone_name": "Udyavara Estuary",
        "status": "OPERATIONAL",
        "coordinates": [13.3540, 74.7860],
        "capacity_or_load": "2000 Beds • 85% Occupancy",
        "contact": "+91 820 292 2761",
        "elevation_m": 45.0
    },
    {
        "id": "SHELTER-MALPE-01",
        "name": "Malpe Community Relief Shelter (Govt High School)",
        "type": "SHELTER",
        "zone_id": "Zone 01",
        "zone_name": "Malpe Harbor",
        "status": "OPERATIONAL",
        "coordinates": [13.3520, 74.7110],
        "capacity_or_load": "Capacity: 500 • 35 Occupied",
        "contact": "+91 820 253 8811",
        "elevation_m": 4.2
    },
    {
        "id": "SHELTER-UDYAVARA-01",
        "name": "Udyavara Grama Panchayat Hall Shelter",
        "type": "SHELTER",
        "zone_id": "Zone 02",
        "zone_name": "Udyavara Estuary",
        "status": "OPERATIONAL",
        "coordinates": [13.3150, 74.7410],
        "capacity_or_load": "Capacity: 350 • 20 Occupied",
        "contact": "+91 820 257 1144",
        "elevation_m": 5.1
    },
    {
        "id": "SHELTER-KAUP-01",
        "name": "Kaup Light Beach Community Shelter",
        "type": "SHELTER",
        "zone_id": "Zone 03",
        "zone_name": "Kaup Coast",
        "status": "OPERATIONAL",
        "coordinates": [13.2280, 74.7480],
        "capacity_or_load": "Capacity: 400 • 15 Occupied",
        "contact": "+91 820 254 3322",
        "elevation_m": 6.8
    },
    {
        "id": "FIRE-MALPE",
        "name": "Malpe Coastal Fire & Rescue Station",
        "type": "FIRE_STATION",
        "zone_id": "Zone 01",
        "zone_name": "Malpe Harbor",
        "status": "OPERATIONAL",
        "coordinates": [13.3450, 74.7080],
        "capacity_or_load": "3 Water Tenders • 2 Rescue Inflatables",
        "contact": "101 / +91 820 253 7101",
        "elevation_m": 3.8
    },
    {
        "id": "POLICE-MALPE",
        "name": "Malpe Coastal Security Police Station",
        "type": "POLICE_STATION",
        "zone_id": "Zone 01",
        "zone_name": "Malpe Harbor",
        "status": "OPERATIONAL",
        "coordinates": [13.3480, 74.7060],
        "capacity_or_load": "2 High-Speed All-Weather Patrol Boats",
        "contact": "112 / +91 820 253 7100",
        "elevation_m": 3.1
    },
    {
        "id": "PORT-MALPE",
        "name": "Malpe Deep-Sea Fisheries Terminal & Wharf",
        "type": "PORT",
        "zone_id": "Zone 01",
        "zone_name": "Malpe Harbor",
        "status": "AT_RISK",
        "coordinates": [13.3490, 74.7010],
        "capacity_or_load": "Trawler Berthing • High Tide Overtopping",
        "contact": "+91 820 253 8222",
        "elevation_m": 1.6
    }
]

def get_study_area_facilities(study_area: str):
    if study_area.lower() == "udupi":
        return UDUPI_FACILITIES
    return MANGALURU_FACILITIES
