"""
CoastGuard-AI: Model Training Pipeline
Trains the dual-head LightGBM Multi-Quantile Surrogate Model for real-time inference
across 17 static terrain and dynamic hydrometeorological features.
"""

import numpy as np
import pandas as pd
import lightgbm as lgb
import joblib
import os

FEATURE_NAMES = [
    'elevation_mean', 'elevation_min', 'hand_mean', 'hand_min', 'slope_mean',
    'impervious_ratio', 'curve_number', 'dist_to_river_m', 'dist_to_coast_m',
    'rain_1h', 'rain_3h', 'rain_6h', 'antecedent_rain_3d',
    'tide_height', 'storm_surge', 'river_discharge', 'tide_rain_interaction'
]

def generate_hydrodynamic_dataset(n_samples=5000, random_state=42):
    """
    Generates physically consistent training samples covering the operational domain
    of coastal Karnataka (Mangaluru & Udupi estuarine lowlands).
    """
    np.random.seed(random_state)

    # Static terrain features
    elev_mean = np.random.uniform(1.2, 18.0, n_samples)
    elev_min = elev_mean - np.random.uniform(0.3, 2.5, n_samples)
    elev_min = np.maximum(0.1, elev_min)
    hand_mean = np.random.uniform(0.3, 10.0, n_samples)
    hand_min = np.maximum(0.02, hand_mean - np.random.uniform(0.1, 1.5, n_samples))
    slope = np.random.uniform(0.5, 6.0, n_samples)
    impervious = np.random.uniform(0.35, 0.95, n_samples)
    cn = np.random.uniform(65.0, 96.0, n_samples)
    dist_river = np.random.uniform(50.0, 3000.0, n_samples)
    dist_coast = np.random.uniform(100.0, 6000.0, n_samples)

    # Dynamic meteo & marine features
    rain_1h = np.random.exponential(12.0, n_samples)  # mm/hr
    rain_3h = rain_1h * np.random.uniform(1.8, 2.8, n_samples)
    rain_6h = rain_3h * np.random.uniform(1.5, 2.2, n_samples)
    antecedent_3d = np.random.uniform(10.0, 220.0, n_samples)
    tide_height = np.random.uniform(0.2, 2.4, n_samples)  # meters
    storm_surge = np.random.uniform(0.0, 0.85, n_samples)  # meters
    river_discharge = np.random.uniform(80.0, 2400.0, n_samples)  # m3/s

    # Engineered interaction
    tide_rain_interaction = rain_1h * tide_height

    # Physical hydrodynamic response formulation
    rainfall_runoff_head = (
        (rain_1h * 0.016 + rain_3h * 0.009 + antecedent_3d * 0.0015)
        * (cn / 75.0)
        * (0.65 + impervious * 0.55)
    )

    tidal_backwater_head = (
        np.maximum(0.0, (tide_height + storm_surge) - elev_mean * 0.85)
        * np.exp(-dist_coast / 2000.0)
    )

    river_spill_head = (
        np.maximum(0.0, (river_discharge / 750.0) - hand_min)
        * np.exp(-dist_river / 900.0)
    )

    estuarine_blockage = (tide_rain_interaction * 0.012) * np.exp(-dist_coast / 2500.0)

    drainage_relief = slope * 0.04

    effective_depth = (
        rainfall_runoff_head
        + tidal_backwater_head * 1.2
        + river_spill_head * 0.7
        + estuarine_blockage
        - drainage_relief
    )

    # Add realistic environmental variance
    noise = np.random.normal(0.0, 0.04, n_samples)
    actual_depth = np.maximum(0.0, effective_depth + noise)
    actual_depth = np.round(actual_depth, 3)

    data = {
        'elevation_mean': elev_mean,
        'elevation_min': elev_min,
        'hand_mean': hand_mean,
        'hand_min': hand_min,
        'slope_mean': slope,
        'impervious_ratio': impervious,
        'curve_number': cn,
        'dist_to_river_m': dist_river,
        'dist_to_coast_m': dist_coast,
        'rain_1h': rain_1h,
        'rain_3h': rain_3h,
        'rain_6h': rain_6h,
        'antecedent_rain_3d': antecedent_3d,
        'tide_height': tide_height,
        'storm_surge': storm_surge,
        'river_discharge': river_discharge,
        'tide_rain_interaction': tide_rain_interaction,
        'actual_depth_m': actual_depth
    }

    return pd.DataFrame(data)

def train_coastguard_ai_model(output_path="coastguard_ai_model.pkl"):
    print("Generating calibrated hydrodynamic training dataset...")
    df = generate_hydrodynamic_dataset()

    X = df[FEATURE_NAMES]
    y_class = (df['actual_depth_m'] >= 0.05).astype(int)
    y_depth = df['actual_depth_m']

    print("Training Head 1: Binary Flood Classifier...")
    clf = lgb.LGBMClassifier(
        n_estimators=250,
        learning_rate=0.05,
        max_depth=6,
        num_leaves=31,
        random_state=42,
        verbosity=-1
    )
    clf.fit(X, y_class)

    print("Training Head 2: Pinball Loss Quantile Depth Regressors (q10, q50, q90)...")
    quantiles = [0.10, 0.50, 0.90]
    quantile_models = {}

    for q in quantiles:
        reg = lgb.LGBMRegressor(
            objective='quantile',
            alpha=q,
            n_estimators=250,
            learning_rate=0.05,
            max_depth=6,
            num_leaves=31,
            random_state=42,
            verbosity=-1
        )
        reg.fit(X, y_depth)
        quantile_models[f'q_{int(q * 100)}'] = reg

    bundle = {
        'classifier': clf,
        'q10_regressor': quantile_models['q_10'],
        'q50_regressor': quantile_models['q_50'],
        'q90_regressor': quantile_models['q_90'],
        'feature_names': FEATURE_NAMES
    }

    joblib.dump(bundle, output_path)
    print(f"Model bundle successfully saved to {output_path}!")

    # Also save as model.pkl for drop-in compatibility
    joblib.dump(bundle, "model.pkl")
    print("Also saved copy to model.pkl for drop-in compatibility!")
    return bundle

if __name__ == "__main__":
    train_coastguard_ai_model()
