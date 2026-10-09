"""
CoastGuard-AI: Application Configuration & Constants
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Coordinates for target coastal basins
COORDINATES = {
    "mangaluru": {
        "lat": 12.9141,
        "lon": 74.8560,
        "name": "Mangaluru",
        "displayName": "Mangaluru (Mangalore)",
        "default_zone_id": "Zone 03"
    },
    "udupi": {
        "lat": 13.3409,
        "lon": 74.7421,
        "name": "Udupi",
        "displayName": "Udupi",
        "default_zone_id": "Zone 01"
    }
}

# Road Safety Thresholds (in meters)
ROAD_CLOSURE_DEPTH_M = 0.30
ROAD_AT_RISK_DEPTH_M = 0.15

# The supplied surrogate is trained/evaluated on Mangaluru simulator data.
# Udupi uses it as an unvalidated regional transfer, not a Udupi-validated model.
MODEL_PATH = os.environ.get("COASTGUARD_MODEL_PATH", str(BASE_DIR / "surrogate_model.pkl"))

# Cache TTL (seconds) for external API calls to avoid rate limiting
EXTERNAL_CACHE_TTL_SECONDS = 180  # 3 minutes

# API namespace
API_PREFIX = "/api/v1"
