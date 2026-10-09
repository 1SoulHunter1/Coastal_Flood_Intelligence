"""
CoastGuard-AI API: /environment/current
"""

from fastapi import APIRouter, Query
from app.models.schemas import EnvironmentConditions
from app.services.external_data import get_live_hydrometeo_conditions

router = APIRouter()

@router.get("/environment/current", response_model=EnvironmentConditions)
def get_current_environment(
    study_area: str = Query("mangaluru", description="Target coastal basin ('mangaluru' or 'udupi')")
):
    """
    Returns provider-derived environmental estimates from Open-Meteo APIs.
    """
    data = get_live_hydrometeo_conditions(study_area)

    return EnvironmentConditions(
        observed_rainfall_rate_mm_hr=data["observed_rainfall_rate_mm_hr"],
        rainfall_24h_total_mm=data["rainfall_24h_total_mm"],
        rainfall_status=data["rainfall_status"],
        tide_level_m=data["tide_level_m"],
        tide_status=data["tide_status"],
        storm_surge_m=data["storm_surge_m"],
        wind_speed_kmh=data["wind_speed_kmh"],
        wind_direction=data["wind_direction"],
        river_discharge_m3s=data["river_discharge_m3s"],
        weather_source=data["weather_source"],
        marine_source=data["marine_source"],
        river_source=data["river_source"],
        feed_timestamp_ist=data["feed_timestamp_ist"],
    )
