"""
CoastGuard-AI: Bilingual Alert Dispatch Service
Generates dynamically interpolated public safety warnings in English and Kannada (ಕನ್ನಡ)
formatted for SMS, WhatsApp, and CAP radio broadcasts.
"""

from typing import Dict, Any

KANNADA_ZONE_NAMES = {
    "Kulur": "ಕುಲೂರು",
    "Bunder": "ಬಂದರು",
    "Ullal": "ಉಲ್ಲಾಳ",
    "Bolar": "ಬೋಳಾರ",
    "Hampankatta": "ಹಂಪನಕಟ್ಟೆ",
    "Kankanady": "ಕಂಕನಾಡಿ",
    "Deralakatte": "ದೇರಳಕಟ್ಟೆ",
    "Malpe Harbor": "ಮಲ್ಪೆ ಬಂದರು",
    "Udyavara Estuary": "ಉದ್ಯಾವರ",
    "Kaup Coast": "ಕಾಪು",
    "Brahmavara River Delta": "ಬ್ರಹ್ಮಾವರ",
    "Padubidri Coast": "ಪಡುಬಿದ್ರಿ"
}

KANNADA_RISK_MAP = {
    "CRITICAL": "ತೀವ್ರ ಗಂಭೀರ",
    "HIGH": "ಹೆಚ್ಚು",
    "MODERATE": "ಮಧ್ಯಮ",
    "LOW": "ಕಡಿಮೆ"
}

