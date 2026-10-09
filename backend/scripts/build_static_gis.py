"""Download source GIS layers once and persist model static inputs by zone."""

from __future__ import annotations

import os
import json
import sqlite3
import tempfile
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import geopandas as gpd
import numpy as np
import rasterio
import requests
from rasterio.features import geometry_mask, geometry_window, rasterize
from rasterio.enums import Resampling
from rasterio.warp import reproject
from rasterio.windows import from_bounds
from scipy import ndimage
from shapely.geometry import Polygon, mapping
from shapely.ops import unary_union

from app.data.gis_data import MANGALURU_ZONES_GIS, UDUPI_ZONES_GIS
from app.data.static_gis_store import STATIC_FEATURES, STATIC_GIS_DB


BACKEND_DIR = Path(__file__).resolve().parents[1]
SOURCE_DIR = BACKEND_DIR / "data" / "static_gis_sources"
DEM_BASE_URL = "https://copernicus-dem-30m.s3.amazonaws.com"
WORLD_COVER_URL = (
    "https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/"
    "ESA_WorldCover_10m_2021_v200_N12E072_Map.tif"
)
HYDRORIVERS_URL = (
    "https://data.hydrosheds.org/file/HydroRIVERS/"
    "HydroRIVERS_v10_as_shp.zip"
)
SOURCES = {
    "copernicus_dem": DEM_BASE_URL,
    "esa_worldcover": WORLD_COVER_URL,
    "hydrorivers": HYDRORIVERS_URL,
}
MODEL_FEATURE_NOTE = (
    "New per-zone aggregation; not the missing H3 resolution-8 training pipeline. "
    "HAND is approximated from elevation above the nearest mapped HydroRIVERS cell. "
    "Coast distance uses zero-elevation Copernicus DEM cells connected to the "
    "western tile edge as a coastal-water proxy, which may include estuaries. "
    "Curve number uses the notebook's near-uniform HSG-D assumption; SoilGrids "
    "WCS was unavailable during import."
)


def _download(url: str, destination: Path) -> None:
    if destination.is_file() and destination.stat().st_size > 0:
        return
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(destination.suffix + ".part")
    try:
        with requests.get(url, stream=True, timeout=(30, 180)) as response:
            response.raise_for_status()
            with temporary.open("wb") as output:
                for chunk in response.iter_content(chunk_size=1024 * 1024):
                    if chunk:
                        output.write(chunk)
        temporary.replace(destination)
    except requests.RequestException as error:
        temporary.unlink(missing_ok=True)
        raise RuntimeError(f"Could not download static GIS source {url}: {error}") from error


def _zone_polygon(zone: dict[str, Any]) -> Polygon:
    return Polygon([(lon, lat) for lat, lon in zone["coordinates"]])


def _download_sources() -> tuple[list[Path], Path, Path]:
    dem_paths = []
    for latitude in (12, 13):
        tile = f"Copernicus_DSM_COG_10_N{latitude:02d}_00_E074_00_DEM"
        url = f"{DEM_BASE_URL}/{tile}/{tile}.tif"
        destination = SOURCE_DIR / f"{tile}.tif"
        _download(url, destination)
        dem_paths.append(destination)

    world_cover = SOURCE_DIR / Path(WORLD_COVER_URL).name
    hydrorivers = SOURCE_DIR / Path(HYDRORIVERS_URL).name
    _download(WORLD_COVER_URL, world_cover)
    _download(HYDRORIVERS_URL, hydrorivers)
    return dem_paths, world_cover, hydrorivers


def _load_rivers(path: Path, area_bounds: tuple[float, float, float, float]):
    with zipfile.ZipFile(path) as archive:
        shapefile = next(
            name for name in archive.namelist()
            if name.lower().endswith(".shp") and "hydrorivers_v10_as" in name.lower()
        )
    rivers = gpd.read_file(f"zip://{path}!{shapefile}", bbox=area_bounds)
    if rivers.crs is None:
        raise RuntimeError("HydroRIVERS shapefile is missing its CRS.")
    return rivers.to_crs("EPSG:4326")


