"""
CoastGuard-AI: Real-Time Machine Learning Surrogate Engine
Loads the dual-head LightGBM multi-quantile surrogate model bundle
and performs sub-millisecond inference across 17 static and dynamic features.
"""

import os
import pickle
import pandas as pd
from typing import Dict, Any, Optional
from app.config import (
    MODEL_PATH,
    ROAD_AT_RISK_DEPTH_M,
    ROAD_CLOSURE_DEPTH_M,
)

class CoastGuardMLEngine:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or MODEL_PATH
        self.feature_names = [
            'hand_min', 'hand_mean', 'elevation_mean', 'elevation_min',
            'slope_mean', 'curve_number', 'impervious_ratio', 'dist_to_river_m',
            'dist_to_coast_m', 'rain_1h', 'rain_3h', 'rain_6h', 'rain_24h',
            'antecedent_mm', 'tide_m', 'surge_m', 'rain_tide_product'
        ]
        self._load_models()

    def _load_models(self):
        if not os.path.isfile(self.model_path):
            raise FileNotFoundError(f"Surrogate model file not found: {self.model_path}")

        with open(self.model_path, "rb") as model_file:
            self.surrogate_bundle = pickle.load(model_file)

        self.feature_names = self.surrogate_bundle["features"]
        if set(self.feature_names) != set(self.surrogate_bundle["static_features"]) | set(
            self.surrogate_bundle["dynamic_features"]
        ):
            raise ValueError("Surrogate feature list does not match its static/dynamic features.")
        models = self.surrogate_bundle["models"]
        self.clf = models["classifier"]
        self.quantile_models = models["quantiles"]
        if set(self.quantile_models) != {0.1, 0.5, 0.9}:
            raise ValueError("Surrogate bundle must contain q=0.1, 0.5, and 0.9 models.")

        print(f"[CoastGuard ML] Loaded evaluated surrogate from {self.model_path}")

    def predict_zone(
        self,
        static_zone: Dict[str, Any],
        dynamic_env: Dict[str, Any],
        study_area: str = "mangaluru",
    ) -> Dict[str, Any]:
        """
        Runs multi-quantile inference for a single zone given static GIS terrain
        and dynamic provider-derived weather/marine values.
        """
        if study_area.lower() not in {"mangaluru", "udupi"}:
            raise ValueError(f"Unsupported study area for surrogate inference: {study_area}")

        required_static = self.surrogate_bundle["static_features"]
        missing_static = [name for name in required_static if name not in static_zone]
        required_dynamic = self.surrogate_bundle["dynamic_features"]
        missing_dynamic = [name for name in required_dynamic if name not in dynamic_env]
        if missing_static or missing_dynamic:
            raise ValueError(
                f"Missing surrogate inputs: static={missing_static}, "
                f"dynamic={missing_dynamic}"
            )

        features_dict = {
            name: float(static_zone[name]) for name in required_static
        }
        features_dict.update(
            {name: float(dynamic_env[name]) for name in required_dynamic}
        )

        p_flood, q10_depth, q50_depth, q90_depth = self._predict_surrogate(features_dict)

        # Risk classification
        if p_flood >= 80 or q50_depth >= 0.38:
            risk_level = "CRITICAL" if q50_depth >= 0.40 else "HIGH"
            severity = "HIGH"
        elif p_flood >= 45 or q50_depth >= 0.18:
            risk_level = "MODERATE"
            severity = "MODERATE"
        else:
            risk_level = "LOW"
            severity = "LOW"

        # Road accessibility state enforcement
        if q50_depth >= ROAD_CLOSURE_DEPTH_M:
            road_status = "CLOSED"
        elif q50_depth >= ROAD_AT_RISK_DEPTH_M:
            road_status = "AT_RISK"
        else:
            road_status = "OPEN"

        return {
            "p_flood": p_flood,
            "q10_depth": q10_depth,
            "q50_depth": q50_depth,
            "q90_depth": q90_depth,
            "risk_level": risk_level,
            "severity": severity,
            "road_access_status": road_status,
            "feature_inputs": features_dict
        }

    def _predict_surrogate(self, features: Dict[str, float]) -> tuple:
        missing = [name for name in self.feature_names if name not in features]
        if missing:
            raise ValueError(f"Missing surrogate input features: {missing}")

        model_input = pd.DataFrame(
            [[features[name] for name in self.feature_names]],
            columns=self.feature_names,
        )
        probability = float(self.clf.predict_proba(model_input)[0][1])
        quantiles = [
            max(0.0, float(self.quantile_models[q].predict(model_input)[0]))
            for q in (0.1, 0.5, 0.9)
        ]
        q10, q50, q90 = sorted(quantiles)
        return (
            int(round(probability * 100)),
            round(q10, 2),
            round(q50, 2),
            round(q90, 2),
        )


# Singleton instance
ml_engine = CoastGuardMLEngine()
