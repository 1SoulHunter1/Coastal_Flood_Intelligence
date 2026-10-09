# CoastGuard-AI: Real-Time Operational Backend Engine

This is the production-grade, real-time FastAPI backend powering the **CoastGuard-AI** coastal flood intelligence and emergency response control room.

---

## 1. Quick Start

### Start the Backend Server:
```bash
python main.py
```
Or:
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Swagger Interactive API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

## 2. Data Inputs and Refresh

| Metric | Source & API Provider | Measurement Unit |
|---|---|---|
| **Rainfall and weather forecast** | Open-Meteo Weather API; hourly windows are calculated from provider timestamps | `mm` per 1/3/6/24h window |
| **Antecedent rainfall** | Open-Meteo hourly series; preceding five days, excluding the most recent 24h | `mm` |
| **Sea level/tide and waves** | Open-Meteo Marine API (`sea_level_height_msl`) | `m` MSL |
| **Storm surge estimate** | Inverse-barometer and wind-setup formula using Open-Meteo pressure/wind | `m` |
| **River discharge** | Open-Meteo Flood API forecast | `m³/s` |
| **Terrain and land-cover model features** | One-time Copernicus DEM GLO-30, ESA WorldCover 2021, and HydroRIVERS v10 import; persisted in `app/data/static_gis.sqlite` | Elevation, HAND proxy, slope, imperviousness, curve number, distances |
| **Road Network** | OpenStreetMap (OSM) via NetworkX | Polylines, Edges, Safety Threshold $\ge 0.30\text{m}$ |

Dynamic provider data is cached in memory for three minutes. If a required provider
fails or returns malformed data, the API returns HTTP 503 rather than substituting
hard-coded weather or tide readings. Rainfall and sea level are nearest-grid API
estimates, not IMD/INCOIS gauge observations. River discharge is an Open-Meteo daily
grid forecast, not a CWC gauge observation. No synthetic secondary-river flow is
shown. Dynamic weather and marine data are not written to the static GIS database.
The marine API tide value is currently passed as MSL; the notebook describes
`tide_m` relative to chart datum. A local datum conversion has not been configured,
so the tide feature needs datum calibration before operational use.

### Static GIS import and limitations

`app/data/static_gis.sqlite` contains per-zone features imported from Copernicus
DEM GLO-30, ESA WorldCover 2021, and HydroRIVERS v10. The original source
downloads are cached under `backend/data/static_gis_sources`; rebuild the store
from the `backend` directory with:

```bash
python -m scripts.build_static_gis
```

This is a one-time/static import and does not freeze or replace the live feeds.
The supplied study-zone polygons remain provisional and embedded in
`app/data/gis_data.py`; exposure counts are also not independently sourced.
SoilGrids WCS was unavailable during the import, so curve number uses the
evaluation notebook's near-uniform HSG-D assumption and a land-cover lookup.
The `hand_min` and `hand_mean` values are explicitly approximate: elevation
above the nearest mapped HydroRIVERS channel, not flow-connected HAND.
`dist_to_coast_m` is estimated from zero-elevation DEM cells connected to the
west edge of the DEM tile; connected estuaries can therefore affect this proxy.

The new values are aggregated over the existing zone polygons, not the
evaluation notebook's H3 resolution-8 training cells. Consequently these
features may not match the model's training feature-generation semantics;
the source model remains simulator-evaluated for Mangaluru, and Udupi remains
an unvalidated regional transfer. This import is not evidence of real-world
forecast accuracy.

### Continuous monitoring and officer notifications

When the FastAPI service is running, a background task checks both study areas
every three minutes (configurable with
`COASTGUARD_MONITOR_INTERVAL_SECONDS`, minimum 60 seconds). It records an
officer review message when a zone newly crosses the current model rule
(`p_flood >= 80%` or `q50_depth >= 0.38 m`). Repeated high readings do not
create repeated messages; a zone must return below both thresholds and cross
again to create another event. Provider/model failures are logged and retried
on the next cycle.

Messages are persisted to `backend/data/demo_officer_inbox.sqlite` and visible
in the dashboard's duty-officer inbox. To deliver email outside the dashboard,
configure `COASTGUARD_SMTP_HOST`, `COASTGUARD_SMTP_PORT`,
`COASTGUARD_SMTP_FROM`, and `COASTGUARD_OFFICER_EMAIL`; optional SMTP login
uses `COASTGUARD_SMTP_USERNAME` and `COASTGUARD_SMTP_PASSWORD`. Without valid
SMTP configuration, notifications are **in-app only** and cannot wake an
unattended officer. This project does not integrate with SACHET/CBS and does
not send public broadcasts.

