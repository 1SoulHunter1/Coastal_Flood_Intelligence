"""
Live hydrometeorological inputs from Open-Meteo weather, marine, and flood APIs.
"""

import time
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Tuple

import requests
from fastapi import HTTPException

from app.config import COORDINATES, EXTERNAL_CACHE_TTL_SECONDS

_cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}


def get_ist_time_str() -> str:
    """Returns formatted current Indian Standard Time (IST, UTC+5:30)."""
    ist = timezone(timedelta(hours=5, minutes=30))
    return datetime.now(ist).strftime("%H:%M IST")


def _fetch_json(url: str, source: str) -> Dict[str, Any]:
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        payload = response.json()
    except (requests.RequestException, ValueError) as exc:
        raise HTTPException(
            status_code=503,
            detail=f"{source} data is unavailable: {exc}",
        ) from exc
    if not isinstance(payload, dict):
        raise HTTPException(status_code=503, detail=f"{source} returned invalid data.")
    return payload


def _parse_api_time(value: str) -> datetime:
    parsed = datetime.fromisoformat(value)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def _hourly_rain_sum(
    times: List[str],
    values: List[Any],
    start: datetime,
    end: datetime,
) -> float:
    total = 0.0
    for timestamp, value in zip(times, values):
        hour = _parse_api_time(timestamp)
        if start < hour <= end:
            if value is None:
                raise ValueError(f"Missing hourly precipitation value at {timestamp}.")
            total += float(value)
    return round(total, 2)


def _fetch_live_meteo(lat: float, lon: float) -> Dict[str, Any]:
    """Fetches recent and forecast rainfall, pressure, and wind observations."""
    url = (
        "https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&"
        "current=precipitation,surface_pressure,wind_speed_10m,wind_direction_10m&"
        "hourly=precipitation,surface_pressure,wind_speed_10m&past_days=7&forecast_days=2"
    )
    try:
        payload = _fetch_json(url, "Open-Meteo weather")
        current = payload["current"]
        hourly = payload["hourly"]
        times = hourly["time"]
        hourly_rain = hourly["precipitation"]
        hourly_pressure = hourly["surface_pressure"]
        hourly_wind = hourly["wind_speed_10m"]
        now = _parse_api_time(current["time"])
        if not times or any(
            len(times) != len(values)
            for values in (hourly_rain, hourly_pressure, hourly_wind)
        ):
            raise ValueError("Hourly weather series is empty or malformed.")

        rain_1h = _hourly_rain_sum(times, hourly_rain, now - timedelta(hours=1), now)
        rain_3h = _hourly_rain_sum(times, hourly_rain, now - timedelta(hours=3), now)
        rain_6h = _hourly_rain_sum(times, hourly_rain, now - timedelta(hours=6), now)
        rain_24h = _hourly_rain_sum(times, hourly_rain, now - timedelta(hours=24), now)
        antecedent_mm = _hourly_rain_sum(
            times,
            hourly_rain,
            now - timedelta(days=6),
            now - timedelta(hours=24),
        )
        antecedent_3d = _hourly_rain_sum(
            times,
            hourly_rain,
            now - timedelta(days=4),
            now - timedelta(hours=24),
        )

        pressure = float(current["surface_pressure"])
        wind = float(current["wind_speed_10m"])
        wind_dir_deg = float(current["wind_direction_10m"])
        directions = [
            "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
            "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
        ]
        wind_dir = directions[int((wind_dir_deg + 11.25) / 22.5) % 16]
        surge_m = max(0.0, (1013.25 - pressure) * 0.01 + wind * 0.0025)

        if rain_1h > (rain_3h / 3.0) + 0.5:
            rainfall_status = "RISING"
        elif rain_1h < (rain_3h / 3.0) - 0.5:
            rainfall_status = "RECEDING"
        else:
            rainfall_status = "STEADY"

        return {
            "rain_1h": rain_1h,
            "rain_3h": rain_3h,
            "rain_6h": rain_6h,
            "rain_24h": rain_24h,
            "antecedent_mm": antecedent_mm,
            "antecedent_3d": antecedent_3d,
            "rainfall_status": rainfall_status,
            "pressure_hpa": round(pressure, 1),
            "wind_speed_kmh": round(wind, 1),
            "wind_direction": wind_dir,
            "storm_surge_m": round(surge_m, 2),
            "hourly_precipitation": hourly_rain,
            "hourly_precipitation_times": times,
            "hourly_pressure": hourly_pressure,
            "hourly_wind_speed": hourly_wind,
            "current_time": now.isoformat(),
        }
    except HTTPException:
        raise
    except (KeyError, TypeError, ValueError, IndexError) as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Open-Meteo weather data is malformed: {exc}",
        ) from exc


