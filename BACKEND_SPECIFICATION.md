# CoastGuard-AI: Backend Architecture & API Specification

**Project:** AI-Powered Coastal Flood Intelligence & Emergency Response System  
**Study Area:** Mangaluru (Mangalore), Karnataka, India  
**Target Backend Stack:** Python 3.10+, FastAPI, Pydantic v2, NetworkX, GeoPandas / Shapely, Scikit-Learn / XGBoost, SHAP  
**Target Frontend Stack:** React 19, TypeScript, Vite, Tailwind CSS, React-Leaflet  

---

## 1. Executive Summary & Purpose

The **CoastGuard-AI** frontend has been fully constructed as an operational GIS Emergency Control Room dashboard. Currently, the frontend consumes structured deterministic simulation data via `frontend/src/services/api.ts`.

This document is the **complete implementation specification** for developing the backend in Python/FastAPI. Once the backend is implemented to satisfy these endpoints and schemas, the frontend will connect seamlessly and display live, dynamically calculated hydrodynamic intelligence, NetworkX-driven access routing, plain-English explainability, and bilingual alert dispatches.

---

## 2. Core Architectural Principles

1. **Deterministic & Model-Driven Intelligence**:
   * Flood probabilities and depths must be produced by hydrodynamic simulation models or ML models (e.g., XGBoost / Random Forest trained on rainfall, tide, elevation, and river discharge).
   * Road closures must enforce the safety threshold constant:
     $$\text{ROAD\_CLOSURE\_DEPTH\_M} = 0.30\text{ m}$$
     * $\text{depth} < 0.15\text{ m} \longrightarrow \mathbf{OPEN}$
     * $0.15\text{ m} \le \text{depth} < 0.30\text{ m} \longrightarrow \mathbf{AT\_RISK}$
     * $\text{depth} \ge 0.30\text{ m} \longrightarrow \mathbf{CLOSED}$
2. **NetworkX Graph Routing Engine**:
   * Road intersections = Graph Nodes.
   * Road segments = Graph Edges.
   * Flood depth = Edge attribute.
   * If edge flood depth $\ge 0.30\text{ m}$, the edge is pruned from the navigable sub-graph.
   * Shortest/fastest emergency route is computed via Dijkstra / A* algorithm.
3. **Plain-English Explainability (SHAP Proxy)**:
   * Translates model feature attributions into human-readable labels and deterministic sentences without requiring an external LLM.
4. **Bilingual Alert Generation**:
   * Dynamic template interpolation in both **English** and **Kannada** (ಕನ್ನಡ) for SMS and WhatsApp dispatch.
5. **CORS & Base URL**:
   * Backend must allow CORS for `http://localhost:5173` and `http://127.0.0.1:5173`.
   * Standard API prefix: `/api/v1`.

---

## 3. How to Connect the Frontend to the Backend

### Step A: Configure Frontend Environment Variable
In `frontend/.env` (or `frontend/.env.development`):
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