def _dem_features(
    dem_paths: list[Path],
    polygon: Polygon,
    rivers_wgs84: gpd.GeoDataFrame,
    world_cover_path: Path,
) -> dict[str, float]:
    latitude, longitude = polygon.centroid.y, polygon.centroid.x
    tile_path = next(
        path for path in dem_paths
        if f"N{int(latitude):02d}_00_E{int(longitude):03d}_00" in path.name
    )
    with rasterio.open(tile_path) as source:
        window = geometry_window(source, [mapping(polygon)], pad_x=2, pad_y=2)
        elevation = source.read(1, window=window).astype(np.float64)
        transform = source.window_transform(window)
        world_cover = np.zeros(elevation.shape, dtype=np.uint8)
        with rasterio.open(world_cover_path) as cover_source:
            reproject(
                source=rasterio.band(cover_source, 1),
                destination=world_cover,
                src_transform=cover_source.transform,
                src_crs=cover_source.crs,
                src_nodata=0,
                dst_transform=transform,
                dst_crs=source.crs,
                dst_nodata=0,
                resampling=Resampling.nearest,
            )
        inside = geometry_mask(
            [mapping(polygon)],
            out_shape=elevation.shape,
            transform=transform,
            invert=True,
        )
        land = (
            np.isfinite(elevation)
            & (elevation > 0)
            & (world_cover != 0)
            & (world_cover != 80)
        )
        valid = inside & land
        if not np.any(valid):
            raise RuntimeError(f"DEM has no valid pixels inside {polygon.wkt}.")
        coast_distance = _coast_distance_from_dem(source, polygon)

        nearest_land = ndimage.distance_transform_edt(
            ~land, return_distances=False, return_indices=True
        )
        land_elevation = elevation[nearest_land[0], nearest_land[1]]
        metres_per_degree_x = 111320.0 * np.cos(np.deg2rad(latitude))
        metres_per_degree_y = 110574.0
        dz_dy, dz_dx = np.gradient(
            land_elevation,
            abs(transform.e) * metres_per_degree_y,
            abs(transform.a) * metres_per_degree_x,
        )
        slope = np.degrees(np.arctan(np.hypot(dz_dx, dz_dy)))

        nearby = rivers_wgs84[rivers_wgs84.intersects(polygon.buffer(0.1))]
        if nearby.empty:
            raise RuntimeError(
                f"HydroRIVERS has no mapped channel within about 11 km of {polygon.wkt}."
            )
        river_mask = rasterize(
            ((geometry, 1) for geometry in nearby.geometry if geometry is not None),
            out_shape=elevation.shape,
            transform=transform,
            fill=0,
            dtype="uint8",
        ).astype(bool)
        if not river_mask.any():
            raise RuntimeError("Nearby HydroRIVERS reaches do not intersect the DEM window.")
        nearest_indices = ndimage.distance_transform_edt(
            ~river_mask, return_distances=False, return_indices=True
        )
        channel_elevation = np.maximum(
            elevation[nearest_indices[0], nearest_indices[1]], 0.0
        )
        relative_height = np.maximum(
            land_elevation - channel_elevation, 0.0
        )

        polygon_utm = gpd.GeoSeries([polygon], crs="EPSG:4326").to_crs(
            "EPSG:32643"
        ).iloc[0]
        nearby_utm = nearby.to_crs("EPSG:32643")
        distance_to_river = float(polygon_utm.distance(unary_union(nearby_utm.geometry)))

        return {
            "elevation_mean": float(np.mean(elevation[valid])),
            "elevation_min": float(np.min(elevation[valid])),
            "slope_mean": float(np.mean(slope[valid])),
            "hand_mean": float(np.mean(relative_height[valid])),
            "hand_min": float(np.min(relative_height[valid])),
            "dist_to_river_m": distance_to_river,
            "dist_to_coast_m": coast_distance,
        }


def _worldcover_features(path: Path, polygon: Polygon) -> dict[str, float]:
    with rasterio.open(path) as source:
        window = geometry_window(source, [mapping(polygon)])
        cover = source.read(1, window=window)
        transform = source.window_transform(window)
        inside = geometry_mask(
            [mapping(polygon)],
            out_shape=cover.shape,
            transform=transform,
            invert=True,
        )
        classes = cover[inside & (cover != 0)]
        if classes.size == 0:
            raise RuntimeError("WorldCover has no pixels inside a study zone.")

        built_up_fraction = float(np.mean(classes == 50))
        counts = np.unique(classes, return_counts=True)
        pixels = dict(zip(counts[0].tolist(), counts[1].tolist()))
        hsg_d_curve_number = {
            10: 77.0, 20: 79.0, 30: 84.0, 40: 91.0, 50: 98.0,
            60: 89.0, 70: 100.0, 80: 100.0, 90: 100.0, 95: 100.0,
            100: 85.0,
        }
        known = [(value, count) for code, count in pixels.items()
                 if (value := hsg_d_curve_number.get(int(code))) is not None]
        if not known:
            raise RuntimeError("No recognized ESA WorldCover class in a study zone.")
        curve_number = sum(value * count for value, count in known) / sum(
            count for _, count in known
        )

    return {
        "impervious_ratio": built_up_fraction,
        "curve_number": float(curve_number),
    }


