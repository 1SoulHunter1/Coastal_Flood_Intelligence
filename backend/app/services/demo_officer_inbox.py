"""Persistent in-app inbox used to demonstrate officer alert delivery."""

import json
import logging
import os
import smtplib
import sqlite3
import uuid
from contextlib import closing
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path
from typing import Any


logger = logging.getLogger(__name__)
INBOX_DB = Path(
    os.environ.get(
        "COASTGUARD_DEMO_INBOX_DB",
        str(Path(__file__).resolve().parents[2] / "data" / "demo_officer_inbox.sqlite"),
    )
)


def store_demo_alert(alert: dict[str, Any]) -> dict[str, Any]:
    INBOX_DB.parent.mkdir(parents=True, exist_ok=True)
    record = {
        **alert,
        "id": str(uuid.uuid4()),
        "channel": "In-app duty officer inbox",
        "status": "DELIVERED_TO_IN_APP_INBOX",
        "external_email_sent": False,
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
    }
    with closing(sqlite3.connect(INBOX_DB, timeout=10)) as connection, connection:
        connection.execute(
            "CREATE TABLE IF NOT EXISTS officer_alerts ("
            "id TEXT PRIMARY KEY, created_at_utc TEXT NOT NULL, alert_json TEXT NOT NULL)"
        )
        connection.execute(
            "CREATE TABLE IF NOT EXISTS monitor_zone_state ("
            "study_area TEXT NOT NULL, zone_id TEXT NOT NULL, high_risk INTEGER NOT NULL, "
            "updated_at_utc TEXT NOT NULL, PRIMARY KEY (study_area, zone_id))"
        )
        connection.execute(
            "INSERT INTO officer_alerts (id, created_at_utc, alert_json) VALUES (?, ?, ?)",
            (
                record["id"],
                record["created_at_utc"],
                json.dumps(record, separators=(",", ":")),
            ),
        )
    _try_send_email(record)
    with closing(sqlite3.connect(INBOX_DB, timeout=10)) as connection, connection:
        connection.execute(
            "UPDATE officer_alerts SET alert_json = ? WHERE id = ?",
            (json.dumps(record, separators=(",", ":")), record["id"]),
        )
    return record


def _try_send_email(record: dict[str, Any]) -> None:
    host = os.environ.get("COASTGUARD_SMTP_HOST")
    port = os.environ.get("COASTGUARD_SMTP_PORT")
    sender = os.environ.get("COASTGUARD_SMTP_FROM")
    recipient = os.environ.get("COASTGUARD_OFFICER_EMAIL")
    username = os.environ.get("COASTGUARD_SMTP_USERNAME")
    password = os.environ.get("COASTGUARD_SMTP_PASSWORD")
    configured = [host, port, sender, recipient]
    if not any(configured):
        logger.warning(
            "Officer notification stored in the in-app inbox only; "
            "configure SMTP to deliver external email."
        )
        return
    if not all(configured):
        record["status"] = "IN_APP_ONLY_SMTP_CONFIGURATION_INCOMPLETE"
        logger.error(
            "Officer alert is in the in-app inbox, but external email was not sent: "
            "SMTP host, port, from address, and officer email are all required."
        )
        return

    message = EmailMessage()
    message["Subject"] = "CoastGuard-AI flood risk officer alert"
    message["From"] = sender
    message["To"] = recipient
    message.set_content(record["message"])
    try:
        with smtplib.SMTP(host, int(port), timeout=15) as smtp:
            smtp.starttls()
            if username:
                smtp.login(username, password or "")
            smtp.send_message(message)
    except (OSError, smtplib.SMTPException, ValueError):
        record["status"] = "IN_APP_DELIVERED_EMAIL_FAILED"
        record["delivery_error"] = "External email delivery failed; check SMTP configuration and server logs."
        logger.exception("External officer email delivery failed; alert remains in the in-app inbox.")
        return
    record["channel"] = "Email + in-app duty officer inbox"
    record["status"] = "EMAIL_SENT_AND_STORED_IN_INBOX"
    record["external_email_sent"] = True


def transition_to_high_risk(study_area: str, zone_id: str, high_risk: bool) -> bool:
    """Persist risk state and return whether this is a new high-risk transition."""
    INBOX_DB.parent.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc).isoformat()
    with closing(
        sqlite3.connect(INBOX_DB, timeout=10, isolation_level=None)
    ) as connection:
        connection.execute("BEGIN IMMEDIATE")
        connection.execute(
            "CREATE TABLE IF NOT EXISTS monitor_zone_state ("
            "study_area TEXT NOT NULL, zone_id TEXT NOT NULL, high_risk INTEGER NOT NULL, "
            "updated_at_utc TEXT NOT NULL, PRIMARY KEY (study_area, zone_id))"
        )
        row = connection.execute(
            "SELECT high_risk FROM monitor_zone_state "
            "WHERE study_area = ? AND zone_id = ?",
            (study_area, zone_id),
        ).fetchone()
        is_new_alert = high_risk and (row is None or row[0] == 0)
        connection.execute(
            "INSERT INTO monitor_zone_state "
            "(study_area, zone_id, high_risk, updated_at_utc) VALUES (?, ?, ?, ?) "
            "ON CONFLICT(study_area, zone_id) DO UPDATE SET "
            "high_risk=excluded.high_risk, updated_at_utc=excluded.updated_at_utc",
            (study_area, zone_id, int(high_risk), now),
        )
        connection.execute("COMMIT")
    return is_new_alert


def get_demo_alerts(limit: int = 20) -> list[dict[str, Any]]:
    if not INBOX_DB.is_file():
        return []
    with closing(sqlite3.connect(INBOX_DB, timeout=10)) as connection:
        rows = connection.execute(
            "SELECT alert_json FROM officer_alerts "
            "ORDER BY created_at_utc DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return [json.loads(row[0]) for row in rows]
