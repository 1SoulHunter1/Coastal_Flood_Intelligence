# CoastGuard-AI — Frontend Foundation

**AI-Powered Coastal Flood Intelligence & Emergency Response System**  
**Study Area:** Mangaluru (Mangalore), Karnataka, India  
**Hackathon:** AI for Coastal Flood Intelligence  

---

## 🏛 Overview

CoastGuard-AI is an operational Coastal Flood Emergency Operations and GIS Intelligence Command Center frontend built with React, TypeScript, Vite, Tailwind CSS, React-Leaflet, Recharts, and Lucide React.

It is designed for emergency managers, the District Disaster Management Authority (DDMA), the Indian Coast Guard, and local municipalities to monitor, forecast, and respond to coastal inundation, tidal surges, and monsoonal river discharge across the Mangaluru estuary system (Netravati and Gurupura/Phalguni rivers).

> **Data mode:** The app requests its operational telemetry, zones, timeline, and
> what-if results from the FastAPI backend. Demo fixture fallback is disabled by
> default; set `VITE_ENABLE_DEMO_FALLBACK=true` only when intentionally running a
> demo. Additional map overlays are marked as demo and hidden unless that flag is
> enabled. Backend zone boundaries and terrain attributes are still embedded
> constants and are not yet an authoritative, persistently refreshed GIS dataset.

---

## 🎨 Professional Design System

- **Aesthetic:** Clean, high-density government operations / GIS intelligence command center. No generic admin templates, no cyberpunk gimmicks.
- **Palette:**
  - Base: Deep Navy (`#070D1E`, `#0B132B`, `#12234B`), White, and Light Grey.
  - Accent: Government Blue (`#1D4ED8`, `#2563EB`).
  - Risk Standard:
    - **CRITICAL** → Red (`#DC2626`)
    - **HIGH** → Orange (`#EA580C`)
    - **MODERATE** → Yellow/Amber (`#D97706`)
    - **LOW** → Green (`#16A34A`)
- **Desktop First:** Tailored for 1366×768, 1440×900, and 1920×1080 operational displays with zero horizontal scrolling.

---

## 📁 Frontend Architecture

```
frontend/
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx             # Operation center title, IST clock & status indicators
│   │   │   ├── Sidebar.tsx            # Navigation and system status indicators
│   │   │   └── Layout.tsx             # Responsive desktop-first layout container
│   │   ├── dashboard/
│   │   │   ├── KpiCard.tsx            # Reusable operational KPI card
│   │   │   ├── EnvironmentSection.tsx # Section 1: 4 Environment condition telemetry cards
│   │   │   ├── SelectedZonePanel.tsx  # Section 3: Selected zone deep telemetry
│   │   │   ├── RiskDrivers.tsx        # Section 4: Model factor attribution bars
│   │   │   ├── ForecastChart.tsx      # Section 5: Recharts 24-hour flood forecast
│   │   │   ├── InfrastructureImpact.tsx # Section 6: Infrastructure vulnerability counters
│   │   │   ├── EmergencyPriorityTable.tsx # Section 7: Ranked priority response table
│   │   │   ├── AlertPanel.tsx         # Section 8: Active flood warning notices
│   │   │   ├── SituationBrief.tsx     # Section 9: Official situation brief narrative
│   │   │   ├── RiskBadge.tsx          # Reusable risk badge
│   │   │   └── StatusBadge.tsx        # Operational state badge
│   │   ├── map/
│   │   │   ├── FloodMap.tsx           # Interactive React-Leaflet GIS workstation
│   │   │   ├── MapLegend.tsx          # Hydrology & risk symbology legend
│   │   │   ├── MapLayerControl.tsx    # Interactive GIS layer toggles and reset view
│   │   │   └── ZonePopup.tsx          # Zone polygon inspection popup
│   │   ├── charts/
│   │   │   └── ForecastChart.tsx      # Re-export / modular chart container
│   │   ├── alerts/
│   │   │   └── AlertPanel.tsx         # Re-export / modular alerts container
│   │   ├── infrastructure/
│   │   │   └── InfrastructureImpact.tsx # Re-export / modular infrastructure container
│   │   └── emergency/
│   │       └── EmergencyPriorityTable.tsx # Re-export / modular priority table
│   │
│   ├── pages/
│   │   ├── Overview.tsx               # Main operational command center
│   │   ├── FloodRiskMap.tsx           # Expanded GIS spatial workstation
│   │   ├── ZoneAnalysis.tsx           # 7-Zone comparative vulnerability matrix
│   │   ├── Timeline.tsx               # 24-Hour hydrodynamic timeline scrubber
│   │   ├── Infrastructure.tsx         # Critical lifeline facilities & roads audit
│   │   ├── EmergencyResponse.tsx      # Incident command & fleet staging board
│   │   ├── Alerts.tsx                 # CAP-compliant warning bulletins
│   │   └── Reports.tsx                # Formal SITREP document generator
│   │
│   ├── data/
│   │   └── demo/
│   │       ├── zones.ts               # 7 Mangaluru zones data & polygon boundaries
│   │       ├── alerts.ts              # Active emergency alerts
│   │       ├── forecast.ts            # 24-Hour forecast hydro-timesteps
│   │       ├── infrastructure.ts      # Facilities & road segment inventory
│   │       ├── riskDrivers.ts         # Model explanation factor weights
│   │       ├── emergencyPriority.ts   # Ranked prioritization matrix
│   │       ├── environment.ts         # Real-time environmental telemetry
│   │       ├── situationBrief.ts      # Structured command SITREP brief
│   │       └── gisLayers.ts           # GeoJSON river lines and NH-66 highway network
│   │
│   ├── types/
│   │   └── index.ts                   # Strict TypeScript domain contracts
│   ├── services/
│   │   └── api.ts                     # API-ready service functions (ready for FastAPI)
│   ├── hooks/
│   │   └── useFloodIntelligence.ts    # Centralized state & telemetry hook
│   ├── utils/
│   │   └── index.ts                   # Formatting and color utility helpers
│   ├── App.tsx                        # Root application & routing
│   ├── main.tsx                       # Entrypoint
│   └── index.css                      # Tailwind base & custom map CSS
│
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Running Locally

```bash
# In Windows PowerShell:
cd frontend
npm.cmd install
npm.cmd run dev
```

To build production bundle:
```bash
npm.cmd run build
```

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the FastAPI backend.
Keep `VITE_ENABLE_DEMO_FALLBACK=false` for live operation; with demo fallback
disabled, API errors are surfaced instead of being replaced with static fixtures.
The Overview and Timeline refresh their live backend data every three minutes.

---

## 🌊 7 Monitored Mangaluru Zones

1. **Zone 03 — Kulur** (Priority 1 • High Risk 82% • Gurupura estuary & NH-66 bridge crossing)
2. **Zone 05 — Bunder** (Priority 2 • High Risk 78% • Old Port wharf & fisheries market)
3. **Zone 01 — Ullal** (Priority 3 • High Risk 75% • Coastal spit & southern Netravati mouth)
4. **Zone 02 — Bolar** (Priority 4 • Moderate Risk 64% • River confluence jetties)
5. **Zone 04 — Hampankatta** (Priority 5 • Moderate Risk 42% • Central commercial district)
6. **Zone 06 — Kankanady** (Priority 6 • Low Risk 35% • Transit corridor & healthcare apex)
7. **Zone 07 — Deralakatte** (Priority 7 • Low Risk 18% • Elevated inland medical plateau)
