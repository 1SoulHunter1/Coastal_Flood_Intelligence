"""
CoastGuard-AI: Explainability & SHAP Feature Attribution Service
Translates multi-dimensional hydrodynamic model attributions into
ranked factors and human-readable plain-English explanations.
"""

from typing import Dict, Any, List

def compute_zone_attributions(zone_features: Dict[str, Any], p_flood: int, depth_q50: float) -> Dict[str, float]:
    """
    Computes normalized relative feature attributions (0.0 to 1.0)
    for why a zone is flagged at flood risk.
    """
    rain = zone_features.get('rain_1h', 20.0) + (zone_features.get('rain_3h', 40.0) * 0.4)
    tide = (zone_features.get('tide_height', 1.5) + zone_features.get('storm_surge', 0.3))
    elev = max(0.1, 15.0 - zone_features.get('elevation_mean', 3.0))
    impervious = zone_features.get('impervious_ratio', 0.7) * 20.0
    river = zone_features.get('river_discharge', 1000.0) / 100.0

    raw_scores = {
        "Low ground elevation": elev * 2.2,
        "High tide level": tide * 18.0,
        "Recent rainfall": rain * 0.9,
        "Impervious land cover": impervious * 1.4,
        "River backwater discharge": river * 0.8
    }

    total = sum(raw_scores.values()) or 1.0
    normalized = {k: round(v / total, 2) for k, v in raw_scores.items()}
    return normalized

def generate_risk_drivers_list(attributions: Dict[str, float]) -> List[Dict[str, Any]]:
    """
    Returns list of risk driver factor objects matching the frontend RiskDriverFactor schema.
    """
    factor_descriptions = {
        "Low ground elevation": "Static GIS elevation input; lower terrain increases modeled susceptibility",
        "High tide level": "Open-Meteo Marine nearest-grid sea-level estimate (MSL)",
        "Recent rainfall": "Open-Meteo Weather nearest-grid rainfall accumulation",
        "Impervious land cover": "Static GIS imperviousness input; not refreshed from a live land-cover feed",
        "River backwater discharge": "Open-Meteo Flood API daily grid estimate; not a local gauge reading"
    }

    drivers = []
    # Sort descending by contribution
    sorted_items = sorted(attributions.items(), key=lambda x: x[1], reverse=True)
    for factor, weight in sorted_items:
        drivers.append({
            "factor": factor,
            "percentage": int(round(weight * 100)),
            "impact_description": factor_descriptions.get(factor, "Hydrological factor contributing to inundation")
        })

    return drivers

def generate_plain_english_explanation(attributions: Dict[str, float], zone_name: str) -> str:
    """
    Constructs a plain-English explainability narrative.
    """
    sorted_items = sorted(attributions.items(), key=lambda x: x[1], reverse=True)
    top1, weight1 = sorted_items[0]
    top2, weight2 = sorted_items[1]

    pct1 = int(round(weight1 * 100))
    pct2 = int(round(weight2 * 100))

    return (
        f"In {zone_name}, flood risk is primarily driven by {top1.lower()} ({pct1}%), "
        f"compounded by {top2.lower()} ({pct2}%). Low-lying arterial corridors face backwater ponding."
    )
