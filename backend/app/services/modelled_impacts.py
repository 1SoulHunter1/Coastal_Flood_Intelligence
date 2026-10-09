"""Apply zone-level surrogate depths to provisional road and facility inventories."""

from app.data.gis_data import get_study_area_zones
from app.services.external_data import get_live_hydrometeo_conditions
from app.services.ml_engine import ml_engine


def get_modelled_zone_depths(study_area: str) -> dict[str, float]:
    environment = get_live_hydrometeo_conditions(study_area)
    zones = get_study_area_zones(study_area)
    return {
        zone["zone_id"]: ml_engine.predict_zone(
            zone, environment, study_area=study_area
        )["q50_depth"]
        for zone in zones
    }