def generate_bilingual_public_alert(
    zone_id: str,
    zone_name: str,
    risk_level: str,
    expected_onset: str,
    expected_peak: str,
    nearest_shelter_name: str,
    nearest_shelter_distance_km: float,
    closed_road_name: str = "Main Road 760"
) -> Dict[str, Any]:
    """
    Interpolates active operational parameters into verified bilingual dispatch templates.
    """
    kn_zone = KANNADA_ZONE_NAMES.get(zone_name, zone_name)
    kn_risk = KANNADA_RISK_MAP.get(risk_level, "ಹೆಚ್ಚು")

    english = {
        "title": "FLOOD WARNING — COASTGUARD-AI ALERT",
        "body": (
            f"Zone: {zone_id} — {zone_name}\n"
            f"Risk Level: {risk_level}\n"
            f"Expected Onset: {expected_onset}\n"
            f"Expected Peak: {expected_peak}\n\n"
            f"Residents in low-lying estuarine areas should evacuate toward identified dry shelters and avoid flooded roads."
        ),
        "advisory": (
            f"Nearest reachable shelter: {nearest_shelter_name} ({nearest_shelter_distance_km:.1f} km). "
            f"Avoid {closed_road_name} (CLOSED: flood depth >= 0.30m)."
        ),
        "sms_text": (
            f"FLOOD WARNING: {zone_id} {zone_name} at {risk_level} risk from {expected_onset}. "
            f"Avoid flooded roads. Nearest dry shelter: {nearest_shelter_name} ({nearest_shelter_distance_km:.1f}km). Infoline: 1077 / 112."
        ),
        "whatsapp_text": (
            f"*FLOOD WARNING — CIVIC CONTROL ROOM*\n\n"
            f"*Zone:* {zone_id} — {zone_name}\n"
            f"*Risk:* {risk_level}\n"
            f"*Onset:* {expected_onset} | *Peak:* {expected_peak}\n\n"
            f"Residents in low-lying coastal and riverfront sectors should evacuate toward identified dry shelters.\n\n"
            f"*Nearest Safe Shelter:* {nearest_shelter_name} ({nearest_shelter_distance_km:.1f} km)\n"
            f"*Road Closures:* {closed_road_name} is CLOSED to all traffic (water depth >= 0.30m).\n"
            f"*Emergency Infoline:* 1077 / 112\n\n"
            f"_Official Disaster Management Broadcast_"
        )
    }

    kannada = {
        "title": "ಪ್ರವಾಹ ಮುನ್ನೆಚ್ಚರಿಕೆ — ತುರ್ತು ಎಚ್ಚರಿಕೆ",
        "body": (
            f"ವಲಯ: {kn_zone} ({zone_id})\n"
            f"ಅಪಾಯ ಮಟ್ಟ: {kn_risk}\n"
            f"ನಿರೀಕ್ಷಿತ ಆರಂಭ: {expected_onset}\n"
            f"ನಿರೀಕ್ಷಿತ ಗರಿಷ್ಠ: {expected_peak}\n\n"
            f"ತಗ್ಗು ಪ್ರದೇಶದ ನಿವಾಸಿಗಳು ತಕ್ಷಣವೇ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಕೇಂದ್ರಕ್ಕೆ ತೆರಳಲು ಸೂಚಿಸಲಾಗಿದೆ. ನೀರು ತುಂಬಿದ ರಸ್ತೆಗಳನ್ನು ತಪ್ಪಿಸಿ."
        ),
        "advisory": (
            f"ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಕೇಂದ್ರ: {nearest_shelter_name} ({nearest_shelter_distance_km:.1f} ಕಿ.ಮೀ). "
            f"{closed_road_name} ಸಂಚಾರಕ್ಕೆ ಮುಚ್ಚಲಾಗಿದೆ."
        ),
        "sms_text": (
            f"ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ: {kn_zone} ವಲಯದಲ್ಲಿ {kn_risk} ಅಪಾಯ ({expected_onset}). "
            f"ನೀರು ತುಂಬಿದ ರಸ್ತೆಗಳನ್ನು ತಪ್ಪಿಸಿ. ಆಶ್ರಯ: {nearest_shelter_name} ({nearest_shelter_distance_km:.1f}km). ಸಹಾಯವಾಣಿ: 1077."
        ),
        "whatsapp_text": (
            f"*ಪ್ರವಾಹ ಎಚ್ಚರಿಕೆ — ಜಿಲ್ಲಾ ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಪ್ರಾಧಿಕಾರ*\n\n"
            f"*ವಲಯ:* {kn_zone} ({zone_id})\n"
            f"*ಅಪಾಯ ಮಟ್ಟ:* {kn_risk}\n"
            f"*ನಿರೀಕ್ಷಿತ ಆರಂಭ:* {expected_onset} | *ಗರಿಷ್ಠ:* {expected_peak}\n\n"
            f"ತಗ್ಗು ಪ್ರದೇಶದ ನಿವಾಸಿಗಳು ತಕ್ಷಣವೇ ಅಧಿಕೃತ ಆಶ್ರಯ ಕೇಂದ್ರಗಳಿಗೆ ಸ್ಥಳಾಂತರಗೊಳ್ಳಲು ಸೂಚಿಸಲಾಗಿದೆ.\n\n"
            f"*ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ಆಶ್ರಯ ಕೇಂದ್ರ:* {nearest_shelter_name} ({nearest_shelter_distance_km:.1f} ಕಿ.ಮೀ)\n"
            f"*ರಸ್ತೆ ಸ್ಥಿತಿ:* {closed_road_name} ಸಂಚಾರಕ್ಕೆ ಸಂಪೂರ್ಣ ಮುಚ್ಚಲಾಗಿದೆ (ನೀರಿನ ಆಳ >= 0.30 ಮೀ).\n"
            f"*ತುರ್ತು ಸಹಾಯವಾಣಿ:* 1077 / 112\n\n"
            f"_ಅಧಿಕೃತ ಸಾರ್ವಜನಿಕ ಎಚ್ಚರಿಕೆ ಸಂದೇಶ_"
        )
    }

    return {
        "zone_id": zone_id,
        "zone_name": zone_name,
        "risk_level": risk_level,
        "expected_onset": expected_onset,
        "expected_peak": expected_peak,
        "nearest_shelter_name": nearest_shelter_name,
        "nearest_shelter_distance_km": round(nearest_shelter_distance_km, 1),
        "english": english,
        "kannada": kannada
    }
