"""Read the one-time, source-derived static GIS feature store."""

import sqlite3
from pathlib import Path
from typing import Any


STATIC_GIS_DB = Path(__file__).with_name("static_gis.sqlite")
STATIC_FEATURES = (
    "hand_min",
    "hand_mean",
    "elevation_mean",
    "elevation_min",
    "slope_mean",
    "curve_number",
    "impervious_ratio",
    "dist_to_river_m",
    "dist_to_coast_m",
)


def load_static_features(study_area: str) -> dict[str, dict[str, Any]]:
    """Return persisted static terrain features indexed by zone ID."""
    if not STATIC_GIS_DB.is_file():
        raise RuntimeError(
            f"Static GIS feature store is missing: {STATIC_GIS_DB}. "
            "Build it with `python -m scripts.build_static_gis` from backend."
        )

    columns = ", ".join(f'"{name}"' for name in STATIC_FEATURES)
    uri = f"{STATIC_GIS_DB.as_uri()}?mode=ro"
    try:
        with sqlite3.connect(uri, uri=True) as connection:
            rows = connection.execute(
                f"SELECT zone_id, {columns} FROM zone_features "
                "WHERE study_area = ?",
                (study_area,),
            ).fetchall()
    except sqlite3.Error as error:
        raise RuntimeError(f"Could not read static GIS feature store: {error}") from error

    if not rows:
        raise RuntimeError(
            f"Static GIS feature store has no zone data for {study_area!r}."
        )

    return {
        row[0]: dict(zip(STATIC_FEATURES, row[1:]))
        for row in rows
    }
