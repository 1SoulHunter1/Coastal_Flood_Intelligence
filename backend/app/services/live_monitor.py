"""Background zone-risk polling and first-response officer notifications."""

import asyncio
import logging
import os
from typing import Any

from app.data.gis_data import get_study_area_zones
from app.services.demo_officer_inbox import store_demo_alert, transition_to_high_risk
from app.services.external_data import get_live_hydrometeo_conditions
from app.services.ml_engine import ml_engine


logger = logging.getLogger(__name__)


def scan_study_area(study_area: str) -> None:
    environment = get_live_hydrometeo_conditions(study_area)
    recipient = os.environ.get(
        "COASTGUARD_MONITORING_OFFICER_NAME", "Duty Monitoring Officer"
    )
    for zone in get_study_area_zones(study_area):
        prediction: dict[str, Any] = ml_engine.predict_zone(
            zone, environment, study_area=study_area
        )
        high_risk = (
            prediction["p_flood"] >= 80 or prediction["q50_depth"] >= 0.38
        )
        if not transition_to_high_risk(
            study_area, zone["zone_id"], high_risk
        ):
            continue

        message = (
            f"LIVE MODEL REVIEW REQUIRED — {study_area.title()} / {zone['zone_id']} "
            f"({zone['zone_name']}) has surrogate flood-label probability "
            f"{prediction['p_flood']}% and median depth {prediction['q50_depth']:.2f} m. "
            "These are unvalidated model estimates from provider grid inputs, not "
            "confirmed flooding. Verify conditions before any public warning."
        )
        store_demo_alert(
            {
                "recipient": recipient,
                "study_area": study_area,
                "zone_id": zone["zone_id"],
                "zone_name": zone["zone_name"],
                "p_flood": prediction["p_flood"],
                "risk_level": prediction["risk_level"],
                "q50_depth_m": prediction["q50_depth"],
                "message": message,
                "demo_only": False,
                "event_type": "LIVE_MODEL_THRESHOLD",
                "public_broadcast_sent": False,
                "feed_timestamp_ist": environment["feed_timestamp_ist"],
            }
        )
        logger.warning(
            "High-risk threshold crossed for %s/%s; officer notification recorded.",
            study_area,
            zone["zone_id"],
        )


async def run_live_monitor() -> None:
    interval = int(os.environ.get("COASTGUARD_MONITOR_INTERVAL_SECONDS", "180"))
    if interval < 60:
        raise ValueError("COASTGUARD_MONITOR_INTERVAL_SECONDS must be at least 60.")
    while True:
        for study_area in ("mangaluru", "udupi"):
            try:
                await asyncio.to_thread(scan_study_area, study_area)
            except Exception:
                logger.exception(
                    "Continuous risk monitoring failed for %s; it will retry next cycle.",
                    study_area,
                )
        await asyncio.sleep(interval)