def _coast_distance_from_dem(source: rasterio.io.DatasetReader, polygon: Polygon) -> float:
    """Estimate coast distance to zero-elevation DEM cells connected to tile west."""
    _, min_y, max_x, max_y = polygon.bounds
    window = from_bounds(
        source.bounds.left,
        max(source.bounds.bottom, min_y - 0.02),
        min(source.bounds.right, max_x + 0.01),
        min(source.bounds.top, max_y + 0.02),
        source.transform,
    ).round_offsets().round_lengths()
    elevation = source.read(1, window=window)
    transform = source.window_transform(window)
    ocean_candidates = elevation == 0
    labels, _ = ndimage.label(
        ocean_candidates, structure=np.ones((3, 3), dtype=np.uint8)
    )
    sea_labels = np.unique(labels[:, 0])
    sea_labels = sea_labels[sea_labels != 0]
    if sea_labels.size == 0:
        raise RuntimeError("Copernicus DEM has no zero-elevation sea cells at tile west.")
    sea = np.isin(labels, sea_labels)
    pixel_x = abs(transform.a) * 111320.0 * np.cos(np.deg2rad(polygon.centroid.y))
    pixel_y = abs(transform.e) * 110574.0
    distances = ndimage.distance_transform_edt(
        ~sea, sampling=(pixel_y, pixel_x)
    )
    zone_mask = geometry_mask(
        [mapping(polygon)],
        out_shape=elevation.shape,
        transform=transform,
        invert=True,
    )
    zone_mask &= elevation > 0
    if not zone_mask.any():
        raise RuntimeError("Copernicus DEM coast-distance window misses its study zone.")
    return float(np.mean(distances[zone_mask]))


def _build_rows() -> list[tuple[Any, ...]]:
    dem_paths, world_cover, hydro_archive = _download_sources()
    zones_by_area = {
        "mangaluru": MANGALURU_ZONES_GIS,
        "udupi": UDUPI_ZONES_GIS,
    }
    polygons = [
        _zone_polygon(zone)
        for zones in zones_by_area.values()
        for zone in zones
    ]
    all_bounds = unary_union(polygons).bounds
    buffer_degrees = 0.15
    river_bounds = (
        all_bounds[0] - buffer_degrees,
        all_bounds[1] - buffer_degrees,
        all_bounds[2] + buffer_degrees,
        all_bounds[3] + buffer_degrees,
    )
    rivers = _load_rivers(hydro_archive, river_bounds)
    rows = []
    for area, zones in zones_by_area.items():
        for zone in zones:
            polygon = _zone_polygon(zone)
            values = _dem_features(dem_paths, polygon, rivers, world_cover)
            values.update(_worldcover_features(world_cover, polygon))
            rows.append(
                (area, zone["zone_id"], *(values[name] for name in STATIC_FEATURES))
            )
            print(f"Derived static GIS features: {area}/{zone['zone_id']}")
    return rows


def build_static_gis_store() -> Path:
    rows = _build_rows()
    STATIC_GIS_DB.parent.mkdir(parents=True, exist_ok=True)
    columns = ", ".join(f'"{name}" REAL NOT NULL' for name in STATIC_FEATURES)
    with tempfile.NamedTemporaryFile(
        prefix="static_gis_", suffix=".sqlite", dir=STATIC_GIS_DB.parent, delete=False
    ) as temporary:
        temporary_path = Path(temporary.name)
    try:
        connection = sqlite3.connect(temporary_path)
        try:
            connection.execute(
                "CREATE TABLE zone_features ("
                "study_area TEXT NOT NULL, zone_id TEXT NOT NULL, "
                f"{columns}, PRIMARY KEY (study_area, zone_id))"
            )
            placeholders = ", ".join("?" for _ in range(2 + len(STATIC_FEATURES)))
            connection.executemany(
                f"INSERT INTO zone_features VALUES ({placeholders})", rows
            )
            connection.execute(
                "CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)"
            )
            metadata = {
                "generated_at_utc": datetime.now(timezone.utc).isoformat(),
                "sources": json.dumps(SOURCES, sort_keys=True),
                "method_limitations": MODEL_FEATURE_NOTE,
                "zone_geometry_note": (
                    "Study-zone polygons remain the provisional geometries "
                    "embedded in app/data/gis_data.py."
                ),
            }
            connection.executemany(
                "INSERT INTO metadata VALUES (?, ?)", metadata.items()
            )
            connection.commit()
        finally:
            connection.close()
        os.replace(temporary_path, STATIC_GIS_DB)
    except Exception:
        temporary_path.unlink(missing_ok=True)
        raise
    return STATIC_GIS_DB


if __name__ == "__main__":
    print(f"Persisted source-derived features to {build_static_gis_store()}")