### Step B: Service Layer Integration
In [`frontend/src/services/api.ts`](file:///c:/Users/SUSHEEL/OneDrive/Desktop/CoastGuard-AI/frontend/src/services/api.ts), replace the mock `Promise.resolve(...)` calls with HTTP requests to `VITE_API_BASE_URL`. A drop-in client code snippet with fallback to demo data is provided in [Section 8](#8-drop-in-frontend-api-client).

---

## 4. API Endpoints Directory

All endpoints use `GET` (or `POST` for simulations) under the `/api/v1` namespace.

| # | Endpoint | Method | Frontend Purpose | Backend Computational Engine |
|---|---|---|---|---|
| **1** | `/api/v1/environment/current` | `GET` | Live meteorological & tidal KPI banner | Fetch/simulate gauge data (Tide, Rain, Surge, River discharge) |
| **2** | `/api/v1/zones` | `GET` | 7 Mangaluru zones summary & polygon GIS data | Hydrological risk scoring & GIS polygon packaging |
| **3** | `/api/v1/zones/{zone_id}` | `GET` | Detailed zone status & risk drivers | Single-zone query & SHAP attribution lookup |
| **4** | `/api/v1/forecast/timeline` | `GET` | 24-Hour forecast chart (NOW to +24H) | Hydrodynamic time-series forward prediction |
| **5** | `/api/v1/infrastructure/summary` | `GET` | KPI cards for facilities & roads at risk | Spatial intersection of flood layer with facility/road DB |
| **6** | `/api/v1/infrastructure/facilities` | `GET` | Markers for hospitals, shelters, stations | Facility database query with current risk status |
| **7** | `/api/v1/infrastructure/roads` | `GET` | Road segment GIS polylines & water depths | Road network GIS query with overlaid predicted depth |
| **8** | `/api/v1/routing/roads-impact` | `GET` | Road closure analysis table & closure reasons | Evaluates depth against `0.30m` threshold |
| **9** | `/api/v1/routing/blocked-roads` | `GET` | Map layer: Closed road segments | Filters roads where `predicted_depth_m >= 0.30` |
| **10** | `/api/v1/routing/hospitals-accessibility` | `GET` | Wenlock & city hospital access status | Facility flood status vs route ingress availability |
| **11** | `/api/v1/routing/shelters-accessibility` | `GET` | Dry shelter capacity & reachable status | Ingress routing to shelters & nearest dry shelter recommendation |
| **12** | `/api/v1/routing/alternative-route` | `GET` | Emergency route geometry & detour time | NetworkX shortest path bypassing closed edges |
| **13** | `/api/v1/routing/system-access-summary` | `GET` | Compact Access & Impact card metrics | System aggregate access ratios and diversion headline |
| **14** | `/api/v1/analysis/what-if` | `POST` | Counterfactual scenario simulator | Sensitivity calculation: Tide, Rain, Surge delta vs Depth |
| **15** | `/api/v1/emergency/priority-table` | `GET` | Multi-criteria emergency priority table | MCDA weighted ranking of all 7 zones |
| **16** | `/api/v1/emergency/responder-briefing` | `GET` | Structured tactical responder briefing | Deterministic tactical briefing generator |
| **17** | `/api/v1/alerts/active` | `GET` | Active system alert cards | Active civic warnings based on risk tier |
| **18** | `/api/v1/alerts/public-template` | `GET` | Multilingual English + Kannada alert preview | Deterministic template interpolation with nearest shelter |
| **19** | `/api/v1/emergency/situation-brief` | `GET` | Executive situation bulletin | Structured bulletin compilation |

---

## 5. Detailed Endpoint Contracts & Data Models

### 5.1. Current Environment Conditions
* **Endpoint:** `GET /api/v1/environment/current`
* **Response Schema (`EnvironmentConditions`):**
```json
{
  "observed_rainfall_rate_mm_hr": 38.5,
  "rainfall_24h_total_mm": 142.0,
  "rainfall_status": "RISING",
  "tide_level_m": 1.95,
  "tide_status": "HIGH TIDE",
  "storm_surge_m": 0.45,
  "wind_speed_kmh": 46.0,
  "wind_direction": "WSW",
  "river_discharge_m3s": 1280.0,
  "river_name": "Netravati River",
  "gurupura_discharge_m3s": 620.0,
  "simulated_time_ist": "17:30 IST",
  "station_name": "Mangaluru Old Port Marine Gauge (Station 04)"
}
```
* **Enums:**
  * `rainfall_status`: `"RISING"` | `"STEADY"` | `"RECEDING"`
  * `tide_status`: `"HIGH TIDE"` | `"LOW TIDE"` | `"SLACK TIDE"` | `"EBB TIDE"`

---

### 5.2. Coastal Zones
* **Endpoint:** `GET /api/v1/zones`
* **Query Params (Optional):** `?risk_level=HIGH`
* **Response Schema (`ZoneData[]`):**
```json
[
  {
    "zone_id": "Zone 03",
    "zone_name": "Kulur",
    "risk_level": "HIGH",
    "flood_probability": 82,
    "severity": "HIGH",
    "expected_onset": "18:40 IST",
    "expected_peak": "22:15 IST",
    "risk_drivers": [
      { "factor": "tide_height", "percentage": 75, "impact_description": "High spring tide coincidence (+1.95m CD)" },
      { "factor": "elevation", "percentage": 25, "impact_description": "Low ground elevation (<2.5m MSL) near Gurupura confluence" }
    ],
    "estimated_population": 18500,
    "affected_buildings": 1420,
    "affected_roads": 7,
    "critical_facilities": 3,
    "elevation_avg_m": 2.1,
    "coordinates": [
      [12.925, 74.805],
      [12.935, 74.815],
      [12.930, 74.835],
      [12.915, 74.825]
    ],
    "center": [12.925, 74.820],
    "priority_rank": 1,
    "priority_status": "IMMEDIATE",
    "priority_score": 88,
    "drainage_capacity_rating": "SEVERELY CONGESTED",
    "key_observation": "Gurupura river backwater effect compounded by peak astronomical spring tide."
  }
]
```
* **Enums:**
  * `risk_level`: `"CRITICAL"` | `"HIGH"` | `"MODERATE"` | `"LOW"`
  * `priority_status`: `"IMMEDIATE"` | `"URGENT"` | `"HIGH"` | `"MONITOR"` | `"LOW"`
  * `drainage_capacity_rating`: `"ADEQUATE"` | `"STRESSED"` | `"SEVERELY CONGESTED"`

---

### 5.3. 24-Hour Forecast Timeline
* **Endpoint:** `GET /api/v1/forecast/timeline`
* **Query Params:** `?zone_id=Zone%2003`
* **Response Schema (`ForecastPoint[]`):**
```json
[
  {
    "time_label": "NOW",
    "timestamp": "17:30 IST",
    "flood_probability": 55,
    "rainfall_rate_mm_hr": 28.0,
    "tide_level_m": 1.65,
    "storm_surge_m": 0.35,
    "is_onset": false,
    "is_peak": false,
    "notes": "Rainfall intensifying; tidal influx beginning"
  },
  {
    "time_label": "+3H",
    "timestamp": "20:30 IST",
    "flood_probability": 78,
    "rainfall_rate_mm_hr": 42.0,
    "tide_level_m": 1.90,
    "storm_surge_m": 0.45,
    "is_onset": true,
    "is_peak": false,
    "notes": "Onset window: Gurupura backwater surge begins"
  },
  {
    "time_label": "+6H",
    "timestamp": "23:30 IST",
    "flood_probability": 85,
    "rainfall_rate_mm_hr": 35.0,
    "tide_level_m": 1.95,
    "storm_surge_m": 0.48,
    "is_onset": false,
    "is_peak": true,
    "notes": "Peak inundation window: low-lying road networks impassable"
  }
]
```

---

### 5.4. Road Impact Analysis (Feature 1A & 1B)
* **Endpoint:** `GET /api/v1/routing/roads-impact`
* **Query Params (Optional):** `?zone_id=Zone%2003`
* **Threshold Rule:** `predicted_depth_m >= 0.30` $\to$ `"CLOSED"`, `0.15 <= depth < 0.30` $\to$ `"AT_RISK"`, else `"OPEN"`.
* **Response Schema (`RoadImpactItem[]`):**
```json
[
  {
    "id": "ROAD-MR760",
    "name": "Main Road 760 (Kottara-Kulur Link)",
    "zone_id": "Zone 03",
    "zone_name": "Kulur",
    "category": "ARTERIAL",
    "predicted_depth_m": 0.34,
    "water_depth_cm": 34,
    "status": "CLOSED",
    "closure_reason": "Flood depth exceeds 0.30 m vehicle-access threshold.",
    "predicted_closure_time": "18:40 IST",
    "coordinates": [
      [12.9220, 74.8210],
      [12.9270, 74.8235]
    ],
    "alternative_route_available": true,
    "alternative_route_id": "ROUTE-ALT-02"
  },
  {
    "id": "ROAD-SEG-12",
    "name": "Road Segment 12 (Kavoor Cross)",
    "zone_id": "Zone 03",
    "zone_name": "Kulur",
    "category": "ARTERIAL",
    "predicted_depth_m": 0.18,
    "water_depth_cm": 18,
    "status": "AT_RISK",
    "closure_reason": "Approaching critical inundation; restricted high-clearance transit only.",
    "coordinates": [
      [12.9280, 74.8250],
      [12.9320, 74.8280]
    ],
    "alternative_route_available": true
  },
  {
    "id": "ROAD-SEG-18",
    "name": "Road Segment 18 (Upper Kulur Heights)",
    "zone_id": "Zone 03",
    "zone_name": "Kulur",
    "category": "ARTERIAL",
    "predicted_depth_m": 0.08,
    "water_depth_cm": 8,
    "status": "OPEN",
    "coordinates": [
      [12.9330, 74.8310],
      [12.9360, 74.8340]
    ],
    "alternative_route_available": true
  },
  {
    "id": "ROAD-PUMPWELL-APP",
    "name": "Pumpwell Circle Ingress Corridor",
    "zone_id": "Zone 05",
    "zone_name": "Jeppinamogaru",
    "category": "NH-66",
    "predicted_depth_m": 0.35,
    "water_depth_cm": 35,
    "status": "CLOSED",
    "closure_reason": "Flood depth exceeds 0.30 m threshold. Cutoff predicted after 14:10 IST.",
    "predicted_closure_time": "14:10 IST",
    "coordinates": [
      [12.8610, 74.8620],
      [12.8655, 74.8640]
    ],
    "alternative_route_available": true,
    "alternative_route_id": "ROUTE-ALT-02"
  }
]
```

---

### 5.5. Hospital Accessibility (Feature 1D)
* **Endpoint:** `GET /api/v1/routing/hospitals-accessibility`
* **Query Params (Optional):** `?hospital_id=HOSP-WENLOCK`
* **Response Schema (`HospitalAccessibility[]`):**
```json
[
  {
    "id": "HOSP-WENLOCK",
    "name": "Government Wenlock District Hospital",
    "zone_id": "Zone 02",
    "zone_name": "Bunder / Hampankatta",
    "facility_flood_status": "DRY",
    "access_status": "AT_RISK",
    "reason": "The hospital itself is outside the predicted flood area, but the primary access route via Pumpwell Circle is predicted to become impassable.",
    "primary_route": {
      "name": "Pumpwell Circle -> Main Road Corridor",
      "corridor": "NH-66 -> K.S. Rao Road",
      "status": "CLOSED AFTER 14:10",
      "closure_time": "14:10 IST"
    },
    "alternative_route": {
      "name": "Bendoorwell -> Balmatta Alternative Bypass",
      "corridor": "Bendoorwell - Balmatta Road",
      "status": "OPEN",
      "detour_minutes": 8,
      "travel_time_minutes": 22,
      "route_id": "ROUTE-ALT-02"
    },
    "contact": "+91 824 244 4444",
    "coordinates": [12.8682, 74.8428]
  }
]
```

---

### 5.6. Shelter Accessibility & Nearest Safe Shelter (Feature 1E & 8)
* **Endpoint:** `GET /api/v1/routing/shelters-accessibility`
* **Query Params (Optional):** `?zone_id=Zone%2003`
* **Response Schema (`ShelterAccessibility[]`):**
```json
[
  {
    "id": "SHELTER-A",
    "name": "Shelter A (St. Antony Memorial Hall)",
    "zone_id": "Zone 03",
    "zone_name": "Kulur",
    "capacity": 450,
    "occupied": 45,
    "flood_status": "DRY",
    "road_accessibility": "OPEN",
    "distance_km": 2.4,
    "travel_time_minutes": 12,
    "route_status": "OPEN ACCESS",
    "is_recommended": true,
    "route_id": "ROUTE-SHELTER-A",
    "coordinates": [12.9295, 74.8260]
  },
  {
    "id": "SHELTER-B",
    "name": "Shelter B (Kulur Riverfront Community Center)",
    "zone_id": "Zone 03",
    "zone_name": "Kulur",
    "capacity": 300,
    "occupied": 0,
    "flood_status": "DRY",
    "road_accessibility": "CLOSED",
    "distance_km": 1.1,
    "travel_time_minutes": 0,
    "route_status": "NOT ACCESSIBLE",
    "is_recommended": false,
    "coordinates": [12.9215, 74.8190]
  }
]
```

---

### 5.7. Alternative Emergency Routing (Feature 1C & 9)
* **Endpoint:** `GET /api/v1/routing/alternative-route`
* **Query Params:** `?facility_id=HOSP-WENLOCK` or `?route_id=ROUTE-ALT-02`
* **Response Schema (`EmergencyRoute`):**
```json
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
}
```

---

### 5.8. System Access & Impact Summary (Feature 11)
* **Endpoint:** `GET /api/v1/routing/system-access-summary`
* **Response Schema (`SystemAccessSummary`):**
```json
{
  "roads_closed_count": 3,
  "roads_at_risk_count": 4,
  "hospitals_accessible_ratio": "2 / 3",
  "shelters_reachable_ratio": "3 / 4",
  "critical_facilities_count": 3,
  "access_status_headline": "2 critical facilities require route diversion."
}
```

---

### 5.9. Counterfactual / What-If Analysis (Feature 3)
* **Endpoint:** `POST /api/v1/analysis/what-if`
* **Request Body Schema (`CounterfactualInputs`):**
```json
{
  "zone_id": "Zone 03",
  "tide_offset_m": -0.40,
  "rainfall_percent_change": 0,
  "storm_surge_offset_m": 0
}
```
* **Response Schema (`CounterfactualScenario`):**
```json
{
  "zone_id": "Zone 03",
  "baseline": {
    "tide_m": 1.95,
    "rainfall_rate_mm_hr": 38.5,
    "storm_surge_m": 0.45,
    "predicted_depth_m": 0.35,
    "risk_level": "HIGH",
    "probability": 82
  },
  "simulated": {
    "tide_m": 1.55,
    "rainfall_rate_mm_hr": 38.5,
    "storm_surge_m": 0.45,
    "predicted_depth_m": 0.08,
    "risk_level": "LOW",
    "probability": 28
  },
  "depth_delta_m": -0.27,
  "risk_shift": "HIGH -> LOW",
  "explanation": "Under this simulated lower-tide scenario, predicted flood depth decreases substantially from 0.35 m to 0.08 m, restoring vehicle accessibility across primary road corridors."
}
```

---

### 5.10. Automated Responder Briefing (Feature 4 & 5)
* **Endpoint:** `GET /api/v1/emergency/responder-briefing`
* **Query Params:** `?zone_id=Zone%2003`
* **Response Schema (`ResponderBriefing`):**
```json
{
  "zone_id": "Zone 03",
  "zone_name": "Kulur",
  "headline": "Zone 03 — Kulur: High Flood Risk Alert",
  "risk_level": "HIGH",
  "expected_onset": "18:40 IST",
  "expected_peak": "22:15 IST",
  "roads_affected_count": 7,
  "roads_closed_count": 2,
  "critical_facilities_at_risk_count": 3,
  "key_actions": [
    "Prioritize Zone 03 (Kulur estuarine corridor).",
    "Inspect closed road segments on Main Road 760 and Kottara junction.",
    "Verify critical facility ingress/egress routes to Government Wenlock District Hospital.",
    "Prepare alternative routes via Bendoorwell bypass.",
    "Monitor real-time rainfall rate and Gurupura tidal backwater conditions."
  ],
  "responder_actions": [
    {
      "category": "IMMEDIATE",
      "action": "Deploy modular flood barriers and high-capacity dewatering pumps",
      "target_location": "Kottara Chowki underpass & Kulur bridge approach",
      "timing": "Before 13:00 IST",
      "priority": "URGENT"
    },
    {
      "category": "TRAFFIC CONTROL",
      "action": "Divert heavy & light vehicle traffic away from Main Road 760",
      "target_location": "Main Road 760 intersection",
      "timing": "Starting 13:30 IST",
      "priority": "HIGH"
    },
    {
      "category": "ROUTE MANAGEMENT",
      "action": "Signpost and clear alternative emergency bypass corridor",
      "target_location": "Bendoorwell corridor",
      "timing": "Immediate",
      "priority": "HIGH"
    },
    {
      "category": "CRITICAL FACILITY",
      "action": "Verify emergency ambulance access route to Wenlock Hospital",
      "target_location": "Government Wenlock District Hospital ingress",
      "timing": "Continuous monitoring",
      "priority": "URGENT"
    }
  ],
  "generated_timestamp": "17:35 IST"
}
```

---

### 5.11. Bilingual Public Alerts (Feature 6 & 7)
* **Endpoint:** `GET /api/v1/alerts/public-template`
* **Query Params:** `?zone_id=Zone%2003`
* **Response Schema (`PublicAlertTemplate`):**
```json
{
  "zone_id": "Zone 03",
  "zone_name": "Kulur",
  "risk_level": "HIGH",
  "expected_onset": "18:40 IST",
  "expected_peak": "22:15 IST",
  "nearest_shelter_name": "Shelter A (St. Antony Memorial Hall)",
  "nearest_shelter_distance_km": 2.4,
  "english": {
    "title": "FLOOD WARNING — MANGALURU",
    "body": "Zone: Zone 03 — Kulur\nRisk Level: HIGH\nExpected Onset: 18:40 IST\nExpected Peak: 22:15 IST\n\nResidents in low-lying areas should move toward the nearest identified dry shelter and avoid flooded roads.",
    "advisory": "Nearest reachable shelter: Shelter A (St. Antony Memorial Hall) — 2.4 km. Avoid Main Road 760 (CLOSED).",
    "sms_text": "FLOOD WARNING (MANGALURU): Zone 03 Kulur at HIGH risk from 18:40 IST. Avoid flooded roads. Nearest dry shelter: Shelter A (2.4km). Infoline: 1077.",
    "whatsapp_text": "*FLOOD WARNING — MANGALURU*\n\n*Zone:* Zone 03 — Kulur\n*Risk:* HIGH\n*Onset:* 18:40 IST | *Peak:* 22:15 IST\n\nResidents in low-lying estuarine areas should evacuate toward identified dry shelters.\n\n*Nearest Safe Shelter:* Shelter A (St. Antony Memorial) (2.4 km)\n*Road Closures:* Main Road 760 is CLOSED (depth >= 0.30m).\n*Helpline:* 1077 / 112\n\n_SIMULATION PUBLIC ALERT — Civic Control Room_"
  },
  "kannada": {
    "title": "ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ — ಮಂಗಳೂರು",
    "body": "ವಲಯ: ಕುಲೂರು\nಅಪಾಯ ಮಟ್ಟ: ಹೆಚ್ಚು\nನಿರೀಕ್ಷಿತ ಆರಂಭ: ಸಂಜೆ 6:40\nನಿರೀಕ್ಷಿತ ಗರಿಷ್ಠ: ರಾತ್ರಿ 10:15\n\nನೀರು ತುಂಬಿರುವ ರಸ್ತೆಗಳಲ್ಲಿ ಪ್ರಯಾಣಿಸಬೇಡಿ. ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಕೇಂದ್ರಕ್ಕೆ ತೆರಳಿ.",
    "advisory": "ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಕೇಂದ್ರ: Shelter A (St. Antony Memorial Hall) — 2.4 ಕಿ.ಮೀ. ಮುಖ್ಯ ರಸ್ತೆ 760 ಬಂದ್ ಆಗಿದೆ.",
    "sms_text": "ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ (ಮಂಗಳೂರು): ಕುಲೂರು ವಲಯದಲ್ಲಿ ಹೆಚ್ಚಿನ ಪ್ರವಾಹ ಅಪಾಯ (ಸಂಜೆ 6:40). ನೀರು ತುಂಬಿದ ರಸ್ತೆಗಳನ್ನು ತಪ್ಪಿಸಿ. ಸುರಕ್ಷಿತ ಆಶ್ರಯ: Shelter A (2.4km). ಸಹಾಯವಾಣಿ: 1077.",
    "whatsapp_text": "*ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ — ಮಂಗಳೂರು*\n\n*ವಲಯ:* ಕುಲೂರು (Zone 03)\n*ಅಪಾಯ ಮಟ್ಟ:* ಹೆಚ್ಚು\n*ನಿರೀಕ್ಷಿತ ಆರಂಭ:* ಸಂಜೆ 6:40 | *ಗರಿಷ್ಠ:* ರಾತ್ರಿ 10:15\n\nತಗ್ಗು ಪ್ರದೇಶದ ನಿವಾಸಿಗಳು ತಕ್ಷಣವೇ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಕೇಂದ್ರಕ್ಕೆ ತೆರಳಲು ಸೂಚಿಸಲಾಗಿದೆ.\n\n*ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಕೇಂದ್ರ:* Shelter A (2.4 ಕಿ.ಮೀ)\n*ರಸ್ತೆ ಸ್ಥಿತಿ:* ಮುಖ್ಯ ರಸ್ತೆ 760 ಸಂಚಾರಕ್ಕೆ ಮುಚ್ಚಲಾಗಿದೆ (ನೀರಿನ ಆಳ >= 0.30 ಮೀ).\n*ತುರ್ತು ಸಹಾಯವಾಣಿ:* 1077 / 112\n\n_ಮಾದರಿ ಸಾರ್ವಜನಿಕ ಎಚ್ಚರಿಕೆ — ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಪ್ರಾಧಿಕಾರ_"
  }
}
```

---

### 5.12. Emergency Priority Ranking
* **Endpoint:** `GET /api/v1/emergency/priority-table`
* **Response Schema (`EmergencyPriorityItem[]`):**
```json
[
  {
    "rank": 1,
    "zone_id": "Zone 03",
    "zone_name": "Kulur",
    "risk_level": "HIGH",
    "exposure": "VERY HIGH",
    "critical_facilities": 3,
    "priority": "IMMEDIATE",
    "priority_score": 88,
    "rationale": "High estuarine tide coincidence combined with NH-66 transit disruption risk."
  },
  {
    "rank": 2,
    "zone_id": "Zone 01",
    "zone_name": "Bengre",
    "risk_level": "CRITICAL",
    "exposure": "HIGH",
    "critical_facilities": 1,
    "priority": "IMMEDIATE",
    "priority_score": 92,
    "rationale": "Coastal sandspit isolation risk with direct wave runup and storm surge."
  }
]
```

---

## 6. Backend Computational Engines (How to Process Data)

### 6.1. Hydrodynamic & Flood Depth Model
The backend should use an ML model or hydrodynamic physics calculation:
* **Inputs:** `tide_level_m` (Tide gauge), `rainfall_rate_mm_hr` (IMD), `river_discharge_m3s` (CWC), `zone_elevation_m` (DEM), `distance_to_river_m`.
* **Model:** LightGBM / XGBoost Regressor or spatial hydrodynamic rule.
* **Outputs:** 
  1. `flood_probability`: Sigmoid/calibrated probability ($0 - 100\%$).
  2. `predicted_depth_m`: Inundation depth ($0.00\text{ m} - 1.50\text{ m}$).

### 6.2. NetworkX Routing & Cutoff Engine (Mandatory)
```python
import networkx as nx

ROAD_CLOSURE_DEPTH_M = 0.30

def build_road_graph(road_segments, predicted_depths):
    G = nx.DiGraph()
    for seg in road_segments:
        depth = predicted_depths.get(seg.id, 0.0)
        # Attribute assignment
        G.add_edge(
            seg.start_node, 
            seg.end_node, 
            id=seg.id,
            name=seg.name,
            length_km=seg.length_km,
            depth_m=depth,
            status="CLOSED" if depth >= ROAD_CLOSURE_DEPTH_M else ("AT_RISK" if depth >= 0.15 else "OPEN"),
            weight=float('inf') if depth >= ROAD_CLOSURE_DEPTH_M else (seg.travel_time_min * (1.5 if depth >= 0.15 else 1.0))
        )
    return G

def find_emergency_route(G, origin_node, hospital_node):
    try:
        path = nx.shortest_path(G, source=origin_node, target=hospital_node, weight='weight')
        travel_time = nx.shortest_path_length(G, source=origin_node, target=hospital_node, weight='weight')
        return {"path": path, "travel_time_min": travel_time, "status": "OPEN"}
    except nx.NetworkXNoPath:
        return {"status": "BLOCKED", "reason": "All access corridors exceed 0.30m closure threshold"}
```

### 6.3. Plain-English SHAP Feature Attribution (Feature 2)
Convert raw SHAP values into deterministic sentences:
```python
def generate_plain_english_drivers(shap_dict):
    # Sort top 2 contributing drivers
    sorted_factors = sorted(shap_dict.items(), key=lambda x: x[1], reverse=True)
    top1, pct1 = sorted_factors[0]
    top2, pct2 = sorted_factors[1]
    
    label_map = {
        "tide_height": "high tide level",
        "elevation": "low ground elevation",
        "rainfall_6h": "recent heavy rainfall",
        "drainage_density": "drainage congestion",
        "storm_surge": "coastal storm surge"
    }
    
    sentence = (
        f"Flood risk is mainly driven by the {label_map.get(top1, top1)} ({pct1}%), "
        f"with {label_map.get(top2, top2)} ({pct2}%) providing an additional contribution."
    )
    return sentence
```

### 6.4. Multi-Criteria Decision Analysis (MCDA) Emergency Priority Scoring
```python
def calculate_priority_score(zone):
    # Normalized weights
    score = (
        (zone.flood_probability * 0.35) +
        (min(zone.predicted_depth_m / 0.50, 1.0) * 100 * 0.25) +
        (min(zone.estimated_population / 25000, 1.0) * 100 * 0.20) +
        (min(zone.critical_facilities / 5, 1.0) * 100 * 0.20)
    )
    return round(score)
```

---

## 7. Recommended FastAPI Project Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app & CORS middleware
│   ├── config.py                # Environment configs & constants
│   ├── api/
│   │   ├── v1/
│   │   │   ├── api.py           # Includes all routers
│   │   │   ├── environment.py   # /environment/current
│   │   │   ├── zones.py         # /zones
│   │   │   ├── forecast.py      # /forecast/timeline
│   │   │   ├── routing.py       # /routing (Roads, Hospitals, Shelters, NetworkX)
│   │   │   ├── analysis.py      # /analysis (What-If, SHAP)
│   │   │   ├── alerts.py        # /alerts (Active alerts, bilingual templates)
│   │   │   └── emergency.py     # /emergency (Priority table, situation brief)
│   ├── models/
│   │   ├── schemas.py           # Pydantic v2 schemas matching Frontend types
│   ├── services/
│   │   ├── ml_model.py          # XGBoost / Inundation predictor
│   │   ├── networkx_routing.py  # Graph routing & cutoff algorithms
│   │   ├── explainability.py    # SHAP explainer & template generator
│   │   └── alert_generator.py   # Bilingual alert generator
│   └── data/
│       ├── mangaluru_roads.geojson
│       ├── mangaluru_zones.geojson
│       └── critical_facilities.json
├── requirements.txt
└── Dockerfile
```

### Recommended `requirements.txt`:
```txt
fastapi>=0.110.0
uvicorn[standard]>=0.28.0
pydantic>=2.6.0
networkx>=3.2.1
geopandas>=0.14.3
shapely>=2.0.3
scikit-learn>=1.4.1
shap>=0.45.0
numpy>=1.26.0
pandas>=2.2.0
```

---

## 8. Drop-In Frontend API Client

Once the backend is started (e.g., `uvicorn app.main:app --reload --port 8000`), copy this implementation into [`frontend/src/services/api.ts`](file:///c:/Users/SUSHEEL/OneDrive/Desktop/CoastGuard-AI/frontend/src/services/api.ts). It will attempt to fetch live data from FastAPI and gracefully fall back to demo simulation data if the backend is down:

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

async function fetchWithFallback<T>(endpoint: string, fallback: () => Promise<T>): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.warn(`[CoastGuard-AI] Live API call to ${endpoint} failed. Using demo data fallback.`, error);
    return fallback();
  }
}
```

---

## 9. Validation Checklist for the Backend Developer

Before handing the backend to the frontend team, verify that:
1. `GET http://127.0.0.1:8000/docs` opens Swagger UI without schema errors.
2. `ROAD_CLOSURE_DEPTH_M = 0.30` is enforced on all road segments.
3. NetworkX properly flags `ROAD-MR760` and `ROAD-PUMPWELL-APP` as `CLOSED` and finds the detour `ROUTE-ALT-02` with $+8\text{ min}$.
4. Bilingual alert endpoints return clean Kannada text (UTF-8 encoded) matching the variable substitutions.
5. All JSON keys use `snake_case` exactly matching the schemas documented above.