The header's **Demo Alert** button opens a compact officer-inbox popup, runs
synthetic rainfall and tide inputs through the surrogate for every zone, and
updates the map and zone-analysis tabs with clearly marked demo estimates. The
what-if tab uses the same synthetic baseline. The demo message is stored in the
same inbox; it never dispatches a public alert.

---

## 3. Machine Learning Architecture: LightGBM Multi-Quantile Surrogate

`app/services/ml_engine.py` loads the supplied
`surrogate_model.pkl` artifact at the repository root for both study areas. Its
**17 features** are:

- Static: `hand_min`, `hand_mean`, `elevation_mean`, `elevation_min`, `slope_mean`,
  `curve_number`, `impervious_ratio`, `dist_to_river_m`, `dist_to_coast_m`
- Dynamic: `rain_1h`, `rain_3h`, `rain_6h`, `rain_24h`, `antecedent_mm`, `tide_m`,
  `surge_m`, `rain_tide_product`

The model bundle contains a binary flood classifier and independent q10/q50/q90
LightGBM quantile regressors. Quantile outputs are sorted to enforce
`q10 <= q50 <= q90`. The artifact and evaluation notebook cover Mangaluru only.
Applying this model to Udupi is an unvalidated regional transfer, not a
Udupi-trained or Udupi-validated prediction.

The notebook's reported metrics are measured against held-out physics-simulator
labels, not observed flood events. They are surrogate-fidelity metrics and must
not be interpreted as real-world flood forecast accuracy.

### Outputs:
- **Head 1 (Binary Classifier)**: $P(\text{Flood}) \in [0, 100\%]$
- **Head 2 (Pinball Loss Quantile Regressors)**: $q_{10}$, $q_{50}$ (expected median), $q_{90}$ inundation depth in meters
- **Safety Closure Rule**: Road status is `CLOSED` when $q_{50} \ge 0.30\text{ m}$.

---

## 4. API Endpoints Directory

### Operational Telemetry & Environmental Status:
- `GET /api/v1/environment/current?study_area=mangaluru|udupi`
- `GET /api/v1/operational-summary?region=mangaluru|udupi`

### Zone Hydrodynamic Intelligence:
- `GET /api/v1/zones?study_area=mangaluru|udupi`
- `GET /api/v1/zones/{zone_id}?study_area=mangaluru|udupi`
- `GET /api/v1/zones/summary?study_area=mangaluru|udupi`
- `GET /api/v1/zone-analysis/{zone_id}?region=mangaluru|udupi`
- `GET /api/v1/zone-prediction?zone=Kulur&region=mangaluru|udupi`

### Forecast Progression:
- `GET /api/v1/forecast/timeline?study_area=mangaluru|udupi`

### Infrastructure & Road Network:
- `GET /api/v1/infrastructure/summary?study_area=mangaluru|udupi`
- `GET /api/v1/infrastructure/facilities?study_area=mangaluru|udupi`
- `GET /api/v1/infrastructure/roads?study_area=mangaluru|udupi`

### NetworkX Emergency Routing:
- `GET /api/v1/routing/roads-impact?study_area=mangaluru|udupi`
- `GET /api/v1/routing/blocked-roads?study_area=mangaluru|udupi`
- `GET /api/v1/routing/hospitals-accessibility?study_area=mangaluru|udupi`
- `GET /api/v1/routing/shelters-accessibility?study_area=mangaluru|udupi`
- `GET /api/v1/routing/nearest-shelter?study_area=mangaluru|udupi`
- `GET /api/v1/routing/alternative-route?study_area=mangaluru|udupi`
- `GET /api/v1/routing/system-access-summary?study_area=mangaluru|udupi`

### Scenario Analysis & Tactical Briefings:
- `POST /api/v1/analysis/what-if`
- `POST /api/v1/demo/what-if` (counterfactual from the synthetic demo baseline)
- `GET /api/v1/emergency/priority-table?study_area=mangaluru|udupi`
- `GET /api/v1/emergency/responder-briefing?study_area=mangaluru|udupi`
- `GET /api/v1/emergency/situation-brief?study_area=mangaluru|udupi`

### Public Warning Bulletins:
- `GET /api/v1/alerts/active?study_area=mangaluru|udupi`
- `GET /api/v1/alerts/public-template?study_area=mangaluru|udupi` (Bilingual English + Kannada)
