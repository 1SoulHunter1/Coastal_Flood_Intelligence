import unittest
from datetime import datetime, timedelta, timezone
from math import isfinite
import sqlite3
from unittest.mock import patch

import requests
from fastapi import HTTPException

from app.data.static_gis_store import STATIC_FEATURES, STATIC_GIS_DB
from app.api.v1.alerts import get_active_alerts
from app.data.gis_data import get_study_area_zones
from app.services.external_data import _fetch_live_meteo, _hourly_rain_sum
from app.services.ml_engine import CoastGuardMLEngine


class SurrogateInputTests(unittest.TestCase):
    def setUp(self):
        self.engine = CoastGuardMLEngine()
        self.zone = get_study_area_zones("mangaluru")[0]
        self.environment = {
            "rain_1h": 1.0,
            "rain_3h": 2.0,
            "rain_6h": 3.0,
            "rain_24h": 10.0,
            "antecedent_mm": 50.0,
            "tide_m": 0.5,
            "surge_m": 0.1,
            "rain_tide_product": 0.6,
            "antecedent_rain_3d": 30.0,
            "tide_height": 0.5,
            "storm_surge": 0.1,
            "river_discharge": 1000.0,
            "tide_rain_interaction": 0.5,
        }

    def test_mangaluru_uses_loaded_surrogate_and_live_feature_values(self):
        prediction = self.engine.predict_zone(
            self.zone,
            self.environment,
            study_area="mangaluru",
        )

        self.assertEqual(self.engine.model_path.rsplit("\\", 1)[-1], "surrogate_model.pkl")
        self.assertEqual(prediction["feature_inputs"]["rain_24h"], 10.0)
        self.assertEqual(prediction["feature_inputs"]["antecedent_mm"], 50.0)
        self.assertEqual(prediction["feature_inputs"]["rain_tide_product"], 0.6)
        self.assertTrue(
            0 <= prediction["p_flood"] <= 100
        )
        self.assertLessEqual(
            prediction["q10_depth"],
            prediction["q50_depth"],
        )
        self.assertLessEqual(
            prediction["q50_depth"],
            prediction["q90_depth"],
        )

    def test_mangaluru_rejects_missing_dynamic_inputs(self):
        incomplete = dict(self.environment)
        del incomplete["antecedent_mm"]
        with self.assertRaisesRegex(ValueError, "antecedent_mm"):
            self.engine.predict_zone(self.zone, incomplete, study_area="mangaluru")

    def test_mangaluru_rejects_missing_static_inputs(self):
        incomplete = dict(self.zone)
        del incomplete["elevation_mean"]
        with self.assertRaisesRegex(ValueError, "elevation_mean"):
            self.engine.predict_zone(incomplete, self.environment, study_area="mangaluru")

    def test_static_zone_features_are_loaded_from_persistent_source_store(self):
        with sqlite3.connect(STATIC_GIS_DB) as connection:
            count = connection.execute(
                "SELECT COUNT(*) FROM zone_features"
            ).fetchone()[0]
            method_note = connection.execute(
                "SELECT value FROM metadata WHERE key = 'method_limitations'"
            ).fetchone()[0]
        self.assertEqual(count, 12)
        self.assertIn("not the missing H3 resolution-8 training pipeline", method_note)

        for area in ("mangaluru", "udupi"):
            zones = get_study_area_zones(area)
            for zone in zones:
                for feature in STATIC_FEATURES:
                    self.assertIn(feature, zone)
                    self.assertTrue(isfinite(zone[feature]), (area, zone["zone_id"], feature))

    def test_udupi_uses_same_surrogate_as_unvalidated_regional_transfer(self):
        udupi_zone = get_study_area_zones("udupi")[0]
        prediction = self.engine.predict_zone(
            udupi_zone,
            self.environment,
            study_area="udupi",
        )

        self.assertEqual(self.engine.model_path.rsplit("\\", 1)[-1], "surrogate_model.pkl")
        self.assertIn("p_flood", prediction)
        self.assertIn("q50_depth", prediction)

    def test_no_unverified_static_bulletins_are_returned_as_active_alerts(self):
        self.assertEqual(get_active_alerts(study_area="mangaluru"), [])

    def test_hourly_rainfall_windows_use_provider_timestamps(self):
        end = datetime(2026, 10, 8, 21, 30, tzinfo=timezone.utc)
        times = [
            (end - timedelta(hours=hour)).isoformat()
            for hour in range(24, -1, -1)
        ]
        self.assertEqual(
            _hourly_rain_sum(times, [1.0] * len(times), end - timedelta(hours=3), end),
            3.0,
        )

    def test_weather_provider_failure_is_reported_not_substituted(self):
        with patch(
            "app.services.external_data.requests.get",
            side_effect=requests.Timeout("provider timed out"),
        ):
            with self.assertRaises(HTTPException) as error:
                _fetch_live_meteo(12.9, 74.8)
        self.assertEqual(error.exception.status_code, 503)

    def test_rain_windows_and_five_day_antecedent_are_time_aligned(self):
        end = datetime(2026, 10, 8, 21, 30, tzinfo=timezone.utc)
        first = end - timedelta(days=7)
        times = [
            (first + timedelta(hours=hour)).strftime("%Y-%m-%dT%H:%M")
            for hour in range(7 * 24 + 1)
        ]
        hourly_values = [1.0] * len(times)
        payload = {
            "current": {
                "time": end.isoformat(),
                "precipitation": 1.0,
                "surface_pressure": 1010.0,
                "wind_speed_10m": 10.0,
                "wind_direction_10m": 270.0,
            },
            "hourly": {
                "time": times,
                "precipitation": hourly_values,
                "surface_pressure": [1010.0] * len(times),
                "wind_speed_10m": [10.0] * len(times),
            },
        }
        with patch("app.services.external_data._fetch_json", return_value=payload):
            meteo = _fetch_live_meteo(12.9, 74.8)

        self.assertEqual(meteo["rain_1h"], 1.0)
        self.assertEqual(meteo["rain_3h"], 3.0)
        self.assertEqual(meteo["rain_6h"], 6.0)
        self.assertEqual(meteo["rain_24h"], 24.0)
        self.assertEqual(meteo["antecedent_mm"], 120.0)


if __name__ == "__main__":
    unittest.main()