def _fetch_live_marine(lat: float, lon: float) -> Dict[str, Any]:
    """Fetches sea level and wave observations/forecasts."""
    url = (
        "https://marine-api.open-meteo.com/v1/marine?"
        f"latitude={lat}&longitude={lon}&"
        "current=sea_level_height_msl,wave_height&"
        "hourly=sea_level_height_msl,wave_height&past_days=1&forecast_days=2"
    )
    try:
        payload = _fetch_json(url, "Open-Meteo marine")
        current = payload["current"]
        hourly = payload["hourly"]
        times = hourly["time"]
        sea_levels = hourly["sea_level_height_msl"]
        waves = hourly["wave_height"]
        if not times or len(times) != len(sea_levels) or len(times) != len(waves):
            raise ValueError("Hourly marine series is empty or malformed.")

        tide = float(current["sea_level_height_msl"])
        wave = float(current["wave_height"])
        now = _parse_api_time(current["time"])
        prior = None
        following = None
        for timestamp, level in zip(times, sea_levels):
            hour = _parse_api_time(timestamp)
            if hour <= now:
                prior = float(level)
            elif following is None:
                following = float(level)
        if prior is not None and following is not None:
            if tide >= prior and tide >= following:
                tide_status = "HIGH TIDE"
            elif tide <= prior and tide <= following:
                tide_status = "LOW TIDE"
            elif following < prior:
                tide_status = "EBB TIDE"
            else:
                tide_status = "SLACK TIDE"
        else:
            tide_status = "SLACK TIDE"

        return {
            "wave_height_m": round(wave, 2),
            "tide_height_m": round(tide, 2),
            "tide_status": tide_status,
            "hourly_waves": waves,
            "hourly_sea_level": sea_levels,
            "hourly_marine_times": times,
        }
    except HTTPException:
        raise
    except (KeyError, TypeError, ValueError, IndexError) as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Open-Meteo marine data is malformed: {exc}",
        ) from exc


def _fetch_live_river_flow(lat: float, lon: float) -> Dict[str, Any]:
    """Fetches forecast river discharge from the Open-Meteo Flood API."""
    url = (
        "https://flood-api.open-meteo.com/v1/flood?"
        f"latitude={lat}&longitude={lon}&daily=river_discharge&forecast_days=2"
    )
    try:
        payload = _fetch_json(url, "Open-Meteo flood")
        discharges = payload["daily"]["river_discharge"]
        if not discharges or discharges[0] is None:
            raise ValueError("River discharge series has no current value.")
        primary_flow = round(float(discharges[0]), 1)
        return {
            "primary_discharge_m3s": primary_flow,
            "daily_discharges": discharges,
        }
    except HTTPException:
        raise
    except (KeyError, TypeError, ValueError, IndexError) as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Open-Meteo flood data is malformed: {exc}",
        ) from exc


def get_live_hydrometeo_conditions(study_area: str = "mangaluru") -> Dict[str, Any]:
    """
    Fetches or returns briefly cached live environmental conditions for a basin.
    """
    area_key = "udupi" if study_area.lower() == "udupi" else "mangaluru"
    now = time.time()

    if area_key in _cache:
        cached_time, cached_data = _cache[area_key]
        if now - cached_time < EXTERNAL_CACHE_TTL_SECONDS:
            return cached_data

    coords = COORDINATES[area_key]
    meteo = _fetch_live_meteo(coords["lat"], coords["lon"])
    marine = _fetch_live_marine(coords["lat"], coords["lon"])
    river = _fetch_live_river_flow(
        coords["lat"],
        coords["lon"],
    )
    provider_time = _parse_api_time(meteo["current_time"]).astimezone(
        timezone(timedelta(hours=5, minutes=30))
    )

    combined = {
        "study_area": area_key,
        "region_name": coords["displayName"],
        "weather_source": "Open-Meteo Weather API · nearest grid estimate",
        "marine_source": "Open-Meteo Marine API · nearest grid estimate",
        "river_source": "Open-Meteo Flood API · daily discharge grid forecast",
        "feed_timestamp_ist": provider_time.strftime("%Y-%m-%d %H:%M IST"),
        "observed_rainfall_rate_mm_hr": meteo["rain_1h"],
        "rainfall_24h_total_mm": meteo["rain_24h"],
        "rainfall_status": meteo["rainfall_status"],
        "tide_level_m": marine["tide_height_m"],
        "tide_status": marine["tide_status"],
        "storm_surge_m": meteo["storm_surge_m"],
        "wind_speed_kmh": meteo["wind_speed_kmh"],
        "wind_direction": meteo["wind_direction"],
        "river_discharge_m3s": river["primary_discharge_m3s"],
        "rain_1h": meteo["rain_1h"],
        "rain_3h": meteo["rain_3h"],
        "rain_6h": meteo["rain_6h"],
        "rain_24h": meteo["rain_24h"],
        "antecedent_mm": meteo["antecedent_mm"],
        "antecedent_rain_3d": meteo["antecedent_3d"],
        "tide_m": marine["tide_height_m"],
        "surge_m": meteo["storm_surge_m"],
        "tide_height": marine["tide_height_m"],
        "storm_surge": meteo["storm_surge_m"],
        "river_discharge": river["primary_discharge_m3s"],
        "tide_rain_interaction": round(
            meteo["rain_1h"] * marine["tide_height_m"],
            2,
        ),
        "rain_tide_product": round(
            meteo["rain_1h"]
            * (marine["tide_height_m"] + meteo["storm_surge_m"]),
            2,
        ),
        "hourly_precipitation": meteo["hourly_precipitation"],
        "hourly_precipitation_times": meteo["hourly_precipitation_times"],
        "hourly_pressure": meteo["hourly_pressure"],
        "hourly_wind_speed": meteo["hourly_wind_speed"],
        "hourly_waves": marine["hourly_waves"],
        "hourly_sea_level": marine["hourly_sea_level"],
        "hourly_marine_times": marine["hourly_marine_times"],
        "feed_timestamp": meteo["current_time"],
    }

    _cache[area_key] = (now, combined)
    return combined
