import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from app.api.v1 import analysis
from app.api.v1.demo import run_demo_what_if, trigger_demo_officer_alert
from app.api.v1.infrastructure import get_infrastructure_summary
from app.api.v1.routing import (
    get_hospitals_accessibility,
    get_roads_impact,
)
from app.models.schemas import CounterfactualInputs
from app.services import demo_officer_inbox


class OfficerAlertAndImpactTests(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.inbox_path = Path(self.temporary_directory.name) / "officer.sqlite"
        self.inbox_patch = patch.object(demo_officer_inbox, "INBOX_DB", self.inbox_path)
        self.inbox_patch.start()
        self.environment_patch = patch.dict(os.environ, {}, clear=True)
        self.environment_patch.start()

    def tearDown(self):
        self.environment_patch.stop()
        self.inbox_patch.stop()
        self.temporary_directory.cleanup()

    def test_demo_alert_runs_surrogate_and_persists_officer_message(self):
        result = trigger_demo_officer_alert(study_area="mangaluru")

        self.assertGreaterEqual(result["zone"]["flood_probability"], 80)
        self.assertIn(result["zone"]["risk_level"], {"HIGH", "CRITICAL"})
        self.assertTrue(result["demo_only"])
        self.assertFalse(result["public_broadcast_sent"])
        self.assertEqual(result["status"], "DELIVERED_TO_IN_APP_INBOX")
        self.assertEqual(demo_officer_inbox.get_demo_alerts()[0]["id"], result["id"])
        self.assertGreater(len(result["zones"]), 1)
        self.assertTrue(
            any(zone["risk_level"] in {"HIGH", "CRITICAL"} for zone in result["zones"])
        )

    def test_demo_what_if_uses_synthetic_baseline_and_surrogate(self):
        result = run_demo_what_if(
            CounterfactualInputs(
                zone_id="Zone 03",
                study_area="mangaluru",
                tide_offset_m=0.2,
                rainfall_percent_change=20,
                storm_surge_offset_m=0.1,
            )
        )

        self.assertEqual(result.zone_id, "Zone 03")
        self.assertEqual(result.baseline.rainfall_rate_mm_hr, 50.0)
        self.assertEqual(result.baseline.tide_m, 2.0)
        self.assertEqual(result.simulated.tide_m, 2.2)
        self.assertGreaterEqual(
            result.simulated.predicted_depth_m,
            result.simulated.depth_q10_m,
        )
        self.assertLessEqual(
            result.simulated.predicted_depth_m,
            result.simulated.depth_q90_m,
        )
        self.assertGreaterEqual(result.simulated.depth_q90_m, result.simulated.depth_q10_m)
        self.assertIsNotNone(result.depth_q90_delta_m)
        self.assertIn("Synthetic demonstration baseline", result.explanation)

    def test_demo_what_if_reports_input_sensitive_upper_depth_when_median_is_flat(self):
        less_rain = run_demo_what_if(
            CounterfactualInputs(
                zone_id="Zone 03",
                study_area="mangaluru",
                tide_offset_m=0.0,
                rainfall_percent_change=-40,
                storm_surge_offset_m=0.0,
            )
        )
        more_rain = run_demo_what_if(
            CounterfactualInputs(
                zone_id="Zone 03",
                study_area="mangaluru",
                tide_offset_m=0.0,
                rainfall_percent_change=40,
                storm_surge_offset_m=0.0,
            )
        )

        self.assertEqual(
            less_rain.simulated.predicted_depth_m,
            more_rain.simulated.predicted_depth_m,
        )
        self.assertNotEqual(
            less_rain.simulated.probability,
            more_rain.simulated.probability,
        )
        self.assertNotEqual(
            less_rain.simulated.depth_q90_m,
            more_rain.simulated.depth_q90_m,
        )
        self.assertNotEqual(
            less_rain.depth_q90_delta_m,
            more_rain.depth_q90_delta_m,
        )

    def test_live_what_if_handles_float_rainfall_change_in_depth_explanations(self):
        environment = {
            "tide_level_m": 1.0,
            "observed_rainfall_rate_mm_hr": 10.0,
            "storm_surge_m": 0.1,
            "rain_1h": 10.0,
            "rain_3h": 20.0,
            "rain_6h": 40.0,
            "rain_24h": 80.0,
            "antecedent_mm": 30.0,
        }
        zone = {"zone_id": "Zone 03", "zone_name": "Kulur"}
        cases = (
            (0.1, 0.3, "inundation deepens"),
            (0.3, 0.1, "drops substantially"),
        )

        for baseline_depth, simulated_depth, expected_explanation in cases:
            with self.subTest(expected_explanation=expected_explanation):
                predictions = [
                    {
                        "q10_depth": 0.0,
                        "q50_depth": baseline_depth,
                        "q90_depth": 0.5,
                        "p_flood": 20,
                        "risk_level": "LOW",
                    },
                    {
                        "q10_depth": 0.01,
                        "q50_depth": simulated_depth,
                        "q90_depth": 0.65,
                        "p_flood": 40,
                        "risk_level": "MODERATE",
                    },
                ]
                with (
                    patch.object(
                        analysis,
                        "get_live_hydrometeo_conditions",
                        return_value=environment,
                    ),
                    patch.object(
                        analysis,
                        "get_study_area_zones",
                        return_value=[zone],
                    ),
                    patch.object(
                        analysis.ml_engine,
                        "predict_zone",
                        side_effect=predictions,
                    ) as predict_zone,
                ):
                    result = analysis.run_what_if_analysis(
                        CounterfactualInputs(
                            zone_id="Zone 03",
                            study_area="mangaluru",
                            tide_offset_m=0.2,
                            rainfall_percent_change=20,
                            storm_surge_offset_m=0.1,
                        )
                    )

                self.assertIn(expected_explanation, result.explanation)
                self.assertIn("12.0 mm/h rain", result.explanation)
                self.assertEqual(result.baseline.depth_q90_m, 0.5)
                self.assertEqual(result.simulated.depth_q90_m, 0.65)
                self.assertAlmostEqual(result.depth_q90_delta_m, 0.15)
                simulated_environment = predict_zone.call_args_list[1].args[1]
                self.assertEqual(simulated_environment["rain_3h"], 24.0)
                self.assertEqual(simulated_environment["rain_6h"], 48.0)
                self.assertEqual(simulated_environment["rain_24h"], 96.0)

    def test_live_what_if_adds_rainfall_when_current_rain_is_zero(self):
        environment = {
            "study_area": "mangaluru",
            "tide_level_m": 1.03,
            "observed_rainfall_rate_mm_hr": 0.0,
            "storm_surge_m": 0.01,
            "rain_1h": 0.0,
            "rain_3h": 0.0,
            "rain_6h": 0.0,
            "rain_24h": 0.0,
            "antecedent_mm": 0.0,
            "tide_m": 1.03,
            "surge_m": 0.01,
            "rain_tide_product": 0.0,
        }
        with patch.object(
            analysis,
            "get_live_hydrometeo_conditions",
            return_value=environment,
        ):
            result = analysis.run_what_if_analysis(
                CounterfactualInputs(
                    zone_id="Zone 03",
                    study_area="mangaluru",
                    tide_offset_m=0.0,
                    rainfall_offset_mm_hr=20.0,
                    storm_surge_offset_m=0.0,
                )
            )

        self.assertEqual(result.baseline.rainfall_rate_mm_hr, 0.0)
        self.assertEqual(result.simulated.rainfall_rate_mm_hr, 20.0)
        self.assertNotEqual(
            result.baseline.probability,
            result.simulated.probability,
        )
        self.assertNotEqual(
            result.baseline.predicted_depth_m,
            result.simulated.predicted_depth_m,
        )

    def test_low_model_depth_does_not_mark_roads_or_hospitals_closed(self):
        low_depths = {f"Zone {number:02d}": 0.01 for number in range(1, 8)}
        with patch("app.api.v1.routing.get_modelled_zone_depths", return_value=low_depths):
            roads = get_roads_impact(study_area="mangaluru")
            hospitals = get_hospitals_accessibility(study_area="mangaluru")

        self.assertTrue(roads)
        self.assertTrue(all(road.status == "OPEN" for road in roads))
        self.assertTrue(all(road.predicted_depth_m == 0.01 for road in roads))
        self.assertTrue(all(hospital.access_status == "OPEN" for hospital in hospitals))
        self.assertTrue(all(hospital.alternative_route is None for hospital in hospitals))

    def test_closed_hospital_route_includes_drawable_alternative_polyline(self):
        depths = {
            "Zone 01": 0.01,
            "Zone 02": 0.01,
            "Zone 03": 0.01,
            "Zone 04": 0.01,
            "Zone 05": 0.35,
            "Zone 06": 0.01,
            "Zone 07": 0.01,
        }
        with patch("app.api.v1.routing.get_modelled_zone_depths", return_value=depths):
            hospitals = get_hospitals_accessibility(study_area="mangaluru")

        wenlock = next(h for h in hospitals if h.id == "HOSP-WENLOCK")
        self.assertEqual(wenlock.access_status, "CLOSED")
        self.assertIsNotNone(wenlock.alternative_route)
        self.assertGreaterEqual(len(wenlock.alternative_route.coordinates), 2)

    def test_infrastructure_summary_drops_fabricated_risk_counts_at_low_depth(self):
        low_depths = {f"Zone {number:02d}": 0.01 for number in range(1, 8)}
        with patch("app.api.v1.infrastructure.get_modelled_zone_depths", return_value=low_depths):
            summary = get_infrastructure_summary(study_area="mangaluru").summary

        self.assertEqual(summary.hospitals_at_risk, 0)
        self.assertEqual(summary.schools_at_risk, None)
        self.assertEqual(summary.road_segments_affected, 0)
        self.assertEqual(summary.buildings_affected, 0)
        self.assertEqual(summary.critical_facilities_at_risk, 0)

    def test_infrastructure_summary_zone_filter_is_safe_and_applies_to_zone_data(self):
        depths = {f"Zone {number:02d}": 0.01 for number in range(1, 8)}
        depths["Zone 05"] = 0.35
        with patch("app.api.v1.infrastructure.get_modelled_zone_depths", return_value=depths):
            summary = get_infrastructure_summary(
                study_area="mangaluru", zone_id="Zone 05"
            )
            mismatched_zone = get_infrastructure_summary(
                study_area="mangaluru", zone_id="udupi"
            )

        self.assertEqual(summary.summary.buildings_affected, 920)
        self.assertTrue(all(f.zone_id == "Zone 05" for f in summary.facilities))
        self.assertTrue(all(r.zone_id == "Zone 05" for r in summary.roads))
        self.assertEqual(mismatched_zone.summary.buildings_affected, 0)
        self.assertEqual(mismatched_zone.facilities, [])
        self.assertEqual(mismatched_zone.roads, [])

    def test_monitor_notifies_only_when_zone_crosses_high_threshold(self):
        self.assertTrue(
            demo_officer_inbox.transition_to_high_risk("mangaluru", "Zone 03", True)
        )
        self.assertFalse(
            demo_officer_inbox.transition_to_high_risk("mangaluru", "Zone 03", True)
        )
        self.assertFalse(
            demo_officer_inbox.transition_to_high_risk("mangaluru", "Zone 03", False)
        )
        self.assertTrue(
            demo_officer_inbox.transition_to_high_risk("mangaluru", "Zone 03", True)
        )


if __name__ == "__main__":
    unittest.main()
