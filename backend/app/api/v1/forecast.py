"""
CoastGuard-AI API: /forecast/timeline
"""

from datetime import datetime, timedelta, timezone
from typing import Any, List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.data.gis_data import get_study_area_zones
from app.models.schemas import ForecastPoint
from app.services.external_data import (
    _parse_api_time,
    get_live_hydrometeo_conditions,
)
from app.services.ml_engine import ml_engine

router = APIRouter()


def _value_at_or_before(
    times: List[str],
    values: List[Any],
    target: datetime,
) -> float:
    available = [
        (_parse_api_time(timestamp), value)
        for timestamp, value in zip(times, values)
        if _parse_api_time(timestamp) <= target
        and value is not None
    ]
    if not available:
        raise HTTPException(
            status_code=503,
            detail="Forecast data does not cover the requested time.",
        )
    return float(available[-1][1] or 0.0)


def _value_nearest(
    times: List[str],
    values: List[Any],
    target: datetime,
) -> float:
    if not times or len(times) != len(values):
        raise HTTPException(status_code=503, detail="Marine forecast data is incomplete.")
    candidates = [
        (timestamp, value)
        for timestamp, value in zip(times, values)
        if value is not None
    ]
    if not candidates:
        raise HTTPException(status_code=503, detail="Marine forecast has no valid values.")
    timestamp, value = min(
        candidates,
        key=lambda row: abs((_parse_api_time(row[0]) - target).total_seconds()),
    )
    if abs((_parse_api_time(timestamp) - target).total_seconds()) > 90 * 60:
        raise HTTPException(
            status_code=503,
            detail="Marine forecast does not cover the requested time.",
        )
    return float(value)


def _rain_sum(
    times: List[str],
    values: List[Any],
    end: datetime,
    hours: int,
) -> float:
    start = end - timedelta(hours=hours)
    matching = [
        value
        for timestamp, value in zip(times, values)
        if start < _parse_api_time(timestamp) <= end
    ]
    if any(value is None for value in matching):
        raise HTTPException(status_code=503, detail="Weather forecast has missing rainfall values.")
    if len(matching) != hours:
        raise HTTPException(
            status_code=503,
            detail=f"Weather forecast does not cover the full trailing {hours}-hour window.",
        )
    total = sum(float(value) for value in matching)
    return round(total, 2)


@router.get("/forecast/timeline", response_model=List[ForecastPoint])
def get_forecast_timeline(
    study_area: str = Query("mangaluru", description="Target basin ('mangaluru' or 'udupi')"),
    zone_id: Optional[str] = Query(None, description="Optional zone ID or name"),
):
    """Runs the selected regional model over the live hourly weather and tide forecast."""
    env = get_live_hydrometeo_conditions(study_area)
    zones = get_study_area_zones(study_area)
    if zone_id:
        clean_zone_id = zone_id.lower().replace("-", " ")
        zone = next(
            (
                candidate
                for candidate in zones
                if candidate["zone_id"].lower() == clean_zone_id
                or candidate["zone_name"].lower() == clean_zone_id
            ),
            None,
        )
        if zone is None:
            raise HTTPException(status_code=404, detail=f"Unknown zone: {zone_id}")
    else:
        default_id = (
            "Zone 01" if study_area.lower() == "udupi" else "Zone 03"
        )
        zone = next(
            (candidate for candidate in zones if candidate["zone_id"] == default_id),
            zones[0],
        )

    rain_times = env["hourly_precipitation_times"]
    rainfall = env["hourly_precipitation"]
    marine_times = env["hourly_marine_times"]
    sea_levels = env["hourly_sea_level"]
    wave_heights = env["hourly_waves"]
    pressure = env["hourly_pressure"]
    wind = env["hourly_wind_speed"]
    feed_time = _parse_api_time(env["feed_timestamp"])

    offsets = [
        ("NOW", 0),
        ("+3H", 3),
        ("+6H", 6),
        ("+9H", 9),
        ("+12H", 12),
        ("+18H", 18),
        ("+24H", 24),
    ]
    forecasts = []
    for label, hours in offsets:
        target = feed_time + timedelta(hours=hours)
        rain_1h = _rain_sum(rain_times, rainfall, target, 1)
        tide = _value_nearest(marine_times, sea_levels, target)
        pressure_hpa = _value_at_or_before(rain_times, pressure, target)
        wind_kmh = _value_at_or_before(rain_times, wind, target)
        surge = max(0.0, (1013.25 - pressure_hpa) * 0.01 + wind_kmh * 0.0025)

        model_env = {
            **env,
            "rain_1h": rain_1h,
            "rain_3h": _rain_sum(rain_times, rainfall, target, 3),
            "rain_6h": _rain_sum(rain_times, rainfall, target, 6),
            "rain_24h": _rain_sum(rain_times, rainfall, target, 24),
            "antecedent_mm": _rain_sum(
                rain_times,
                rainfall,
                target - timedelta(hours=24),
                120,
            ),
            "antecedent_rain_3d": _rain_sum(
                rain_times,
                rainfall,
                target - timedelta(hours=24),
                72,
            ),
            "tide_m": tide,
            "tide_height": tide,
            "surge_m": round(surge, 2),
            "storm_surge": round(surge, 2),
            "tide_rain_interaction": round(rain_1h * tide, 2),
            "rain_tide_product": round(rain_1h * (tide + surge), 2),
            "river_discharge": env["river_discharge"],
        }
        prediction = ml_engine.predict_zone(
            zone,
            model_env,
            study_area=study_area,
        )
        forecasts.append(
            {
                "time_label": label,
                "target": target,
                "probability": prediction["p_flood"],
                "rain": rain_1h,
                "tide": tide,
                "surge": round(surge, 2),
                "depth": prediction["q50_depth"],
            }
        )

    peak_index = max(
        range(len(forecasts)),
        key=lambda index: forecasts[index]["probability"],
    )
    onset_index = next(
        (
            index
            for index, point in enumerate(forecasts)
            if point["probability"] >= 50
        ),
        None,
    )
    ist = timezone(timedelta(hours=5, minutes=30))
    points = []
    for index, forecast in enumerate(forecasts):
        if index == peak_index:
            notes = "Highest surrogate-predicted flood probability in this timeline."
        elif index == onset_index:
            notes = "Surrogate-predicted flood probability reaches 50%."
        else:
            notes = "Surrogate estimate from forecast rainfall, tide, and surge."
        points.append(
            ForecastPoint(
                time_label=forecast["time_label"],
                timestamp=forecast["target"].astimezone(ist).strftime("%H:%M IST"),
                flood_probability=forecast["probability"],
                rainfall_rate_mm_hr=round(forecast["rain"], 1),
                tide_level_m=round(forecast["tide"], 2),
                storm_surge_m=forecast["surge"],
                is_onset=index == onset_index,
                is_peak=index == peak_index,
                notes=notes,
            )
        )
    return points
